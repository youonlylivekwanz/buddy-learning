import {
  prisma,
  isDatabaseConfigured,
  memoryStore,
  ExpirationWindow,
  EnrollmentStatus,
  Role,
} from '@/lib/db';
import { dispatchWebhookEvent } from '@/lib/webhooks/dispatcher';

export interface ComplianceEvaluationResult {
  evaluated: number;
  transitioned90d: number;
  transitioned60d: number;
  transitioned30d: number;
  expiredAndReenrolled: number;
  timestamp: string;
}

export function calculateExpirationWindow(expiresAt: Date, now: Date = new Date()): {
  window: ExpirationWindow;
  daysRemaining: number;
  isExpired: boolean;
} {
  const diffMs = expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return { window: ExpirationWindow.EXPIRED, daysRemaining, isExpired: true };
  } else if (daysRemaining <= 30) {
    return { window: ExpirationWindow.WINDOW_30_DAYS, daysRemaining, isExpired: false };
  } else if (daysRemaining <= 60) {
    return { window: ExpirationWindow.WINDOW_60_DAYS, daysRemaining, isExpired: false };
  } else if (daysRemaining <= 90) {
    return { window: ExpirationWindow.WINDOW_90_DAYS, daysRemaining, isExpired: false };
  } else {
    return { window: ExpirationWindow.ACTIVE, daysRemaining, isExpired: false };
  }
}

