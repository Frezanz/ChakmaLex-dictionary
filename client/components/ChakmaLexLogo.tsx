/**
 * ChakmaLex Logo Component
 * Modern logo design for the ChakmaLex application
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChakmaLexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeCount?: number;
  className?: string;
}

function LogoMarkSVG({ pixelSize }: { pixelSize: number }) {
  const idSuffix = Math.random().toString(36).slice(2, 7);
  const gradId = `cl-grad-${idSuffix}`;
  const shineId = `cl-shine-${idSuffix}`;

  return (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      role="img"
      aria-label="ChakmaLex"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--chakma-primary)" />
          <stop offset="50%" stopColor="var(--chakma-accent)" />
          <stop offset="100%" stopColor="var(--chakma-secondary)" />
        </linearGradient>
        <linearGradient id={shineId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="40%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <filter id={`cl-soft-${idSuffix}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset dy="1" result="offsetBlur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.25" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill={`url(#${gradId})`} />

      {/* Subtle inner shadow ring */}
      <circle cx="32" cy="32" r="24" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

      {/* Book/page motif */}
      <path
        d="M18 22c6 0 10 2 14 4c4-2 8-4 14-4v20c-6 0-10 2-14 4c-4-2-8-4-14-4V22z"
        fill="rgba(255,255,255,0.12)"
      />
      <path
        d="M18 26c6 0 10 2 14 4c4-2 8-4 14-4"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeLinecap="round"
        strokeWidth="1.5"
      />

      {/* Monogram CL (geometric) */}
      <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
        {/* C */}
        <path d="M25 40c-4 0-7-3-7-8s3-8 7-8c2.2 0 3.9.7 5.3 2" strokeWidth="3" opacity="0.95" />
        {/* L */}
        <path d="M39 24v14h8" strokeWidth="3" opacity="0.95" />
      </g>

      {/* Shine overlay */}
      <path d="M8 10c14-8 36-8 48 0c1 0 2 2 0 4c-18-8-34-6-48 2c-2-1-2-4 0-6z" fill={`url(#${shineId})`} />

      {/* Accent spark */}
      <g filter={`url(#cl-soft-${idSuffix})`}>
        <circle cx="48" cy="16" r="2" fill="white" opacity="0.9" />
      </g>
    </svg>
  );
}

export default function ChakmaLexLogo({ 
  size = 'md', 
  showBadge = false, 
  badgeCount = 0,
  className 
}: ChakmaLexLogoProps) {
  const sizes = {
    sm: { container: 'h-8', px: 8, titleText: 'text-base', subtitleText: 'text-[10px]' },
    md: { container: 'h-10', px: 10, titleText: 'text-2xl', subtitleText: 'text-xs' },
    lg: { container: 'h-16', px: 16, titleText: 'text-4xl', subtitleText: 'text-sm' },
  } as const;

  const pixelSize = sizes[size].px;

  return (
    <div className={cn('flex items-center space-x-3 unselectable', className)}>
      {/* Logomark */}
      <div className={cn('relative', sizes[size].container)}>
        <LogoMarkSVG pixelSize={pixelSize} />

        {/* Tap counter badge */}
        {showBadge && badgeCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-xs h-5 w-5 p-0 flex items-center justify-center"
          >
            {badgeCount}
          </Badge>
        )}
      </div>

      {/* Wordmark */}
      <div className="flex flex-col unselectable select-none">
        <div
          className={cn(
            'font-extrabold tracking-tight bg-gradient-to-r from-chakma-primary via-chakma-accent to-chakma-secondary bg-clip-text text-transparent',
            sizes[size].titleText,
          )}
        >
          ChakmaLex
        </div>
        <div className={cn('text-muted-foreground font-medium', sizes[size].subtitleText)}>
          Digital Dictionary
        </div>
      </div>
    </div>
  );
}

export function AnimatedChakmaLexLogo({ className }: { className?: string }) {
  return (
    <div className={cn('relative', className)}>
      <div className="h-16 w-16 relative">
        {/* Rotating outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-chakma-primary/20 border-t-chakma-primary animate-spin" />
        {/* Center mark */}
        <div className="absolute inset-2 rounded-full flex items-center justify-center bg-gradient-to-br from-chakma-primary to-chakma-secondary">
          <LogoMarkSVG pixelSize={40} />
        </div>
      </div>
    </div>
  );
}

export function CompactLogo({ className }: { className?: string }) {
  return (
    <div className={cn('h-8 w-8 relative', className)}>
      <LogoMarkSVG pixelSize={32} />
    </div>
  );
}
