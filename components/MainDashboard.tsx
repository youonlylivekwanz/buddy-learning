'use client';

import React, { useState, useMemo } from 'react';
import { UserRole, NoticeItem, EducationPoster, Lesson } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  MOCK_NOTICES,
  MOCK_EDUCATION_POSTERS,
  MOCK_LESSONS,
  INITIAL_LEARNER,
} from '@/data/mockData';
import {
  GraduationCap,
  Calendar,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Download,
  Sparkles,
  Pin,
  Clock,
  Search,
  CheckCircle2,
  Flame,
  BookOpen,
  ChevronRight,
  AlertCircle,
  FileText,
  Users,
} from 'lucide-react';

interface MainDashboardProps {
  onSelectRole: (role: UserRole) => void;
  onLaunchClassroom: (lesson: Lesson) => void;
  onOpenBuddyInsight: () => void;
  onOpenStreakModal: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onSelectRole,
  onLaunchClassroom,
  onOpenBuddyInsight,
  onOpenStreakModal,
}) => {
  const { canAccessRole, currentUser } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const categories = ['All', 'Exam Alert', 'Bursary Notice', 'Workshop', 'Curriculum Update'];

  const filteredNotices = useMemo(() => {
    return MOCK_NOTICES.filter((notice) => {
      const matchesCategory =
        selectedCategory === 'All' || notice.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleDownload = (posterTitle: string) => {
    setDownloadToast(`Downloaded: ${posterTitle}`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3000);
  };

  const handleNoticeAction = (notice: NoticeItem) => {
    if (notice.actionPayload === 'vault') {
      onSelectRole('learner');
    } else if (notice.actionPayload === 'sponsor') {
      onSelectRole('sponsor');
    } else if (notice.actionPayload === 'admin') {
      onSelectRole('admin');
    } else if (notice.actionPayload === 'live_room') {
      const targetLesson = MOCK_LESSONS[0];
      if (targetLesson) {
        onLaunchClassroom(targetLesson);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Alert */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-buddy-charcoal text-white font-mono text-xs shadow-lg border border-buddy-border animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-buddy-emerald" />
          <span>{downloadToast}</span>
        </div>
      )}

      {/* =========================================================================
          HERO BANNER: CLEAR, DIRECT, HUMAN
          ========================================================================= */}
      <section className="relative overflow-hidden rounded-2xl bg-white border border-buddy-border shadow-subtle p-6 sm:p-8 lg:p-10">
        <div className="absolute inset-0 architectural-grid opacity-50 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-buddy-primaryLight border border-buddy-primary/30 text-buddy-primaryText text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-buddy-primary" />
              <span className="font-mono text-[11px] tracking-wide uppercase">
                High School STEM Tutoring
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-buddy-charcoal leading-[1.15]">
              Personalized 1-on-1 Tutoring for{' '}
              <span className="text-buddy-primary">Mathematics &amp; Science</span>
            </h1>

            <p className="text-sm sm:text-base text-buddy-charcoalMuted max-w-2xl leading-relaxed">
              We pair Grade 10–12 learners with top university tutors.
              Structured lessons, past exam paper practice, and automated notes after every session.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onSelectRole('learner')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-buddy-primary text-white font-bold text-xs uppercase tracking-wide hover:bg-buddy-primaryHover transition-all shadow-subtle hover:scale-[1.01]"
              >
                <span>Open Learner Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenBuddyInsight}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-buddy-cream hover:bg-buddy-creamMuted text-buddy-charcoal font-medium text-xs border border-buddy-border transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
                <span className="font-semibold">Learner Progress Report</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-buddy-charcoalLight" />
              </button>

              <button
                onClick={onOpenStreakModal}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-buddy-primaryLight text-buddy-primaryText font-semibold text-xs border border-buddy-primary/20 hover:border-buddy-primary/40 transition-all"
              >
                <Flame className="w-3.5 h-3.5 text-buddy-primary fill-buddy-primary" />
                <span className="font-mono">{INITIAL_LEARNER.streakCount}-Day Streak</span>
              </button>
            </div>
          </div>

          {/* Right Column: Key Metrics */}
          <div className="lg:col-span-4 bg-buddy-cream/80 border border-buddy-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-buddy-border">
              <span className="font-mono text-[11px] uppercase tracking-wider text-buddy-charcoalLight font-bold">
                Term 4 Overview
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-buddy-emerald">
                <span className="w-2 h-2 rounded-full bg-buddy-emerald" />
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-buddy-border">
                <div className="text-[10px] font-mono text-buddy-charcoalLight uppercase">
                  Learners
                </div>
                <div className="text-xl font-mono font-bold text-buddy-charcoal mt-0.5">
                  142
                </div>
                <div className="text-[10px] text-buddy-charcoalMuted mt-0.5">
                  18 Partner Schools
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-buddy-border">
                <div className="text-[10px] font-mono text-buddy-charcoalLight uppercase">
                  Attendance
                </div>
                <div className="text-xl font-mono font-bold text-buddy-emerald mt-0.5">
                  95%
                </div>
                <div className="text-[10px] text-buddy-charcoalMuted mt-0.5">
                  Verified by Tutors
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-buddy-border">
                <div className="text-[10px] font-mono text-buddy-charcoalLight uppercase">
                  Hours Taught
                </div>
                <div className="text-xl font-mono font-bold text-buddy-charcoal mt-0.5">
                  4,800+
                </div>
                <div className="text-[10px] text-buddy-charcoalMuted mt-0.5">
                  This Academic Year
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-buddy-border">
                <div className="text-[10px] font-mono text-buddy-charcoalLight uppercase">
                  Subjects
                </div>
                <div className="text-xl font-mono font-bold text-buddy-primary mt-0.5">
                  Gr. 10–12
                </div>
                <div className="text-[10px] text-buddy-charcoalMuted mt-0.5">
                  Maths &amp; Science
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-buddy-primaryLight/40 border border-buddy-primary/20 flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-buddy-primary shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight">
                <strong className="text-buddy-charcoal font-semibold">
                  Exam Countdown:
                </strong>{' '}
                <span className="text-buddy-charcoalMuted">
                  Matric trial exams start in 18 days. Past papers and memos are ready in the Study Vault.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: REVISION GUIDES & BANNERS
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-buddy-border">
          <div>
            <div className="font-mono text-[11px] text-buddy-primary font-bold uppercase tracking-wider">
              Study Guides &amp; Bursaries
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-buddy-charcoal">
              Free Study Resources &amp; Opportunities
            </h2>
          </div>
          <p className="text-xs text-buddy-charcoalMuted font-mono">
            Downloadable formula sheets, past papers, and university bursaries
          </p>
        </div>

        {/* Poster Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MOCK_EDUCATION_POSTERS.map((poster) => {
            const isAmber = poster.accent === 'amber';
            const isCharcoal = poster.accent === 'charcoal';
            const isEmerald = poster.accent === 'emerald';

            return (
              <div
                key={poster.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-buddy-border p-6 shadow-subtle hover:border-buddy-primary/60 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase ${
                        isAmber
                          ? 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/30'
                          : isCharcoal
                          ? 'bg-buddy-charcoal text-white'
                          : isEmerald
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-buddy-creamMuted text-buddy-charcoal border border-buddy-border'
                      }`}
                    >
                      {poster.tag}
                    </span>

                    <span className="font-mono text-[11px] text-buddy-charcoalLight flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {poster.deadlineOrDate}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-buddy-charcoal group-hover:text-buddy-primary transition-colors leading-snug">
                    {poster.title}
                  </h3>

                  <p className="text-xs text-buddy-charcoalMuted mt-1.5 leading-relaxed">
                    {poster.subtitle}
                  </p>

                  {poster.formulaNote && (
                    <div className="my-3 px-3 py-2 rounded-lg bg-buddy-cream font-mono text-[11px] text-buddy-charcoal font-semibold border-l-2 border-buddy-primary border-t border-r border-b border-buddy-border flex items-center justify-between">
                      <div className="truncate">
                        <span className="text-buddy-primary font-bold mr-1.5">KEY NOTE:</span>
                        <span>{poster.formulaNote}</span>
                      </div>
                      <FileText className="w-3.5 h-3.5 text-buddy-primary shrink-0 ml-2" />
                    </div>
                  )}

                  <ul className="mt-3 space-y-1.5 text-xs text-buddy-charcoalMuted">
                    {poster.bulletPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-buddy-primary mt-1.5 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 mt-5 border-t border-buddy-border flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-buddy-charcoalLight font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-buddy-emerald" />
                    {poster.badgeText}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(poster.title)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-buddy-charcoal text-white hover:bg-black font-semibold text-xs transition-all shadow-subtle hover:scale-[1.02]"
                    >
                      <Download className="w-3.5 h-3.5 text-buddy-primary" />
                      <span>{poster.ctaLabel}</span>
                    </button>
                    {poster.targetRole && (
                      <button
                        onClick={() => onSelectRole(poster.targetRole!)}
                        className="p-1.5 rounded-lg text-buddy-charcoalMuted hover:text-buddy-charcoal hover:bg-buddy-cream border border-buddy-border transition-all"
                        title={`Go to ${poster.targetRole}`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: NOTICE BOARD
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-buddy-border">
          <div>
            <div className="font-mono text-[11px] text-buddy-primary font-bold uppercase tracking-wider">
              Announcements
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-buddy-charcoal">
              Notice Board
            </h2>
          </div>
          <span className="text-xs text-buddy-charcoalMuted font-mono">
            {filteredNotices.length} updates posted this month
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-xl border border-buddy-border shadow-subtle">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all font-medium ${
                    isActive
                      ? 'bg-buddy-charcoal text-white font-semibold'
                      : 'text-buddy-charcoalMuted hover:text-buddy-charcoal hover:bg-buddy-cream'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-buddy-charcoalLight" />
            <input
              type="text"
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoal placeholder-buddy-charcoalLight focus:outline-none focus:border-buddy-primary"
            />
          </div>
        </div>

        {/* Notices List */}
        <div className="space-y-3">
          {filteredNotices.map((notice) => {
            const isHighPriority = notice.priority === 'high';
            return (
              <div
                key={notice.id}
                className={`relative overflow-hidden rounded-xl bg-white border p-5 transition-all shadow-subtle hover:border-buddy-primary/50 ${
                  notice.pinned
                    ? 'border-buddy-primary/40 bg-gradient-to-r from-buddy-primaryLight/10 to-transparent'
                    : 'border-buddy-border'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {notice.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-buddy-primaryLight text-buddy-primaryText font-mono text-[10px] font-bold uppercase tracking-wider border border-buddy-primary/30">
                          <Pin className="w-3 h-3 text-buddy-primary" />
                          PINNED
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded bg-buddy-cream text-buddy-charcoal font-mono text-[10px] font-semibold border border-buddy-border">
                        {notice.category}
                      </span>

                      {isHighPriority && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-buddy-coral font-semibold">
                          <AlertCircle className="w-3 h-3 text-buddy-coral" />
                          Important
                        </span>
                      )}

                      <span className="font-mono text-[11px] text-buddy-charcoalLight">
                        • {notice.date}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-buddy-charcoal hover:text-buddy-primary transition-colors cursor-pointer">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-buddy-charcoalMuted leading-relaxed max-w-3xl">
                      {notice.summary}
                    </p>

                    <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-buddy-charcoalLight">
                      <span className="font-semibold text-buddy-charcoal">{notice.author}</span>
                    </div>
                  </div>

                  {notice.actionText && (
                    <div className="shrink-0 self-start sm:self-center">
                      <button
                        onClick={() => handleNoticeAction(notice)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-buddy-cream hover:bg-buddy-primary hover:text-white text-buddy-charcoal text-xs font-semibold border border-buddy-border hover:border-buddy-primary transition-all shadow-subtle group"
                      >
                        <span>{notice.actionText}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-buddy-charcoalLight group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredNotices.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-buddy-border p-6 space-y-2">
              <BookOpen className="w-8 h-8 text-buddy-charcoalLight mx-auto" />
              <div className="text-sm font-semibold text-buddy-charcoal">
                No notices found
              </div>
              <p className="text-xs text-buddy-charcoalMuted">
                Try searching for a different keyword or resetting your filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ROLE WORKSPACES (Only visible for permitted roles)
          ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-buddy-border">
          <div>
            <div className="font-mono text-[11px] text-buddy-primary font-bold uppercase tracking-wider">
              Workspaces
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-buddy-charcoal">
              {currentUser?.role === 'GLOBAL_ADMIN'
                ? 'System Portals'
                : `Your Dedicated Workspace [${currentUser?.role}]`}
            </h2>
          </div>
          <span className="text-xs text-buddy-charcoalMuted font-mono">
            {currentUser?.organizationName}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              role: 'learner' as UserRole,
              index: '01',
              title: 'Learner Hub',
              desc: 'Upcoming lessons, study materials, formula sheets, and your learning streak.',
              metric: '14-Day Streak',
              metricColor: 'text-buddy-primary',
              icon: (
                <GraduationCap className="w-4 h-4 text-buddy-charcoalLight group-hover:text-buddy-primary transition-colors" />
              ),
            },
            {
              role: 'tutor' as UserRole,
              index: '02',
              title: 'Tutor Terminal',
              desc: 'Weekly calendar, availability slots, session timer, and monthly earnings.',
              metric: 'Tier 1 • $45/hr',
              metricColor: 'text-buddy-emerald',
              icon: (
                <Calendar className="w-4 h-4 text-buddy-charcoalLight group-hover:text-buddy-primary transition-colors" />
              ),
            },
            {
              role: 'sponsor' as UserRole,
              index: '03',
              title: 'Sponsor Suite',
              desc: 'Cohort performance, attendance verification, and one-click PDF reports.',
              metric: '+18.4% Average Jump',
              metricColor: 'text-buddy-charcoal',
              icon: (
                <Building2 className="w-4 h-4 text-buddy-charcoalLight group-hover:text-buddy-primary transition-colors" />
              ),
            },
            {
              role: 'admin' as UserRole,
              index: '04',
              title: 'Admin Command',
              desc: 'Active tutoring rooms, tutor pay runs, and client invoice management.',
              metric: 'Pay Run #44',
              metricColor: 'text-buddy-emerald',
              icon: (
                <ShieldCheck className="w-4 h-4 text-buddy-charcoalLight group-hover:text-buddy-primary transition-colors" />
              ),
            },
          ]
            .filter((p) => canAccessRole(p.role))
            .map((portal) => (
              <div
                key={portal.role}
                onClick={() => onSelectRole(portal.role)}
                className="group relative cursor-pointer overflow-hidden rounded-xl bg-white border border-buddy-border p-5 shadow-subtle hover:border-buddy-primary transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] font-bold text-buddy-primary">
                    [ {portal.index} ]
                  </span>
                  {portal.icon}
                </div>

                <h3 className="text-base font-bold text-buddy-charcoal group-hover:text-buddy-primary transition-colors">
                  {portal.title}
                </h3>
                <p className="text-xs text-buddy-charcoalMuted mt-1 leading-snug">
                  {portal.desc}
                </p>

                <div className="mt-4 pt-3 border-t border-buddy-border flex items-center justify-between text-xs font-mono">
                  <span className={`font-bold ${portal.metricColor}`}>{portal.metric}</span>
                  <span className="text-buddy-charcoalMuted group-hover:text-buddy-charcoal flex items-center gap-1 font-semibold">
                    Open <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: TRUST & CURRICULUM STANDARDS
          ========================================================================= */}
      <section className="rounded-2xl bg-buddy-charcoal text-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-buddy-charcoalLight/30">
          <div className="space-y-2">
            <span className="font-mono text-[11px] text-buddy-primary font-bold tracking-wider uppercase">
              Curriculum &amp; Quality
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Aligned with South African Curriculum Standards
            </h3>
            <p className="text-xs text-buddy-charcoalLight max-w-2xl leading-relaxed">
              Every lesson is focused on mastering past paper problems, understanding core scientific principles, and building academic confidence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectRole('learner')}
              className="px-4 py-2.5 rounded-xl bg-buddy-primary text-white font-bold text-xs uppercase tracking-wide hover:bg-buddy-primaryHover transition-all flex items-center gap-2"
            >
              <span>Explore Study Vault</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
          <div className="space-y-1">
            <div className="text-buddy-primary font-bold">[ 01 ] CAPS &amp; IEB ALIGNED</div>
            <div className="text-white font-semibold">Past Exam Paper Mastery</div>
            <p className="text-buddy-charcoalLight text-[11px] leading-relaxed">
              Targeted revision using official past papers with step-by-step memos.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-buddy-primary font-bold">[ 02 ] VETTED STEM TUTORS</div>
            <div className="text-white font-semibold">Top University Achievers</div>
            <p className="text-buddy-charcoalLight text-[11px] leading-relaxed">
              Passionate engineering and science university tutors selected for clarity and patience.
            </p>
          </div>

          <div className="space-y-1">
            <div className="text-buddy-primary font-bold">[ 03 ] VERIFIED ATTENDANCE</div>
            <div className="text-white font-semibold">Accurate Reporting</div>
            <p className="text-buddy-charcoalLight text-[11px] leading-relaxed">
              Automated lesson logs and progress updates for learners, parents, and bursary sponsors.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
