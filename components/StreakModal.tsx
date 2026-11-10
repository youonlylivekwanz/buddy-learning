'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Badge } from '@/types';
import { X, Flame, Sparkles, Award, CheckCircle2 } from 'lucide-react';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakCount: number;
  totalXp: number;
  badges: Badge[];
  onCheckIn?: () => Promise<void> | void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  streakCount,
  totalXp,
  badges,
  onCheckIn,
}) => {
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F8991D', '#1C1917', '#E5870E', '#FAF8F5'],
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckInClick = async () => {
    if (hasCheckedIn || isCheckingIn) return;
    setIsCheckingIn(true);
    try {
      if (onCheckIn) {
        await onCheckIn();
      }
      setHasCheckedIn(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#F8991D', '#10B981', '#1C1917'],
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-buddy-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white border border-buddy-border rounded-2xl shadow-lift overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-buddy-cream border-b border-buddy-border">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-buddy-primary fill-buddy-primary" />
            <h2 className="text-sm sm:text-base font-heading font-bold text-buddy-charcoal">
              Study Streak &amp; Mastery
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-buddy-charcoalLight hover:text-buddy-charcoal hover:bg-buddy-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-white text-buddy-charcoal">
          {/* Hero Stat */}
          <div className="text-center p-6 rounded-xl bg-buddy-cream border border-buddy-border relative overflow-hidden">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-buddy-primaryLight border border-buddy-primary/30 flex items-center justify-center mb-3">
              <Flame className="w-8 h-8 text-buddy-primary fill-buddy-primary" />
            </div>

            <span className="academic-pill bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20 mb-2">
              ACTIVE STREAK • 1.5x XP MULTIPLIER
            </span>

            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-buddy-charcoal tracking-tight mt-1">
              {streakCount} Days Unbroken
            </h1>
            <p className="text-xs sm:text-sm text-buddy-charcoalMuted max-w-md mx-auto mt-2">
              You are among the top 3% of STEM scholars this term. Keeping this streak active ensures full bursary attendance compliance.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2 max-w-sm mx-auto">
              <div className="p-2.5 rounded-lg bg-white border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Total XP</span>
                <p className="font-mono text-sm font-bold text-buddy-charcoal mt-0.5">{totalXp.toLocaleString()}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Shields</span>
                <p className="font-mono text-sm font-bold text-buddy-charcoal mt-0.5">2 Freezes</p>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-buddy-border">
                <span className="font-mono text-[10px] text-buddy-charcoalLight uppercase">Level</span>
                <p className="font-mono text-sm font-bold text-buddy-primary mt-0.5">Level {Math.floor(totalXp / 1000) + 1}</p>
              </div>
            </div>

            {/* Live Check-in Button */}
            <div className="mt-5">
              <button
                onClick={handleCheckInClick}
                disabled={hasCheckedIn || isCheckingIn}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-subtle ${
                  hasCheckedIn
                    ? 'bg-buddy-emerald text-white cursor-default'
                    : 'bg-buddy-primary text-white hover:bg-buddy-primaryHover hover:scale-[1.02]'
                }`}
              >
                {hasCheckedIn ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Today&apos;s Study Logged (+50 XP)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    {isCheckingIn ? 'Saving to Database...' : "Check In Today's Study (+50 XP)"}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Badges Collection */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-buddy-charcoalLight font-bold">
              Earned Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    badge.unlocked
                      ? 'bg-white border-buddy-border shadow-subtle hover:border-buddy-primary/40'
                      : 'bg-buddy-creamMuted/50 border-buddy-border/60 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-buddy-cream border border-buddy-border flex items-center justify-center text-xl shrink-0">
                      {badge.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-buddy-charcoal truncate">
                          {badge.title}
                        </h4>
                        <span
                          className={`academic-pill ${
                            badge.rarity === 'legendary'
                              ? 'bg-buddy-primaryLight text-buddy-primaryText border border-buddy-primary/20'
                              : 'bg-buddy-creamMuted text-buddy-charcoalMuted border border-buddy-border'
                          }`}
                        >
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-buddy-charcoalMuted mt-1 leading-snug line-clamp-2">
                        {badge.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                        <span className="text-buddy-primaryText font-semibold">
                          +{badge.xpReward} XP
                        </span>
                        {badge.unlocked ? (
                          <span className="text-buddy-emeraldText flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Earned {badge.earnedDate}
                          </span>
                        ) : (
                          <span className="text-buddy-charcoalLight">Locked</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-buddy-cream border-t border-buddy-border flex items-center justify-between">
          <span className="text-xs text-buddy-charcoalMuted font-mono">
            Synced with SQLite Database
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-buddy-charcoal hover:bg-black text-white text-xs font-semibold shadow-sm transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
