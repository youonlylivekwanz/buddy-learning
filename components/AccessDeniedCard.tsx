'use client';

import React from 'react';
import { UserRole } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from 'lucide-react';

interface AccessDeniedCardProps {
  attemptedRole: UserRole;
  onNavigateHome: () => void;
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  dashboard: 'Overview',
  learner: 'Learner Hub',
  tutor: 'Tutor Terminal',
  sponsor: 'Sponsor & Bursary Suite',
  admin: 'Admin Command Center',
};

const REQUIRED_ROLE_LABELS: Record<UserRole, string> = {
  dashboard: 'Any Authenticated Role',
  learner: 'LEARNER or GLOBAL_ADMIN',
  tutor: 'TUTOR or GLOBAL_ADMIN',
  sponsor: 'BRANCH_MANAGER or GLOBAL_ADMIN',
  admin: 'GLOBAL_ADMIN strictly',
};

export const AccessDeniedCard: React.FC<AccessDeniedCardProps> = ({
  attemptedRole,
  onNavigateHome,
}) => {
  const { currentUser, setIsAccountModalOpen } = useAuth();

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-buddy-border rounded-2xl shadow-subtle text-center space-y-6 animate-fadeIn">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-buddy-primary/30 flex items-center justify-center text-buddy-primary">
        <Lock className="w-8 h-8 text-buddy-primary" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-buddy-cream font-mono text-[11px] font-bold uppercase tracking-wider text-buddy-charcoalMuted border border-buddy-border">
          <ShieldAlert className="w-3.5 h-3.5 text-buddy-primary" />
          <span>RBAC Enforcement • 403 Forbidden</span>
        </div>
        <h2 className="text-2xl font-bold text-buddy-charcoal">
          Access Restricted to {ROLE_DISPLAY_NAMES[attemptedRole]}
        </h2>
        <p className="text-sm text-buddy-charcoalMuted max-w-lg mx-auto leading-relaxed">
          Your current authenticated session does not possess the credentials required to view this
          enterprise LMS portal.
        </p>
      </div>

      {/* User Context Box */}
      <div className="p-4 rounded-xl bg-buddy-cream/60 border border-buddy-border text-left font-mono text-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-buddy-border">
          <span className="text-buddy-charcoalLight uppercase text-[10px]">Your Session</span>
          <span className="font-bold text-buddy-primary">
            [{currentUser?.role || 'UNAUTHENTICATED'}]
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-buddy-charcoalLight block text-[10px]">Active Identity:</span>
            <span className="font-sans font-semibold text-buddy-charcoal">
              {currentUser?.name || 'Guest User'}
            </span>
          </div>
          <div>
            <span className="text-buddy-charcoalLight block text-[10px]">Branch:</span>
            <span className="font-sans text-buddy-charcoal truncate block">
              {currentUser?.organizationName || 'None'}
            </span>
          </div>
        </div>
        <div className="pt-2 border-t border-buddy-border text-[11px] text-buddy-charcoalMuted">
          <span className="text-buddy-primary font-bold">Required Credentials: </span>
          <span>{REQUIRED_ROLE_LABELS[attemptedRole]}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onNavigateHome}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-buddy-charcoal hover:bg-black text-white font-semibold text-xs transition-all shadow-subtle"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Permitted View</span>
        </button>

        <button
          onClick={() => setIsAccountModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-buddy-primary hover:bg-buddy-primaryHover text-white font-semibold text-xs transition-all shadow-subtle"
        >
          <UserCheck className="w-4 h-4" />
          <span>Switch Account / Persona</span>
        </button>
      </div>
    </div>
  );
};
