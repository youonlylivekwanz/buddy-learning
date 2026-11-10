import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { SponsorStudent } from '@/types';

function mapRowToStudent(r: any): SponsorStudent {
  return {
    id: r.id,
    name: r.name,
    avatar: r.avatar,
    grade: r.grade,
    school: r.school,
    sponsorName: r.sponsor_name,
    tutorAssigned: r.tutor_assigned,
    attendanceRate: r.attendance_rate,
    baselineScore: r.baseline_score,
    currentScore: r.current_score,
    targetScore: r.target_score,
    hoursCompleted: r.hours_completed,
    status: r.status,
    recentHighlight: `Achieved ${r.current_score}% in Term 3 prelims (+${r.current_score - r.baseline_score}% jump)`,
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const status = searchParams.get('status');
    const query = searchParams.get('q');

    let sql = 'SELECT * FROM learners WHERE 1=1';
    const params: any[] = [];

    if (grade && grade !== 'all') {
      sql += ' AND grade = ?';
      params.push(Number(grade));
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (query) {
      sql += ' AND (name LIKE ? OR school LIKE ? OR tutor_assigned LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY current_score DESC';

    const rows = db.prepare(sql).all(...params);
    const students = rows.map(mapRowToStudent);

    return NextResponse.json({ success: true, count: students.length, data: students });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
