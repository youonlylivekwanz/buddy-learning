import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { SessionLog } from '@/types';

function mapRowToLog(r: any): SessionLog {
  return {
    id: r.id,
    tutorId: r.tutor_id,
    tutorName: r.tutor_name,
    learnerId: r.learner_id,
    learnerName: r.learner_name,
    subject: r.subject,
    date: r.date,
    durationMinutes: r.duration_minutes,
    rateTier: r.rate_tier,
    hourlyRate: r.hourly_rate,
    totalEarned: r.total_earned,
    attendanceStatus: r.attendance_status,
    notes: r.notes,
    aiSummaryGenerated: Boolean(r.ai_summary_generated),
    status: r.status,
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get('tutorId') || 'tut-01';

    const rows = db.prepare('SELECT * FROM session_logs WHERE tutor_id = ? ORDER BY date DESC, created_at DESC').all(tutorId);
    const logs = rows.map(mapRowToLog);

    return NextResponse.json({ success: true, count: logs.length, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `log-${Date.now().toString(36)}`;
    const tutorId = body.tutorId || 'tut-01';
    const tutorName = body.tutorName || 'Sipho Dlamini, MSc';
    const learnerId = body.learnerId || 'learner-01';
    const learnerName = body.learnerName || 'Zanele Khumalo';
    const subject = body.subject || 'Grade 12 Mathematics';
    const date = body.date || new Date().toISOString().split('T')[0];
    const durationMinutes = Number(body.durationMinutes) || 60;
    const rateTier = body.rateTier || 'Tier 1: Senior STEM Specialist';
    const hourlyRate = Number(body.hourlyRate) || 45.0;
    const totalEarned = (durationMinutes / 60) * hourlyRate;
    const attendanceStatus = body.attendanceStatus || 'present';
    const notes = body.notes || 'Logged via Tutor Terminal.';
    const aiSummaryGenerated = body.aiSummaryGenerated ? 1 : 0;
    const status = body.status || 'approved';
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO session_logs (
        id, tutor_id, tutor_name, learner_id, learner_name, subject,
        date, duration_minutes, rate_tier, hourly_rate, total_earned,
        attendance_status, notes, ai_summary_generated, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, tutorId, tutorName, learnerId, learnerName, subject,
      date, durationMinutes, rateTier, hourlyRate, totalEarned,
      attendanceStatus, notes, aiSummaryGenerated, status, createdAt
    );

    const row = db.prepare('SELECT * FROM session_logs WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: mapRowToLog(row) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
