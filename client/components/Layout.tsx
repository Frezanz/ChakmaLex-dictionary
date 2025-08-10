/**
 * Main Layout Component for ChakmaLex
 * Provides navigation, header, and consistent layout structure
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  VolumeX,
  ArrowLeft,
  Home
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
  const [tapCount, setTapCount] = useState(0);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const logoRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize audio state
  useEffect(() => {
    const volume = AudioManager.getVolume();
    setAudioEnabled(volume > 0);
  }, []);

  // Track navigation history to show/hide back button
  useEffect(() => {
    const handlePopState = () => {
      setCanGoBack(window.history.length > 1);
    };

    // Check if we can go back
    setCanGoBack(window.history.length > 1 && location.pathname !== '/');

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname]);

  // PWA install prompt handling
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show install button
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle logo tap for developer console access
  const handleLogoTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    // Clear previous timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    // Reset tap count after 5 seconds of no taps
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, 5000);

    // Check if we've reached the required taps
    if (newTapCount >= 10) {
      setTapCount(0);
      setShowDevConsole(true);
    }
  };


  // Handle back navigation
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // Handle home navigation
  const handleGoHome = () => {
    navigate('/');
  };

  // Handle PWA installation
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

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
            {/* Back Button and Logo */}
            <div className="flex justify-start flex-row overflow-auto items-center space-x-2">
              {/* Back Button */}
              {canGoBack && location.pathname !== '/' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoBack}
                  className="h-8 w-8 p-0"
                  title="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}

              {/* Home Button (only show when not on home page) */}
              {location.pathname !== '/' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGoHome}
                  className="h-8 w-8 p-0"
                  title="Go to home"
                >
                  <Home className="h-4 w-4" />
                </Button>
              )}

              {/* Logo and Title */}
              <div
                ref={logoRef}
                className="dev-console-trigger unselectable"
                onClick={handleLogoTap}
              >
                <ChakmaLexLogo
                  size="md"
                  showBadge={false}
                  badgeCount={0}
                />
              </div>
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

      {/* Developer Console Modal */}
      {showDevConsole && (
        <DeveloperConsole onClose={() => setShowDevConsole(false)} />
      )}

      {/* Fxanx Watermark */}
      <FxanxWatermark position="bottom-right" size="sm" opacity={0.4} />
    </div>
  );
}
