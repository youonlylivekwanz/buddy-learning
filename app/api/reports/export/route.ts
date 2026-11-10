import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma, isDatabaseConfigured, memoryStore, Role } from '@/lib/db';
import { getCurrentSessionUser } from '@/lib/auth/session';
import { enforceRBAC, buildTenantWhereClause, AuthorizationError } from '@/lib/auth/rbac';

export const dynamic = 'force-dynamic';

type ExportEnrollmentRecord = Prisma.EnrollmentGetPayload<{
  include: {
    user: { include: { organization: true } };
    course: {
      include: {
        certificates: true;
      };
    };
  };
}>;

// RFC 4180 cell sanitizer with Formula Injection (CSV Injection) mitigation
function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let str = String(value);

  // Mitigate CSV Formula Injection: prefix leading =, +, -, @, \t, \r with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If cell contains commas, double-quotes, or newlines, wrap in quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentSessionUser();
    enforceRBAC(user, [Role.BRANCH_MANAGER, Role.GLOBAL_ADMIN]);

    const { searchParams } = new URL(request.url);
    const targetOrgId = searchParams.get('orgId');
    const tenantFilter = buildTenantWhereClause(user, targetOrgId);

    const encoder = new TextEncoder();
    const csvHeader =
      'Learner ID,Name,Email,Branch/Organization,Course Title,Enrollment Status,Progress %,Raw Score,Certificate Serial,Expiration Window,Expires At,Re-enrollment Count\r\n';

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // Enqueue UTF-8 BOM so Microsoft Excel correctly detects character encoding
        controller.enqueue(encoder.encode('\uFEFF'));
        controller.enqueue(encoder.encode(csvHeader));

        const BATCH_SIZE = 200;

        if (isDatabaseConfigured()) {
          // ============================================
          // DATABASE STREAMING CURSOR PIPELINE
          // ============================================
          let cursor: string | undefined = undefined;
          let hasMore = true;

          const whereClause: Record<string, unknown> = {};
          if (tenantFilter.organizationId) {
            whereClause.user = { organizationId: tenantFilter.organizationId };
          }

          while (hasMore) {
            const enrollments: ExportEnrollmentRecord[] = await prisma.enrollment.findMany({
              where: whereClause,
              take: BATCH_SIZE,
              skip: cursor ? 1 : 0,
              cursor: cursor ? { id: cursor } : undefined,
              orderBy: { id: 'asc' },
              include: {
                user: { include: { organization: true } },
                course: {
                  include: {
                    certificates: {
                      orderBy: { issuedAt: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            });

            if (enrollments.length === 0) {
              hasMore = false;
              break;
            }

            let batchChunk = '';
            for (const enr of enrollments) {
              const latestCert = enr.course.certificates[0];
              const row = [
                sanitizeCsvCell(enr.user.id),
                sanitizeCsvCell(enr.user.name),
                sanitizeCsvCell(enr.user.email),
                sanitizeCsvCell(enr.user.organization.name),
                sanitizeCsvCell(enr.course.title),
                sanitizeCsvCell(enr.status),
                sanitizeCsvCell(`${Math.round(enr.progressPercent)}%`),
                sanitizeCsvCell(enr.scoreRaw !== null ? enr.scoreRaw : 'N/A'),
                sanitizeCsvCell(latestCert?.serialNumber || 'None'),
                sanitizeCsvCell(latestCert?.expirationWindow || 'ACTIVE'),
                sanitizeCsvCell(latestCert?.expiresAt ? latestCert.expiresAt.toISOString().split('T')[0] : 'N/A'),
                sanitizeCsvCell(enr.reenrollmentCount),
              ].join(',') + '\r\n';

              batchChunk += row;
            }

            controller.enqueue(encoder.encode(batchChunk));
            cursor = enrollments[enrollments.length - 1].id;

            if (enrollments.length < BATCH_SIZE) {
              hasMore = false;
            } else {
              // Yield to event loop between batches to maintain high system concurrency
              await new Promise((resolve) => setImmediate(resolve));
            }
          }
        } else {
          // ============================================
          // LOCAL DEV IN-MEMORY STREAMING PIPELINE
          // ============================================
          const targetOrg = tenantFilter.organizationId;
          const filteredEnrollments = memoryStore.enrollments.filter((enr) => {
            if (!targetOrg) return true;
            const u = memoryStore.users.find((userItem) => userItem.id === enr.userId);
            return u?.organizationId === targetOrg;
          });

          for (let i = 0; i < filteredEnrollments.length; i += BATCH_SIZE) {
            const batch = filteredEnrollments.slice(i, i + BATCH_SIZE);
            let batchChunk = '';

            for (const enr of batch) {
              const userItem = memoryStore.users.find((u) => u.id === enr.userId);
              const courseItem = memoryStore.courses.find((c) => c.id === enr.courseId);
              const orgItem = memoryStore.organizations.find((o) => o.id === userItem?.organizationId);
              const certItem = memoryStore.certificates.find(
                (c) => c.userId === enr.userId && c.courseId === enr.courseId
              );

              const row = [
                sanitizeCsvCell(userItem?.id || enr.userId),
                sanitizeCsvCell(userItem?.name || 'Learner'),
                sanitizeCsvCell(userItem?.email || 'learner@domain.co.za'),
                sanitizeCsvCell(orgItem?.name || 'Branch'),
                sanitizeCsvCell(courseItem?.title || 'Course'),
                sanitizeCsvCell(enr.status),
                sanitizeCsvCell(`${Math.round(enr.progressPercent)}%`),
                sanitizeCsvCell(enr.scoreRaw !== null ? enr.scoreRaw : 'N/A'),
                sanitizeCsvCell(certItem?.serialNumber || 'None'),
                sanitizeCsvCell(certItem?.expirationWindow || 'ACTIVE'),
                sanitizeCsvCell(certItem?.expiresAt ? certItem.expiresAt.toISOString().split('T')[0] : 'N/A'),
                sanitizeCsvCell(enr.reenrollmentCount),
              ].join(',') + '\r\n';

              batchChunk += row;
            }

            controller.enqueue(encoder.encode(batchChunk));
            if (i + BATCH_SIZE < filteredEnrollments.length) {
              await new Promise((resolve) => setImmediate(resolve));
            }
          }
        }

        controller.close();
      },
    });

    const filename = `buddy-lms-compliance-report-${Date.now()}.csv`;

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    if (error instanceof AuthorizationError) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error('[Reports:Export:Error]', message);
    return new Response(JSON.stringify({ success: false, error: 'Internal export failure.', details: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
