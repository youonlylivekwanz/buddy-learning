import { Role } from '@/lib/db';
import { SessionUser } from '@/lib/auth/session';

export class AuthorizationError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

/**
 * Enforces that the current authenticated user possesses one of the allowed roles.
 * Throws a typed AuthorizationError if unauthenticated (401) or unauthorized (403).
 */
export function enforceRBAC(user: SessionUser | null | undefined, allowedRoles: Role[]): void {
  if (!user) {
    throw new AuthorizationError('Authentication required. Missing session context.', 401);
  }

  if (!allowedRoles.includes(user.role)) {
    throw new AuthorizationError(
      `Forbidden: Role "${user.role}" does not have permission to access this resource. Required: [${allowedRoles.join(
        ', '
      )}]`,
      403
    );
  }
}

export interface TenantWhereClause {
  organizationId?: string;
  userId?: string;
  id?: string;
}

/**
 * Enforces strict Row-Level Multi-Tenancy based on user role and organization.
 * Prevents unauthorized cross-branch data access.
 */
export function buildTenantWhereClause(
  user: SessionUser,
  targetOrgId?: string | null
): TenantWhereClause {
  if (user.role === Role.GLOBAL_ADMIN) {
    // Global admin can view all organizations or filter by targetOrgId
    if (targetOrgId && targetOrgId !== 'all') {
      return { organizationId: targetOrgId };
    }
    return {};
  }

  if (user.role === Role.BRANCH_MANAGER) {
    // Branch manager is strictly sandboxed to their own branch
    if (targetOrgId && targetOrgId !== 'all' && targetOrgId !== user.organizationId) {
      throw new AuthorizationError(
        `Cross-tenant access violation: Branch Manager is restricted to branch "${user.organizationId}" and cannot query "${targetOrgId}".`,
        403
      );
    }
    return { organizationId: user.organizationId };
  }

  if (user.role === Role.LEARNER) {
    // Learner is strictly sandboxed to their own user and branch
    return {
      id: user.id,
      organizationId: user.organizationId,
    };
  }

  if (user.role === Role.TUTOR) {
    // Tutor is sandboxed to their own sessions and organization
    return {
      userId: user.id,
      organizationId: user.organizationId,
    };
  }

  throw new AuthorizationError('Unknown role tenancy enforcement.', 403);
}
