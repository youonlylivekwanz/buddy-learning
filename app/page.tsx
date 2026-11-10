'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, Lesson, Invoice } from '@/types';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { Header } from '@/components/Header';
import { SignInPage } from '@/components/SignInPage';
import { MainDashboard } from '@/components/MainDashboard';
import { LearnerDashboard } from '@/components/LearnerDashboard';
import { TutorDashboard } from '@/components/TutorDashboard';
import { SponsorDashboard } from '@/components/SponsorDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AccountSwitcherModal } from '@/components/AccountSwitcherModal';
import { VirtualClassroomModal } from '@/components/VirtualClassroomModal';
import { SessionDetailModal } from '@/components/SessionDetailModal';
import { InvoiceModal } from '@/components/InvoiceModal';
import { SponsorReportModal } from '@/components/SponsorReportModal';
import { StreakModal } from '@/components/StreakModal';
import { BuddyInsightProfileModal } from '@/components/BuddyInsightProfileModal';
import { BuddyLogo } from '@/components/BuddyLogo';
import { INITIAL_LEARNER, MOCK_BADGES } from '@/data/mockData';
import { api } from '@/lib/apiClient';

function HomeContent() {
  const { currentUser, isLoading, canAccessRole, isAccountModalOpen, setIsAccountModalOpen } =
    useAuth();
  const [currentRole, setCurrentRole] = useState<UserRole>('dashboard');

  // Modals state
  const [classroomLesson, setClassroomLesson] = useState<Lesson | null>(null);
  const [detailLesson, setDetailLesson] = useState<Lesson | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isSponsorReportOpen, setIsSponsorReportOpen] = useState(false);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState(false);
  const [isBuddyInsightOpen, setIsBuddyInsightOpen] = useState(false);
  const [activeInsightLearnerId, setActiveInsightLearnerId] = useState('69ef398b6f7864ef23dd98e9');

  // Learner quick stats (live synced with SQLite backend)
  const [streakCount, setStreakCount] = useState(INITIAL_LEARNER.streakCount);
  const [totalXp, setTotalXp] = useState(INITIAL_LEARNER.totalXp);

  // Load live learner data on mount from backend
  useEffect(() => {
    api.learners
      .getById('learner-01')
      .then((data) => {
        if (data.streakCount !== undefined) setStreakCount(data.streakCount);
        if (data.totalXp !== undefined) setTotalXp(data.totalXp);
      })
      .catch((err) => console.warn('Backend learner fetch fallback:', err));
  }, []);

  // When user signs in, ensure currentRole is one they are authorized for
  useEffect(() => {
    if (currentUser) {
      if (!canAccessRole(currentRole)) {
        const fallbackRole = currentUser.allowedViews[1] || 'dashboard';
        setCurrentRole(fallbackRole);
      }
    }
  }, [currentUser, currentRole, canAccessRole]);

  // Keyboard navigation shortcuts: ONLY permitted roles can be triggered
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === '0' || e.key === '`') setCurrentRole('dashboard');
      if (e.key === '1' && canAccessRole('learner')) setCurrentRole('learner');
      if (e.key === '2' && canAccessRole('tutor')) setCurrentRole('tutor');
      if (e.key === '3' && canAccessRole('sponsor')) setCurrentRole('sponsor');
      if (e.key === '4' && canAccessRole('admin')) setCurrentRole('admin');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canAccessRole]);

  const handleStreakCheckIn = async () => {
    try {
      const res = await api.learners.checkInStreak('learner-01');
      if (res && res.streakCount !== undefined) {
        setStreakCount(res.streakCount);
        setTotalXp(res.totalXp);
      }
    } catch {
      setStreakCount((prev) => prev + 1);
      setTotalXp((prev) => prev + 50);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-buddy-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <BuddyLogo size="lg" />
          <div className="font-mono text-xs text-buddy-charcoalMuted">
            Initializing secure workspace...
          </div>
        </div>
      </div>
    );
  }

  // 2. Unauthenticated State -> Render Dedicated Sign-In Page
  if (!currentUser) {
    return (
      <SignInPage
        onSignedIn={(role) => {
          setCurrentRole(role);
        }}
      />
    );
  }

  // 3. Authenticated State -> Render Role-Specific Workspace
  return (
    <div className="min-h-screen bg-buddy-cream text-buddy-charcoal flex flex-col selection:bg-buddy-primaryLight selection:text-buddy-primaryText antialiased">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        streakCount={streakCount}
        totalXp={totalXp}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
        onOpenBuddyInsightModal={() => setIsBuddyInsightOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation & Active Session Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-buddy-border text-xs text-buddy-charcoalMuted shadow-subtle">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-buddy-charcoal flex items-center gap-1.5">
              <span>Authenticated:</span>
              <strong className="font-sans font-bold text-buddy-charcoal">
                {currentUser.name}
              </strong>
              <span className="px-1.5 py-0.5 rounded bg-buddy-cream text-buddy-primary font-mono text-[10px] font-bold border border-buddy-border">
                [{currentUser.role}]
              </span>
            </span>
            <span className="hidden sm:inline text-buddy-border">•</span>
            <span className="hidden sm:inline font-mono text-buddy-charcoalLight text-[11px] truncate max-w-[220px]">
              {currentUser.organizationName}
            </span>
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="text-buddy-primary font-semibold hover:underline font-mono text-[11px] ml-1 flex items-center gap-1"
            >
              <span>[Switch Persona]</span>
            </button>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-buddy-charcoalLight">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-buddy-emerald animate-pulse" />
              <span>Role-Gated Workspace Active</span>
            </div>
            <span className="hidden md:inline text-buddy-border">•</span>
            <span className="hidden md:inline">
              Active Portals: {currentUser.allowedViews.join(' / ')}
            </span>
          </div>
        </div>

        {/* Dashboards (Only Permitted Roles Render) */}
        {currentRole === 'dashboard' && (
          <MainDashboard
            onSelectRole={(role) => setCurrentRole(role)}
            onLaunchClassroom={(lesson) => setClassroomLesson(lesson)}
            onOpenBuddyInsight={() => setIsBuddyInsightOpen(true)}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
          />
        )}

        {currentRole === 'learner' && canAccessRole('learner') && (
          <LearnerDashboard
            onLaunchClassroom={(lesson) => setClassroomLesson(lesson)}
            onOpenLessonDetails={(lesson) => setDetailLesson(lesson)}
            onOpenStreakModal={() => setIsStreakModalOpen(true)}
            onOpenBuddyInsightModal={() => setIsBuddyInsightOpen(true)}
          />
        )}

        {currentRole === 'tutor' && canAccessRole('tutor') && <TutorDashboard />}

        {currentRole === 'sponsor' && canAccessRole('sponsor') && (
          <SponsorDashboard
            onOpenReportModal={() => setIsSponsorReportOpen(true)}
            onOpenBuddyInsightModal={(id) => {
              if (id) setActiveInsightLearnerId(id);
              setIsBuddyInsightOpen(true);
            }}
          />
        )}

        {currentRole === 'admin' && canAccessRole('admin') && (
          <AdminDashboard
            onOpenInvoiceModal={(invoice) => setPreviewInvoice(invoice)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-buddy-border bg-white py-8 text-xs text-buddy-charcoalMuted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BuddyLogo size="sm" />
            <span className="font-mono text-[11px] text-buddy-charcoalLight">
              • High School Mathematics &amp; Physical Science Tutoring
            </span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] text-buddy-charcoalLight">
            <span>Verified Sessions</span>
            <span>•</span>
            <span>Past Paper Library</span>
            <span>•</span>
            <span>Bursary Reporting</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AccountSwitcherModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onRoleSwitched={() => {
          // Re-evaluation handled reactively
        }}
      />

      <VirtualClassroomModal
        lesson={classroomLesson}
        isOpen={!!classroomLesson}
        onClose={() => setClassroomLesson(null)}
        onSessionComplete={async () => {
          if (classroomLesson) {
            try {
              const res = await api.lessons.complete(classroomLesson.id, {
                durationMinutes: classroomLesson.durationMinutes,
              });
              if (res.learner) {
                setStreakCount(res.learner.streakCount);
                setTotalXp(res.learner.totalXp);
                return;
              }
            } catch (err) {
              console.warn('Backend complete fallback:', err);
            }
          }
          setStreakCount((prev) => prev + 1);
          setTotalXp((prev) => prev + 150);
        }}
      />

      <SessionDetailModal
        lesson={detailLesson}
        isOpen={!!detailLesson}
        onClose={() => setDetailLesson(null)}
        onLaunchClassroom={(lesson) => {
          setDetailLesson(null);
          setClassroomLesson(lesson);
        }}
      />

      <InvoiceModal
        invoice={previewInvoice}
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
      />

      <SponsorReportModal
        isOpen={isSponsorReportOpen}
        onClose={() => setIsSponsorReportOpen(false)}
      />

      <StreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        streakCount={streakCount}
        totalXp={totalXp}
        badges={MOCK_BADGES}
        onCheckIn={handleStreakCheckIn}
      />

      <BuddyInsightProfileModal
        isOpen={isBuddyInsightOpen}
        onClose={() => setIsBuddyInsightOpen(false)}
        learnerId={activeInsightLearnerId}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}
