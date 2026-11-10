'use client';

import React from 'react';

interface BuddyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BuddyLogo: React.FC<BuddyLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const heightPx = {
    sm: 26,
    md: 34,
    lg: 44,
    xl: 56,
  }[size] || 34;

  // Aspect ratio of the official Buddy Learning logo (185 x 54 = 3.4259)
  const widthPx = Math.round(heightPx * 3.4259);

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Buddy Learning Logo Asset */}
      <img
        src="/buddy-learning-logo-transparent.png"
        alt="Buddy Learning"
        width={widthPx}
        height={heightPx}
        style={{ height: `${heightPx}px`, width: 'auto' }}
        className="object-contain block flex-shrink-0"
        loading="eager"
        decoding="async"
      />
      {showSubtitle && (
        <span className="hidden sm:inline-block font-mono text-[11px] uppercase tracking-wider text-buddy-charcoalMuted border-l border-buddy-border pl-3">
          STEM Tutoring
        </span>
      )}
    </div>
  );
};
