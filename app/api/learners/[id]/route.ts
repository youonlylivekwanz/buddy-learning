import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM learners WHERE id = ?').get(params.id);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Learner not found' }, { status: 404 });
    }

    const learner = {
      id: row.id,
      name: row.name,
      email: row.email,
      avatar: row.avatar,
      grade: row.grade,
      school: row.school,
      sponsorName: row.sponsor_name,
      tutorAssigned: row.tutor_assigned,
      attendanceRate: row.attendance_rate,
      baselineScore: row.baseline_score,
      currentScore: row.current_score,
      targetScore: row.target_score,
      hoursCompleted: row.hours_completed,
      status: row.status,
      streakCount: row.streak_count,
      totalXp: row.total_xp,
      level: row.level,
      badges: row.badges ? JSON.parse(row.badges) : [],
      lastActiveDate: row.last_active_date,
    };

    return NextResponse.json({ success: true, data: learner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const body = await req.json();

    const existing = db.prepare('SELECT * FROM learners WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Learner not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.streakCount !== undefined) {
      updates.push('streak_count = ?');
      values.push(body.streakCount);
    }
    if (body.totalXp !== undefined) {
      updates.push('total_xp = ?');
      values.push(body.totalXp);
    }
    if (body.currentScore !== undefined) {
      updates.push('current_score = ?');
      values.push(body.currentScore);
    }
    if (body.hoursCompleted !== undefined) {
      updates.push('hours_completed = ?');
      values.push(body.hoursCompleted);
    }

    if (updates.length > 0) {
      values.push(params.id);
      db.prepare(`UPDATE learners SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM learners WHERE id = ?').get(params.id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
