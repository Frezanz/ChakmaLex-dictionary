/**
 * Fxanx Watermark Component
 * Company branding watermark for ChakmaLex application
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface FxanxWatermarkProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  opacity?: number;
  className?: string;
}

export default function FxanxWatermark({ 
  position = 'bottom-right',
  size = 'sm',
  opacity = 0.6,
  className 
}: FxanxWatermarkProps) {
  const positions = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div 
      className={cn(
        positions[position],
        "z-10 pointer-events-none select-none",
        className
      )}
      style={{ opacity }}
    >
      <div className="flex items-center gap-1">
        {/* Fxanx logo mark */}
        <div className="relative">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-muted-foreground"
          >
            {/* Stylized 'F' with modern design */}
            <path
              d="M3 2h10v3H7v3h5v3H7v6H3V2z"
              fill="currentColor"
              className="opacity-80"
            />
            {/* Decorative element */}
            <circle
              cx="15"
              cy="6"
              r="2"
              fill="currentColor"
              className="opacity-60"
            />
            <circle
              cx="16"
              cy="14"
              r="1.5"
              fill="currentColor"
              className="opacity-40"
            />
          </svg>
        </div>
        
        {/* Company text */}
        <span 
          className={cn(
            "font-medium tracking-wide text-muted-foreground",
            sizes[size]
          )}
        >
          Fxanx
        </span>
      </div>
    </div>
  );
}

// Alternative design with gradient effect
export function FxanxWatermarkGradient({ 
  position = 'bottom-right',
  className 
}: { 
  position?: FxanxWatermarkProps['position'];
  className?: string;
}) {
  const positions = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
    'center': 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
  };

  return (
    <div 
      className={cn(
        positions[position],
        "z-10 pointer-events-none select-none opacity-50",
        className
      )}
    >
      <div className="bg-gradient-to-r from-chakma-primary/20 to-chakma-secondary/20 px-3 py-1 rounded-full backdrop-blur-sm border border-border/30">
        <span className="text-xs font-medium bg-gradient-to-r from-chakma-primary to-chakma-secondary bg-clip-text text-transparent">
          Powered by Fxanx
        </span>
      </div>
    </div>
  );
}

// Minimal watermark for footer areas
export function FxanxFooterBrand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <div className="h-4 w-4 bg-gradient-to-br from-chakma-primary to-chakma-secondary rounded-sm flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">F</span>
      </div>
      <span className="text-xs font-medium">
        Built with <span className="text-chakma-primary">Fxanx</span>
      </span>
    </div>
  );
}

// Inline brand component for about pages
export function FxanxInlineBrand({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="text-muted-foreground">by</span>
      <span className="font-semibold bg-gradient-to-r from-chakma-primary to-chakma-secondary bg-clip-text text-transparent">
        Fxanx
      </span>
    </span>
  );
}
