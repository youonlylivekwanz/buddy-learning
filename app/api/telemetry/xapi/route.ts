import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import {
  prisma,
  isDatabaseConfigured,
  memoryStore,
  EnrollmentStatus,
  ExpirationWindow,
} from '@/lib/db';
import { XApiStatementPayload } from '@/lib/scorm/types';
import { dispatchWebhookEvent } from '@/lib/webhooks/dispatcher';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as XApiStatementPayload;

    if (!payload.enrollmentId || !payload.actor || !payload.verb || !payload.object) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required xAPI parameters: enrollmentId, actor, verb, and object are required.',
        },
        { status: 400 }
      );
    }

    const { enrollmentId, actor, verb, object, result, context, cmiSnapshot } = payload;
    const isCompleted = Boolean(result?.completion || result?.success);
    const scoreVal = result?.score?.raw !== undefined ? Number(result.score.raw) : null;
    const now = new Date();

    let certificateIssued: boolean = false;
    let certificateSerial: string | null = null;

    if (isDatabaseConfigured()) {
      // Find corresponding enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
        include: {
          user: { include: { organization: true } },
          course: true,
        },
      });

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: `Enrollment "${enrollmentId}" not found.` },
          { status: 404 }
        );
      }

      // Record xAPI Statement
      await prisma.xApiStatement.create({
        data: {
          userId: enrollment.userId,
          actor: actor as unknown as Prisma.InputJsonValue,
          verb: verb as unknown as Prisma.InputJsonValue,
          object: object as unknown as Prisma.InputJsonValue,
          result: (result || null) as unknown as Prisma.InputJsonValue,
          context: (context || null) as unknown as Prisma.InputJsonValue,
          timestamp: now,
        },
      });

      // Compute bookmark and suspend data from cmiSnapshot
      const bookmark =
        cmiSnapshot?.['cmi.core.lesson_location'] ||
        cmiSnapshot?.['cmi.location'] ||
        enrollment.bookmarkLocation;
      const suspend =
        cmiSnapshot?.['cmi.suspend_data'] || enrollment.suspendData;

      // Update Enrollment atomically
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          scoreRaw: scoreVal !== null ? scoreVal : enrollment.scoreRaw,
          progressPercent: isCompleted ? 100 : enrollment.progressPercent,
          status: isCompleted ? EnrollmentStatus.COMPLETED : EnrollmentStatus.IN_PROGRESS,
          bookmarkLocation: bookmark,
          suspendData: suspend,
          cmiState: (cmiSnapshot || enrollment.cmiState) as unknown as Prisma.InputJsonValue,
          completedAt: isCompleted ? (enrollment.completedAt || now) : enrollment.completedAt,
        },
      });

      // Issue or renew certificate if completed
      if (isCompleted) {
        const validityDays = enrollment.course.validityDays || 365;
        const certExpiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
        certificateSerial = `CERT-${enrollment.course.slug.toUpperCase().slice(0, 8)}-${Date.now().toString().slice(-6)}`;

        const existingCert = await prisma.certificate.findFirst({
          where: {
            userId: enrollment.userId,
            courseId: enrollment.courseId,
          },
        });

        if (existingCert) {
          await prisma.certificate.update({
            where: { id: existingCert.id },
            data: {
              expiresAt: certExpiresAt,
              expirationWindow: ExpirationWindow.ACTIVE,
              isExpired: false,
              serialNumber: certificateSerial,
            },
          });
        } else {
          await prisma.certificate.create({
            data: {
              userId: enrollment.userId,
              courseId: enrollment.courseId,
              serialNumber: certificateSerial,
              issuedAt: now,
              expiresAt: certExpiresAt,
              expirationWindow: ExpirationWindow.ACTIVE,
              isExpired: false,
            },
          });
        }

        certificateIssued = true;

        // In-App Alert for Certificate Issuance
        await prisma.inAppAlert.create({
          data: {
            userId: enrollment.userId,
            title: 'Compliance Certificate Issued',
            message: `Congratulations! You passed "${enrollment.course.title}" with a score of ${scoreVal || 100}%. Certificate ${certificateSerial} is now active.`,
            severity: 'INFO',
            metadata: { certificateSerial, courseId: enrollment.courseId },
          },
        });

        // Dispatch Outbound Webhook
        await dispatchWebhookEvent('COURSE_COMPLETED', {
          learnerName: enrollment.user.name,
          learnerEmail: enrollment.user.email,
          courseTitle: enrollment.course.title,
          branchName: enrollment.user.organization.name,
          score: scoreVal || 100,
          certificateSerial,
          expiresAt: certExpiresAt.toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          enrollmentId: updatedEnrollment.id,
          status: updatedEnrollment.status,
          scoreRaw: updatedEnrollment.scoreRaw,
          progressPercent: updatedEnrollment.progressPercent,
          certificateIssued,
          certificateSerial,
          timestamp: now.toISOString(),
        },
      });
    } else {
      // ============================================
      // RESILIENT IN-MEMORY MOCK HANDLING
      // ============================================
      const enrollment = memoryStore.enrollments.find((e) => e.id === enrollmentId);
      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: `Enrollment "${enrollmentId}" not found in mock store.` },
          { status: 404 }
        );
      }

      const user = memoryStore.users.find((u) => u.id === enrollment.userId);
      const course = memoryStore.courses.find((c) => c.id === enrollment.courseId);
      const org = memoryStore.organizations.find((o) => o.id === user?.organizationId);

      // Record mock xAPI statement
      memoryStore.xapiStatements.push({
        id: `xapi-${Date.now()}`,
        userId: enrollment.userId,
        actor: actor as unknown as Record<string, unknown>,
        verb: verb as unknown as Record<string, unknown>,
        object: object as unknown as Record<string, unknown>,
        result: result as unknown as Record<string, unknown>,
        context: context as unknown as Record<string, unknown>,
        timestamp: now,
      });

      if (scoreVal !== null) enrollment.scoreRaw = scoreVal;
      if (isCompleted) {
        enrollment.status = EnrollmentStatus.COMPLETED;
        enrollment.progressPercent = 100;
        enrollment.completedAt = now;
      }
      if (cmiSnapshot) {
        enrollment.cmiState = cmiSnapshot;
        enrollment.bookmarkLocation =
          cmiSnapshot['cmi.core.lesson_location'] || cmiSnapshot['cmi.location'] || enrollment.bookmarkLocation;
        enrollment.suspendData = cmiSnapshot['cmi.suspend_data'] || enrollment.suspendData;
      }

      if (isCompleted && course) {
        const validityDays = course.validityDays || 365;
        const certExpiresAt = new Date(now.getTime() + validityDays * 24 * 60 * 60 * 1000);
        certificateSerial = `CERT-${course.slug.toUpperCase().slice(0, 8)}-${Date.now().toString().slice(-6)}`;

        const existingCert = memoryStore.certificates.find(
          (c) => c.userId === enrollment.userId && c.courseId === enrollment.courseId
        );

        if (existingCert) {
          existingCert.expiresAt = certExpiresAt;
          existingCert.expirationWindow = ExpirationWindow.ACTIVE;
          existingCert.isExpired = false;
          existingCert.serialNumber = certificateSerial;
        } else {
          memoryStore.certificates.push({
            id: `cert-${Date.now()}`,
            userId: enrollment.userId,
            courseId: enrollment.courseId,
            serialNumber: certificateSerial,
            issuedAt: now,
            expiresAt: certExpiresAt,
            expirationWindow: ExpirationWindow.ACTIVE,
            isExpired: false,
            lastEvaluatedAt: null,
            createdAt: now,
            updatedAt: now,
          });
        }

        certificateIssued = true;

        memoryStore.alerts.push({
          id: `alert-${Date.now()}`,
          userId: enrollment.userId,
          title: 'Compliance Certificate Issued',
          message: `Congratulations! You passed "${course.title}". Certificate ${certificateSerial} is active.`,
          severity: 'INFO',
          isRead: false,
          metadata: { certificateSerial, courseId: course.id },
          createdAt: now,
        });

        await dispatchWebhookEvent('COURSE_COMPLETED', {
          learnerName: user?.name,
          learnerEmail: user?.email,
          courseTitle: course.title,
          branchName: org?.name,
          score: scoreVal || 100,
          certificateSerial,
          expiresAt: certExpiresAt.toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          enrollmentId: enrollment.id,
          status: enrollment.status,
          scoreRaw: enrollment.scoreRaw,
          progressPercent: enrollment.progressPercent,
          certificateIssued,
          certificateSerial,
          timestamp: now.toISOString(),
        },
      });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[xAPI:Telemetry:Error]', message);
    return NextResponse.json(
      { success: false, error: 'Failed to process xAPI telemetry.', details: message },
      { status: 500 }
    );
  }
}
