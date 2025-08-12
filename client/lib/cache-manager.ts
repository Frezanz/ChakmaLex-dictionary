/**
 * Cache Manager for ChakmaLex
 * Handles caching, cleanup, and synchronization of dictionary data
 */

import { Word, Character } from '@shared/types';

export interface CacheConfig {
  maxAge: number; // in milliseconds
  maxItems: number;
  version: string;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
  etag?: string;
}

export interface SyncStatus {
  lastSync: number;
  status: 'idle' | 'syncing' | 'error' | 'completed';
  error?: string;
}

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  maxItems: 1000,
  version: '2.0.0',
};

const CACHE_KEYS = {
  WORDS: 'chakmalex_words_cache',
  CHARACTERS: 'chakmalex_characters_cache',
  SYNC_STATUS: 'chakmalex_sync_status',
  CACHE_CONFIG: 'chakmalex_cache_config',
  LAST_CLEANUP: 'chakmalex_last_cleanup',
} as const;

export class CacheManager {
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    this.initializeCache();
  }

  private initializeCache() {
    try {
      // Store cache configuration
      localStorage.setItem(CACHE_KEYS.CACHE_CONFIG, JSON.stringify(this.config));
      
      // Perform cleanup on initialization
      this.cleanup();
    } catch (error) {
      console.error('Failed to initialize cache:', error);
    }
  }

  // Store data in cache
  set<T>(key: string, data: T, etag?: string): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        version: this.config.version,
        etag,
      };
      
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to cache data for key ${key}:`, error);
      // If storage is full, try cleanup and retry
      this.cleanup();
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          version: this.config.version,
          etag,
        };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch (retryError) {
        console.error(`Failed to cache data after cleanup for key ${key}:`, retryError);
      }
    }
  }

  // Get data from cache
  get<T>(key: string): CacheEntry<T> | null {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const entry: CacheEntry<T> = JSON.parse(stored);
      
      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.delete(key);
        return null;
      }

      // Check if entry version matches
      if (entry.version !== this.config.version) {
        this.delete(key);
        return null;
      }

      return entry;
    } catch (error) {
      console.error(`Failed to get cached data for key ${key}:`, error);
      this.delete(key);
      return null;
    }
  }

  // Delete cache entry
  delete(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to delete cache entry for key ${key}:`, error);
    }
  }

  // Check if cache entry is expired
  private isExpired<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.maxAge;
  }

  // Cache words data
  cacheWords(words: Word[], etag?: string): void {
    this.set(CACHE_KEYS.WORDS, words, etag);
  }

  // Get cached words
  getCachedWords(): Word[] | null {
    const entry = this.get<Word[]>(CACHE_KEYS.WORDS);
    return entry?.data || null;
  }

  // Cache characters data
  cacheCharacters(characters: Character[], etag?: string): void {
    this.set(CACHE_KEYS.CHARACTERS, characters, etag);
  }

  // Get cached characters
  getCachedCharacters(): Character[] | null {
    const entry = this.get<Character[]>(CACHE_KEYS.CHARACTERS);
    return entry?.data || null;
  }

  // Update sync status
  setSyncStatus(status: SyncStatus): void {
    this.set(CACHE_KEYS.SYNC_STATUS, status);
  }

  // Get sync status
  getSyncStatus(): SyncStatus | null {
    const entry = this.get<SyncStatus>(CACHE_KEYS.SYNC_STATUS);
    return entry?.data || null;
  }

  // Cleanup expired and invalid cache entries
  cleanup(): void {
    try {
      const keys = Object.keys(localStorage);
      const chakmalexKeys = keys.filter(key => key.startsWith('chakmalex_'));
      
      for (const key of chakmalexKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          const entry = JSON.parse(stored);
          
          // Remove if expired or version mismatch
          if (this.isExpired(entry) || entry.version !== this.config.version) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }

      // Update last cleanup timestamp
      localStorage.setItem(CACHE_KEYS.LAST_CLEANUP, Date.now().toString());
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  // Clear all cache
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      const chakmalexKeys = keys.filter(key => key.startsWith('chakmalex_'));
      
      for (const key of chakmalexKeys) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Failed to clear all cache:', error);
    }
  }

  // Get cache statistics
  getStats(): {
    totalSize: number;
    entryCount: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    configuredMaxAge: number;
  } {
    let totalSize = 0;
    let entryCount = 0;
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    try {
      const keys = Object.keys(localStorage);
      const chakmalexKeys = keys.filter(key => key.startsWith('chakmalex_'));
      
      for (const key of chakmalexKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (!stored) continue;

          totalSize += stored.length;
          entryCount++;

          const entry = JSON.parse(stored);
          if (entry.timestamp) {
            if (!oldestEntry || entry.timestamp < oldestEntry) {
              oldestEntry = entry.timestamp;
            }
            if (!newestEntry || entry.timestamp > newestEntry) {
              newestEntry = entry.timestamp;
            }
          }
        } catch (error) {
          // Skip corrupted entries
        }
      }
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }

    return {
      totalSize,
      entryCount,
      oldestEntry,
      newestEntry,
      configuredMaxAge: this.config.maxAge,
    };
  }

  // Check if data needs refreshing
  needsRefresh(key: string): boolean {
    const entry = this.get(key);
    if (!entry) return true;

    const age = Date.now() - entry.timestamp;
    const refreshThreshold = this.config.maxAge * 0.8; // Refresh at 80% of max age
    
    return age > refreshThreshold;
  }

  // Optimize cache by removing least recently used items
  optimize(): void {
    try {
      const keys = Object.keys(localStorage);
      const chakmalexKeys = keys.filter(key => key.startsWith('chakmalex_'));
      
      if (chakmalexKeys.length <= this.config.maxItems) return;

      // Get entries with timestamps
      const entries = chakmalexKeys
        .map(key => {
          try {
            const stored = localStorage.getItem(key);
            if (!stored) return null;
            const entry = JSON.parse(stored);
            return { key, timestamp: entry.timestamp || 0 };
          } catch {
            return { key, timestamp: 0 };
          }
        })
        .filter(Boolean)
        .sort((a, b) => a!.timestamp - b!.timestamp); // Sort by oldest first

      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - this.config.maxItems);
      for (const entry of toRemove) {
        localStorage.removeItem(entry!.key);
      }
    } catch (error) {
      console.error('Cache optimization failed:', error);
    }
  }

  // Import/export cache data
  export(): string {
    const data: { [key: string]: any } = {};
    
    try {
      const keys = Object.keys(localStorage);
      const chakmalexKeys = keys.filter(key => key.startsWith('chakmalex_'));
      
      for (const key of chakmalexKeys) {
        const stored = localStorage.getItem(key);
        if (stored) {
          data[key] = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Cache export failed:', error);
    }

    return JSON.stringify(data, null, 2);
  }

  import(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      
      for (const [key, value] of Object.entries(parsed)) {
        if (key.startsWith('chakmalex_')) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Cache import failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager();

// Utility functions
export function clearAllChakmaLexData(): void {
  cacheManager.clearAll();
  
  // Also clear any other application data
  const additionalKeys = [
    'chakmalex_user_preferences',
    'chakmalex_search_history',
    'chakmalex_favorites',
    'chakmalex_dev_console',
    'chakmalex_quiz_progress',
    'github_token',
    'github_repo',
    'last_sync',
  ];

  for (const key of additionalKeys) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
    }
  }
}

export function getDataSize(): number {
  let totalSize = 0;
  
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('chakmalex_') || key.startsWith('github_')) {
        const item = localStorage.getItem(key);
        if (item) {
          totalSize += item.length;
        }
      }
    }
  } catch (error) {
    console.error('Failed to calculate data size:', error);
  }

  return totalSize;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}