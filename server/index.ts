import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { handleDemo } from "./routes/demo";
import {
  getWords,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  uploadAudio,
  uploadImage,
  healthCheck,
} from "./routes/words";
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "./routes/characters";
import {
  validateGitHubConfig,
  getRepositoryInfo,
  getGitHubFile,
  syncToGitHub,
  getFileCommits,
  createBranch,
  createPullRequest,
} from "./routes/github";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check
  app.get("/api/health", healthCheck);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Words API routes
  app.get("/api/words", getWords);
  app.get("/api/words/:id", getWord);
  app.post("/api/words", createWord);
  app.put("/api/words/:id", updateWord);
  app.delete("/api/words/:id", deleteWord);

  // Characters API routes
  app.get("/api/characters", getCharacters);
  app.get("/api/characters/:id", getCharacter);
  app.post("/api/characters", createCharacter);
  app.put("/api/characters/:id", updateCharacter);
  app.delete("/api/characters/:id", deleteCharacter);

  // File upload routes
  app.post("/api/upload/audio", uploadAudio);
  app.post("/api/upload/image", uploadImage);

  // GitHub integration routes
  app.get("/api/github/validate", validateGitHubConfig);
  app.get("/api/github/repo-info", getRepositoryInfo);
  app.get("/api/github/file/:path(*)", getGitHubFile);
  app.post("/api/github/sync", syncToGitHub);
  app.get("/api/github/commits/:path(*)", getFileCommits);
  app.post("/api/github/branch", createBranch);
  app.post("/api/github/pull-request", createPullRequest);

  return app;
}
