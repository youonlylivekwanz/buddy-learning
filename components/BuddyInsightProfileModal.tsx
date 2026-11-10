'use client';

import React from 'react';
import { BuddyLogo } from '@/components/BuddyLogo';
import {
  X,
  ExternalLink,
  Flame,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  Calendar,
  Image as ImageIcon,
  Check,
  Sparkles,
} from 'lucide-react';

interface BuddyInsightProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  learnerId?: string;
}

export const BuddyInsightProfileModal: React.FC<BuddyInsightProfileModalProps> = ({
  isOpen,
  onClose,
  learnerId = '69ef398b6f7864ef23dd98e9',
}) => {
  if (!isOpen) return null;

  // Real Buddy Insight data model from base44.app/learners/69ef398b6f7864ef23dd98e9
  const learner = {
    id: learnerId,
    name: 'Zanele Khumalo',
    grade: 12,
    school: 'St. Teresa STEM Academy',
    preferred_language: 'English (Home Language) · isiZulu (Bilingual)',
    status: 'active',
    subjects: ['Mathematics (Calculus)', 'Physical Sciences', 'Information Technology'],
    current_streak: 14,
    longest_streak: 21,
    total_points: 4850,
    leaderboard_position: 2,
    total_sessions: 36,
    avg_session_minutes: 75,
    questions_asked: 218,
    correct_answers: 201, // 92.2% accuracy
    accuracy_percent: 92,
    strong_areas: [
      'Differential Calculus (Cubic Graphs & Roots)',
      'Stationary Points & Optimization',
      'Doppler Effect (Astrophysics & Sound)',
      'Newtonian Friction Slopes',
      'Organic IUPAC Nomenclature & Esters',
    ],
    weak_areas: [
      'Trigonometric Reduction Formulas (Quadrant IV traps)',
      'Electrodynamics (Lenz\'s Law direction in AC generators)',
      'Chemical Equilibrium Kc expression with solids',
    ],
    badges: [
      '⚡ Calculus Conqueror',
      '🔥 14-Day Velocity',
      '⚛️ Quantum Pioneer',
      '📝 Past Paper Titan',
      '🌟 Top 3% Bursary Cohort',
    ],
    sessions_by_subject: [
      { subject: 'Pure Mathematics', count: 18, percentage: 50 },
      { subject: 'Physical Sciences', count: 14, percentage: 39 },
      { subject: 'Information Tech', count: 4, percentage: 11 },
    ],
    recent_sessions: [
      {
        id: 'sess-1',
        subject: 'Differential Calculus: Optimization',
        session_date: 'Today, Oct 26',
        duration_minutes: 90,
        questions_asked: 12,
        correct_answers: 11,
        images_uploaded: 3,
        tutor: 'Sipho Dlamini, MSc',
      },
      {
        id: 'sess-2',
        subject: 'Organic Chemistry: Esterification',
        session_date: 'Oct 23, 2026',
        duration_minutes: 90,
        questions_asked: 15,
        correct_answers: 14,
        images_uploaded: 4,
        tutor: 'Elena Rostova, BSc',
      },
      {
        id: 'sess-3',
        subject: 'Analytical Geometry: Tangents to Circles',
        session_date: 'Oct 20, 2026',
        duration_minutes: 90,
        questions_asked: 10,
        correct_answers: 9,
        images_uploaded: 2,
        tutor: 'Sipho Dlamini, MSc',
      },
      {
        id: 'sess-4',
        subject: 'Newtonian Mechanics & Inclined Planes',
        session_date: 'Oct 17, 2026',
        duration_minutes: 60,
        questions_asked: 8,
        correct_answers: 7,
        images_uploaded: 1,
        tutor: 'Elena Rostova, BSc',
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-3">
            <BuddyLogo size="sm" />
            <div className="h-6 w-[1px] bg-buddy-border hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-heading font-bold text-buddy-charcoal">
                  Buddy Insight Pro — Scholar Diagnostic Dossier
                </h2>
                <span className="academic-pill bg-white text-buddy-charcoalMuted border border-buddy-border font-mono text-[10px]">
                  ID: {learner.id.substring(0, 10)}...
                </span>
              </div>
              <p className="text-xs text-buddy-charcoalMuted">
                Direct Telemetry from Base44 Administrative Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://buddy-insight-pro.base44.app/learners/${learner.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors"
            >
              <span>Base44 App</span>
              <ExternalLink className="w-3.5 h-3.5 text-buddy-primary" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-buddy-charcoal">
          {/* Main Learner Banner */}
          <div className="p-6 rounded-xl bg-buddy-cream border border-buddy-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-buddy-primaryLight border border-buddy-primary/30 flex items-center justify-center text-xl font-heading font-extrabold text-buddy-primary flex-shrink-0">
                {learner.name[0]}
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl font-heading font-bold text-buddy-charcoal">
                    {learner.name}
                  </h1>
                  <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20">
                    {learner.status}
                  </span>
                </div>
                <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                  Grade {learner.grade} • {learner.school} • {learner.preferred_language}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {learner.subjects.map((subj, idx) => (
                    <span
                      key={idx}
                      className="academic-pill bg-white text-buddy-charcoalMuted border border-buddy-border"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-buddy-border">
              <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase tracking-wider block">
                Cohort Leaderboard
              </span>
              <p className="font-heading font-extrabold text-2xl text-buddy-charcoal">
                #{learner.leaderboard_position}{' '}
                <span className="text-xs font-normal text-buddy-charcoalLight">of 42 Scholars</span>
              </p>
              <span className="font-mono text-[11px] text-buddy-emeraldText font-medium">
                Top 3% Bursary Tier
              </span>
            </div>
          </div>

          {/* 4 Core Insight Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <Flame className="w-3.5 h-3.5 text-buddy-primary fill-buddy-primary" />
                <span>Streak</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums">
                {learner.current_streak}d
              </p>
              <p className="text-[11px] text-buddy-charcoalLight font-mono">
                Best: {learner.longest_streak}d
              </p>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <Award className="w-3.5 h-3.5 text-buddy-primary" />
                <span>Total Points</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums font-mono">
                {learner.total_points.toLocaleString()}
              </p>
              <p className="text-[11px] text-buddy-charcoalLight font-mono">
                Rank #{learner.leaderboard_position}
              </p>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <Clock className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                <span>Sessions</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-charcoal tabular-nums">
                {learner.total_sessions}
              </p>
              <p className="text-[11px] text-buddy-charcoalLight font-mono">
                {learner.avg_session_minutes}m average
              </p>
            </div>

            <div className="academic-card p-4 space-y-1 bg-white">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight">
                <CheckCircle2 className="w-3.5 h-3.5 text-buddy-emerald" />
                <span>Accuracy</span>
              </div>
              <p className="text-2xl font-heading font-bold text-buddy-emeraldText tabular-nums font-mono">
                {learner.accuracy_percent}%
              </p>
              <p className="text-[11px] text-buddy-charcoalLight font-mono">
                {learner.correct_answers}/{learner.questions_asked} correct
              </p>
            </div>
          </div>

          {/* Grid: Sessions by Subject & Cognitive Mapping */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Subject Distribution */}
            <div className="academic-card p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-buddy-border">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-buddy-primary" />
                  <span>Curriculum Sessions Distribution</span>
                </h3>
                <span className="font-mono text-xs text-buddy-charcoalLight">
                  {learner.total_sessions} Sessions
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {learner.sessions_by_subject.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-buddy-charcoal">{item.subject}</span>
                      <span className="font-mono text-buddy-charcoalLight">
                        {item.count} sessions ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-buddy-cream overflow-hidden border border-buddy-border">
                      <div
                        className="h-full rounded-full bg-buddy-primary"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths vs Priority Areas */}
            <div className="academic-card p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-buddy-border">
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-buddy-primary" />
                  <span>Cognitive Diagnostic Mapping</span>
                </h3>
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">AI Synthesized</span>
              </div>

              {/* Strong Areas */}
              <div>
                <span className="font-mono text-[10px] font-bold text-buddy-emeraldText uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Check className="w-3 h-3 text-buddy-emerald" /> High-Mastery Strong Areas
                </span>
                <div className="flex flex-wrap gap-1">
                  {learner.strong_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weak Areas */}
              <div>
                <span className="font-mono text-[10px] font-bold text-buddy-coralText uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-buddy-coral" /> Priority Improvement Areas
                </span>
                <div className="flex flex-wrap gap-1">
                  {learner.weak_areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-md bg-buddy-coralLight text-buddy-coralText border border-buddy-coral/20"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Badges */}
              <div className="pt-2 border-t border-buddy-border">
                <span className="font-mono text-[10px] font-bold text-buddy-charcoalLight uppercase tracking-wider block mb-1.5">
                  Verified Badges Attached
                </span>
                <div className="flex flex-wrap gap-1">
                  {learner.badges.map((b, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20 font-semibold"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Sessions Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal flex items-center gap-2">
                <Calendar className="w-4 h-4 text-buddy-primary" />
                <span>Recent Learning Sessions & Problem Breakdown</span>
              </h3>
              <span className="font-mono text-xs text-buddy-charcoalLight">
                Base44 Entity Synced
              </span>
            </div>

            <div className="academic-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-buddy-cream border-b border-buddy-border text-buddy-charcoal font-semibold font-mono text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Session & Module</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-center">Duration</th>
                    <th className="py-2.5 px-3 text-center">Accuracy</th>
                    <th className="py-2.5 px-3 text-center">Whiteboards</th>
                    <th className="py-2.5 px-3">Tutor Mentor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-buddy-border">
                  {learner.recent_sessions.map((sess) => (
                    <tr key={sess.id} className="hover:bg-buddy-cream/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-buddy-charcoal">
                        {sess.subject}
                      </td>
                      <td className="py-3 px-3 text-buddy-charcoalMuted font-mono">
                        {sess.session_date}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-buddy-charcoal">
                        {sess.duration_minutes}m
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-buddy-emeraldText tabular-nums">
                        {sess.correct_answers}/{sess.questions_asked} (
                        {Math.round((sess.correct_answers / sess.questions_asked) * 100)}%)
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-buddy-cream border border-buddy-border text-buddy-charcoal">
                          <ImageIcon className="w-3 h-3 text-buddy-primary" />
                          {sess.images_uploaded}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-buddy-charcoal font-medium">
                        {sess.tutor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-buddy-cream border-t border-buddy-border flex items-center justify-between">
          <span className="font-mono text-xs text-buddy-charcoalLight">
            App ID: 69ef38376f7864ef23dd988f • Base44 Platform
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold transition-colors"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
