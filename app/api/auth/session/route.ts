import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentSessionUser, getOptionalSessionUser } from '@/lib/auth/session';
import { Role } from '@/lib/db';
import { VERIFIED_PERSONAS } from '@/lib/auth/personas';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await getOptionalSessionUser();
    if (!sessionUser) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        availablePersonas: VERIFIED_PERSONAS,
      });
    }

    const persona = VERIFIED_PERSONAS.find((p) => p.id === sessionUser.id) || {
      id: sessionUser.id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      organizationId: sessionUser.organizationId,
      organizationName: sessionUser.organizationName || 'Default Branch',
      title: sessionUser.role.replace('_', ' '),
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      allowedViews:
        sessionUser.role === Role.GLOBAL_ADMIN
          ? (['dashboard', 'learner', 'tutor', 'sponsor', 'admin'] as const)
          : sessionUser.role === Role.BRANCH_MANAGER
          ? (['dashboard', 'sponsor'] as const)
          : sessionUser.role === Role.TUTOR
          ? (['dashboard', 'tutor'] as const)
          : (['dashboard', 'learner'] as const),
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: persona,
      availablePersonas: VERIFIED_PERSONAS,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve session';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, role } = body as { userId?: string; role?: Role };

    let targetPersona = VERIFIED_PERSONAS.find((p) => p.id === userId);
    if (!targetPersona && role) {
      targetPersona = VERIFIED_PERSONAS.find((p) => p.role === role);
    }
    if (!targetPersona) {
      targetPersona = VERIFIED_PERSONAS[0];
    }

    const cookieStore = cookies();
    cookieStore.set('dev_user_id', targetPersona.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('dev_user_role', targetPersona.role, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
    cookieStore.set('dev_org_id', targetPersona.organizationId, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      message: `Signed in as ${targetPersona.name} (${targetPersona.role})`,
      user: targetPersona,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to set session';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete('dev_user_id');
  cookieStore.delete('dev_user_role');
  cookieStore.delete('dev_org_id');

  return NextResponse.json({
    success: true,
    message: 'Signed out successfully.',
  });
}
