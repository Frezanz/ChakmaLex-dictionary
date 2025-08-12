/**
 * GitHub Integration Service
 * Handles repository operations, file management, and synchronization
 */

import { Octokit } from '@octokit/rest';

// GitHub Configuration
const GITHUB_CONFIG = {
  REPO_OWNER: process.env.GITHUB_REPO_OWNER || 'your-github-username',
  REPO_NAME: process.env.GITHUB_REPO_NAME || 'chakmalex-dictionary',
  BRANCH: process.env.GITHUB_BRANCH || 'main',
  DICTIONARY_PATH: process.env.GITHUB_DICTIONARY_PATH || 'data/dictionary.json',
  CHARACTERS_PATH: process.env.GITHUB_CHARACTERS_PATH || 'data/characters.json',
} as const;

// Initialize Octokit
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubFile {
  content: string;
  sha: string;
  path: string;
}

export interface GitHubCommit {
  message: string;
  content: string;
  sha: string;
  path: string;
}

export class GitHubService {
  /**
   * Get file content from GitHub repository
   */
  static async getFile(path: string): Promise<GitHubFile> {
    try {
      const response = await octokit.repos.getContent({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        path,
        ref: GITHUB_CONFIG.BRANCH,
      });

      if (Array.isArray(response.data)) {
        throw new Error(`Path ${path} is a directory, not a file`);
      }

      if (response.data.type !== 'file') {
        throw new Error(`Path ${path} is not a file`);
      }

      // Decode content from base64
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');

      return {
        content,
        sha: response.data.sha,
        path: response.data.path,
      };
    } catch (error) {
      console.error(`Error getting file ${path}:`, error);
      throw new Error(`Failed to get file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update file in GitHub repository
   */
  static async updateFile(commit: GitHubCommit): Promise<void> {
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        path: commit.path,
        message: commit.message,
        content: Buffer.from(commit.content).toString('base64'),
        sha: commit.sha,
        branch: GITHUB_CONFIG.BRANCH,
      });
    } catch (error) {
      console.error(`Error updating file ${commit.path}:`, error);
      throw new Error(`Failed to update file ${commit.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new file in GitHub repository
   */
  static async createFile(path: string, content: string, message: string): Promise<void> {
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch: GITHUB_CONFIG.BRANCH,
      });
    } catch (error) {
      console.error(`Error creating file ${path}:`, error);
      throw new Error(`Failed to create file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file from GitHub repository
   */
  static async deleteFile(path: string, sha: string, message: string): Promise<void> {
    try {
      await octokit.repos.deleteFile({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        path,
        message,
        sha,
        branch: GITHUB_CONFIG.BRANCH,
      });
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      throw new Error(`Failed to delete file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if file exists in repository
   */
  static async fileExists(path: string): Promise<boolean> {
    try {
      await this.getFile(path);
      return true;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get repository information
   */
  static async getRepositoryInfo() {
    try {
      const response = await octokit.repos.get({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
      });

      return {
        name: response.data.name,
        full_name: response.data.full_name,
        description: response.data.description,
        html_url: response.data.html_url,
        default_branch: response.data.default_branch,
        updated_at: response.data.updated_at,
      };
    } catch (error) {
      console.error('Error getting repository info:', error);
      throw new Error(`Failed to get repository info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get recent commits for a file
   */
  static async getFileCommits(path: string, limit: number = 10) {
    try {
      const response = await octokit.repos.listCommits({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        path,
        per_page: limit,
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author,
        date: commit.commit.author?.date,
      }));
    } catch (error) {
      console.error(`Error getting commits for ${path}:`, error);
      throw new Error(`Failed to get commits for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new branch
   */
  static async createBranch(branchName: string, baseBranch: string = GITHUB_CONFIG.BRANCH) {
    try {
      // Get the latest commit SHA from the base branch
      const baseRef = await octokit.git.getRef({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        ref: `heads/${baseBranch}`,
      });

      // Create the new branch
      await octokit.git.createRef({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        ref: `refs/heads/${branchName}`,
        sha: baseRef.data.object.sha,
      });
    } catch (error) {
      console.error(`Error creating branch ${branchName}:`, error);
      throw new Error(`Failed to create branch ${branchName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a pull request
   */
  static async createPullRequest(title: string, body: string, headBranch: string, baseBranch: string = GITHUB_CONFIG.BRANCH) {
    try {
      const response = await octokit.pulls.create({
        owner: GITHUB_CONFIG.REPO_OWNER,
        repo: GITHUB_CONFIG.REPO_NAME,
        title,
        body,
        head: headBranch,
        base: baseBranch,
      });

      return {
        number: response.data.number,
        html_url: response.data.html_url,
        state: response.data.state,
      };
    } catch (error) {
      console.error('Error creating pull request:', error);
      throw new Error(`Failed to create pull request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Sync dictionary data to GitHub
   */
  static async syncDictionaryData(words: any[], characters: any[], operation: 'add' | 'update' | 'delete') {
    try {
      const timestamp = new Date().toISOString();
      const commitMessage = `Sync ${operation} operation - ${timestamp}`;

      const commits: GitHubCommit[] = [];

      // Handle dictionary file
      if (await this.fileExists(GITHUB_CONFIG.DICTIONARY_PATH)) {
        const wordsFile = await this.getFile(GITHUB_CONFIG.DICTIONARY_PATH);
        commits.push({
          message: commitMessage,
          content: JSON.stringify(words, null, 2),
          sha: wordsFile.sha,
          path: GITHUB_CONFIG.DICTIONARY_PATH,
        });
      } else {
        // Create new file
        await this.createFile(
          GITHUB_CONFIG.DICTIONARY_PATH,
          JSON.stringify(words, null, 2),
          commitMessage
        );
      }

      // Handle characters file
      if (await this.fileExists(GITHUB_CONFIG.CHARACTERS_PATH)) {
        const charactersFile = await this.getFile(GITHUB_CONFIG.CHARACTERS_PATH);
        commits.push({
          message: commitMessage,
          content: JSON.stringify(characters, null, 2),
          sha: charactersFile.sha,
          path: GITHUB_CONFIG.CHARACTERS_PATH,
        });
      } else {
        // Create new file
        await this.createFile(
          GITHUB_CONFIG.CHARACTERS_PATH,
          JSON.stringify(characters, null, 2),
          commitMessage
        );
      }

      // Update all files
      await Promise.all(commits.map(commit => this.updateFile(commit)));

      return {
        success: true,
        message: `Successfully synced ${operation} operation to GitHub`,
        timestamp,
      };
    } catch (error) {
      console.error('Error syncing dictionary data:', error);
      throw new Error(`Failed to sync dictionary data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate GitHub configuration
   */
  static async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check if token is provided
    if (!process.env.GITHUB_TOKEN) {
      errors.push('GitHub token is not configured');
    }

    // Check if repository exists and is accessible
    try {
      await this.getRepositoryInfo();
    } catch (error) {
      errors.push(`Repository ${GITHUB_CONFIG.REPO_OWNER}/${GITHUB_CONFIG.REPO_NAME} is not accessible`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}