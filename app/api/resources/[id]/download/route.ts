import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(params.id);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }

    db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').run(params.id);
    const updated = db.prepare('SELECT * FROM resources WHERE id = ?').get(params.id);

    return NextResponse.json({
      success: true,
      message: 'Download initiated',
      resourceId: params.id,
      downloadCount: updated.download_count,
      downloadUrl: `/downloads/${updated.id}.${updated.format.toLowerCase()}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
