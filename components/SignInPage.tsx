'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { BuddyLogo } from '@/components/BuddyLogo';
import { Role } from '@/lib/db';
import {
  GraduationCap,
  Calendar,
  Building2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SignInPageProps {
  onSignedIn?: (role: 'dashboard' | 'learner' | 'tutor' | 'sponsor' | 'admin') => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onSignedIn }) => {
  const { availablePersonas, loginAs } = useAuth();
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loadingPersonaId, setLoadingPersonaId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectRole = async (personaId: string, role: Role) => {
    try {
      setErrorMessage(null);
      setLoadingPersonaId(personaId);
      await loginAs(personaId);

      // Route directly to their primary portal
      const targetRole =
        role === Role.LEARNER
          ? 'learner'
          : role === Role.TUTOR
          ? 'tutor'
          : role === Role.BRANCH_MANAGER
          ? 'sponsor'
          : 'admin';

      if (onSignedIn) onSignedIn(targetRole);
    } catch {
      setErrorMessage('Failed to sign in. Please try again.');
    } finally {
      setLoadingPersonaId(null);
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Please enter an email address.');
      return;
    }

    const matched = availablePersonas.find(
      (p) => p.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matched) {
      await handleSelectRole(matched.id, matched.role);
    } else {
      // Default to Learner if email not found
      await handleSelectRole(availablePersonas[0].id, availablePersonas[0].role);
    }
  };

  return (
    <div className="min-h-screen bg-buddy-cream flex flex-col justify-between selection:bg-buddy-primaryLight selection:text-buddy-primaryText">
      {/* Top Brand Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between border-b border-buddy-border">
        <div className="flex items-center gap-3">
          <BuddyLogo size="md" />
          <div className="hidden sm:block h-6 w-[1px] bg-buddy-border" />
          <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-buddy-charcoalLight">
            Enterprise LMS
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-buddy-charcoalLight">
          <span className="w-2 h-2 rounded-full bg-buddy-emerald animate-pulse" />
          <span className="hidden sm:inline">Role-Based Access Control</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl space-y-8 animate-fadeIn">
          {/* Header Title */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-buddy-primaryLight border border-buddy-primary/30 text-buddy-primaryText text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
              <span className="font-mono text-[11px] uppercase tracking-wide">
                Single Sign-On &amp; Role Gate
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-buddy-charcoal">
              Sign In to Buddy Learning
            </h1>

            <p className="text-sm sm:text-base text-buddy-charcoalMuted max-w-xl mx-auto">
              Select your role to access your dedicated workspace. You will only see tools,
              analytics, and resources permitted for your role.
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex p-1 rounded-xl bg-white border border-buddy-border shadow-subtle">
              <button
                type="button"
                onClick={() => setActiveTab('quick')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'quick'
                    ? 'bg-buddy-charcoal text-white shadow-sm'
                    : 'text-buddy-charcoalMuted hover:text-buddy-charcoal'
                }`}
              >
                Choose Role / Persona
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('credentials')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'credentials'
                    ? 'bg-buddy-charcoal text-white shadow-sm'
                    : 'text-buddy-charcoalMuted hover:text-buddy-charcoal'
                }`}
              >
                Sign in with Email
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium text-center">
              {errorMessage}
            </div>
          )}

          {/* Tab 1: Role Selection Cards */}
          {activeTab === 'quick' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePersonas.map((persona) => {
                const isLoading = loadingPersonaId === persona.id;
                const isLearner = persona.role === Role.LEARNER;
                const isTutor = persona.role === Role.TUTOR;
                const isSponsor = persona.role === Role.BRANCH_MANAGER;
                const isAdmin = persona.role === Role.GLOBAL_ADMIN;

                const roleBadge = isLearner
                  ? '[ 01 ] LEARNER'
                  : isTutor
                  ? '[ 02 ] TUTOR'
                  : isSponsor
                  ? '[ 03 ] SPONSOR'
                  : '[ 04 ] ADMIN';

                const icon = isLearner ? (
                  <GraduationCap className="w-5 h-5 text-buddy-primary" />
                ) : isTutor ? (
                  <Calendar className="w-5 h-5 text-emerald-600" />
                ) : isSponsor ? (
                  <Building2 className="w-5 h-5 text-amber-700" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-buddy-charcoal" />
                );

                const subtitle = isLearner
                  ? 'Grade 10–12 STEM lessons, past exam papers, live whiteboard & revision vault'
                  : isTutor
                  ? 'Session timer, learner logs, availability calendar & hourly pay tracking'
                  : isSponsor
                  ? 'Cohort attendance tracking, bursary compliance audits & verified progress dossiers'
                  : 'Platform health, tutor pay runs, compliance state machine & global telemetry';

                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectRole(persona.id, persona.role)}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white border border-buddy-border p-6 shadow-subtle hover:border-buddy-primary transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-buddy-primary tracking-wide">
                          {roleBadge}
                        </span>
                        <div className="p-2 rounded-xl bg-buddy-cream border border-buddy-border group-hover:border-buddy-primary/40 transition-colors">
                          {icon}
                        </div>
                      </div>

                      <div>
                        <h2 className="text-lg font-bold text-buddy-charcoal group-hover:text-buddy-primary transition-colors">
                          {persona.title}
                        </h2>
                        <p className="text-xs text-buddy-charcoalMuted mt-1 leading-relaxed">
                          {subtitle}
                        </p>
                      </div>

                      {/* Persona Profile Snapshot */}
                      <div className="pt-3 border-t border-buddy-border flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-buddy-border bg-buddy-cream shrink-0">
                          <img
                            src={persona.avatarUrl}
                            alt={persona.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="leading-tight text-left">
                          <div className="text-xs font-bold text-buddy-charcoal">{persona.name}</div>
                          <div className="text-[10px] text-buddy-charcoalMuted truncate max-w-[200px]">
                            {persona.organizationName}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-buddy-border flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase text-buddy-charcoalLight">
                        {persona.role} PORTAL
                      </span>
                      <button
                        disabled={isLoading}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-buddy-charcoal text-white group-hover:bg-buddy-primary font-semibold text-xs transition-all shadow-subtle"
                      >
                        <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Traditional Credentials Form */}
          {activeTab === 'credentials' && (
            <div className="max-w-md mx-auto bg-white border border-buddy-border rounded-2xl p-6 sm:p-8 shadow-subtle space-y-5">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-buddy-charcoal">Sign In with Email</h2>
                <p className="text-xs text-buddy-charcoalMuted">
                  Enter your registered institutional email to access your role workspace.
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-mono font-semibold text-buddy-charcoal">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buddy-charcoalLight" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="zanele.k@anglo-scholars.co.za"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoal focus:outline-none focus:border-buddy-primary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-mono font-semibold text-buddy-charcoal">
                    Password / Token
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buddy-charcoalLight" />
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-buddy-cream border border-buddy-border text-xs text-buddy-charcoal focus:outline-none focus:border-buddy-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-buddy-primary hover:bg-buddy-primaryHover text-white font-bold text-xs uppercase tracking-wider transition-all shadow-subtle"
                >
                  Sign In to Workspace
                </button>
              </form>

              <div className="pt-3 border-t border-buddy-border text-[11px] text-buddy-charcoalMuted space-y-1">
                <span className="font-semibold block text-buddy-charcoal">Demo Quick Accounts:</span>
                <div className="font-mono text-[10px] space-y-0.5 text-buddy-charcoalLight">
                  <div>Learner: zanele.k@anglo-scholars.co.za</div>
                  <div>Tutor: sipho.tutor@buddylearning.co.za</div>
                  <div>Sponsor: thandiwe.m@anglo-edu.co.za</div>
                  <div>Admin: admin@buddylearning.co.za</div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Governance Notice */}
          <div className="p-4 rounded-xl bg-white border border-buddy-border text-center text-xs text-buddy-charcoalMuted space-y-1 max-w-xl mx-auto shadow-subtle">
            <div className="flex items-center justify-center gap-1.5 font-semibold text-buddy-charcoal">
              <Lock className="w-3.5 h-3.5 text-buddy-primary" />
              <span>Strict Privacy &amp; Role-Level Multi-Tenancy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              In accordance with POPIA regulations, learners, tutors, and sponsors only have visibility
              over their assigned workspace and records.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-buddy-border text-xs text-buddy-charcoalMuted flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="font-mono text-[11px] text-buddy-charcoalLight">
          © {new Date().getFullYear()} Buddy Learning (Pty) Ltd. All rights reserved.
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px] text-buddy-charcoalLight">
          <span>POPIA Compliant</span>
          <span>•</span>
          <span>CAPS &amp; IEB Aligned</span>
          <span>•</span>
          <span>Enterprise STEM LMS</span>
        </div>
      </footer>
    </div>
  );
};
