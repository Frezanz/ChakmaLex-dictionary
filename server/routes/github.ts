import { RequestHandler } from "express";
import { ApiResponse } from "@shared/types";

// GitHub API integration for syncing dictionary data
export const syncToGitHub: RequestHandler = async (req, res) => {
  try {
    const { operation, data, repo, token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: "GitHub token is required",
      });
    }

    if (!repo) {
      return res.status(400).json({
        success: false,
        error: "GitHub repository is required",
      });
    }

    // Parse repository owner and name
    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) {
      return res.status(400).json({
        success: false,
        error: "Invalid repository format. Use 'owner/repo'",
      });
    }

    // Get current file content from GitHub
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/${operation === 'create' || operation === 'update' ? 'words.json' : 'words.json'}`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "ChakmaLex-App",
        },
      }
    );

    let currentContent = [];
    let sha = "";

    if (getFileResponse.ok) {
      const fileData = await getFileResponse.json();
      currentContent = JSON.parse(Buffer.from(fileData.content, "base64").toString());
      sha = fileData.sha;
    }

    // Update content based on operation
    let updatedContent = currentContent;
    const commitMessage = `[ChakmaLex] ${operation} ${data.chakma_word_script || data.character_script || 'item'}`;

    switch (operation) {
      case "create":
        updatedContent.push(data);
        break;
      case "update":
        const updateIndex = updatedContent.findIndex((item: any) => item.id === data.id);
        if (updateIndex !== -1) {
          updatedContent[updateIndex] = { ...updatedContent[updateIndex], ...data };
        }
        break;
      case "delete":
        updatedContent = updatedContent.filter((item: any) => item.id !== data.id);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: "Invalid operation",
        });
    }

    // Create or update file on GitHub
    const updateResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/contents/data/words.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "ChakmaLex-App",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: Buffer.from(JSON.stringify(updatedContent, null, 2)).toString("base64"),
          sha: sha || undefined,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      console.error("GitHub API error:", errorData);
      return res.status(updateResponse.status).json({
        success: false,
        error: `GitHub API error: ${errorData.message || updateResponse.statusText}`,
      });
    }

    const response: ApiResponse<void> = {
      success: true,
      message: `Successfully ${operation}d item to GitHub`,
    };

    res.json(response);
  } catch (error) {
    console.error("GitHub sync error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to sync to GitHub",
    });
  }
};

// Get GitHub sync status
export const getGitHubStatus: RequestHandler = async (req, res) => {
  try {
    const { token, repo } = req.query;

    if (!token || !repo) {
      return res.status(400).json({
        success: false,
        error: "GitHub token and repository are required",
      });
    }

    const [owner, repoName] = (repo as string).split("/");
    if (!owner || !repoName) {
      return res.status(400).json({
        success: false,
        error: "Invalid repository format",
      });
    }

    // Get repository information
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "ChakmaLex-App",
        },
      }
    );

    if (!repoResponse.ok) {
      return res.status(repoResponse.status).json({
        success: false,
        error: "Failed to fetch repository information",
      });
    }

    const repoData = await repoResponse.json();

    // Get last commit information
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/commits?per_page=1`,
      {
        headers: {
          Authorization: `token ${token}`,
          "User-Agent": "ChakmaLex-App",
        },
      }
    );

    let lastSync = "";
    if (commitsResponse.ok) {
      const commits = await commitsResponse.json();
      if (commits.length > 0) {
        lastSync = commits[0].commit.author.date;
      }
    }

    const response: ApiResponse<{ lastSync: string; pendingChanges: number }> = {
      success: true,
      data: {
        lastSync,
        pendingChanges: 0, // This would need to be calculated based on your sync logic
      },
    };

    res.json(response);
  } catch (error) {
    console.error("GitHub status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get GitHub status",
    });
  }
};