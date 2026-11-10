import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(params.id);
    if (!learner) {
      return NextResponse.json({ success: false, error: 'Learner not found' }, { status: 404 });
    }

    const newStreak = learner.streak_count + 1;
    let xpGained = 50;
    if (newStreak % 7 === 0) {
      xpGained = 250; // Milestone bonus
    }
    const newXp = learner.total_xp + xpGained;
    const newLevel = Math.floor(newXp / 1000) + 1;
    const today = new Date().toISOString().split('T')[0];

    db.prepare(`
      UPDATE learners
      SET streak_count = ?, total_xp = ?, level = ?, last_active_date = ?
      WHERE id = ?
    `).run(newStreak, newXp, newLevel, today, params.id);

    return NextResponse.json({
      success: true,
      message: 'Streak check-in logged',
      streakCount: newStreak,
      xpGained,
      totalXp: newXp,
      level: newLevel,
      milestoneBonus: newStreak % 7 === 0,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
