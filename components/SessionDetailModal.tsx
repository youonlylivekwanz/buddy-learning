'use client';

import React, { useState } from 'react';
import { Lesson } from '@/types';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Circle,
  RotateCw,
} from 'lucide-react';

interface SessionDetailModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchClassroom?: (lesson: Lesson) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onLaunchClassroom,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [tasks, setTasks] = useState(
    lesson?.aiSummary?.recommendedHomework || []
  );

  if (!isOpen || !lesson) return null;

  const toggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1200);
  };

  const ai = lesson.aiSummary;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-2">
            <span
              className={`academic-pill ${
                lesson.status === 'upcoming'
                  ? 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                  : lesson.status === 'completed'
                  ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                  : 'bg-buddy-creamMuted text-buddy-charcoalMuted border border-buddy-border'
              }`}
            >
              {lesson.status}
            </span>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              Room #{lesson.roomCode}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-buddy-charcoal">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-buddy-primaryText font-semibold">
              <span>{lesson.subject}</span>
              <span>•</span>
              <span className="text-buddy-charcoalLight">{lesson.grade}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-buddy-charcoal mt-1">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-buddy-charcoalMuted font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-buddy-charcoalLight" />
                <span>{lesson.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-buddy-charcoalLight" />
                <span>{lesson.time} ({lesson.durationMinutes} min)</span>
              </div>
              <div className="flex items-center gap-1.5 text-buddy-charcoal font-sans font-medium">
                <span>Tutor: {lesson.tutorName}</span>
              </div>
            </div>
          </div>

          {/* AI Summary Card */}
          {ai ? (
            <div className="academic-card p-6 space-y-5 border-t-2 border-t-buddy-primary bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-buddy-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-buddy-primaryLight text-buddy-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
                      AI Session Recap & Synthesis
                      <span className="academic-pill bg-buddy-creamMuted text-buddy-charcoalLight border border-buddy-border">
                        Auto-Compiled
                      </span>
                    </h3>
                    <p className="text-xs text-buddy-charcoalMuted">
                      Curriculum Mastery Index: <strong className="text-buddy-primaryText font-mono font-bold">{ai.masteryScorePercent}%</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex items-center gap-1.5 font-mono text-xs text-buddy-charcoalLight hover:text-buddy-charcoal transition-colors"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin text-buddy-primary' : ''}`} />
                  <span>{isRegenerating ? 'Processing...' : 'Regenerate'}</span>
                </button>
              </div>

              {/* Takeaways */}
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal mb-2 block">
                  Core Conceptual Rules
                </span>
                <ul className="space-y-2 text-xs text-buddy-charcoalMuted">
                  {ai.takeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-buddy-cream p-3 rounded-lg border border-buddy-border">
                      <span className="w-1.5 h-1.5 rounded-full bg-buddy-primary mt-1.5 flex-shrink-0" />
                      <span className="leading-relaxed text-buddy-charcoal">{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulas */}
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal mb-2 block">
                  High-Yield Equations & Proofs
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ai.keyFormulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-buddy-primaryLight border border-buddy-primary/30 font-mono text-xs font-semibold text-buddy-charcoal flex items-center justify-between"
                    >
                      <span>{formula}</span>
                      <span className="text-[10px] text-buddy-charcoalLight uppercase font-sans">Formula #{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Homework Tasks */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoal">
                    Reinforcement Homework Tasks
                  </span>
                  <span className="font-mono text-[10px] text-buddy-charcoalLight">
                    Click checkbox to complete
                  </span>
                </div>

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                        task.completed
                          ? 'bg-buddy-creamMuted/60 border-buddy-border text-buddy-charcoalLight'
                          : 'bg-white border-buddy-border hover:border-buddy-primary/60 text-buddy-charcoal'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-buddy-emerald flex-shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-buddy-charcoalLight flex-shrink-0" />
                        )}
                        <span className={`text-xs ${task.completed ? 'line-through text-buddy-charcoalLight' : 'font-medium'}`}>
                          {task.task}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`academic-pill ${
                            task.difficulty === 'Challenge'
                              ? 'bg-buddy-coralLight text-buddy-coralText border border-buddy-coral/20'
                              : 'bg-buddy-creamMuted text-buddy-charcoal border border-buddy-border'
                          }`}
                        >
                          {task.difficulty}
                        </span>
                        <span className="font-mono text-[11px] text-buddy-charcoalLight hidden sm:inline">
                          Due: {task.dueDate}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tutor Note */}
              <div className="p-3.5 rounded-lg bg-buddy-cream border border-buddy-border text-xs">
                <span className="font-mono text-[10px] font-bold text-buddy-charcoal uppercase block mb-1">
                  Mentor Note ({lesson.tutorName}):
                </span>
                <p className="text-buddy-charcoalMuted italic">
                  &quot;{ai.tutorFeedback}&quot;
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-buddy-cream border border-buddy-border text-center space-y-2">
              <Sparkles className="w-8 h-8 text-buddy-primary mx-auto" />
              <p className="text-sm font-semibold text-buddy-charcoal">
                AI Summary will auto-compile after this session concludes.
              </p>
              <p className="text-xs text-buddy-charcoalMuted max-w-md mx-auto">
                During the call, ambient audio transcription extracts high-yield formulas and targeted practice problems.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-buddy-cream border-t border-buddy-border flex items-center justify-between">
          <span className="font-mono text-xs text-buddy-charcoalLight">
            {lesson.status === 'upcoming' ? 'Scheduled Session' : 'Archived Session'}
          </span>

          <div className="flex items-center gap-2">
            {lesson.status === 'upcoming' && (
              <button
                onClick={() => {
                  onClose();
                  if (onLaunchClassroom) onLaunchClassroom(lesson);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white font-semibold text-xs transition-all shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-buddy-primary" />
                <span>Launch Live Classroom</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
