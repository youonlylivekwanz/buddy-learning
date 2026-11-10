import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { TutorAvailability } from '@/types';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT day, slots FROM tutor_availability WHERE tutor_id = ?').all('tut-01');

    const schedule: TutorAvailability[] = rows.map((r: any) => ({
      day: r.day,
      slots: JSON.parse(r.slots),
    }));

    return NextResponse.json({ success: true, data: schedule });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();
    const { day, time, status } = body;

    const row = db.prepare('SELECT slots FROM tutor_availability WHERE tutor_id = ? AND day = ?').get('tut-01', day);
    if (!row) {
      return NextResponse.json({ success: false, error: 'Day not found' }, { status: 404 });
    }

    const slots = JSON.parse(row.slots);
    const targetSlot = slots.find((s: any) => s.time === time);
    if (targetSlot) {
      targetSlot.status = status;
    } else {
      slots.push({ time, status });
    }

    db.prepare('UPDATE tutor_availability SET slots = ? WHERE tutor_id = ? AND day = ?').run(
      JSON.stringify(slots),
      'tut-01',
      day
    );

    return NextResponse.json({ success: true, message: 'Slot updated', day, slots });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
