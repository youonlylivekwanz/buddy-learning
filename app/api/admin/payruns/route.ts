import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM payruns ORDER BY batch_number DESC').all();

    const payruns = rows.map((r: any) => ({
      id: r.id,
      batchNumber: r.batch_number,
      title: r.title,
      totalTutors: r.total_tutors,
      totalHours: r.total_hours,
      totalAmount: r.total_amount,
      status: r.status,
      authorizedAt: r.authorized_at || undefined,
      authorizedBy: r.authorized_by || undefined,
    }));

    return NextResponse.json({ success: true, count: payruns.length, data: payruns });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const id = `pr-${Date.now().toString(36)}`;
    const batchNumber = body.batchNumber || `BATCH #${Math.floor(45 + Math.random() * 50)}`;
    const title = body.title || 'Bi-Weekly Tutor Pay Run';
    const totalTutors = Number(body.totalTutors) || 28;
    const totalHours = Number(body.totalHours) || 400;
    const totalAmount = Number(body.totalAmount) || 18000.0;
    const status = 'Awaiting Authorization';

    db.prepare(`
      INSERT INTO payruns (
        id, batch_number, title, total_tutors, total_hours, total_amount, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, batchNumber, title, totalTutors, totalHours, totalAmount, status);

    const created = db.prepare('SELECT * FROM payruns WHERE id = ?').get(id);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
