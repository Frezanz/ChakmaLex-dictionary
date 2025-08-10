/**
 * Settings Page - App personalization and preferences
 * Features: Theme selection, font size, sound controls, data management
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Volume2, 
  Type, 
  Download, 
  Upload, 
  Trash2,
  RotateCcw,
  Check,
  Sun,
  Moon,
  Zap,
  Coffee,
  Sparkles,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { ThemeMode, FontSize, UserPreferences } from '@shared/types';
import { 
  PreferencesManager, 
  AudioManager,
  exportAllData,
  importAllData,
  clearAllData
} from '@/lib/storage';

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>(PreferencesManager.get());
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    const current = PreferencesManager.get();
    setPreferences(current);
  }, []);

  const handleThemeChange = (theme: ThemeMode) => {
    const updated = { ...preferences, theme };
    setPreferences(updated);
    PreferencesManager.set(updated);
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    const updated = { ...preferences, font_size: fontSize };
    setPreferences(updated);
    PreferencesManager.set(updated);
  };

  const handleVolumeChange = (volume: number[]) => {
    const updated = { ...preferences, sound_volume: volume[0] };
    setPreferences(updated);
    PreferencesManager.set(updated);
  };

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chakmalex-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setIsImporting(true);
        const data = e.target?.result as string;
        const success = importAllData(data);
        
        if (success) {
          setImportSuccess(true);
          setPreferences(PreferencesManager.get());
          setTimeout(() => setImportSuccess(false), 3000);
        }
      } catch (error) {
        console.error('Import failed:', error);
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
      clearAllData();
      const defaultPrefs = PreferencesManager.get();
      setPreferences(defaultPrefs);
    }
  };

  const themes = [
    { id: 'light' as ThemeMode, label: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark' as ThemeMode, label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'oled' as ThemeMode, label: 'OLED', icon: Monitor, description: 'Pure black for OLED' },
    { id: 'sepia' as ThemeMode, label: 'Sepia', icon: Coffee, description: 'Warm and comfortable' },
    { id: 'warm' as ThemeMode, label: 'Warm', icon: Coffee, description: 'Cozy orange tones' },
    { id: 'vibrant' as ThemeMode, label: 'Vibrant', icon: Sparkles, description: 'High contrast colors' }
  ];

  const fontSizes = [
    { id: 'xs' as FontSize, label: 'Extra Small', size: '12px' },
    { id: 'sm' as FontSize, label: 'Small', size: '14px' },
    { id: 'base' as FontSize, label: 'Normal', size: '16px' },
    { id: 'lg' as FontSize, label: 'Large', size: '18px' },
    { id: 'xl' as FontSize, label: 'Extra Large', size: '20px' },
    { id: '2xl' as FontSize, label: 'Huge', size: '24px' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Customize your ChakmaLex experience
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Theme</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose your preferred color scheme
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((theme) => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      preferences.theme === theme.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{theme.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {theme.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Font Size</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Adjust text size for better readability
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {fontSizes.map((font) => (
                <button
                  key={font.id}
                  onClick={() => handleFontSizeChange(font.id)}
                  className={cn(
                    "p-3 rounded-lg border text-left transition-all duration-200",
                    preferences.font_size === font.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-medium">{font.label}</div>
                  <div className="text-xs text-muted-foreground" style={{ fontSize: font.size }}>
                    Sample text
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-base font-medium">Volume</Label>
                <p className="text-sm text-muted-foreground">
                  Control pronunciation audio volume
                </p>
              </div>
              <span className="text-sm font-medium">
                {preferences.sound_volume}%
              </span>
            </div>
            <Slider
              value={[preferences.sound_volume]}
              onValueChange={handleVolumeChange}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Export Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download your settings, favorites, and search history
              </p>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Import Data</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Restore your data from a backup file
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isImporting}
                />
                <Button variant="outline" className="w-full" disabled={isImporting}>
                  {isImporting ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                  ) : importSuccess ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isImporting ? 'Importing...' : importSuccess ? 'Imported!' : 'Import Data'}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-medium text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              These actions cannot be undone. Please be careful.
            </p>
            <Button 
              onClick={handleResetAll}
              variant="destructive" 
              className="w-full md:w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-medium">ChakmaLex v1.0</h3>
            <p className="text-sm text-muted-foreground">
              Digital Dictionary for the Chakma Language
            </p>
            <p className="text-xs text-muted-foreground">
              Settings are automatically saved to your device
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
