import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get('tutorId') || 'tut-01';

    const logs = db.prepare('SELECT duration_minutes, total_earned, status FROM session_logs WHERE tutor_id = ?').all(tutorId);

    let totalMinutes = 0;
    let totalEarned = 0;
    let approvedEarned = 0;
    let pendingEarned = 0;

    for (const log of logs) {
      totalMinutes += log.duration_minutes;
      totalEarned += log.total_earned;
      if (log.status === 'approved') {
        approvedEarned += log.total_earned;
      } else {
        pendingEarned += log.total_earned;
      }
    }

    const totalHours = Number((totalMinutes / 60).toFixed(1));

    return NextResponse.json({
      success: true,
      data: {
        tutorId,
        rateTier: 'Tier 1: Senior STEM Specialist',
        hourlyRate: 45.0,
        totalHours,
        totalEarned: Number(totalEarned.toFixed(2)),
        approvedEarned: Number(approvedEarned.toFixed(2)),
        pendingEarned: Number(pendingEarned.toFixed(2)),
        sessionsLogged: logs.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
