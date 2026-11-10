'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  Award,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  MOCK_TUTOR_SCHEDULE,
  MOCK_SESSION_LOGS,
} from '@/data/mockData';
import { TutorAvailability, SessionLog } from '@/types';
import { api } from '@/lib/apiClient';

export const TutorDashboard: React.FC = () => {
  const [schedule, setSchedule] = useState<TutorAvailability[]>(MOCK_TUTOR_SCHEDULE);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>(MOCK_SESSION_LOGS);

  // Live Session Logger State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedLearner, setSelectedLearner] = useState('Zanele Khumalo (Gr 12)');
  const [selectedSubject] = useState('Grade 12 Mathematics (Calculus)');
  const [attendance, setAttendance] = useState<'present' | 'late' | 'absent'>('present');
  const [lessonNotes, setLessonNotes] = useState('');
  const [sessionSuccessToast, setSessionSuccessToast] = useState<string | null>(null);

  const HOURLY_RATE = 45; // Tier 1: Senior STEM Specialist
  const TARGET_HOURS = 60;

  // Sync with live backend
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.tutors.getSchedule(),
      api.tutors.getLogs(),
    ]).then(([schedRes, logsRes]) => {
      if (!mounted) return;
      if (schedRes.status === 'fulfilled' && schedRes.value?.length > 0) {
        setSchedule(schedRes.value);
      }
      if (logsRes.status === 'fulfilled' && logsRes.value?.length > 0) {
        setSessionLogs(logsRes.value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  const totalLoggedMinutes = sessionLogs.reduce((acc, log) => acc + log.durationMinutes, 0);
  const totalLoggedHours = Math.round((totalLoggedMinutes / 60) * 10) / 10;
  const currentEarnings = sessionLogs.reduce((acc, log) => acc + log.totalEarned, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleSlotStatus = async (dayIndex: number, slotIndex: number) => {
    const dayObj = schedule[dayIndex];
    const targetSlot = dayObj.slots[slotIndex];
    const newStatus = targetSlot.status === 'available' ? 'blocked' : 'available';

    setSchedule((prev) => {
      const updated = [...prev];
      updated[dayIndex].slots[slotIndex].status = newStatus;
      return updated;
    });

    try {
      await api.tutors.updateSlot(dayObj.day, targetSlot.time, newStatus);
    } catch {
      // ignore
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    const durationMins = Math.max(Math.round(timerSeconds / 60), 45);
    const earned = (durationMins / 60) * HOURLY_RATE;

    const newLog: SessionLog = {
      id: `log-${Date.now()}`,
      tutorId: 'tut-01',
      tutorName: 'Sipho Dlamini, MSc',
      learnerId: 'learner-new',
      learnerName: selectedLearner.split('(')[0].trim(),
      subject: selectedSubject,
      date: new Date().toISOString().split('T')[0],
      durationMinutes: durationMins,
      rateTier: 'Tier 1: Senior STEM Specialist',
      hourlyRate: HOURLY_RATE,
      totalEarned: Math.round(earned * 100) / 100,
      attendanceStatus: attendance,
      notes: lessonNotes || 'Completed scheduled syllabus section. Key calculus proofs practiced.',
      aiSummaryGenerated: true,
      status: 'approved',
    };

    setSessionLogs((prev) => [newLog, ...prev]);
    setIsTimerRunning(false);
    setTimerSeconds(0);
    setLessonNotes('');
    setSessionSuccessToast(
      `Session logged for ${newLog.learnerName}! +$${newLog.totalEarned.toFixed(2)} credited.`
    );

    setTimeout(() => {
      setSessionSuccessToast(null);
    }, 4000);

    try {
      await api.tutors.createLog(newLog);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notice */}
      {sessionSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-buddy-charcoal text-white text-xs shadow-lift flex items-center gap-3 border border-buddy-border animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5 text-buddy-emerald" />
          <span className="font-mono">{sessionSuccessToast}</span>
        </div>
      )}

      {/* Grid Index Header */}
      <div className="flex items-center justify-between border-b border-buddy-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-buddy-charcoalLight">
            [ 02 // TUTOR TERMINAL & DISPATCH ]
          </span>
          <span className="text-buddy-border">/</span>
          <span className="text-xs font-semibold text-buddy-charcoal">
            Sipho Dlamini, MSc (Tier 1 Specialist)
          </span>
        </div>
        <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20">
          Direct EFT Ready
        </span>
      </div>

      {/* 3 Top Bento KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Earnings Card */}
        <div className="academic-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-buddy-charcoalLight">
              October Reconciled Pay
            </span>
            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
              Verified
            </span>
          </div>

          <p className="text-3xl font-heading font-extrabold text-buddy-charcoal tabular-nums">
            ${currentEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          <p className="text-xs text-buddy-charcoalMuted">
            Based on <strong className="text-buddy-charcoal">{totalLoggedHours} logged hours</strong> at Tier 1 STEM Specialist rate.
          </p>

          <div className="pt-3 border-t border-buddy-border text-[11px] font-mono text-buddy-charcoalLight flex items-center justify-between">
            <span>Next Payout: Nov 01, 2026</span>
            <span className="text-buddy-emeraldText font-medium">Reconciled 100%</span>
          </div>
        </div>

        {/* Target Hours Progress */}
        <div className="academic-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-buddy-charcoalLight">
              Monthly Mentorship Hours
            </span>
            <span className="font-mono text-xs font-bold text-buddy-charcoal">
              {Math.round((totalLoggedHours / TARGET_HOURS) * 100)}%
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-heading font-extrabold text-buddy-charcoal tabular-nums">
              {totalLoggedHours}h
            </span>
            <span className="text-xs font-mono text-buddy-charcoalLight">
              / {TARGET_HOURS}h Target
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-buddy-creamMuted overflow-hidden border border-buddy-border">
            <div
              className="h-full rounded-full bg-buddy-primary"
              style={{ width: `${Math.min((totalLoggedHours / TARGET_HOURS) * 100, 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-buddy-charcoalMuted pt-1">
            Achieving 60 hours qualifies for the +5% Quarterly Bursary Mentor Bonus.
          </p>
        </div>

        {/* Rate Tier Status */}
        <div className="academic-card p-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono uppercase tracking-wider text-buddy-charcoalLight">
              Compensation Classification
            </span>
            <Award className="w-4 h-4 text-buddy-primary" />
          </div>

          <h3 className="text-xl font-heading font-bold text-buddy-charcoal">
            Tier 1: Senior STEM
          </h3>
          <p className="text-xs font-mono text-buddy-primaryText font-bold">
            ${HOURLY_RATE}.00 / Verified Hour
          </p>

          <div className="pt-3 border-t border-buddy-border text-[11px] text-buddy-charcoalMuted space-y-1">
            <div className="flex justify-between">
              <span>Standard Baseline:</span>
              <span className="font-mono text-buddy-charcoal">$35/hr</span>
            </div>
            <div className="flex justify-between">
              <span>Senior Specialist Uplift:</span>
              <span className="font-mono text-buddy-emeraldText font-medium">+28% Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Weekly Schedule Matrix (7 cols) + Session Logger (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dynamic Calendar Availability (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-buddy-primary" />
                <span>Weekly Availability Schedule</span>
              </h2>
              <p className="text-xs text-buddy-charcoalMuted">
                Click any slot to toggle between Available and Blocked.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-buddy-emerald" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-buddy-charcoal" /> Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-buddy-borderDark" /> Blocked
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {schedule.map((dayPlan, dayIdx) => (
              <div
                key={dayPlan.day}
                className="academic-card p-3.5 space-y-2 bg-white"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-buddy-border">
                  <span className="font-heading font-bold text-xs text-buddy-charcoal">
                    {dayPlan.day}
                  </span>
                  <span className="font-mono text-[10px] text-buddy-charcoalLight">
                    {dayPlan.slots.filter((s) => s.status === 'available').length} Open
                  </span>
                </div>

                <div className="space-y-1">
                  {dayPlan.slots.map((slot, slotIdx) => (
                    <button
                      key={slotIdx}
                      type="button"
                      onClick={() => toggleSlotStatus(dayIdx, slotIdx)}
                      className={`w-full text-left p-1.5 rounded-md text-xs font-mono transition-all border ${
                        slot.status === 'booked'
                          ? 'bg-buddy-charcoal text-white border-buddy-charcoal font-semibold cursor-default'
                          : slot.status === 'available'
                          ? 'bg-buddy-primaryLight text-buddy-primaryText border-buddy-primary/30 hover:border-buddy-primary font-medium'
                          : 'bg-buddy-creamMuted text-buddy-charcoalLight border-buddy-border'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{slot.time}</span>
                        <span className="uppercase text-[9px] font-bold">
                          {slot.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Session Logger (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
              <Clock className="w-4 h-4 text-buddy-primary" />
              <span>Live Session Logger</span>
            </h2>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              Biometric Timesheet
            </span>
          </div>

          <form
            onSubmit={handleSaveSession}
            className="academic-card p-5 space-y-4"
          >
            {/* Stopwatch Timer Display */}
            <div className="p-4 rounded-xl bg-buddy-cream border border-buddy-border text-center">
              <span className="font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight tracking-wider">
                Session Elapsed Stopwatch
              </span>
              <div className="font-mono text-3xl font-extrabold text-buddy-charcoal my-1 tabular-nums">
                {formatTimer(timerSeconds)}
              </div>

              <div className="flex items-center justify-center gap-2 mt-2">
                {!isTimerRunning ? (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Timer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-primary text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(0);
                  }}
                  className="p-1.5 rounded-lg bg-white border border-buddy-border text-buddy-charcoalLight hover:text-buddy-charcoal transition-colors"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Learner Select */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal block mb-1">
                Scholar Participant
              </label>
              <select
                value={selectedLearner}
                onChange={(e) => setSelectedLearner(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-buddy-border text-xs text-buddy-charcoal focus:outline-none focus:border-buddy-primary font-medium"
              >
                <option>Zanele Khumalo (Gr 12 - Pure Maths)</option>
                <option>Tshepo Modise (Gr 11 - Physical Science)</option>
                <option>Amara Patel (Gr 12 - Calculus)</option>
                <option>Liam Ndlovu (Gr 10 - Algebra)</option>
              </select>
            </div>

            {/* Attendance Checklist */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal block mb-1">
                Attendance Check
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['present', 'late', 'absent'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setAttendance(status)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold uppercase tracking-wider border transition-all ${
                      attendance === status
                        ? status === 'present'
                          ? 'bg-buddy-emeraldLight text-buddy-emeraldText border-buddy-emerald/40'
                          : status === 'late'
                          ? 'bg-buddy-primaryLight text-buddy-primaryText border-buddy-primary/40'
                          : 'bg-buddy-coralLight text-buddy-coralText border-buddy-coral/40'
                        : 'bg-white border-buddy-border text-buddy-charcoalLight hover:text-buddy-charcoal'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal block mb-1">
                Session Pedagogical Log & Homework
              </label>
              <textarea
                rows={3}
                placeholder="Key concepts mastered, derivations practiced, and follow-up homework..."
                value={lessonNotes}
                onChange={(e) => setLessonNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary resize-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Save className="w-3.5 h-3.5 text-buddy-primary" />
              <span>Log & Auto-Compile Timesheet</span>
            </button>
          </form>
        </div>
      </div>

      {/* Timesheet Ledger Table */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-sm text-buddy-charcoal">
            Reconciled Session Ledger
          </h2>
          <span className="font-mono text-xs text-buddy-charcoalLight">
            {sessionLogs.length} Verified Entries
          </span>
        </div>

        <div className="academic-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-buddy-cream border-b border-buddy-border text-buddy-charcoal font-semibold">
              <tr>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Date</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Scholar</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Curriculum Module</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Duration</th>
                <th className="py-2.5 px-4 text-center font-mono text-[11px] uppercase">Attendance</th>
                <th className="py-2.5 px-4 text-right font-mono text-[11px] uppercase">Earned</th>
                <th className="py-2.5 px-4 font-mono text-[11px] uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-buddy-border">
              {sessionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-buddy-cream/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-buddy-charcoalMuted">{log.date}</td>
                  <td className="py-3 px-4 font-semibold text-buddy-charcoal">{log.learnerName}</td>
                  <td className="py-3 px-4 text-buddy-charcoalMuted">{log.subject}</td>
                  <td className="py-3 px-4 text-center font-mono text-buddy-charcoal">{log.durationMinutes} min</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`academic-pill ${
                        log.attendanceStatus === 'present'
                          ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                          : 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                      }`}
                    >
                      {log.attendanceStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-buddy-charcoal tabular-nums">
                    ${log.totalEarned.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="academic-pill bg-buddy-creamMuted text-buddy-charcoalMuted border border-buddy-border">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
