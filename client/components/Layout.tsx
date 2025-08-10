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
    <div className=\"min-h-screen bg-background transition-colors duration-300\">\n      {/* Header */}\n      <header className=\"sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60\">\n        <div className=\"container mx-auto px-4\">\n          <div className=\"flex h-16 items-center justify-between\">\n            {/* Logo and Title */}\n            <div \n              ref={logoRef}\n              className=\"flex items-center space-x-3 cursor-pointer\"\n              onClick={handleLogoTap}\n            >\n              <div className=\"relative\">\n                <div className=\"text-2xl font-bold text-chakma-primary\">\n                  𑄌𑄇𑄴𑄟𑄣𑄮𑄇𑄴𑄌\n                </div>\n                {tapCount > 0 && (\n                  <Badge \n                    variant=\"secondary\" \n                    className=\"absolute -top-2 -right-2 text-xs\"\n                  >\n                    {tapCount}\n                  </Badge>\n                )}\n              </div>\n              <div>\n                <h1 className=\"text-xl font-semibold text-foreground\">\n                  ChakmaLex\n                </h1>\n                <p className=\"text-xs text-muted-foreground\">\n                  Digital Dictionary\n                </p>\n              </div>\n            </div>\n\n            {/* Desktop Navigation */}\n            <nav className=\"hidden md:flex items-center space-x-1\">\n              {navigationItems.map((item) => {\n                const Icon = item.icon;\n                const isActive = location.pathname === item.to;\n                \n                return (\n                  <Link\n                    key={item.to}\n                    to={item.to}\n                    className={cn(\n                      \"flex flex-col items-center px-3 py-2 rounded-lg text-xs transition-colors\",\n                      isActive\n                        ? \"bg-primary text-primary-foreground\"\n                        : \"text-muted-foreground hover:text-foreground hover:bg-muted\"\n                    )}\n                  >\n                    <Icon className=\"h-4 w-4 mb-1\" />\n                    <span>{item.label}</span>\n                  </Link>\n                );\n              })}\n            </nav>\n\n            {/* Audio Toggle and Mobile Menu */}\n            <div className=\"flex items-center space-x-2\">\n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                onClick={toggleAudio}\n                className=\"h-8 w-8 p-0\"\n              >\n                {audioEnabled ? (\n                  <Volume2 className=\"h-4 w-4\" />\n                ) : (\n                  <VolumeX className=\"h-4 w-4\" />\n                )}\n              </Button>\n              \n              <Button\n                variant=\"ghost\"\n                size=\"sm\"\n                className=\"md:hidden h-8 w-8 p-0\"\n                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}\n              >\n                {isMobileMenuOpen ? (\n                  <X className=\"h-4 w-4\" />\n                ) : (\n                  <Menu className=\"h-4 w-4\" />\n                )}\n              </Button>\n            </div>\n          </div>\n\n          {/* Mobile Navigation */}\n          {isMobileMenuOpen && (\n            <div className=\"md:hidden py-4 border-t border-border\">\n              <nav className=\"grid grid-cols-2 gap-2\">\n                {navigationItems.map((item) => {\n                  const Icon = item.icon;\n                  const isActive = location.pathname === item.to;\n                  \n                  return (\n                    <Link\n                      key={item.to}\n                      to={item.to}\n                      className={cn(\n                        \"flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors\",\n                        isActive\n                          ? \"bg-primary text-primary-foreground\"\n                          : \"text-muted-foreground hover:text-foreground hover:bg-muted\"\n                      )}\n                      onClick={() => setIsMobileMenuOpen(false)}\n                    >\n                      <Icon className=\"h-5 w-5\" />\n                      <div>\n                        <div className=\"font-medium text-sm\">{item.label}</div>\n                        <div className=\"text-xs opacity-75\">{item.description}</div>\n                      </div>\n                    </Link>\n                  );\n                })}\n              </nav>\n            </div>\n          )}\n        </div>\n      </header>\n\n      {/* Main Content */}\n      <main className=\"container mx-auto px-4 py-6\">\n        {children}\n      </main>\n\n      {/* Developer Console Modal */}\n      {showDevConsole && (\n        <DeveloperConsole onClose={() => setShowDevConsole(false)} />\n      )}\n    </div>\n  );\n}\n\n// Developer Console Component (placeholder for now)\nfunction DeveloperConsole({ onClose }: { onClose: () => void }) {\n  const [password, setPassword] = useState('');\n  const [isAuthenticated, setIsAuthenticated] = useState(false);\n  const [error, setError] = useState('');\n\n  const validPasswords = ['chakmalex2024', 'developer', 'admin123', 'contentmanager'];\n\n  const handlePasswordSubmit = (e: React.FormEvent) => {\n    e.preventDefault();\n    \n    if (validPasswords.includes(password)) {\n      setIsAuthenticated(true);\n      setError('');\n      DeveloperConsoleManager.setAuthenticated(true);\n    } else {\n      setError('Invalid password');\n      setPassword('');\n    }\n  };\n\n  if (!isAuthenticated) {\n    return (\n      <div className=\"fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4\">\n        <div className=\"bg-background border border-border rounded-lg p-6 w-full max-w-md\">\n          <h2 className=\"text-lg font-semibold mb-4\">Developer Console Access</h2>\n          <form onSubmit={handlePasswordSubmit} className=\"space-y-4\">\n            <div>\n              <label className=\"block text-sm font-medium mb-2\">\n                Enter Password:\n              </label>\n              <input\n                type=\"password\"\n                value={password}\n                onChange={(e) => setPassword(e.target.value)}\n                className=\"w-full px-3 py-2 border border-input rounded-lg bg-background\"\n                placeholder=\"Password\"\n                autoFocus\n              />\n              {error && (\n                <p className=\"text-destructive text-sm mt-1\">{error}</p>\n              )}\n            </div>\n            <div className=\"flex space-x-2\">\n              <Button type=\"submit\" className=\"flex-1\">\n                Access Console\n              </Button>\n              <Button type=\"button\" variant=\"outline\" onClick={onClose}>\n                Cancel\n              </Button>\n            </div>\n          </form>\n        </div>\n      </div>\n    );\n  }\n\n  return (\n    <div className=\"fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4\">\n      <div className=\"bg-background border border-border rounded-lg p-6 w-full max-w-4xl h-[80vh] flex flex-col\">\n        <div className=\"flex justify-between items-center mb-4\">\n          <h2 className=\"text-lg font-semibold\">Developer Console</h2>\n          <Button variant=\"ghost\" size=\"sm\" onClick={onClose}>\n            <X className=\"h-4 w-4\" />\n          </Button>\n        </div>\n        \n        <div className=\"flex-1 bg-muted rounded-lg p-4 font-mono text-sm\">\n          <p className=\"text-green-500\">ChakmaLex Developer Console v1.0</p>\n          <p className=\"text-muted-foreground mt-2\">\n            Access granted. Content management features will be implemented here.\n          </p>\n          <p className=\"text-muted-foreground\">\n            Features: Add/Edit/Delete words, AI translation suggestions, data export/import\n          </p>\n        </div>\n      </div>\n    </div>\n  );\n}\n"