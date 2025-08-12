/**
 * API Client for ChakmaLex
 * Handles all backend communication with proper error handling and authentication
 */

import { Word, Character, ApiResponse, PaginatedResponse } from '@shared/types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'chakmalex/dictionary-data';

// API Client Class
class ApiClient {
  private baseURL: string;
  private githubToken: string | undefined;

  constructor(baseURL: string = API_BASE_URL, githubToken?: string) {
    this.baseURL = baseURL;
    this.githubToken = githubToken || GITHUB_TOKEN;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Words API
  async getWords(page: number = 1, limit: number = 50): Promise<ApiResponse<PaginatedResponse<Word>>> {
    return this.request<PaginatedResponse<Word>>(`/words?page=${page}&limit=${limit}`);
  }

  async getWord(id: string): Promise<ApiResponse<Word>> {
    return this.request<Word>(`/words/${id}`);
  }

  async createWord(word: Omit<Word, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Word>> {
    return this.request<Word>('/words', {
      method: 'POST',
      body: JSON.stringify(word),
    });
  }

  async updateWord(id: string, word: Partial<Word>): Promise<ApiResponse<Word>> {
    return this.request<Word>(`/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(word),
    });
  }

  async deleteWord(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/words/${id}`, {
      method: 'DELETE',
    });
  }

  async searchWords(query: string, fields?: string[]): Promise<ApiResponse<Word[]>> {
    const params = new URLSearchParams({ query });
    if (fields) {
      params.append('fields', fields.join(','));
    }
    return this.request<Word[]>(`/words/search?${params}`);
  }

  // Characters API
  async getCharacters(): Promise<ApiResponse<Character[]>> {
    return this.request<Character[]>('/characters');
  }

  async getCharacter(id: string): Promise<ApiResponse<Character>> {
    return this.request<Character>(`/characters/${id}`);
  }

  async createCharacter(character: Omit<Character, 'id' | 'created_at'>): Promise<ApiResponse<Character>> {
    return this.request<Character>('/characters', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  }

  async updateCharacter(id: string, character: Partial<Character>): Promise<ApiResponse<Character>> {
    return this.request<Character>(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(character),
    });
  }

  async deleteCharacter(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload API
  async uploadAudio(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const response = await fetch(`${this.baseURL}/upload/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Audio upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  // GitHub Integration API
  async syncToGitHub(operation: 'create' | 'update' | 'delete', data: any): Promise<ApiResponse<void>> {
    if (!this.githubToken) {
      return {
        success: false,
        error: 'GitHub token not configured',
      };
    }

    return this.request<void>('/github/sync', {
      method: 'POST',
      body: JSON.stringify({
        operation,
        data,
        repo: GITHUB_REPO,
        token: this.githubToken,
      }),
    });
  }

  async getGitHubStatus(): Promise<ApiResponse<{ lastSync: string; pendingChanges: number }>> {
    return this.request<{ lastSync: string; pendingChanges: number }>('/github/status');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.request<{ status: string; timestamp: string }>('/health');
  }

  // Data Export/Import
  async exportData(): Promise<ApiResponse<{ words: Word[]; characters: Character[] }>> {
    return this.request<{ words: Word[]; characters: Character[] }>('/export');
  }

  async importData(data: { words: Word[]; characters: Character[] }): Promise<ApiResponse<void>> {
    return this.request<void>('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Export the class for testing
export { ApiClient };

// Utility functions for common operations
export const apiUtils = {
  // Check if a word already exists (for duplicate prevention)
  async checkWordExists(chakmaWord: string): Promise<boolean> {
    const response = await apiClient.searchWords(chakmaWord, ['chakma_word_script']);
    return response.success && response.data && response.data.length > 0;
  },

  // Batch operations
  async batchCreateWords(words: Omit<Word, 'id' | 'created_at' | 'updated_at'>[]): Promise<ApiResponse<Word[]>> {
    return apiClient.request<Word[]>('/words/batch', {
      method: 'POST',
      body: JSON.stringify({ words }),
    });
  },

  // Sync operations
  async syncAllData(): Promise<ApiResponse<void>> {
    return apiClient.request<void>('/sync', {
      method: 'POST',
    });
  },

  // Cache management
  async clearCache(): Promise<ApiResponse<void>> {
    return apiClient.request<void>('/cache/clear', {
      method: 'POST',
    });
  },
};