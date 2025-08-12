/**
 * ChakmaLex Logo Component
 * Redesigned with vibrant colors and cultural elements
 */

import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ChakmaLexLogoProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  badgeCount?: number;
  className?: string;
}

export default function ChakmaLexLogo({
  size = "md",
  showBadge = false,
  badgeCount = 0,
  className,
}: ChakmaLexLogoProps) {
  const sizes = {
    sm: {
      container: "h-8 w-8",
      text: "text-xs",
      titleText: "text-sm",
      subtitleText: "text-xs",
    },
    md: {
      container: "h-12 w-12",
      text: "text-sm",
      titleText: "text-xl",
      subtitleText: "text-xs",
    },
    lg: {
      container: "h-16 w-16",
      text: "text-lg",
      titleText: "text-3xl",
      subtitleText: "text-sm",
    },
  };

  return (
    <div className={cn("flex items-center space-x-3 unselectable", className)}>
      {/* Logo Icon */}
      <div className={cn("relative", sizes[size].container)}>
        {/* Outer glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-500/20 to-purple-600/20 rounded-2xl blur-lg scale-110" />

        {/* Main logo with geometric pattern */}
        <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700" />

          {/* Chakma script inspired pattern overlay */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 64 64" fill="none">
              {/* Traditional Chakma pattern elements */}
              <path
                d="M16 12 Q32 8 48 12 Q52 24 48 36 Q32 40 16 36 Q12 24 16 12"
                fill="white"
                fillOpacity="0.3"
              />
              <path
                d="M20 20 Q32 16 44 20 Q48 28 44 36 Q32 40 20 36 Q16 28 20 20"
                fill="white"
                fillOpacity="0.2"
              />
              <circle cx="32" cy="28" r="4" fill="white" fillOpacity="0.4" />
              <circle cx="24" cy="24" r="2" fill="white" fillOpacity="0.3" />
              <circle cx="40" cy="32" r="2" fill="white" fillOpacity="0.3" />
            </svg>
          </div>

          {/* Central logo text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                "font-bold text-white drop-shadow-lg select-none tracking-tight",
                sizes[size].text,
              )}
            >
              CkLex
            </div>
          </div>

          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

          {/* Animated corners */}
          <div className="absolute top-1 right-1">
            <div className="h-2 w-2 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full animate-pulse shadow-lg" />
          </div>
          <div className="absolute bottom-1 left-1">
            <div className="h-1.5 w-1.5 bg-gradient-to-br from-pink-300 to-red-400 rounded-full animate-pulse delay-700 shadow-lg" />
          </div>
        </div>

        {/* Tap counter badge */}
        {showBadge && badgeCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 text-xs h-5 w-5 p-0 flex items-center justify-center bg-gradient-to-r from-red-500 to-pink-600 text-white border-none shadow-lg"
          >
            {badgeCount}
          </Badge>
        )}
      </div>

      {/* Logo text */}
      <div className="flex flex-col unselectable">
        <div
          className={cn(
            "font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-700 bg-clip-text text-transparent unselectable tracking-wide",
            sizes[size].titleText,
          )}
        >
          ChakmaLex
        </div>
        <div
          className={cn(
            "text-muted-foreground font-medium unselectable bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent",
            sizes[size].subtitleText,
          )}
        >
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
        {/* Outer glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-blue-500/30 to-purple-600/30 rounded-full blur-xl scale-125 animate-pulse" />

        {/* Rotating outer rings */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-600 animate-spin">
          <div className="absolute inset-0 rounded-full bg-white" />
        </div>
        <div
          className="absolute inset-1 rounded-full border-2 border-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-emerald-400 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "3s" }}
        >
          <div className="absolute inset-0 rounded-full bg-white" />
        </div>

        {/* Logo center */}
        <div className="absolute inset-3 bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-sm font-bold text-white drop-shadow-lg tracking-tight">
            CkLex
          </span>
        </div>

        {/* Orbiting elements */}
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "4s" }}
        >
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 h-2 w-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg" />
        </div>
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: "6s", animationDirection: "reverse" }}
        >
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 h-1.5 w-1.5 bg-gradient-to-br from-pink-400 to-red-500 rounded-full shadow-lg" />
        </div>
      </div>
    </div>
  );
}

// Compact logo for small spaces
export function CompactLogo({ className }: { className?: string }) {
  return (
    <div className={cn("h-8 w-8 relative", className)}>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 via-blue-500/20 to-purple-600/20 rounded-xl blur-md scale-110" />

      <div className="relative h-full w-full bg-gradient-to-br from-emerald-500 via-blue-600 to-purple-700 rounded-xl shadow-lg overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 32 32" fill="none">
            <circle
              cx="16"
              cy="16"
              r="8"
              stroke="white"
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
            <circle cx="16" cy="16" r="3" fill="white" opacity="0.5" />
          </svg>
        </div>

        {/* Glass effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent" />

        <div className="h-full w-full flex items-center justify-center">
          <span className="text-xs font-bold text-white drop-shadow tracking-tight">
            CkLex
          </span>
        </div>
      </div>
    </div>
  );
}

// Special variant for dark mode
export function DarkModeLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: { container: "h-8 w-8", text: "text-xs" },
    md: { container: "h-12 w-12", text: "text-sm" },
    lg: { container: "h-16 w-16", text: "text-lg" },
  };

  return (
    <div className={cn("relative", sizes[size].container, className)}>
      {/* Dark mode glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-indigo-500/30 to-purple-600/30 rounded-2xl blur-lg scale-110" />

      <div className="relative h-full w-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl shadow-2xl border border-slate-600/50 overflow-hidden">
        {/* Neon accent lines */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-indigo-400 to-transparent" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-pink-400 to-transparent" />
        </div>

        {/* Central text with neon effect */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "font-bold text-transparent bg-gradient-to-br from-cyan-300 via-indigo-400 to-purple-500 bg-clip-text drop-shadow-2xl select-none tracking-tight",
              sizes[size].text,
            )}
            style={{ filter: "drop-shadow(0 0 10px rgba(139, 92, 246, 0.5))" }}
          >
            CkLex
          </div>
        </div>

        {/* Glass reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}
