import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));

    const existing = db.prepare('SELECT * FROM payruns WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Pay run not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const authorizedBy = body.authorizedBy || 'Chief Operations Officer';

    db.prepare(`
      UPDATE payruns
      SET status = 'Approved & Dispatched', authorized_at = ?, authorized_by = ?
      WHERE id = ?
    `).run(now, authorizedBy, params.id);

    const updated = db.prepare('SELECT * FROM payruns WHERE id = ?').get(params.id);
    return NextResponse.json({
      success: true,
      message: `Pay run ${existing.batch_number} authorized successfully`,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
