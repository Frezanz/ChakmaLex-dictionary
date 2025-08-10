/**
 * Audio Player Component for ChakmaLex
 * Handles pronunciation audio playback with volume control
 */

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AudioManager } from '@/lib/storage';

interface AudioPlayerProps {
  url?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'default' | 'lg';
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function AudioPlayer({ 
  url, 
  variant = 'ghost', 
  size = 'sm',
  showLabel = false,
  className,
  disabled = false
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePlay = async () => {
    if (!url || disabled || isPlaying) return;

    try {
      setIsLoading(true);
      setIsPlaying(true);
      await AudioManager.playAudio(url);
    } catch (error) {
      console.error('Error playing audio:', error);
    } finally {
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const volume = AudioManager.getVolume();
  const isAudioEnabled = volume > 0;

  if (!url) {
    return (
      <Button
        variant={variant}
        size={size}
        disabled={true}
        className={cn("opacity-50 cursor-not-allowed", className)}
      >
        <VolumeX className="h-4 w-4" />
        {showLabel && <span className="ml-2">No Audio</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handlePlay}
      disabled={disabled || isPlaying || !isAudioEnabled}
      className={cn(
        "transition-all duration-200",
        isPlaying && "animate-pulse",
        !isAudioEnabled && "opacity-50",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : !isAudioEnabled ? (
        <VolumeX className="h-4 w-4" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
      {showLabel && (
        <span className="ml-2">
          {isLoading ? 'Loading...' : isPlaying ? 'Playing...' : 'Play'}
        </span>
      )}
    </Button>
  );
}

// Audio playback indicator component
export function AudioIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className={cn(
      "flex items-center gap-1",
      isPlaying && "animate-pulse"
    )}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-chakma-primary rounded-full transition-all duration-200",
            isPlaying ? "h-4 animate-bounce" : "h-2",
            i === 2 && isPlaying && "animation-delay-100",
            i === 3 && isPlaying && "animation-delay-200"
          )}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

// Global audio controller component
export function GlobalAudioController() {
  const [volume, setVolume] = useState(AudioManager.getVolume());

  const toggleAudio = () => {
    const newVolume = volume > 0 ? 0 : 70;
    AudioManager.setVolume(newVolume);
    setVolume(newVolume);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleAudio}
      className="h-8 w-8 p-0"
      title={volume > 0 ? 'Disable audio' : 'Enable audio'}
    >
      {volume > 0 ? (
        <Volume2 className="h-4 w-4" />
      ) : (
        <VolumeX className="h-4 w-4" />
      )}
    </Button>
  );
}
