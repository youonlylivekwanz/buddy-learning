import { headers, cookies } from 'next/headers';
import { prisma, isDatabaseConfigured, memoryStore, Role } from '@/lib/db';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
  organizationName?: string;
}

export async function getOptionalSessionUser(): Promise<SessionUser | null> {
  const reqHeaders = headers();
  const reqCookies = cookies();

  const headerRole = reqHeaders.get('x-dev-user-role') as Role | null;
  const headerUserId = reqHeaders.get('x-dev-user-id');

  const cookieRole = reqCookies.get('dev_user_role')?.value as Role | undefined;
  const cookieUserId = reqCookies.get('dev_user_id')?.value;

  if (!headerRole && !cookieRole && !cookieUserId && !headerUserId) {
    return null;
  }

  return getCurrentSessionUser();
}

export async function getCurrentSessionUser(): Promise<SessionUser> {
  const reqHeaders = headers();
  const reqCookies = cookies();

  // Support local dev switcher headers/cookies for testing on localhost:3000
  const headerRole = reqHeaders.get('x-dev-user-role') as Role | null;
  const headerOrgId = reqHeaders.get('x-dev-org-id');
  const headerUserId = reqHeaders.get('x-dev-user-id');

  const cookieRole = reqCookies.get('dev_user_role')?.value as Role | undefined;
  const cookieOrgId = reqCookies.get('dev_org_id')?.value;
  const cookieUserId = reqCookies.get('dev_user_id')?.value;

  const resolvedRole = headerRole || cookieRole || Role.GLOBAL_ADMIN;
  const resolvedOrgId = headerOrgId || cookieOrgId || 'org-hq';
  const resolvedUserId = headerUserId || cookieUserId;

  if (isDatabaseConfigured()) {
    try {
      if (resolvedUserId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: resolvedUserId },
          include: { organization: true },
        });
        if (dbUser) {
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            organizationId: dbUser.organizationId,
            organizationName: dbUser.organization.name,
          };
        }
      }

      // Fallback by role and org
      const userByRole = await prisma.user.findFirst({
        where: {
          role: resolvedRole,
          ...(resolvedRole !== Role.GLOBAL_ADMIN ? { organizationId: resolvedOrgId } : {}),
        },
        include: { organization: true },
      });

      if (userByRole) {
        return {
          id: userByRole.id,
          email: userByRole.email,
          name: userByRole.name,
          role: userByRole.role,
          organizationId: userByRole.organizationId,
          organizationName: userByRole.organization.name,
        };
      }
    } catch (err) {
      console.warn('[Session:DB:Fallback]', err);
    }
  }

  // Resilient In-Memory Fallback
  if (resolvedUserId) {
    const memUser = memoryStore.users.find((u) => u.id === resolvedUserId);
    if (memUser) {
      const org = memoryStore.organizations.find((o) => o.id === memUser.organizationId);
      return {
        ...memUser,
        organizationName: org?.name,
      };
    }
  }

  const memUserByRole =
    memoryStore.users.find(
      (u) =>
        u.role === resolvedRole &&
        (resolvedRole === Role.GLOBAL_ADMIN || u.organizationId === resolvedOrgId)
    ) || memoryStore.users[0];

  const org = memoryStore.organizations.find((o) => o.id === memUserByRole.organizationId);

  return {
    ...memUserByRole,
    organizationName: org?.name,
  };
}
