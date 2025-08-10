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

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showDevConsole, setShowDevConsole] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const location = useLocation();
  const logoRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize audio state
  useEffect(() => {
    const volume = AudioManager.getVolume();
    setAudioEnabled(volume > 0);
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
            <div 
              ref={logoRef}
              className="flex items-center space-x-3 cursor-pointer"
              onClick={handleLogoTap}
            >
              <div className="relative">
                <div className="text-2xl font-bold text-chakma-primary font-chakma">
                  𑄌𑄇𑄴𑄟𑄣𑄮𑄇𑄴𑄌
                </div>
                {tapCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-2 -right-2 text-xs"
                  >
                    {tapCount}
                  </Badge>
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  ChakmaLex
                </h1>
                <p className="text-xs text-muted-foreground">
                  Digital Dictionary
                </p>
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
    </div>
  );
}

// Developer Console Component (placeholder for now)
function DeveloperConsole({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const validPasswords = ['chakmalex2024', 'developer', 'admin123', 'contentmanager'];

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validPasswords.includes(password)) {
      setIsAuthenticated(true);
      setError('');
      DeveloperConsoleManager.setAuthenticated(true);
    } else {
      setError('Invalid password');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg p-6 w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">Developer Console Access</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter Password:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                placeholder="Password"
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm mt-1">{error}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Access Console
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Developer Console</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex-1 bg-muted rounded-lg p-4 font-mono text-sm">
          <p className="text-green-500">ChakmaLex Developer Console v1.0</p>
          <p className="text-muted-foreground mt-2">
            Access granted. Content management features will be implemented here.
          </p>
          <p className="text-muted-foreground">
            Features: Add/Edit/Delete words, AI translation suggestions, data export/import
          </p>
        </div>
      </div>
    </div>
  );
}
