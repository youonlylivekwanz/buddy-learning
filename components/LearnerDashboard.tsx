'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Award,
  Video,
  Download,
  Calendar,
  Clock,
  Search,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Zap,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Lesson, ResourceItem } from '@/types';
import { INITIAL_LEARNER, MOCK_LESSONS, MOCK_RESOURCES, MOCK_BADGES } from '@/data/mockData';
import { api } from '@/lib/apiClient';
import { ScormRuntimeBridge } from '@/components/scorm/ScormRuntimeBridge';

interface LearnerDashboardProps {
  onLaunchClassroom: (lesson: Lesson) => void;
  onOpenLessonDetails: (lesson: Lesson) => void;
  onOpenStreakModal: () => void;
  onOpenBuddyInsightModal?: () => void;
}

export const LearnerDashboard: React.FC<LearnerDashboardProps> = ({
  onLaunchClassroom,
  onOpenLessonDetails,
  onOpenStreakModal,
  onOpenBuddyInsightModal,
}) => {
  const [learner, setLearner] = useState(INITIAL_LEARNER);
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [resources, setResources] = useState<ResourceItem[]>(MOCK_RESOURCES);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimedBonus, setClaimedBonus] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [activeScorm, setActiveScorm] = useState<{
    courseId: string;
    courseTitle: string;
    enrollmentId: string;
    scormUrl: string;
    scormVersion: 'SCORM_12' | 'SCORM_2004';
  } | null>(null);

  // Sync with live database on mount
  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      api.learners.getById('learner-01'),
      api.lessons.getAll(),
      api.resources.getAll(),
    ]).then(([learnerRes, lessonsRes, resourcesRes]) => {
      if (!mounted) return;
      if (learnerRes.status === 'fulfilled' && learnerRes.value) {
        setLearner((prev) => ({
          ...prev,
          name: learnerRes.value.name || prev.name,
          streakCount: learnerRes.value.streakDays ?? prev.streakCount,
          totalXp: (learnerRes.value as any).totalXp ?? prev.totalXp,
        }));
      }
      if (lessonsRes.status === 'fulfilled' && lessonsRes.value?.length > 0) {
        setLessons(lessonsRes.value);
      }
      if (resourcesRes.status === 'fulfilled' && resourcesRes.value?.length > 0) {
        setResources(resourcesRes.value);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Claim Daily XP action
  const handleClaimXP = async () => {
    if (claimedBonus) return;
    setClaimedBonus(true);
    setLearner((prev) => ({
      ...prev,
      totalXp: prev.totalXp + 75,
    }));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#F8991D', '#1C1917', '#E5870E', '#FEF5E7'],
    });

    try {
      await api.learners.checkInStreak('learner-01');
    } catch {
      // offline/optimistic fallback
    }
  };

  const handleDownloadResource = async (resource: ResourceItem) => {
    setDownloadNotice(`Downloading: ${resource.title} (${resource.fileSize})`);
    setTimeout(() => {
      setDownloadNotice(null);
    }, 3500);

    try {
      const result = await api.resources.download(resource.id);
      if (result?.downloadCount) {
        setResources((prev) =>
          prev.map((r) =>
            r.id === resource.id ? { ...r, downloadCount: result.downloadCount } : r
          )
        );
      }
    } catch {
      // ignore
    }
  };

  // Next upcoming lesson
  const nextLesson = lessons.find((l) => l.status === 'upcoming') || lessons[0];

  // Filtered resources
  const filteredResources = resources.filter((res) => {
    const matchesSubject =
      selectedSubject === 'all' ||
      (selectedSubject === 'maths' && res.subject === 'Mathematics') ||
      (selectedSubject === 'physics' && res.subject === 'Physical Science') ||
      (selectedSubject === 'recordings' && res.type === 'recording') ||
      (selectedSubject === 'past_papers' && res.type === 'past_paper');

    const matchesSearch =
      res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notice */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-buddy-charcoal text-white text-xs shadow-lift flex items-center gap-3 border border-buddy-border animate-in slide-in-from-bottom">
          <Download className="w-4 h-4 text-buddy-primary animate-bounce" />
          <span className="font-mono">{downloadNotice}</span>
        </div>
      )}

      {/* Grid Header & Editorial Index */}
      <div className="flex items-center justify-between border-b border-buddy-border pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-buddy-charcoalLight">
            [ 01 // LEARNER TERMINAL ]
          </span>
          <span className="text-buddy-border">/</span>
          <span className="text-xs font-semibold text-buddy-charcoal">
            {learner.school} (Grade {learner.grade})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-buddy-emerald" />
          <span className="font-mono text-[11px] text-buddy-charcoalLight uppercase">
            Active Term 4 Bursary Scholar
          </span>
        </div>
      </div>

      {/* Top Bento Banner: Scholar Greeting, XP Progress, Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Scholar Card (8 cols) */}
        <div className="lg:col-span-8 academic-card p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
                Grade 12 STEM
              </span>
              <span className="academic-pill bg-buddy-creamMuted text-buddy-charcoalMuted border border-buddy-border">
                {learner.sponsor}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-buddy-charcoal tracking-tight">
              Good day, <span className="text-buddy-primary">{learner.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-buddy-charcoalMuted max-w-xl leading-relaxed">
              Your academic standing ranks <strong className="text-buddy-charcoal font-bold">#2 in your scholarship cohort</strong>. Next session on <strong className="text-buddy-charcoal">Differential Calculus</strong> starts today at 16:00.
            </p>
          </div>

          {/* XP & Level Progress */}
          <div className="pt-6 mt-4 border-t border-buddy-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-buddy-primaryLight text-buddy-primary flex items-center justify-center font-bold text-xs">
                  ⚡
                </span>
                <span className="font-semibold text-buddy-charcoal">
                  Level {learner.level}: <span className="text-buddy-primaryText">{learner.rankTitle}</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                {learner.totalXp.toLocaleString()} / {learner.nextLevelXp.toLocaleString()} XP
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-buddy-creamMuted overflow-hidden border border-buddy-border">
              <div
                className="h-full rounded-full bg-buddy-primary transition-all duration-300"
                style={{ width: `${(learner.totalXp / learner.nextLevelXp) * 100}%` }}
              />
            </div>

            {onOpenBuddyInsightModal && (
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={onOpenBuddyInsightModal}
                  className="inline-flex items-center gap-1.5 text-xs text-buddy-primaryText hover:text-buddy-charcoal font-medium transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
                  <span>Inspect Synchronized Base44 Diagnostic Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-buddy-charcoalLight">
                  ID: 69ef398b6f7864ef...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Streak & Attendance Actions (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Streak Box */}
          <div
            onClick={onOpenStreakModal}
            className="academic-card p-5 cursor-pointer hover:border-buddy-primary transition-all group flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono uppercase tracking-wider text-buddy-charcoalLight">
                  Learning Velocity
                </span>
                <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
                  Active
                </span>
              </div>

              <div className="flex items-center gap-3 my-2">
                <div className="w-12 h-12 rounded-xl bg-buddy-primaryLight border border-buddy-primary/30 flex items-center justify-center text-buddy-primary">
                  <Flame className="w-6 h-6 fill-buddy-primary" />
                </div>
                <div>
                  <p className="font-heading font-extrabold text-3xl text-buddy-charcoal">
                    {learner.streakCount} <span className="text-sm font-normal text-buddy-charcoalLight">Days</span>
                  </p>
                  <p className="text-xs text-buddy-charcoalMuted">
                    {learner.streakFreezes} Streak Shields Protected
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-mono text-buddy-charcoalLight pt-2 border-t border-buddy-border flex items-center justify-between group-hover:text-buddy-charcoal">
              <span>View streak multiplier breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </p>
          </div>

          {/* Daily XP Claim Button */}
          <button
            onClick={handleClaimXP}
            disabled={claimedBonus}
            className={`w-full py-3.5 px-4 rounded-xl font-heading font-semibold text-xs transition-all flex items-center justify-center gap-2 border ${
              claimedBonus
                ? 'bg-buddy-emeraldLight text-buddy-emeraldText border-buddy-emerald/30 cursor-default'
                : 'bg-buddy-charcoal hover:bg-black text-white border-buddy-charcoal shadow-sm'
            }`}
          >
            {claimedBonus ? (
              <>
                <Check className="w-4 h-4 text-buddy-emerald" />
                <span>Attendance Bonus Claimed (+75 XP)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-buddy-primary" />
                <span>Claim Daily Attendance Bonus (+75 XP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Corporate Compliance Training Slot */}
      <div className="academic-card p-4 sm:p-5 bg-gradient-to-r from-buddy-cream via-white to-buddy-primaryLight/40 border border-buddy-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-buddy-charcoal text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Zap className="w-5 h-5 text-buddy-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20">
                Mandatory Compliance
              </span>
              <span className="font-mono text-[11px] text-buddy-charcoalLight">
                SCORM 1.2 / 2004 Runtime
              </span>
            </div>
            <h3 className="font-heading font-bold text-sm text-buddy-charcoal mt-1">
              POPIA &amp; High School Learner Data Privacy (South Africa)
            </h3>
            <p className="text-xs text-buddy-charcoalMuted">
              Required annual compliance certification. Tracks live CMI bookmarking &amp; Tin Can xAPI telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setActiveScorm({
              courseId: 'course-popia',
              courseTitle: 'POPIA & High School Learner Data Privacy (South Africa)',
              enrollmentId: 'enr-01',
              scormUrl: '/scorm/popia-compliance/index.html',
              scormVersion: 'SCORM_12',
            })
          }
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-buddy-primary hover:bg-buddy-primaryHover text-white text-xs font-bold shadow-subtle transition-all flex-shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Launch SCORM Runtime</span>
        </button>
      </div>

      {/* Mastery Badges Shelf */}
      <div className="academic-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-buddy-primary" />
            <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-buddy-charcoal">
              Curriculum Mastery Credentials
            </h2>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              ({MOCK_BADGES.filter((b) => b.unlocked).length} / {MOCK_BADGES.length} Verified)
            </span>
          </div>

          <button
            onClick={onOpenStreakModal}
            className="text-xs font-semibold text-buddy-primaryText hover:text-buddy-charcoal transition-colors flex items-center gap-1"
          >
            <span>Credentials Vault</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {MOCK_BADGES.map((badge) => (
            <div
              key={badge.id}
              onClick={onOpenStreakModal}
              className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                badge.unlocked
                  ? 'bg-white border-buddy-border hover:border-buddy-primary/60 shadow-subtle'
                  : 'bg-buddy-creamMuted/40 border-buddy-border/60 opacity-50'
              }`}
            >
              <div className="text-xl mb-1">{badge.icon}</div>
              <h4 className="text-xs font-semibold text-buddy-charcoal truncate">
                {badge.title}
              </h4>
              <span
                className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded mt-1 uppercase font-semibold ${
                  badge.rarity === 'legendary'
                    ? 'bg-buddy-primaryLight text-buddy-primaryText'
                    : 'bg-buddy-creamMuted text-buddy-charcoalMuted'
                }`}
              >
                {badge.rarity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Upcoming Lesson (7 cols) + AI Lesson Recap (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Upcoming Lesson & Scheduling Engine (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
              <Calendar className="w-4 h-4 text-buddy-primary" />
              <span>[ 02 // SCHEDULED LESSON ]</span>
            </h2>
            <span className="font-mono text-xs text-buddy-charcoalLight">
              Room Code: <strong className="text-buddy-charcoal">{nextLesson.roomCode}</strong>
            </span>
          </div>

          {/* Featured Upcoming Lesson Card */}
          <div className="academic-card p-6 space-y-4 border-l-4 border-l-buddy-primary">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20 inline-block mb-2">
                  Starts in 35 minutes
                </span>
                <h3 className="font-heading font-bold text-lg text-buddy-charcoal">
                  {nextLesson.title}
                </h3>
                <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                  Subject: <strong className="text-buddy-charcoal">{nextLesson.subject}</strong> ({nextLesson.grade})
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl overflow-hidden border border-buddy-border flex-shrink-0">
                <img
                  src={nextLesson.tutorAvatar}
                  alt={nextLesson.tutorName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 py-3 border-y border-buddy-border text-xs text-buddy-charcoalMuted font-mono">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                <span>{nextLesson.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                <span>{nextLesson.time} ({nextLesson.durationMinutes} min)</span>
              </div>
              <div className="flex items-center gap-1.5 font-sans font-medium text-buddy-charcoal">
                <span>Tutor: {nextLesson.tutorName}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onLaunchClassroom(nextLesson)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-buddy-charcoal hover:bg-black text-white font-semibold text-xs transition-all shadow-sm"
              >
                <Video className="w-3.5 h-3.5 text-buddy-primary" />
                <span>Launch Virtual Classroom</span>
              </button>

              <button
                onClick={() => onOpenLessonDetails(nextLesson)}
                className="px-4 py-2.5 rounded-lg bg-white hover:bg-buddy-cream text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors"
              >
                Inspect Syllabus & Formulas
              </button>
            </div>
          </div>

          {/* Recent Lesson List */}
          <div className="space-y-2 pt-2">
            <span className="font-mono text-xs uppercase tracking-wider text-buddy-charcoalLight block">
              Prior Academic Sessions
            </span>
            <div className="space-y-2">
              {lessons.slice(1, 4).map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => onOpenLessonDetails(lesson)}
                  className="academic-card p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:border-buddy-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-buddy-creamMuted border border-buddy-border flex items-center justify-center font-mono text-xs font-bold text-buddy-charcoal flex-shrink-0">
                      {lesson.subject === 'Mathematics' ? 'M' : 'P'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-buddy-charcoal truncate">
                        {lesson.title}
                      </h4>
                      <p className="text-[11px] text-buddy-charcoalLight font-mono">
                        {lesson.date} • {lesson.time} • {lesson.tutorName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`academic-pill ${
                        lesson.status === 'completed'
                          ? 'bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20'
                          : 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                      }`}
                    >
                      {lesson.status}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-buddy-charcoalLight" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: AI Smart Lesson Recap (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-bold text-sm text-buddy-charcoal flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-buddy-primary" />
              <span>[ 03 // AMBIENT AI RECAP ]</span>
            </h2>
            <span className="font-mono text-xs text-buddy-primaryText font-semibold">
              Oct 23 Session
            </span>
          </div>

          <div className="academic-card p-5 space-y-4 border-t-2 border-t-buddy-primary">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-buddy-charcoalLight tracking-wider">
                Physical Science Synthesis
              </span>
              <h3 className="font-heading font-bold text-sm text-buddy-charcoal mt-0.5">
                Esterification & IUPAC Nomenclature
              </h3>
              <p className="text-xs text-buddy-charcoalMuted mt-0.5">
                Tutor Elena Rostova • Mastery Score: <strong className="text-buddy-primaryText font-mono">96%</strong>
              </p>
            </div>

            {/* AI Bulleted Takeaways */}
            <div className="space-y-1.5 text-xs text-buddy-charcoalMuted">
              <span className="font-mono text-[11px] uppercase tracking-wider text-buddy-charcoal font-semibold block">
                Synthesized Conceptual Rules
              </span>
              <div className="p-3 rounded-lg bg-buddy-cream border border-buddy-border space-y-1.5">
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-buddy-primary mt-1.5 flex-shrink-0" />
                  <span>Synthesized ethyl propanoate from ethanol and propanoic acid under acid reflux.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-buddy-primary mt-1.5 flex-shrink-0" />
                  <span>Intermolecular forces hierarchy: Hydrogen bonding dictates boiling point peaks.</span>
                </p>
              </div>
            </div>

            {/* Formula Card */}
            <div className="p-3 rounded-lg bg-buddy-primaryLight border border-buddy-primary/30 font-mono text-xs text-buddy-charcoal flex items-center justify-between">
              <span className="font-semibold text-buddy-primaryText">
                R-COOH + R&apos;-OH ⇌ R-COO-R&apos; + H₂O
              </span>
              <span className="text-[10px] text-buddy-charcoalLight uppercase">Esterification</span>
            </div>

            {/* Homework Checklist */}
            <div className="space-y-1.5">
              <span className="font-mono text-[11px] uppercase tracking-wider text-buddy-charcoal font-semibold block">
                Assigned Follow-Up Tasks
              </span>
              <div className="p-2.5 rounded-lg bg-white border border-buddy-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-buddy-emerald flex-shrink-0" />
                  <span className="text-buddy-charcoalMuted line-through">
                    Draw structural formulas for 4 isomers of C4H8O2
                  </span>
                </div>
                <span className="academic-pill bg-buddy-emeraldLight text-buddy-emeraldText border border-buddy-emerald/20">
                  Done
                </span>
              </div>
            </div>

            <button
              onClick={() => onOpenLessonDetails(lessons[2])}
              className="w-full py-2 rounded-lg bg-buddy-cream hover:bg-buddy-creamMuted text-buddy-charcoal text-xs font-semibold border border-buddy-border transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Expand Full AI Synthesis & Recording</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-buddy-charcoalLight" />
            </button>
          </div>
        </div>
      </div>

      {/* Resource Vault Tab & Clean Media Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-buddy-border pt-4">
          <div>
            <h2 className="font-heading font-extrabold text-lg text-buddy-charcoal flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-buddy-primary" />
              <span>[ 04 // RESOURCE VAULT & REPOSITORIES ]</span>
            </h2>
            <p className="text-xs text-buddy-charcoalMuted">
              Verified NSC exam past papers, master formula sheets, and live whiteboard recordings.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-buddy-charcoalLight absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter resources or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'maths', label: 'Mathematics' },
            { id: 'physics', label: 'Physical Science' },
            { id: 'past_papers', label: 'Past Papers' },
            { id: 'recordings', label: 'Session Recordings' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSubject(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedSubject === tab.id
                  ? 'bg-buddy-charcoal text-white font-semibold shadow-sm'
                  : 'bg-white text-buddy-charcoalMuted hover:text-buddy-charcoal border border-buddy-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="academic-card p-5 flex flex-col justify-between hover:border-buddy-primary/60 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`academic-pill ${
                      res.type === 'recording'
                        ? 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                        : 'bg-buddy-creamMuted text-buddy-charcoal border border-buddy-border'
                    }`}
                  >
                    {res.type.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-[11px] text-buddy-charcoalLight">
                    {res.fileSize} • {res.format}
                  </span>
                </div>

                <h4 className="font-heading font-bold text-sm text-buddy-charcoal group-hover:text-buddy-primaryDark transition-colors leading-snug">
                  {res.title}
                </h4>

                <p className="text-xs text-buddy-charcoalMuted mt-2 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1 mt-3">
                  {res.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-buddy-cream border border-buddy-border text-buddy-charcoalLight"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-buddy-border flex items-center justify-between">
                <span className="font-mono text-[11px] text-buddy-charcoalLight">
                  {res.downloadCount} downloads
                </span>

                <button
                  onClick={() => handleDownloadResource(res)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-cream hover:bg-buddy-primaryLight text-buddy-charcoal hover:text-buddy-primaryText text-xs font-semibold border border-buddy-border hover:border-buddy-primary/40 transition-all"
                >
                  <Download className="w-3.5 h-3.5 text-buddy-primary" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sandboxed SCORM Runtime Modal */}
      {activeScorm && (
        <ScormRuntimeBridge
          courseId={activeScorm.courseId}
          courseTitle={activeScorm.courseTitle}
          enrollmentId={activeScorm.enrollmentId}
          scormUrl={activeScorm.scormUrl}
          scormVersion={activeScorm.scormVersion}
          learnerId="usr-learner-01"
          learnerName={learner.name}
          onClose={() => setActiveScorm(null)}
          onCompleted={() => {
            setDownloadNotice('Compliance certificate issued! +150 XP awarded.');
            setTimeout(() => setDownloadNotice(null), 4000);
          }}
        />
      )}
    </div>
  );
};