export async function runComplianceEvaluation(): Promise<ComplianceEvaluationResult> {
  const now = new Date();
  const result: ComplianceEvaluationResult = {
    evaluated: 0,
    transitioned90d: 0,
    transitioned60d: 0,
    transitioned30d: 0,
    expiredAndReenrolled: 0,
    timestamp: now.toISOString(),
  };

  if (isDatabaseConfigured()) {
    // ============================================
    // PRODUCTION / DATABASE TRANSACTION PIPELINE
    // ============================================
    const certificates = await prisma.certificate.findMany({
      include: {
        user: {
          include: {
            organization: true,
          },
        },
        course: true,
      },
    });

    result.evaluated = certificates.length;

    for (const cert of certificates) {
      const { window: newWindow, isExpired, daysRemaining } = calculateExpirationWindow(cert.expiresAt, now);

      // Idempotency: Skip if already in this expiration window state
      if (cert.expirationWindow === newWindow && cert.isExpired === isExpired) {
        continue;
      }

      const branchManagers = await prisma.user.findMany({
        where: {
          organizationId: cert.user.organizationId,
          role: Role.BRANCH_MANAGER,
        },
      });

      await prisma.$transaction(async (tx) => {
        // Update Certificate evaluation state
        await tx.certificate.update({
          where: { id: cert.id },
          data: {
            expirationWindow: newWindow,
            isExpired,
            lastEvaluatedAt: now,
          },
        });

        if (newWindow === ExpirationWindow.EXPIRED) {
          result.expiredAndReenrolled++;

          // Transition Enrollment to REENROLLMENT_REQUIRED
          await tx.enrollment.updateMany({
            where: {
              userId: cert.userId,
              courseId: cert.courseId,
            },
            data: {
              status: EnrollmentStatus.REENROLLMENT_REQUIRED,
              progressPercent: 0,
              completedAt: null,
              reenrollmentCount: { increment: 1 },
            },
          });

          // In-App Alert for Learner
          await tx.inAppAlert.create({
            data: {
              userId: cert.userId,
              title: 'Compliance Certificate Expired',
              message: `Your certificate for "${cert.course.title}" has expired. You have been re-enrolled and must complete the training immediately.`,
              severity: 'CRITICAL',
              metadata: {
                certificateId: cert.id,
                courseId: cert.courseId,
                serialNumber: cert.serialNumber,
              },
            },
          });

          // In-App Alert for Branch Managers
          for (const mgr of branchManagers) {
            await tx.inAppAlert.create({
              data: {
                userId: mgr.id,
                title: 'Branch Compliance Breach: Certificate Expired',
                message: `Learner ${cert.user.name} (${cert.user.email}) in branch ${cert.user.organization.name} has an expired certificate for mandatory course "${cert.course.title}".`,
                severity: 'CRITICAL',
                metadata: {
                  learnerId: cert.userId,
                  courseId: cert.courseId,
                  organizationId: cert.user.organizationId,
                },
              },
            });
          }

          // Outbound Webhook for EXPIRED
          await dispatchWebhookEvent('CERT_EXPIRED', {
            learnerName: cert.user.name,
            learnerEmail: cert.user.email,
            courseTitle: cert.course.title,
            branchName: cert.user.organization.name,
            certificateSerial: cert.serialNumber,
            expiresAt: cert.expiresAt.toISOString(),
            status: 'REENROLLMENT_REQUIRED',
          });
        } else {
          // Warning windows: 90d, 60d, 30d
          const severity = newWindow === ExpirationWindow.WINDOW_30_DAYS ? 'CRITICAL' : 'WARNING';
          if (newWindow === ExpirationWindow.WINDOW_90_DAYS) result.transitioned90d++;
          if (newWindow === ExpirationWindow.WINDOW_60_DAYS) result.transitioned60d++;
          if (newWindow === ExpirationWindow.WINDOW_30_DAYS) result.transitioned30d++;

          await tx.inAppAlert.create({
            data: {
              userId: cert.userId,
              title: `Compliance Expiration Warning: ${daysRemaining} Days Remaining`,
              message: `Your certificate for "${cert.course.title}" will expire in ${daysRemaining} days (${cert.expiresAt.toLocaleDateString()}). Please plan your recertification module.`,
              severity,
              metadata: {
                certificateId: cert.id,
                courseId: cert.courseId,
                window: newWindow,
                daysRemaining,
              },
            },
          });

          await dispatchWebhookEvent('COMPLIANCE_WARNING', {
            learnerName: cert.user.name,
            learnerEmail: cert.user.email,
            courseTitle: cert.course.title,
            branchName: cert.user.organization.name,
            certificateSerial: cert.serialNumber,
            window: newWindow,
            daysRemaining,
            severity,
          });
        }
      });
    }
  } else {
    // ============================================
    // LOCAL DEV / RESILIENT IN-MEMORY PIPELINE
    // ============================================
    result.evaluated = memoryStore.certificates.length;

    for (const cert of memoryStore.certificates) {
      const { window: newWindow, isExpired, daysRemaining } = calculateExpirationWindow(cert.expiresAt, now);

      if (cert.expirationWindow === newWindow && cert.isExpired === isExpired) {
        continue;
      }

      cert.expirationWindow = newWindow;
      cert.isExpired = isExpired;
      cert.lastEvaluatedAt = now;
      cert.updatedAt = now;

      const user = memoryStore.users.find((u) => u.id === cert.userId);
      const course = memoryStore.courses.find((c) => c.id === cert.courseId);
      const org = memoryStore.organizations.find((o) => o.id === user?.organizationId);

      if (newWindow === ExpirationWindow.EXPIRED) {
        result.expiredAndReenrolled++;

        // Reset enrollment in memory
        const enrollment = memoryStore.enrollments.find(
          (e) => e.userId === cert.userId && e.courseId === cert.courseId
        );
        if (enrollment) {
          enrollment.status = EnrollmentStatus.REENROLLMENT_REQUIRED;
          enrollment.progressPercent = 0;
          enrollment.completedAt = null;
          enrollment.reenrollmentCount += 1;
          enrollment.updatedAt = now;
        }

        // In-App Alert for Learner
        memoryStore.alerts.push({
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: cert.userId,
          title: 'Compliance Certificate Expired',
          message: `Your certificate for "${course?.title || 'Required Course'}" has expired. You have been re-enrolled.`,
          severity: 'CRITICAL',
          isRead: false,
          metadata: { certificateId: cert.id, courseId: cert.courseId },
          createdAt: now,
        });

        // In-App Alert for Branch Managers
        const branchMgrs = memoryStore.users.filter(
          (u) => u.organizationId === user?.organizationId && u.role === Role.BRANCH_MANAGER
        );
        for (const mgr of branchMgrs) {
          memoryStore.alerts.push({
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            userId: mgr.id,
            title: 'Branch Compliance Breach: Certificate Expired',
            message: `Learner ${user?.name} in branch ${org?.name} has an expired certificate for "${course?.title}".`,
            severity: 'CRITICAL',
            isRead: false,
            metadata: { learnerId: cert.userId, courseId: cert.courseId },
            createdAt: now,
          });
        }

        await dispatchWebhookEvent('CERT_EXPIRED', {
          learnerName: user?.name,
          learnerEmail: user?.email,
          courseTitle: course?.title,
          branchName: org?.name,
          certificateSerial: cert.serialNumber,
          expiresAt: cert.expiresAt.toISOString(),
          status: 'REENROLLMENT_REQUIRED',
        });
      } else {
        const severity = newWindow === ExpirationWindow.WINDOW_30_DAYS ? 'CRITICAL' : 'WARNING';
        if (newWindow === ExpirationWindow.WINDOW_90_DAYS) result.transitioned90d++;
        if (newWindow === ExpirationWindow.WINDOW_60_DAYS) result.transitioned60d++;
        if (newWindow === ExpirationWindow.WINDOW_30_DAYS) result.transitioned30d++;

        memoryStore.alerts.push({
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          userId: cert.userId,
          title: `Compliance Expiration Warning: ${daysRemaining} Days Remaining`,
          message: `Your certificate for "${course?.title}" will expire in ${daysRemaining} days.`,
          severity,
          isRead: false,
          metadata: { certificateId: cert.id, daysRemaining },
          createdAt: now,
        });

        await dispatchWebhookEvent('COMPLIANCE_WARNING', {
          learnerName: user?.name,
          learnerEmail: user?.email,
          courseTitle: course?.title,
          branchName: org?.name,
          certificateSerial: cert.serialNumber,
          window: newWindow,
          daysRemaining,
          severity,
        });
      }
    }
  }

  return result;
}
