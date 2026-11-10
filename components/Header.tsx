'use client';

import React from 'react';
import { UserRole } from '@/types';
import { BuddyLogo } from '@/components/BuddyLogo';
import { useAuth } from '@/lib/auth/AuthContext';
import {
  Flame,
  Calendar,
  Building2,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  LayoutDashboard,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  streakCount: number;
  totalXp: number;
  onOpenStreakModal?: () => void;
  onOpenBuddyInsightModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  streakCount,
  totalXp,
  onOpenStreakModal,
  onOpenBuddyInsightModal,
}) => {
  const { currentUser, canAccessRole, logout, setIsAccountModalOpen } = useAuth();

  const allRoles: { id: UserRole; label: string; index: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Overview',
      index: '00',
      icon: <LayoutDashboard className="w-3.5 h-3.5" />,
    },
    {
      id: 'learner',
      label: 'Learner Hub',
      index: '01',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      id: 'tutor',
      label: 'Tutor Terminal',
      index: '02',
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
    {
      id: 'sponsor',
      label: 'Sponsor Suite',
      index: '03',
      icon: <Building2 className="w-3.5 h-3.5" />,
    },
    {
      id: 'admin',
      label: 'Admin Command',
      index: '04',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];

  // Strictly filter navigation: ONLY render roles pertaining to the active authenticated user
  const permittedRoles = allRoles.filter((role) => canAccessRole(role.id));

  return (
    <header className="sticky top-0 z-40 w-full bg-buddy-cream/95 backdrop-blur-md border-b border-buddy-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div
            onClick={() => onRoleChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Return to Overview"
          >
            <BuddyLogo size="md" />
            <div className="hidden sm:block h-6 w-[1px] bg-buddy-border" />
            <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-buddy-charcoalLight group-hover:text-buddy-primary transition-colors">
              STEM Tutoring
            </span>
          </div>

          {/* Role-Specific Navigation Bar (Only visible roles render) */}
          <div className="hidden md:flex items-center p-1 rounded-xl bg-white border border-buddy-border shadow-subtle">
            {permittedRoles.map((role) => {
              const isActive = currentRole === role.id;

              return (
                <button
                  key={role.id}
                  onClick={() => onRoleChange(role.id)}
                  className={`relative flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-buddy-charcoal text-white font-semibold shadow-sm'
                      : 'text-buddy-charcoalMuted hover:text-buddy-charcoal hover:bg-buddy-cream'
                  }`}
                >
                  <span
                    className={`font-mono text-[10px] ${
                      isActive ? 'text-buddy-primary' : 'text-buddy-charcoalLight'
                    }`}
                  >
                    [{role.index}]
                  </span>
                  <span>{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions & User Identity */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenBuddyInsightModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-buddy-primaryLight text-buddy-charcoal text-xs font-medium border border-buddy-border hover:border-buddy-primary/40 transition-all shadow-subtle"
              title="View Learner Progress Report"
            >
              <Sparkles className="w-3.5 h-3.5 text-buddy-primary" />
              <span className="font-semibold text-[11px]">Progress Report</span>
            </button>

            {currentRole === 'dashboard' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-creamMuted border border-buddy-border text-buddy-charcoal font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-buddy-emerald" />
                <span className="hidden sm:inline">Term 4</span>
              </div>
            )}

            {currentRole === 'learner' && (
              <button
                onClick={onOpenStreakModal}
                className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-buddy-primaryLight border border-buddy-primary/30 hover:border-buddy-primary transition-all text-buddy-primaryText text-xs font-semibold shadow-subtle"
                title="View Streak"
              >
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-buddy-primary fill-buddy-primary" />
                  <span className="font-mono">{streakCount}d</span>
                </div>
                <div className="h-3 w-[1px] bg-buddy-primary/30" />
                <span className="font-mono font-bold text-buddy-charcoal">
                  {totalXp.toLocaleString()} XP
                </span>
              </button>
            )}

            {currentRole === 'tutor' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-creamMuted border border-buddy-border text-buddy-charcoal font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-buddy-emerald" />
                <span>Tier 1 • $45/hr</span>
              </div>
            )}

            {currentRole === 'sponsor' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-creamMuted border border-buddy-border text-buddy-charcoal font-mono text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5 text-buddy-primary" />
                <span className="hidden sm:inline">
                  {currentUser?.organizationName || 'Anglo American Trust'}
                </span>
                <span className="sm:hidden">Sponsor</span>
              </div>
            )}

            {currentRole === 'admin' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-buddy-creamMuted border border-buddy-border text-buddy-charcoal font-mono text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-buddy-emerald" />
                <span>Global Command</span>
              </div>
            )}

            {/* Authenticated User Identity Pill */}
            <div className="flex items-center pl-1.5 border-l border-buddy-border gap-2">
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-white hover:bg-buddy-cream border border-buddy-border transition-all shadow-subtle group"
                title="Active identity profile"
              >
                <div className="w-7 h-7 rounded-lg overflow-hidden border border-buddy-border bg-buddy-creamMuted shrink-0">
                  <img
                    src={
                      currentUser?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
                    }
                    alt={currentUser?.name || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left hidden lg:block leading-tight">
                  <div className="text-xs font-bold text-buddy-charcoal flex items-center gap-1.5">
                    <span className="truncate max-w-[110px]">
                      {currentUser?.name || 'Guest User'}
                    </span>
                    <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-buddy-cream text-buddy-primary font-bold border border-buddy-border">
                      [{currentUser?.role || 'GUEST'}]
                    </span>
                  </div>
                  <div className="text-[10px] text-buddy-charcoalMuted truncate max-w-[130px]">
                    {currentUser?.organizationName || 'Buddy Learning'}
                  </div>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-buddy-charcoalLight group-hover:text-buddy-charcoal ml-0.5 hidden sm:block" />
              </button>

              {/* Direct Sign Out Button */}
              <button
                onClick={() => logout()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-buddy-charcoalMuted hover:text-rose-600 border border-buddy-border hover:border-rose-200 transition-all shadow-subtle text-xs font-medium"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline text-[11px]">Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Viewport Role Bar (Filtered to permitted roles only) */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 border-t border-buddy-border no-scrollbar">
          {permittedRoles.map((role) => {
            const isActive = currentRole === role.id;

            return (
              <button
                key={role.id}
                onClick={() => onRoleChange(role.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isActive
                    ? 'bg-buddy-charcoal text-white font-semibold'
                    : 'bg-white text-buddy-charcoalMuted border border-buddy-border'
                }`}
              >
                <span className="font-mono text-[10px]">[{role.index}]</span>
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
