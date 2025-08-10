/**
 * Main Layout Component for ChakmaLex
 * Provides navigation, header, and consistent layout structure
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BookOpen, 
  Type, 
  Brain, 
  Heart, 
  Settings, 
  Info,
  Menu,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';
import { DeveloperConsoleManager, AudioManager } from '@/lib/storage';
import DeveloperConsole from './DeveloperConsole';
import ChakmaLexLogo from './ChakmaLexLogo';
import FxanxWatermark from './FxanxWatermark';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const location = useLocation();

  // Initialize audio state
  useEffect(() => {
    const volume = AudioManager.getVolume();
    setAudioEnabled(volume > 0);
  }, []);


  // Toggle audio globally
  const toggleAudio = () => {
    const currentVolume = AudioManager.getVolume();
    if (currentVolume > 0) {
      AudioManager.setVolume(0);
      setAudioEnabled(false);
    } else {
      AudioManager.setVolume(70); // Default volume
      setAudioEnabled(true);
    }
  };

  const navigationItems = [
    {
      to: '/',
      icon: Search,
      label: 'Dictionary',
      description: 'Search words'
    },
    {
      to: '/characters',
      icon: Type,
      label: 'Characters',
      description: 'Learn script'
    },
    {
      to: '/quiz',
      icon: Brain,
      label: 'Quiz',
      description: 'Test knowledge'
    },
    {
      to: '/favorites',
      icon: Heart,
      label: 'Favorites',
      description: 'Saved words'
    },
    {
      to: '/settings',
      icon: Settings,
      label: 'Settings',
      description: 'Preferences'
    },
    {
      to: '/about',
      icon: Info,
      label: 'About',
      description: 'Information'
    }
  ];

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="">
              <ChakmaLexLogo
                size="md"
                showBadge={false}
                badgeCount={0}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Audio Toggle and Mobile Menu */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleAudio}
                className="h-8 w-8 p-0"
              >
                {audioEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-8 w-8 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Menu className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-border">
              <nav className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;
                  
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={cn(
                        "flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="h-5 w-5" />
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Fxanx Watermark */}
      <FxanxWatermark position="bottom-right" size="sm" opacity={0.4} />
    </div>
  );
}
