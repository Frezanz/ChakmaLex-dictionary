/**
 * API Client for ChakmaLex
 * Handles all backend communication including GitHub integration
 */

import { Word, Character, ApiResponse } from '@shared/types';
import { GitHubIntegration, createGitHubIntegration, validateGitHubToken, validateRepositoryName } from './github-integration';

// Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions/api' 
  : '/api';

const GITHUB_CONFIG = {
  repo: 'your-username/chakmalex-dictionary', // Replace with actual repo
  token: '', // Will be set dynamically
  branch: 'main',
  wordsFile: 'data/words.json',
  charactersFile: 'data/characters.json'
};

// GitHub API types
interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
}

interface GitHubCommitRequest {
  message: string;
  content: string;
  sha?: string;
  branch?: string;
}

// API Client class
export class APIClient {
  private baseURL: string;
  private githubToken: string | null = null;
  private githubRepo: string | null = null;
  private githubIntegration: GitHubIntegration | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.initializeGitHubToken();
  }

  private async initializeGitHubToken() {
    // Try to get GitHub token from environment or local storage
    this.githubToken = localStorage.getItem('github_token') || process.env.GITHUB_TOKEN || '';
    this.githubRepo = localStorage.getItem('github_repo') || '';
    
    if (this.githubToken && this.githubRepo) {
      this.initializeGitHubIntegration();
    }
  }

  setGitHubToken(token: string) {
    if (!validateGitHubToken(token)) {
      throw new Error('Invalid GitHub token format');
    }
    this.githubToken = token;
    localStorage.setItem('github_token', token);
    this.initializeGitHubIntegration();
  }

  setGitHubRepo(repo: string) {
    if (!validateRepositoryName(repo)) {
      throw new Error('Invalid repository name format');
    }
    this.githubRepo = repo;
    localStorage.setItem('github_repo', repo);
    this.initializeGitHubIntegration();
  }

  private initializeGitHubIntegration() {
    if (this.githubToken && this.githubRepo) {
      this.githubIntegration = createGitHubIntegration(this.githubToken, this.githubRepo);
    }
  }

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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async githubRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.githubToken) {
      throw new Error('GitHub token not configured');
    }

    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
    }

    return response.json();
  }

  // File upload for audio/images
  async uploadFile(file: File, type: 'audio' | 'image'): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${this.baseURL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('File upload failed:', error);
      // Fallback to blob URL for local development
      return URL.createObjectURL(file);
    }
  }

  // GitHub file operations
  async getGitHubFile(path: string): Promise<GitHubFile> {
    return this.githubRequest<GitHubFile>(
      `/repos/${GITHUB_CONFIG.repo}/contents/${path}?ref=${GITHUB_CONFIG.branch}`
    );
  }

  async updateGitHubFile(
    path: string, 
    content: string, 
    message: string, 
    sha?: string
  ): Promise<void> {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const payload: GitHubCommitRequest = {
      message,
      content: encodedContent,
      branch: GITHUB_CONFIG.branch,
    };

    if (sha) {
      payload.sha = sha;
    }

    await this.githubRequest(
      `/repos/${GITHUB_CONFIG.repo}/contents/${path}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  }

  // Word CRUD operations
  async getWords(): Promise<Word[]> {
    try {
      if (this.githubIntegration) {
        // Fetch from GitHub
        return await this.githubIntegration.getWords();
      } else {
        // Fallback to local API
        const result = await this.request<Word[]>('/words');
        return result.success ? result.data || [] : [];
      }
    } catch (error) {
      console.error('Failed to fetch words:', error);
      return [];
    }
  }

  async createWord(word: Omit<Word, 'id'>): Promise<Word> {
    const newWord: Word = {
      ...word,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (this.githubIntegration) {
      // Update GitHub repository
      const currentWords = await this.githubIntegration.getWords();
      const updatedWords = [...currentWords, newWord];
      await this.githubIntegration.updateWords(updatedWords, `Add word: ${newWord.english_translation}`);
    } else {
      // Fallback to local API
      await this.request('/words', {
        method: 'POST',
        body: JSON.stringify(newWord),
      });
    }

    return newWord;
  }

  async updateWord(id: string, updates: Partial<Word>): Promise<Word> {
    const updatedWord: Word = {
      ...updates as Word,
      id,
      updated_at: new Date().toISOString(),
    };

    if (this.githubToken && GITHUB_CONFIG.repo) {
      await this.syncWordsToGitHub([updatedWord], 'update');
    } else {
      await this.request(`/words/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedWord),
      });
    }

    return updatedWord;
  }

  async deleteWord(id: string): Promise<void> {
    if (this.githubToken && GITHUB_CONFIG.repo) {
      await this.syncWordsToGitHub([{ id } as Word], 'delete');
    } else {
      await this.request(`/words/${id}`, {
        method: 'DELETE',
      });
    }
  }

  // Character CRUD operations
  async getCharacters(): Promise<Character[]> {
    try {
      if (this.githubToken && GITHUB_CONFIG.repo) {
        const file = await this.getGitHubFile(GITHUB_CONFIG.charactersFile);
        const content = atob(file.content.replace(/\n/g, ''));
        return JSON.parse(content);
      } else {
        const result = await this.request<Character[]>('/characters');
        return result.success ? result.data || [] : [];
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
      return [];
    }
  }

  async createCharacter(character: Omit<Character, 'id'>): Promise<Character> {
    const newCharacter: Character = {
      ...character,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    if (this.githubToken && GITHUB_CONFIG.repo) {
      await this.syncCharactersToGitHub([newCharacter], 'add');
    } else {
      await this.request('/characters', {
        method: 'POST',
        body: JSON.stringify(newCharacter),
      });
    }

    return newCharacter;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const updatedCharacter: Character = {
      ...updates as Character,
      id,
    };

    if (this.githubToken && GITHUB_CONFIG.repo) {
      await this.syncCharactersToGitHub([updatedCharacter], 'update');
    } else {
      await this.request(`/characters/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedCharacter),
      });
    }

    return updatedCharacter;
  }

  async deleteCharacter(id: string): Promise<void> {
    if (this.githubToken && GITHUB_CONFIG.repo) {
      await this.syncCharactersToGitHub([{ id } as Character], 'delete');
    } else {
      await this.request(`/characters/${id}`, {
        method: 'DELETE',
      });
    }
  }

  // GitHub synchronization
  private async syncWordsToGitHub(
    words: Word[], 
    operation: 'add' | 'update' | 'delete'
  ): Promise<void> {
    try {
      // Get current words from GitHub
      const currentWords = await this.getWords();
      let updatedWords = [...currentWords];

      // Apply operations
      words.forEach(word => {
        switch (operation) {
          case 'add':
            // Check for duplicates
            if (!updatedWords.find(w => w.chakma_word_script === word.chakma_word_script)) {
              updatedWords.push(word);
            }
            break;
          case 'update':
            const index = updatedWords.findIndex(w => w.id === word.id);
            if (index !== -1) {
              updatedWords[index] = { ...updatedWords[index], ...word };
            }
            break;
          case 'delete':
            updatedWords = updatedWords.filter(w => w.id !== word.id);
            break;
        }
      });

      // Get current file SHA
      const file = await this.getGitHubFile(GITHUB_CONFIG.wordsFile);
      
      // Update GitHub file
      await this.updateGitHubFile(
        GITHUB_CONFIG.wordsFile,
        JSON.stringify(updatedWords, null, 2),
        `${operation.charAt(0).toUpperCase() + operation.slice(1)} word(s) - ${words.length} item(s)`,
        file.sha
      );
    } catch (error) {
      console.error('GitHub sync failed for words:', error);
      throw error;
    }
  }

  private async syncCharactersToGitHub(
    characters: Character[], 
    operation: 'add' | 'update' | 'delete'
  ): Promise<void> {
    try {
      const currentCharacters = await this.getCharacters();
      let updatedCharacters = [...currentCharacters];

      characters.forEach(character => {
        switch (operation) {
          case 'add':
            if (!updatedCharacters.find(c => c.character_script === character.character_script)) {
              updatedCharacters.push(character);
            }
            break;
          case 'update':
            const index = updatedCharacters.findIndex(c => c.id === character.id);
            if (index !== -1) {
              updatedCharacters[index] = { ...updatedCharacters[index], ...character };
            }
            break;
          case 'delete':
            updatedCharacters = updatedCharacters.filter(c => c.id !== character.id);
            break;
        }
      });

      const file = await this.getGitHubFile(GITHUB_CONFIG.charactersFile);
      
      await this.updateGitHubFile(
        GITHUB_CONFIG.charactersFile,
        JSON.stringify(updatedCharacters, null, 2),
        `${operation.charAt(0).toUpperCase() + operation.slice(1)} character(s) - ${characters.length} item(s)`,
        file.sha
      );
    } catch (error) {
      console.error('GitHub sync failed for characters:', error);
      throw error;
    }
  }

  // Check sync status
  async checkSyncStatus(): Promise<{
    github_connected: boolean;
    last_sync?: string;
    repo?: string;
  }> {
    return {
      github_connected: !!this.githubToken && !!GITHUB_CONFIG.repo,
      repo: GITHUB_CONFIG.repo,
      last_sync: localStorage.getItem('last_sync') || undefined,
    };
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      if (this.githubToken) {
        await this.githubRequest('/user');
        return true;
      }
      
      const result = await this.request('/ping');
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

// Singleton instance
export const apiClient = new APIClient();

// Export for use in components
export default apiClient;