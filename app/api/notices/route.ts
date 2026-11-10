import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { NoticeItem } from '@/types';

function mapRowToNotice(r: any): NoticeItem {
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    date: r.date,
    pinned: Boolean(r.pinned),
    priority: r.priority,
    summary: r.summary,
    author: r.author,
    actionText: r.action_text || undefined,
    actionPayload: r.action_payload || undefined,
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');

    let sql = 'SELECT * FROM notices WHERE 1=1';
    const params: any[] = [];

    if (category && category !== 'All') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (query) {
      sql += ' AND (title LIKE ? OR summary LIKE ? OR author LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY pinned DESC, created_at DESC';

    const rows = db.prepare(sql).all(...params);
    const notices = rows.map(mapRowToNotice);

    return NextResponse.json({ success: true, count: notices.length, data: notices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `not-${Date.now().toString(36)}`;
    const title = body.title || 'Campus Announcement';
    const category = body.category || 'Exam Alert';
    const date = body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const pinned = body.pinned ? 1 : 0;
    const priority = body.priority || 'normal';
    const summary = body.summary || 'Notice details.';
    const author = body.author || 'Academic Team';
    const actionText = body.actionText || null;
    const actionPayload = body.actionPayload || null;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO notices (
        id, title, category, date, pinned, priority, summary, author, action_text, action_payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, category, date, pinned, priority, summary, author, actionText, actionPayload, createdAt);

    const created = db.prepare('SELECT * FROM notices WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: mapRowToNotice(created) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
