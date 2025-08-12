import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";
import { GitHubService } from "../services/github";

// GET /api/github/validate - Validate GitHub configuration
export const validateGitHubConfig: RequestHandler = async (req, res) => {
  try {
    const validation = await GitHubService.validateConfiguration();
    
    res.json({
      success: true,
      data: validation
    } as ApiResponse<{ valid: boolean; errors: string[] }>);
  } catch (error) {
    console.error('Error validating GitHub config:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/github/repo-info - Get repository information
export const getRepositoryInfo: RequestHandler = async (req, res) => {
  try {
    const repoInfo = await GitHubService.getRepositoryInfo();
    
    res.json({
      success: true,
      data: repoInfo
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error getting repository info:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/github/file/:path - Get file content from GitHub
export const getGitHubFile: RequestHandler = async (req, res) => {
  try {
    const { path } = req.params;
    const file = await GitHubService.getFile(path);
    
    res.json({
      success: true,
      data: file
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error getting GitHub file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/github/sync - Sync data to GitHub
export const syncToGitHub: RequestHandler = async (req, res) => {
  try {
    const { words, characters, operation } = req.body;
    
    if (!words || !characters || !operation) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: words, characters, operation'
      } as ApiResponse<null>);
    }

    if (!['add', 'update', 'delete'].includes(operation)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid operation. Must be one of: add, update, delete'
      } as ApiResponse<null>);
    }

    const result = await GitHubService.syncDictionaryData(words, characters, operation);
    
    res.json({
      success: true,
      data: result
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/github/commits/:path - Get file commits
export const getFileCommits: RequestHandler = async (req, res) => {
  try {
    const { path } = req.params;
    const { limit = 10 } = req.query;
    
    const commits = await GitHubService.getFileCommits(path, parseInt(limit as string));
    
    res.json({
      success: true,
      data: commits
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error getting file commits:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/github/branch - Create a new branch
export const createBranch: RequestHandler = async (req, res) => {
  try {
    const { branchName, baseBranch } = req.body;
    
    if (!branchName) {
      return res.status(400).json({
        success: false,
        error: 'Branch name is required'
      } as ApiResponse<null>);
    }

    await GitHubService.createBranch(branchName, baseBranch);
    
    res.json({
      success: true,
      message: `Branch ${branchName} created successfully`
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/github/pull-request - Create a pull request
export const createPullRequest: RequestHandler = async (req, res) => {
  try {
    const { title, body, headBranch, baseBranch } = req.body;
    
    if (!title || !headBranch) {
      return res.status(400).json({
        success: false,
        error: 'Title and head branch are required'
      } as ApiResponse<null>);
    }

    const pr = await GitHubService.createPullRequest(title, body || '', headBranch, baseBranch);
    
    res.json({
      success: true,
      data: pr
    } as ApiResponse<any>);
  } catch (error) {
    console.error('Error creating pull request:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};