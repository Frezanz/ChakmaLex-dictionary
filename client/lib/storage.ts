/**
 * Storage utilities for ChakmaLex application
 * Handles user preferences, favorites, search history, and theme management
 */

import { UserPreferences, DEFAULT_USER_PREFERENCES, ThemeMode, FontSize, SearchHistoryItem, CustomColors } from '@shared/types';

// Storage keys
const STORAGE_KEYS = {
  USER_PREFERENCES: 'chakmalex_user_preferences',
  SEARCH_HISTORY: 'chakmalex_search_history',
  FAVORITES: 'chakmalex_favorites',
  DEVELOPER_CONSOLE: 'chakmalex_dev_console',
  QUIZ_PROGRESS: 'chakmalex_quiz_progress',
} as const;

// User Preferences Management
export class PreferencesManager {
  static get(): UserPreferences {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_USER_PREFERENCES, ...parsed };
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
    return DEFAULT_USER_PREFERENCES;
  }

  static set(preferences: Partial<UserPreferences>): void {
    try {
      const current = this.get();
      const updated = { 
        ...current, 
        ...preferences, 
        last_updated: new Date().toISOString() 
      };
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updated));
      
      // Apply theme immediately
      if (preferences.theme) {
        this.applyTheme(preferences.theme);
      }
      
      // Apply font size immediately
      if (preferences.font_size) {
        this.applyFontSize(preferences.font_size);
      }
      
      // Apply custom colors if provided
      if (preferences.custom_colors) {
        this.applyCustomColors(preferences.custom_colors);
      }
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  }

  static applyTheme(theme: ThemeMode): void {
    const html = document.documentElement;
    
    // Remove all theme classes
    html.classList.remove('light', 'dark', 'oled', 'sepia', 'warm', 'vibrant');
    
    // Add the selected theme class
    if (theme !== 'light') {
      html.classList.add(theme);
    }
  }

  static applyFontSize(fontSize: FontSize): void {
    const body = document.body;
    
    // Remove existing font size classes
    body.classList.remove('font-size-xs', 'font-size-sm', 'font-size-base', 'font-size-lg', 'font-size-xl', 'font-size-2xl', 'font-size-3xl');
    
    // Add the selected font size class
    body.classList.add(`font-size-${fontSize}`);
  }

  static applyCustomColors(colors: CustomColors): void {
    const root = document.documentElement;
    
    if (colors.text_color) {
      root.style.setProperty('--foreground', colors.text_color);
    }
    if (colors.ui_buttons_color) {
      root.style.setProperty('--primary', colors.ui_buttons_color);
    }
    if (colors.screen_color) {
      root.style.setProperty('--card', colors.screen_color);
    }
    if (colors.background_color) {
      root.style.setProperty('--background', colors.background_color);
    }
  }

  static resetCustomColors(): void {
    const root = document.documentElement;
    const current = this.get();
    
    // Reset to theme defaults by temporarily switching themes
    this.applyTheme(current.theme);
  }

  static exportPreferences(): string {
    return JSON.stringify(this.get(), null, 2);
  }

  static importPreferences(data: string): boolean {
    try {
      const preferences = JSON.parse(data) as UserPreferences;
      this.set(preferences);
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }
}

// Search History Management
export class SearchHistoryManager {
  static add(query: string, resultCount?: number): void {
    try {
      const history = this.get();
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp: new Date().toISOString(),
        result_count: resultCount,
      };

      // Remove duplicate if exists
      const filtered = history.filter(item => item.query !== newItem.query);
      
      // Add to beginning and limit size
      const updated = [newItem, ...filtered].slice(0, 50);
      
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  static get(): SearchHistoryItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      return [];
    }
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  static remove(query: string): void {
    try {
      const history = this.get();
      const filtered = history.filter(item => item.query !== query);
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }
}

// Favorites Management
export class FavoritesManager {
  static get(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  static add(wordId: string): void {
    try {
      const favorites = this.get();
      if (!favorites.includes(wordId)) {
        const updated = [...favorites, wordId];
        localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  }

  static remove(wordId: string): void {
    try {
      const favorites = this.get();
      const updated = favorites.filter(id => id !== wordId);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(updated));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  static toggle(wordId: string): boolean {
    const favorites = this.get();
    const isFavorite = favorites.includes(wordId);
    
    if (isFavorite) {
      this.remove(wordId);
      return false;
    } else {
      this.add(wordId);
      return true;
    }
  }

  static isFavorite(wordId: string): boolean {
    return this.get().includes(wordId);
  }

  static clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.FAVORITES);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }
}

// Developer Console Access Management
export class DeveloperConsoleManager {
  static getTapCount(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVELOPER_CONSOLE);
      if (stored) {
        const data = JSON.parse(stored);
        return data.tapCount || 0;
      }
    } catch (error) {
      console.error('Error loading developer console data:', error);
    }
    return 0;
  }

  static incrementTapCount(): number {
    try {
      const count = this.getTapCount() + 1;
      const data = {
        tapCount: count,
        lastTap: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DEVELOPER_CONSOLE, JSON.stringify(data));
      return count;
    } catch (error) {
      console.error('Error incrementing tap count:', error);
      return 0;
    }
  }

  static resetTapCount(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DEVELOPER_CONSOLE);
    } catch (error) {
      console.error('Error resetting tap count:', error);
    }
  }

  static setAuthenticated(isAuthenticated: boolean): void {
    try {
      const data = {
        tapCount: this.getTapCount(),
        isAuthenticated,
        lastAccess: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DEVELOPER_CONSOLE, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting authentication status:', error);
    }
  }

  static isAuthenticated(): boolean {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVELOPER_CONSOLE);
      if (stored) {
        const data = JSON.parse(stored);
        return data.isAuthenticated || false;
      }
    } catch (error) {
      console.error('Error checking authentication status:', error);
    }
    return false;
  }
}

// Audio Volume Management
export class AudioManager {
  static getVolume(): number {
    const preferences = PreferencesManager.get();
    return preferences.sound_volume;
  }

  static setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    PreferencesManager.set({ sound_volume: clampedVolume });
  }

  static playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(url);
        const volume = this.getVolume() / 100;
        audio.volume = volume;
        
        audio.addEventListener('ended', () => resolve());
        audio.addEventListener('error', (e) => reject(e));
        
        audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Theme initialization on app load
export const initializeTheme = (): void => {
  const preferences = PreferencesManager.get();
  PreferencesManager.applyTheme(preferences.theme);
  PreferencesManager.applyFontSize(preferences.font_size);
  
  if (preferences.custom_colors) {
    PreferencesManager.applyCustomColors(preferences.custom_colors);
  }
};

// Data export/import utilities
export const exportAllData = (): string => {
  const data = {
    preferences: PreferencesManager.get(),
    searchHistory: SearchHistoryManager.get(),
    favorites: FavoritesManager.get(),
    exportedAt: new Date().toISOString(),
  };
  
  return JSON.stringify(data, null, 2);
};

export const importAllData = (data: string): boolean => {
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.preferences) {
      PreferencesManager.set(parsed.preferences);
    }
    
    if (parsed.searchHistory) {
      localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(parsed.searchHistory));
    }
    
    if (parsed.favorites) {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(parsed.favorites));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

// Clear all app data
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset to default theme
    PreferencesManager.applyTheme('light');
    PreferencesManager.applyFontSize('base');
    PreferencesManager.resetCustomColors();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
