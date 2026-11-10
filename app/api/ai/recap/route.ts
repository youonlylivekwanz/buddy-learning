import { NextRequest, NextResponse } from 'next/server';
import { AISessionSummary } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const subject = body.subject || 'Grade 12 Mathematics';
    const topic = body.topic || 'Calculus & Optimization';
    const notes = body.notes || 'Covered cubic functions roots and optimization constraints.';

    // Generate dynamic takeaways based on subject
    const isMaths = subject.toLowerCase().includes('math');
    const isChemistry = subject.toLowerCase().includes('chem');

    let keyFormulas = [
      "f'(x) = 0 for stationary turning points",
      "f''(x) = 0 for inflection point",
      "V = πr²h, A = 2πrh + 2πr² (cylinder constraints)",
    ];

    if (isChemistry) {
      keyFormulas = [
        "R-COOH + R'-OH ⇌ R-COO-R' + H₂O (Esterification)",
        "Haloalkane + strong base (heat) → Alkene (Elimination)",
      ];
    } else if (!isMaths) {
      // Physics
      keyFormulas = [
        'f_L = (v ± v_L) / (v ∓ v_S) · f_S (Doppler Effect)',
        'F_net = ma (Newton 2nd Law)',
      ];
    }

    const summary: AISessionSummary = {
      takeaways: [
        `Verified core conceptual framework for ${topic}`,
        'Solved 4 exam-level problems under timed conditions',
        'Identified and corrected algebraic sign convention traps',
        `Tutor note addressed: "${notes}"`,
      ],
      keyFormulas,
      recommendedHomework: [
        {
          id: `hw-${Date.now()}-1`,
          task: `Complete 5 past exam questions from November 2024 on ${topic}`,
          dueDate: 'Due Friday, 17:00',
          completed: false,
          difficulty: 'Medium',
        },
        {
          id: `hw-${Date.now()}-2`,
          task: 'Summarize 1-page formula derivation note in your Study Vault',
          dueDate: 'Due Sunday, 20:00',
          completed: false,
          difficulty: 'Easy',
        },
      ],
      tutorFeedback: 'Strong engagement and solid understanding of underlying mathematical proofs.',
      masteryScorePercent: 92,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
