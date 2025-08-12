/**
 * API Client for ChakmaLex
 * Handles all backend communication with error handling, retry logic, and sync status
 */

import {
  ApiResponse,
  CreateWordRequest,
  UpdateWordRequest,
  GetWordsResponse,
  GetWordResponse,
  CreateCharacterRequest,
  UpdateCharacterRequest,
  GetCharactersResponse,
  GetCharacterResponse,
  SearchWordsRequest,
  SearchWordsResponse,
  SyncStatus
} from '@shared/api';
import { Word, Character } from '@shared/types';

// API configuration
const API_BASE_URL = '/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds

// Sync status management
let syncStatus: SyncStatus = {
  isLoading: false,
  pendingChanges: 0
};

const syncStatusListeners: ((status: SyncStatus) => void)[] = [];

export const subscribeSyncStatus = (listener: (status: SyncStatus) => void) => {
  syncStatusListeners.push(listener);
  return () => {
    const index = syncStatusListeners.indexOf(listener);
    if (index > -1) {
      syncStatusListeners.splice(index, 1);
    }
  };
};

const updateSyncStatus = (updates: Partial<SyncStatus>) => {
  syncStatus = { ...syncStatus, ...updates };
  syncStatusListeners.forEach(listener => listener(syncStatus));
};

// HTTP client with error handling
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    updateSyncStatus({ isLoading: true, error: undefined });
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<T> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed');
      }

      updateSyncStatus({ 
        isLoading: false, 
        lastSync: new Date().toISOString(),
        error: undefined 
      });

      return data.data!;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      updateSyncStatus({ 
        isLoading: false, 
        error: errorMessage 
      });
      throw error;
    }
  }

  // Words API methods
  async getAllWords(limit?: number, offset?: number): Promise<GetWordsResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<GetWordsResponse>(`/words${query}`);
  }

  async getWordById(id: string): Promise<GetWordResponse> {
    return this.request<GetWordResponse>(`/words/${id}`);
  }

  async createWord(wordData: CreateWordRequest): Promise<GetWordResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetWordResponse>('/words', {
        method: 'POST',
        body: JSON.stringify(wordData),
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  async updateWord(id: string, updateData: Partial<UpdateWordRequest>): Promise<GetWordResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetWordResponse>(`/words/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updateData, id }),
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  async deleteWord(id: string): Promise<GetWordResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetWordResponse>(`/words/${id}`, {
        method: 'DELETE',
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  async searchWords(searchRequest: SearchWordsRequest): Promise<SearchWordsResponse> {
    return this.request<SearchWordsResponse>('/words/search', {
      method: 'POST',
      body: JSON.stringify(searchRequest),
    });
  }

  // Characters API methods
  async getAllCharacters(type?: string, limit?: number, offset?: number): Promise<GetCharactersResponse> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<GetCharactersResponse>(`/characters${query}`);
  }

  async getCharacterById(id: string): Promise<GetCharacterResponse> {
    return this.request<GetCharacterResponse>(`/characters/${id}`);
  }

  async createCharacter(characterData: CreateCharacterRequest): Promise<GetCharacterResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetCharacterResponse>('/characters', {
        method: 'POST',
        body: JSON.stringify(characterData),
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  async updateCharacter(id: string, updateData: Partial<UpdateCharacterRequest>): Promise<GetCharacterResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetCharacterResponse>(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...updateData, id }),
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  async deleteCharacter(id: string): Promise<GetCharacterResponse> {
    updateSyncStatus({ pendingChanges: syncStatus.pendingChanges + 1 });
    
    try {
      const result = await this.request<GetCharacterResponse>(`/characters/${id}`, {
        method: 'DELETE',
      });
      
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      return result;
    } catch (error) {
      updateSyncStatus({ pendingChanges: Math.max(0, syncStatus.pendingChanges - 1) });
      throw error;
    }
  }

  // Sync status
  async getSyncStatus(): Promise<SyncStatus> {
    return this.request<SyncStatus>('/words/sync-status');
  }

  // Get current local sync status
  getCurrentSyncStatus(): SyncStatus {
    return syncStatus;
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Export current sync status getter
export const getCurrentSyncStatus = () => syncStatus;

// Utility functions for common operations
export const refreshAllData = async (): Promise<{ words: Word[]; characters: Character[] }> => {
  try {
    const [wordsResponse, charactersResponse] = await Promise.all([
      apiClient.getAllWords(),
      apiClient.getAllCharacters()
    ]);
    
    return {
      words: wordsResponse.words,
      characters: charactersResponse.characters
    };
  } catch (error) {
    console.error('Failed to refresh data:', error);
    throw error;
  }
};

// Retry wrapper for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};