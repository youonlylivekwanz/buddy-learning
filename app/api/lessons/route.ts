import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { Lesson } from '@/types';

function mapRowToLesson(row: any): Lesson {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    grade: row.grade,
    tutorName: row.tutor_name,
    tutorAvatar: row.tutor_avatar || undefined,
    learnerName: row.learner_name,
    date: row.date,
    time: row.time,
    durationMinutes: row.duration_minutes,
    status: row.status,
    meetingUrl: row.meeting_url,
    roomCode: row.room_code,
    aiSummary: row.ai_summary ? JSON.parse(row.ai_summary) : undefined,
    recordingUrl: row.recording_url || undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const query = searchParams.get('q');

    let sql = 'SELECT * FROM lessons WHERE 1=1';
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (subject && subject !== 'all') {
      sql += ' AND subject LIKE ?';
      params.push(`%${subject}%`);
    }

    if (query) {
      sql += ' AND (title LIKE ? OR tutor_name LIKE ? OR learner_name LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY date ASC, time ASC';

    const rows = db.prepare(sql).all(...params);
    const lessons = rows.map(mapRowToLesson);

    return NextResponse.json({ success: true, count: lessons.length, data: lessons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `les-${Date.now().toString(36)}`;
    const title = body.title || 'Tutoring Session';
    const subject = body.subject || 'Mathematics';
    const grade = body.grade || 'Grade 12';
    const tutorId = body.tutorId || 'tut-01';
    const tutorName = body.tutorName || 'Sipho Dlamini, MSc';
    const tutorAvatar = body.tutorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80';
    const learnerId = body.learnerId || 'learner-01';
    const learnerName = body.learnerName || 'Zanele Khumalo';
    const date = body.date || new Date().toISOString().split('T')[0];
    const time = body.time || '15:00 - 16:30';
    const durationMinutes = body.durationMinutes || 90;
    const status = body.status || 'upcoming';
    const roomCode = body.roomCode || `ROOM-${Math.floor(100 + Math.random() * 900)}`;
    const meetingUrl = body.meetingUrl || `https://meet.buddylearning.co.za/${roomCode.toLowerCase()}`;
    const createdAt = new Date().toISOString();

    const insert = db.prepare(`
      INSERT INTO lessons (
        id, title, subject, grade, tutor_id, tutor_name, tutor_avatar,
        learner_id, learner_name, date, time, duration_minutes,
        status, meeting_url, room_code, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id, title, subject, grade, tutorId, tutorName, tutorAvatar,
      learnerId, learnerName, date, time, durationMinutes,
      status, meetingUrl, roomCode, createdAt
    );

    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: mapRowToLesson(row) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
