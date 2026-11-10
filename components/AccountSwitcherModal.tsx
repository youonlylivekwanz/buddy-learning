'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { BuddyLogo } from '@/components/BuddyLogo';
import {
  X,
  Check,
  Shield,
  GraduationCap,
  Calendar,
  Building2,
  ShieldCheck,
  LogOut,
  Lock,
} from 'lucide-react';
import { Role } from '@/lib/db';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSwitched?: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  onRoleSwitched,
}) => {
  const { currentUser, availablePersonas, loginAs, logout } = useAuth();

  if (!isOpen) return null;

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.LEARNER:
        return <GraduationCap className="w-4 h-4 text-buddy-primary" />;
      case Role.TUTOR:
        return <Calendar className="w-4 h-4 text-emerald-600" />;
      case Role.BRANCH_MANAGER:
        return <Building2 className="w-4 h-4 text-amber-700" />;
      case Role.GLOBAL_ADMIN:
        return <ShieldCheck className="w-4 h-4 text-buddy-charcoal" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const handleSelectPersona = async (personaId: string) => {
    await loginAs(personaId);
    if (onRoleSwitched) onRoleSwitched();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-3">
            <BuddyLogo size="sm" />
            <div className="h-5 w-[1px] bg-buddy-border hidden sm:block" />
            <div>
              <h2 className="text-sm sm:text-base font-bold text-buddy-charcoal">
                Identity &amp; Role-Based Access Control
              </h2>
              <p className="text-[11px] text-buddy-charcoalMuted">
                Select an authenticated LMS persona to test role-gated permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-buddy-charcoalMuted hover:text-buddy-charcoal hover:bg-white border border-transparent hover:border-buddy-border transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Active User Banner */}
        <div className="px-6 py-3 bg-buddy-creamMuted border-b border-buddy-border flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-buddy-emerald animate-pulse" />
            <span className="font-mono text-[11px] text-buddy-charcoalLight uppercase">
              Current Session:
            </span>
            <span className="text-xs font-bold text-buddy-charcoal">
              {currentUser?.name || 'Unauthenticated Guest'}
            </span>
            {currentUser && (
              <span className="px-2 py-0.5 rounded bg-white text-buddy-primary font-mono text-[10px] font-bold border border-buddy-border">
                [{currentUser.role}]
              </span>
            )}
          </div>

          {currentUser && (
            <button
              onClick={async () => {
                await logout();
              }}
              className="flex items-center gap-1.5 text-[11px] font-mono text-buddy-coral hover:underline"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* Personas List */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="text-xs font-mono text-buddy-charcoalLight uppercase tracking-wider mb-2">
            Available Verified Personas
          </div>

          {availablePersonas.map((persona) => {
            const isSelected = currentUser?.id === persona.id;

            return (
              <div
                key={persona.id}
                onClick={() => handleSelectPersona(persona.id)}
                className={`group cursor-pointer p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-buddy-primary bg-buddy-primaryLight/15 shadow-subtle'
                    : 'border-buddy-border hover:border-buddy-primary/40 bg-white hover:bg-buddy-cream/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-buddy-border bg-buddy-cream shrink-0 mt-0.5">
                    <img
                      src={persona.avatarUrl}
                      alt={persona.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-buddy-charcoal group-hover:text-buddy-primary transition-colors">
                        {persona.name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-buddy-cream font-mono text-[10px] font-bold text-buddy-charcoal border border-buddy-border">
                        {getRoleIcon(persona.role)}
                        <span>{persona.role}</span>
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-buddy-emerald/10 text-buddy-emerald font-mono text-[10px] font-semibold border border-buddy-emerald/30">
                          <Check className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-buddy-charcoalMuted">{persona.title}</div>
                    <div className="font-mono text-[11px] text-buddy-charcoalLight">
                      {persona.organizationName}
                    </div>

                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-mono text-buddy-charcoalLight">
                        Allowed Portals:
                      </span>
                      {persona.allowedViews.map((v) => (
                        <span
                          key={v}
                          className="px-1.5 py-0.2 rounded bg-white border border-buddy-border font-mono text-[9px] text-buddy-charcoal uppercase"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-subtle ${
                      isSelected
                        ? 'bg-buddy-charcoal text-white'
                        : 'bg-buddy-cream hover:bg-buddy-primary hover:text-white text-buddy-charcoal border border-buddy-border'
                    }`}
                  >
                    {isSelected ? 'Signed In' : 'Switch to Account'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security Footer Notice */}
        <div className="px-6 py-3 bg-buddy-cream border-t border-buddy-border flex items-center justify-between text-xs text-buddy-charcoalMuted">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-buddy-primary" />
            <span className="text-[11px]">
              Strict Multi-Tenancy: Users only access data belonging to their assigned role &amp; branch.
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-semibold text-buddy-charcoal hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
