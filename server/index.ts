import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { 
  getAllWords,
  getWordById,
  createWord,
  updateWord,
  deleteWord,
  searchWordDatabase,
  getSyncStatus
} from "./routes/words";
import {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter
} from "./routes/characters";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Words API routes
  app.get("/api/words", getAllWords);
  app.get("/api/words/sync-status", getSyncStatus);
  app.get("/api/words/:id", getWordById);
  app.post("/api/words", createWord);
  app.post("/api/words/search", searchWordDatabase);
  app.put("/api/words/:id", updateWord);
  app.delete("/api/words/:id", deleteWord);

  // Characters API routes
  app.get("/api/characters", getAllCharacters);
  app.get("/api/characters/:id", getCharacterById);
  app.post("/api/characters", createCharacter);
  app.put("/api/characters/:id", updateCharacter);
  app.delete("/api/characters/:id", deleteCharacter);

  return app;
}
