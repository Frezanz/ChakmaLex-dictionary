/**
 * Loading Spinner Component for ChakmaLex
 * Provides consistent loading states throughout the application
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text = 'Loading...', 
  className,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinner = (
    <div className={cn("flex items-center justify-center gap-3", className)}>
      <div className="relative">
        <div className={cn(
          "animate-spin rounded-full border-2 border-muted border-t-chakma-primary",
          sizes[size]
        )} />
        <div className={cn(
          "absolute inset-0 animate-ping rounded-full border-2 border-chakma-primary opacity-20",
          sizes[size]
        )} />
      </div>
      {text && (
        <span className={cn("text-muted-foreground", textSizes[size])}>
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-background border border-border rounded-lg p-8 shadow-lg">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
}

// Chakma-themed loading animation
export function ChakmaLoader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className="text-4xl font-bold text-chakma-primary animate-pulse">
          CL
        </div>
        <div className="absolute inset-0 text-4xl font-bold text-chakma-secondary animate-ping opacity-30">
          CL
        </div>
      </div>
    </div>
  );
}

// Skeleton loaders for content
export function WordCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-6 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div className="h-5 bg-muted rounded w-32" />
          <div className="flex gap-1">
            <div className="h-4 bg-muted rounded w-12" />
            <div className="h-4 bg-muted rounded w-16" />
            <div className="h-4 bg-muted rounded w-14" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-8 w-8 bg-muted rounded" />
          <div className="h-8 w-8 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}

export function CharacterCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 text-center animate-pulse">
      <div className="h-12 bg-muted rounded-lg mx-auto mb-2 w-12" />
      <div className="h-4 bg-muted rounded w-16 mx-auto mb-1" />
      <div className="h-5 bg-muted rounded w-20 mx-auto" />
    </div>
  );
}
