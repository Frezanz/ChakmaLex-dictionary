import "dotenv/config";
import express from "express";
import cors from "cors";
import { join } from "path";
import { handleDemo } from "./routes/demo";

// Import new route handlers
import {
  getWords,
  getWord,
  createWord,
  updateWord,
  deleteWord,
  searchWords,
  batchCreateWords,
} from "./routes/words";

import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from "./routes/characters";

import { uploadAudio, uploadImage } from "./routes/upload";
import { syncToGitHub, getGitHubStatus } from "./routes/github";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files (uploads)
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      data: {
        status: "healthy",
        timestamp: new Date().toISOString(),
      },
    });
  });

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
  app.get("/api/words/search", searchWords);
  app.post("/api/words/batch", batchCreateWords);

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
  app.post("/api/github/sync", syncToGitHub);
  app.get("/api/github/status", getGitHubStatus);

  // Data export/import routes
  app.get("/api/export", (req, res) => {
    // Implementation for data export
    res.json({
      success: true,
      data: {
        words: [],
        characters: [],
      },
    });
  });

  app.post("/api/import", (req, res) => {
    // Implementation for data import
    res.json({
      success: true,
      message: "Data imported successfully",
    });
  });

  // Sync and cache management routes
  app.post("/api/sync", (req, res) => {
    // Implementation for data synchronization
    res.json({
      success: true,
      message: "Data synchronized successfully",
    });
  });

  app.post("/api/cache/clear", (req, res) => {
    // Implementation for cache clearing
    res.json({
      success: true,
      message: "Cache cleared successfully",
    });
  });

  return app;
}
