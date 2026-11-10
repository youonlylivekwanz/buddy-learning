'use client';

import React, { useState, useEffect } from 'react';
import { Lesson } from '@/types';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Hand,
  MessageSquare,
  Sparkles,
  PenTool,
  PhoneOff,
  Volume2,
  Eraser,
  Send,
} from 'lucide-react';

interface VirtualClassroomModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionComplete?: (lessonId: string) => void;
}

export const VirtualClassroomModal: React.FC<VirtualClassroomModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onSessionComplete,
}) => {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const [activeTab, setActiveTab] = useState<'whiteboard' | 'aiCopilot' | 'chat'>('whiteboard');
  const [secondsElapsed, setSecondsElapsed] = useState(1320); // 22 minutes
  const [whiteboardLines, setWhiteboardLines] = useState<string[]>([
    'f(x) = 2x³ - 9x² + 12x + 1',
    'f\'(x) = 6x² - 18x + 12 = 0',
    'x² - 3x + 2 = 0  ⟹  (x - 1)(x - 2) = 0',
    'Stationary points at x = 1 (Local Max) and x = 2 (Local Min)',
    'f\'\'(x) = 12x - 18 = 0  ⟹  x = 1.5 (Point of Inflection)',
  ]);
  const [newAnnotation, setNewAnnotation] = useState('');
  const [aiCopilotMessages, setAiCopilotMessages] = useState<
    { sender: 'AI' | 'Learner'; text: string; timestamp: string }[]
  >([
    {
      sender: 'AI',
      text: 'Good afternoon, Zanele! I am monitoring your calculus session. Tutor Sipho just highlighted the second derivative test for inflection points.',
      timestamp: '16:15',
    },
    {
      sender: 'Learner',
      text: 'Why do we need f\'\'(x) = 0 if the gradient is already 0 at turning points?',
      timestamp: '16:18',
    },
    {
      sender: 'AI',
      text: 'Great question! A turning point requires f\'(x)=0, but f\'\'(x) tells you concavity. Where f\'\'(x)=0 and changes sign, the curve transitions between concave up and concave down without necessarily being flat.',
      timestamp: '16:19',
    },
  ]);
  const [userQuery, setUserQuery] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !lesson) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendAiQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const query = userQuery;
    setUserQuery('');
    setAiCopilotMessages((prev) => [
      ...prev,
      { sender: 'Learner', text: query, timestamp: 'Just now' },
    ]);

    setTimeout(() => {
      setAiCopilotMessages((prev) => [
        ...prev,
        {
          sender: 'AI',
          text: `Insight for "${query}": When sketching cubic graphs with a > 0, the curve starts in quadrant 3 (negative infinity), reaches a local maximum, dips to a local minimum, and rises into quadrant 1.`,
          timestamp: 'Just now',
        },
      ]);
    }, 800);
  };

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;
    setWhiteboardLines((prev) => [...prev, newAnnotation]);
    setNewAnnotation('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-buddy-charcoal/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-buddy-coralLight border border-buddy-coral/30 text-buddy-coralText text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-buddy-coral animate-ping" />
              <span>LIVE ROOM</span>
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-heading font-bold text-buddy-charcoal flex items-center gap-2">
                {lesson.title}
                <span className="font-mono text-xs font-normal text-buddy-charcoalLight">
                  ({lesson.roomCode})
                </span>
              </h2>
              <p className="text-xs text-buddy-charcoalMuted">
                Tutor: <strong className="text-buddy-charcoal">{lesson.tutorName}</strong> • Scholar: <strong className="text-buddy-charcoal">{lesson.learnerName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-md bg-white border border-buddy-border text-buddy-charcoal font-mono text-xs font-semibold">
              Elapsed: <span className="text-buddy-primaryText">{formatTimer(secondsElapsed)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-buddy-cream">
          {/* Left: Video Feeds & Collaborative Whiteboard (8 cols) */}
          <div className="lg:col-span-8 flex flex-col border-r border-buddy-border p-4 gap-4 overflow-y-auto">
            {/* Split Video Stage */}
            <div className="grid grid-cols-2 gap-3 h-52 sm:h-60">
              {/* Tutor Feed */}
              <div className="relative rounded-xl overflow-hidden bg-buddy-charcoal border border-buddy-border shadow-sm group">
                <img
                  src={lesson.tutorAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=300&q=80'}
                  alt={lesson.tutorName}
                  className="w-full h-full object-cover opacity-95 group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white font-mono">
                  <Volume2 className="w-3 h-3 text-buddy-primary animate-pulse" />
                  <span>Speaking</span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    {lesson.tutorName} (Tutor)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white font-medium">
                    Host
                  </span>
                </div>
              </div>

              {/* Learner Feed */}
              <div className="relative rounded-xl overflow-hidden bg-buddy-charcoal border border-buddy-border shadow-sm group">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=300&q=80"
                  alt="Learner"
                  className={`w-full h-full object-cover transition-transform duration-300 ${videoActive ? 'opacity-95' : 'opacity-20'}`}
                />
                {!videoActive && (
                  <div className="absolute inset-0 flex items-center justify-center text-white/50">
                    <VideoOff className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-white truncate">
                    {lesson.learnerName} (You)
                  </span>
                  {handRaised && (
                    <span className="academic-pill bg-buddy-primary text-white font-bold">
                      <Hand className="w-3 h-3" /> Hand Raised
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Collaborative Whiteboard Pad */}
            <div className="flex-1 flex flex-col min-h-[260px] academic-card p-4 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-buddy-border mb-3">
                <div className="flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-buddy-primary" />
                  <span className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal">
                    Collaborative Math Derivation Pad
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWhiteboardLines([])}
                    className="flex items-center gap-1 font-mono text-[11px] text-buddy-charcoalLight hover:text-buddy-coral transition-colors"
                  >
                    <Eraser className="w-3 h-3" /> Clear
                  </button>
                  <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
                    Live Sync
                  </span>
                </div>
              </div>

              {/* Whiteboard lines */}
              <div className="flex-1 architectural-grid bg-buddy-cream rounded-lg p-3 font-mono text-xs sm:text-sm text-buddy-charcoal overflow-y-auto space-y-2 border border-buddy-border">
                {whiteboardLines.length === 0 ? (
                  <p className="text-buddy-charcoalLight italic text-xs py-4 text-center font-sans">
                    Whiteboard is clear. Type an equation or question below to write on the shared canvas.
                  </p>
                ) : (
                  whiteboardLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-white border border-buddy-border text-buddy-charcoal flex items-center justify-between shadow-subtle"
                    >
                      <span className="font-mono text-buddy-primary font-bold mr-2">{idx + 1}.</span>
                      <span className="flex-1 font-mono font-medium">{line}</span>
                      <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Derivation</span>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddAnnotation} className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Type an equation or annotation (e.g. f''(x) = 12x - 18)..."
                  value={newAnnotation}
                  onChange={(e) => setNewAnnotation(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold transition-colors"
                >
                  Annotate
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: AI Tutor Copilot (4 cols) */}
          <div className="lg:col-span-4 flex flex-col bg-white p-4 border-t lg:border-t-0 border-buddy-border">
            <div className="flex items-center gap-2 pb-3 border-b border-buddy-border">
              <button
                onClick={() => setActiveTab('whiteboard')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'whiteboard'
                    ? 'bg-buddy-charcoal text-white shadow-sm'
                    : 'text-buddy-charcoalMuted hover:bg-buddy-cream'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
                <span>AI Copilot</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-buddy-charcoal text-white shadow-sm'
                    : 'text-buddy-charcoalMuted hover:bg-buddy-cream'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Session Chat</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col justify-between overflow-hidden py-3">
              <div className="space-y-3 overflow-y-auto pr-1">
                <div className="p-3 rounded-lg bg-buddy-primaryLight border border-buddy-primary/30">
                  <div className="flex items-center gap-2 text-xs font-bold text-buddy-primaryText mb-1 font-heading">
                    <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
                    <span>Real-Time Concept Tracker</span>
                  </div>
                  <p className="text-xs text-buddy-charcoal leading-relaxed">
                    Target topic: <strong className="text-buddy-charcoal font-bold">Cubic Function Optimization</strong>. Estimated syllabus mastery: <strong className="text-buddy-primaryText font-mono">92%</strong>.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-buddy-charcoalLight">
                    Live Dialogue & Queries
                  </span>
                  {aiCopilotMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2.5 rounded-lg text-xs ${
                        msg.sender === 'AI'
                          ? 'bg-buddy-cream border border-buddy-border text-buddy-charcoal'
                          : 'bg-buddy-primaryLight border border-buddy-primary/20 text-buddy-primaryText ml-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-buddy-charcoalLight mb-1">
                        <span className={msg.sender === 'AI' ? 'text-buddy-charcoal font-bold' : 'text-buddy-primaryText font-bold'}>
                          {msg.sender === 'AI' ? 'Buddy Copilot' : 'You (Zanele)'}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed font-sans">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSendAiQuery} className="mt-3 pt-2 border-t border-buddy-border flex gap-2">
                <input
                  type="text"
                  placeholder="Ask AI Copilot for a concept hint..."
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="px-6 py-3.5 bg-buddy-cream border-t border-buddy-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMicActive(!micActive)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                micActive
                  ? 'bg-white border-buddy-border text-buddy-charcoal hover:bg-buddy-cream'
                  : 'bg-buddy-coralLight border-buddy-coral text-buddy-coralText'
              }`}
            >
              {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setVideoActive(!videoActive)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                videoActive
                  ? 'bg-white border-buddy-border text-buddy-charcoal hover:bg-buddy-cream'
                  : 'bg-buddy-coralLight border-buddy-coral text-buddy-coralText'
              }`}
            >
              {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setScreenShared(!screenShared)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                screenShared
                  ? 'bg-buddy-charcoal border-buddy-charcoal text-white'
                  : 'bg-white border-buddy-border text-buddy-charcoal hover:bg-buddy-cream'
              }`}
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setHandRaised(!handRaised)}
              className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                handRaised
                  ? 'bg-buddy-primary border-buddy-primary text-white'
                  : 'bg-white border-buddy-border text-buddy-charcoal hover:bg-buddy-cream'
              }`}
            >
              <Hand className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (onSessionComplete) onSessionComplete(lesson.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-buddy-coral hover:bg-red-600 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave & Auto-Save Recap</span>
          </button>
        </div>
      </div>
    </div>
  );
};
