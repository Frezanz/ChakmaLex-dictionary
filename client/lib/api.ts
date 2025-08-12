/**
 * API Client for ChakmaLex
 * Handles all backend communication, file uploads, and GitHub integration
 */

import { Word, Character, ApiResponse, PaginatedResponse } from "@shared/types";

// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  GITHUB_API_URL: 'https://api.github.com',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

// GitHub Configuration
const GITHUB_CONFIG = {
  REPO_OWNER: 'your-github-username', // Update this
  REPO_NAME: 'chakmalex-dictionary', // Update this
  BRANCH: 'main',
  DICTIONARY_PATH: 'data/dictionary.json',
  CHARACTERS_PATH: 'data/characters.json',
} as const;

// Error types
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Request helper with retry logic
async function makeRequest<T>(
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });

    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retryCount < API_CONFIG.RETRY_ATTEMPTS && error instanceof TypeError) {
      console.warn(`API request failed, retrying... (${retryCount + 1}/${API_CONFIG.RETRY_ATTEMPTS})`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return makeRequest<T>(url, options, retryCount + 1);
    }
    throw error;
  }
}

// GitHub API helper
async function makeGitHubRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) {
    throw new APIError('GitHub token not configured');
  }

  return makeRequest<T>(`${API_CONFIG.GITHUB_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      ...options.headers,
    },
  });
}

// Main API Client Class
export class APIClient {
  // Words CRUD Operations
  static async getWords(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<Word>> {
    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.search) params.append('search', options.search);

    return makeRequest<PaginatedResponse<Word>>(
      `${API_CONFIG.BASE_URL}/words?${params.toString()}`
    );
  }

  static async getWord(id: string): Promise<Word> {
    return makeRequest<Word>(`${API_CONFIG.BASE_URL}/words/${id}`);
  }

  static async createWord(word: Omit<Word, 'id' | 'created_at' | 'updated_at'>): Promise<Word> {
    return makeRequest<Word>(`${API_CONFIG.BASE_URL}/words`, {
      method: 'POST',
      body: JSON.stringify(word),
    });
  }

  static async updateWord(id: string, word: Partial<Word>): Promise<Word> {
    return makeRequest<Word>(`${API_CONFIG.BASE_URL}/words/${id}`, {
      method: 'PUT',
      body: JSON.stringify(word),
    });
  }

  static async deleteWord(id: string): Promise<void> {
    return makeRequest<void>(`${API_CONFIG.BASE_URL}/words/${id}`, {
      method: 'DELETE',
    });
  }

  // Characters CRUD Operations
  static async getCharacters(): Promise<Character[]> {
    return makeRequest<Character[]>(`${API_CONFIG.BASE_URL}/characters`);
  }

  static async getCharacter(id: string): Promise<Character> {
    return makeRequest<Character>(`${API_CONFIG.BASE_URL}/characters/${id}`);
  }

  static async createCharacter(character: Omit<Character, 'id' | 'created_at'>): Promise<Character> {
    return makeRequest<Character>(`${API_CONFIG.BASE_URL}/characters`, {
      method: 'POST',
      body: JSON.stringify(character),
    });
  }

  static async updateCharacter(id: string, character: Partial<Character>): Promise<Character> {
    return makeRequest<Character>(`${API_CONFIG.BASE_URL}/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(character),
    });
  }

  static async deleteCharacter(id: string): Promise<void> {
    return makeRequest<void>(`${API_CONFIG.BASE_URL}/characters/${id}`, {
      method: 'DELETE',
    });
  }

  // File Upload Operations
  static async uploadAudio(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('audio', file);

    return makeRequest<{ url: string }>(`${API_CONFIG.BASE_URL}/upload/audio`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  static async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return makeRequest<{ url: string }>(`${API_CONFIG.BASE_URL}/upload/image`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // GitHub Integration
  static async getGitHubFile(path: string): Promise<{ content: string; sha: string }> {
    const response = await makeGitHubRequest<{
      content: string;
      sha: string;
      encoding: string;
    }>(`/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${path}`);

    return {
      content: atob(response.content),
      sha: response.sha,
    };
  }

  static async updateGitHubFile(
    path: string,
    content: string,
    message: string,
    sha: string
  ): Promise<void> {
    await makeGitHubRequest(`/repos/${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: btoa(content),
        sha,
        branch: GITHUB_CONFIG.BRANCH,
      }),
    });
  }

  static async syncToGitHub(
    words: Word[],
    characters: Character[],
    operation: 'add' | 'update' | 'delete'
  ): Promise<void> {
    try {
      // Get current file content and SHA
      const wordsFile = await this.getGitHubFile(GITHUB_CONFIG.DICTIONARY_PATH);
      const charactersFile = await this.getGitHubFile(GITHUB_CONFIG.CHARACTERS_PATH);

      // Update content based on operation
      const updatedWords = JSON.stringify(words, null, 2);
      const updatedCharacters = JSON.stringify(characters, null, 2);

      // Commit changes
      const timestamp = new Date().toISOString();
      const message = `Sync ${operation} operation - ${timestamp}`;

      await Promise.all([
        this.updateGitHubFile(
          GITHUB_CONFIG.DICTIONARY_PATH,
          updatedWords,
          message,
          wordsFile.sha
        ),
        this.updateGitHubFile(
          GITHUB_CONFIG.CHARACTERS_PATH,
          updatedCharacters,
          message,
          charactersFile.sha
        ),
      ]);
    } catch (error) {
      console.error('GitHub sync failed:', error);
      throw new APIError(`GitHub sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Data Validation
  static validateWord(word: Partial<Word>): string[] {
    const errors: string[] = [];
    
    if (!word.chakma_word_script?.trim()) {
      errors.push('Chakma script is required');
    }
    
    if (!word.romanized_pronunciation?.trim()) {
      errors.push('Romanized pronunciation is required');
    }
    
    if (!word.english_translation?.trim()) {
      errors.push('English translation is required');
    }
    
    if (!word.example_sentence?.trim()) {
      errors.push('Example sentence is required');
    }
    
    if (!word.etymology?.trim()) {
      errors.push('Etymology is required');
    }

    return errors;
  }

  static validateCharacter(character: Partial<Character>): string[] {
    const errors: string[] = [];
    
    if (!character.character_script?.trim()) {
      errors.push('Character script is required');
    }
    
    if (!character.romanized_name?.trim()) {
      errors.push('Romanized name is required');
    }
    
    if (!character.character_type) {
      errors.push('Character type is required');
    }

    return errors;
  }

  // Check for duplicate words
  static async checkDuplicateWord(chakmaScript: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await this.getWords({ search: chakmaScript });
      return response.items.some(word => 
        word.chakma_word_script.toLowerCase() === chakmaScript.toLowerCase() &&
        word.id !== excludeId
      );
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return makeRequest<{ status: string; timestamp: string }>(`${API_CONFIG.BASE_URL}/health`);
  }
}

// Export singleton instance
export const apiClient = new APIClient();