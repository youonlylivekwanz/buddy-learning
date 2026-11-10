import { NextRequest, NextResponse } from 'next/server';
import { runComplianceEvaluation } from '@/lib/compliance/engine';

function validateCronAuth(request: NextRequest): { authorized: boolean; reason?: string } {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // Allow local execution with a structured warning when CRON_SECRET is not configured
    console.warn('[Compliance:Cron:Notice] Execution permitted without CRON_SECRET in local environment.');
    return { authorized: true };
  }

  const authHeader = request.headers.get('authorization') || '';
  const expectedAuth = `Bearer ${cronSecret}`;

  if (authHeader !== expectedAuth) {
    return { authorized: false, reason: 'Invalid or missing Authorization Bearer token.' };
  }

  return { authorized: true };
}

export async function POST(request: NextRequest) {
  const auth = validateCronAuth(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: auth.reason || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const summary = await runComplianceEvaluation();
    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Compliance:Cron:Error]', message);
    return NextResponse.json(
      { success: false, error: 'Compliance evaluation run failed.', details: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Support GET triggers for Vercel Cron or simple health pings
  return POST(request);
}
