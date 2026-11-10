import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/server/db';
import { AISessionSummary } from '@/types';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));

    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(params.id);
    if (!lesson) {
      return NextResponse.json({ success: false, error: 'Lesson not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const duration = body.durationMinutes || lesson.duration_minutes || 90;
    const hourlyRate = 45.0;
    const totalEarned = (duration / 60) * hourlyRate;

    const defaultAiSummary: AISessionSummary = body.aiSummary || {
      takeaways: [
        `Mastered core derivations for ${lesson.subject}`,
        'Recognized critical examiner cues in trial exam problem sets',
        'Verified algebraic constraints and domain boundary conditions',
      ],
      keyFormulas: [
        "f'(x) = 0 for stationary points",
        "f''(x) = 0 for point of inflection",
      ],
      recommendedHomework: [
        {
          id: `hw-${Date.now()}-1`,
          task: `Solve November 2024 Question 8 on ${lesson.subject}`,
          dueDate: 'In 3 days',
          completed: false,
          difficulty: 'Medium',
        },
      ],
      tutorFeedback: body.notes || 'Learner engaged actively and demonstrated strong concept mastery.',
      masteryScorePercent: 88,
    };

    // 1. Update lesson status & AI summary
    db.prepare(`
      UPDATE lessons
      SET status = 'completed', ai_summary = ?
      WHERE id = ?
    `).run(JSON.stringify(defaultAiSummary), params.id);

    // 2. Insert session log for tutor pay tracking
    const logId = `log-${Date.now().toString(36)}`;
    db.prepare(`
      INSERT INTO session_logs (
        id, tutor_id, tutor_name, learner_id, learner_name, subject,
        date, duration_minutes, rate_tier, hourly_rate, total_earned,
        attendance_status, notes, ai_summary_generated, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      logId,
      lesson.tutor_id,
      lesson.tutor_name,
      lesson.learner_id,
      lesson.learner_name,
      lesson.subject,
      lesson.date,
      duration,
      'Tier 1: Senior STEM Specialist',
      hourlyRate,
      totalEarned,
      body.attendanceStatus || 'present',
      body.notes || 'Session completed with live whiteboard derivation pad.',
      1,
      'approved',
      now
    );

    // 3. Update learner gamification (XP, hours, streak)
    const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(lesson.learner_id);
    let updatedLearner = null;
    if (learner) {
      const newXp = learner.total_xp + 150;
      const newStreak = learner.streak_count + 1;
      const newHours = learner.hours_completed + (duration / 60);
      const newLevel = Math.floor(newXp / 1000) + 1;

      db.prepare(`
        UPDATE learners
        SET total_xp = ?, streak_count = ?, hours_completed = ?, level = ?, last_active_date = ?
        WHERE id = ?
      `).run(newXp, newStreak, newHours, newLevel, now.split('T')[0], lesson.learner_id);

      updatedLearner = {
        id: learner.id,
        streakCount: newStreak,
        totalXp: newXp,
        level: newLevel,
        hoursCompleted: newHours,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Lesson completed successfully',
      lessonId: params.id,
      xpAwarded: 150,
      tutorEarned: totalEarned,
      learner: updatedLearner,
      aiSummary: defaultAiSummary,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
