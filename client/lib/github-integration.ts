/**
 * GitHub Integration for ChakmaLex
 * Handles GitHub API operations for dictionary data management
 */

import { Word, Character } from '@shared/types';

export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
  wordsFile: string;
  charactersFile: string;
}

export interface GitHubFileContent {
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

export interface GitHubCommitData {
  message: string;
  content: string;
  sha?: string;
  branch?: string;
}

export class GitHubIntegration {
  private config: GitHubConfig;

  constructor(config: GitHubConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
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

  // Test GitHub connection
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/user');
      return true;
    } catch (error) {
      console.error('GitHub connection test failed:', error);
      return false;
    }
  }

  // Get repository information
  async getRepositoryInfo(): Promise<any> {
    return this.request(`/repos/${this.config.repo}`);
  }

  // Get file content from repository
  async getFile(path: string): Promise<GitHubFileContent> {
    return this.request<GitHubFileContent>(
      `/repos/${this.config.repo}/contents/${path}?ref=${this.config.branch}`
    );
  }

  // Update or create file in repository
  async updateFile(path: string, content: string, message: string, sha?: string): Promise<void> {
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const payload: GitHubCommitData = {
      message,
      content: encodedContent,
      branch: this.config.branch,
    };

    if (sha) {
      payload.sha = sha;
    }

    await this.request(
      `/repos/${this.config.repo}/contents/${path}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  }

  // Initialize repository with basic structure
  async initializeRepository(): Promise<void> {
    try {
      // Check if files exist, if not create them
      const filesToCreate = [
        { path: this.config.wordsFile, content: '[]', message: 'Initialize words.json' },
        { path: this.config.charactersFile, content: '[]', message: 'Initialize characters.json' },
        { path: 'README.md', content: this.getReadmeContent(), message: 'Add README' },
        { path: '.gitignore', content: this.getGitignoreContent(), message: 'Add .gitignore' },
      ];

      for (const file of filesToCreate) {
        try {
          await this.getFile(file.path);
          // File exists, skip creation
        } catch (error) {
          // File doesn't exist, create it
          await this.updateFile(file.path, file.content, file.message);
        }
      }
    } catch (error) {
      console.error('Failed to initialize repository:', error);
      throw error;
    }
  }

  // Get words from repository
  async getWords(): Promise<Word[]> {
    try {
      const file = await this.getFile(this.config.wordsFile);
      const content = atob(file.content.replace(/\n/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get words from GitHub:', error);
      return [];
    }
  }

  // Update words in repository
  async updateWords(words: Word[], message: string = 'Update words'): Promise<void> {
    try {
      const file = await this.getFile(this.config.wordsFile);
      const content = JSON.stringify(words, null, 2);
      await this.updateFile(this.config.wordsFile, content, message, file.sha);
    } catch (error) {
      console.error('Failed to update words in GitHub:', error);
      throw error;
    }
  }

  // Get characters from repository
  async getCharacters(): Promise<Character[]> {
    try {
      const file = await this.getFile(this.config.charactersFile);
      const content = atob(file.content.replace(/\n/g, ''));
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to get characters from GitHub:', error);
      return [];
    }
  }

  // Update characters in repository
  async updateCharacters(characters: Character[], message: string = 'Update characters'): Promise<void> {
    try {
      const file = await this.getFile(this.config.charactersFile);
      const content = JSON.stringify(characters, null, 2);
      await this.updateFile(this.config.charactersFile, content, message, file.sha);
    } catch (error) {
      console.error('Failed to update characters in GitHub:', error);
      throw error;
    }
  }

  // Sync data with repository
  async syncData(words: Word[], characters: Character[]): Promise<void> {
    try {
      await Promise.all([
        this.updateWords(words, `Sync words - ${words.length} items`),
        this.updateCharacters(characters, `Sync characters - ${characters.length} items`)
      ]);
    } catch (error) {
      console.error('Failed to sync data to GitHub:', error);
      throw error;
    }
  }

  // Create backup of current data
  async createBackup(words: Word[], characters: Character[]): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = `backups/${timestamp}`;
    
    try {
      await Promise.all([
        this.updateFile(
          `${backupDir}/words.json`,
          JSON.stringify(words, null, 2),
          `Backup words - ${timestamp}`
        ),
        this.updateFile(
          `${backupDir}/characters.json`,
          JSON.stringify(characters, null, 2),
          `Backup characters - ${timestamp}`
        )
      ]);
    } catch (error) {
      console.error('Failed to create backup in GitHub:', error);
      throw error;
    }
  }

  // Get repository statistics
  async getStats(): Promise<{
    words_count: number;
    characters_count: number;
    last_updated: string;
    repository_size: number;
  }> {
    try {
      const [words, characters, repoInfo] = await Promise.all([
        this.getWords(),
        this.getCharacters(),
        this.getRepositoryInfo()
      ]);

      return {
        words_count: words.length,
        characters_count: characters.length,
        last_updated: repoInfo.updated_at,
        repository_size: repoInfo.size
      };
    } catch (error) {
      console.error('Failed to get repository stats:', error);
      throw error;
    }
  }

  // Validate repository structure
  async validateRepository(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      // Check if required files exist
      const requiredFiles = [this.config.wordsFile, this.config.charactersFile];
      
      for (const file of requiredFiles) {
        try {
          await this.getFile(file);
        } catch (error) {
          issues.push(`Missing file: ${file}`);
        }
      }

      // Validate file contents
      try {
        const words = await this.getWords();
        if (!Array.isArray(words)) {
          issues.push('Words file is not a valid array');
        }
      } catch (error) {
        issues.push('Invalid words file format');
      }

      try {
        const characters = await this.getCharacters();
        if (!Array.isArray(characters)) {
          issues.push('Characters file is not a valid array');
        }
      } catch (error) {
        issues.push('Invalid characters file format');
      }

    } catch (error) {
      issues.push(`Repository access error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  private getReadmeContent(): string {
    return `# ChakmaLex Dictionary Data

This repository contains the dictionary data for ChakmaLex, including Chakma words and characters.

## Structure

- \`${this.config.wordsFile}\` - Chakma words with translations and pronunciations
- \`${this.config.charactersFile}\` - Chakma characters and their information
- \`backups/\` - Automatic backups of the data

## Data Format

### Words

Each word entry contains:
- \`id\` - Unique identifier
- \`chakma_word_script\` - Word in Chakma script
- \`romanized_pronunciation\` - Romanized pronunciation
- \`english_translation\` - English translation
- \`example_sentence\` - Example usage
- \`etymology\` - Word origin and history
- \`audio_pronunciation_url\` - Optional audio file URL
- \`synonyms\` - Related terms
- \`antonyms\` - Opposite terms
- \`explanation_media\` - Visual explanations

### Characters

Each character entry contains:
- \`id\` - Unique identifier
- \`character_script\` - Character in Chakma script
- \`character_type\` - Type (alphabet, vowel, conjunct, etc.)
- \`romanized_name\` - Romanized name
- \`description\` - Character description
- \`audio_pronunciation_url\` - Optional audio file URL

## Automated Updates

This repository is automatically updated by the ChakmaLex Developer Console.

## License

This data is part of the ChakmaLex project and is intended for educational and cultural preservation purposes.
`;
  }

  private getGitignoreContent(): string {
    return `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Dependency directories
node_modules/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# macOS
.DS_Store

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
`;
  }
}

// Default configuration
export const defaultGitHubConfig: Omit<GitHubConfig, 'token' | 'repo'> = {
  branch: 'main',
  wordsFile: 'data/words.json',
  charactersFile: 'data/characters.json'
};

// Utility functions
export function validateGitHubToken(token: string): boolean {
  return token.length >= 40 && token.startsWith('ghp_');
}

export function validateRepositoryName(repo: string): boolean {
  const repoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
  return repoPattern.test(repo);
}

export function createGitHubIntegration(token: string, repo: string): GitHubIntegration {
  const config: GitHubConfig = {
    token,
    repo,
    ...defaultGitHubConfig
  };
  
  return new GitHubIntegration(config);
}