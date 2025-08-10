/**
 * ChakmaLex Logo Component
 * Modern logo design for the ChakmaLex application
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ChakmaLexLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  badgeCount?: number;
  className?: string;
}

export default function ChakmaLexLogo({ 
  size = 'md', 
  showBadge = false, 
  badgeCount = 0,
  className 
}: ChakmaLexLogoProps) {
  const sizes = {
    sm: {
      container: 'h-8 w-8',
      text: 'text-lg',
      titleText: 'text-sm',
      subtitleText: 'text-xs'
    },
    md: {
      container: 'h-10 w-10',
      text: 'text-xl',
      titleText: 'text-xl',
      subtitleText: 'text-xs'
    },
    lg: {
      container: 'h-16 w-16',
      text: 'text-3xl',
      titleText: 'text-3xl',
      subtitleText: 'text-sm'
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      {/* Logo Icon */}
      <div className={cn("relative", sizes[size].container)}>
        {/* Main logo circle with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-chakma-primary to-chakma-secondary rounded-xl shadow-lg transform rotate-3">
          <div className="absolute inset-1 bg-gradient-to-tr from-white/20 to-transparent rounded-lg" />
        </div>
        
        {/* Logo content */}
        <div className="relative h-full w-full flex items-center justify-center rounded-xl bg-gradient-to-br from-chakma-primary via-chakma-accent to-chakma-secondary">
          {/* Stylized 'C' and 'L' letters */}
          <div className={cn(
            "font-bold text-white select-none tracking-tight transform -rotate-3",
            sizes[size].text
          )}>
            C<span className="text-chakma-secondary">L</span>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-chakma-secondary rounded-full opacity-80 animate-pulse" />
        <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-chakma-accent rounded-full opacity-60" />
        
      </div>
      
      {/* Logo text */}
      <div className="flex flex-col">
        <div className={cn(
          "font-bold bg-gradient-to-r from-chakma-primary to-chakma-accent bg-clip-text text-transparent",
          sizes[size].titleText
        )}>
          ChakmaLex
        </div>
        <div className={cn(
          "text-muted-foreground font-medium",
          sizes[size].subtitleText
        )}>
          Digital Dictionary
        </div>
      </div>
    </div>
  );
}

// Animated version for loading states
export function AnimatedChakmaLexLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="h-16 w-16 relative">
        {/* Rotating outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-chakma-primary/20 border-t-chakma-primary animate-spin" />
        
        {/* Logo center */}
        <div className="absolute inset-2 bg-gradient-to-br from-chakma-primary to-chakma-secondary rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-white">CL</span>
        </div>
        
        {/* Pulsing dots */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 h-2 w-2 bg-chakma-accent rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 h-2 w-2 bg-chakma-secondary rounded-full animate-pulse delay-500" />
      </div>
    </div>
  );
}

// Compact logo for small spaces
export function CompactLogo({ className }: { className?: string }) {
  return (
    <div className={cn("h-8 w-8 relative", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-chakma-primary to-chakma-secondary rounded-lg shadow-md">
        <div className="absolute inset-0.5 bg-gradient-to-tr from-white/20 to-transparent rounded-md" />
        <div className="h-full w-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">CL</span>
        </div>
      </div>
    </div>
  );
}
