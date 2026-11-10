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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(params.id);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: mapRowToLesson(row) });
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

    const existing = db.prepare('SELECT * FROM lessons WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (body.status !== undefined) {
      updates.push('status = ?');
      values.push(body.status);
    }
    if (body.date !== undefined) {
      updates.push('date = ?');
      values.push(body.date);
    }
    if (body.time !== undefined) {
      updates.push('time = ?');
      values.push(body.time);
    }
    if (body.roomCode !== undefined) {
      updates.push('room_code = ?');
      values.push(body.roomCode);
    }
    if (body.aiSummary !== undefined) {
      updates.push('ai_summary = ?');
      values.push(JSON.stringify(body.aiSummary));
    }
    if (body.recordingUrl !== undefined) {
      updates.push('recording_url = ?');
      values.push(body.recordingUrl);
    }

    if (updates.length > 0) {
      values.push(params.id);
      db.prepare(`UPDATE lessons SET ${updates.join(', ')} WHERE id = ?`).run(...values);
    }

    const updated = db.prepare('SELECT * FROM lessons WHERE id = ?').get(params.id);
    return NextResponse.json({ success: true, data: mapRowToLesson(updated) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    db.prepare('DELETE FROM lessons WHERE id = ?').run(params.id);
    return NextResponse.json({ success: true, message: 'Lesson deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
