import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { ResourceItem } from '@/types';

function mapRowToResource(r: any): ResourceItem {
  return {
    id: r.id,
    title: r.title,
    subject: r.subject,
    type: r.type,
    fileSize: r.file_size,
    format: r.format,
    downloadCount: r.download_count,
    uploadDate: r.upload_date,
    gradeLevel: r.grade_level,
    tags: JSON.parse(r.tags),
    description: r.description,
  };
}

export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const type = searchParams.get('type');
    const grade = searchParams.get('grade');
    const query = searchParams.get('q');

    let sql = 'SELECT * FROM resources WHERE 1=1';
    const params: any[] = [];

    if (subject && subject !== 'All') {
      sql += ' AND subject = ?';
      params.push(subject);
    }

    if (type && type !== 'All') {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (grade && grade !== 'All') {
      sql += ' AND grade_level LIKE ?';
      params.push(`%${grade}%`);
    }

    if (query) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY download_count DESC, upload_date DESC';

    const rows = db.prepare(sql).all(...params);
    const resources = rows.map(mapRowToResource);

    return NextResponse.json({ success: true, count: resources.length, data: resources });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `res-${Date.now().toString(36)}`;
    const title = body.title || 'Practice Paper';
    const subject = body.subject || 'Mathematics';
    const type = body.type || 'past_paper';
    const fileSize = body.fileSize || '2.4 MB';
    const format = body.format || 'PDF';
    const downloadCount = 0;
    const uploadDate = new Date().toISOString().split('T')[0];
    const gradeLevel = body.gradeLevel || 'Grade 12';
    const tags = body.tags || ['CAPS Aligned', 'Memorandum'];
    const description = body.description || 'Uploaded study resource.';

    db.prepare(`
      INSERT INTO resources (
        id, title, subject, type, file_size, format, download_count,
        upload_date, grade_level, tags, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, title, subject, type, fileSize, format, downloadCount,
      uploadDate, gradeLevel, JSON.stringify(tags), description
    );

    const created = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: mapRowToResource(created) }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
