import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { listWords, createWord, updateWord, deleteWord } from "./routes/words";
import { listCharacters, createCharacter, updateCharacter, deleteCharacter } from "./routes/characters";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  // Demo
  app.get("/api/demo", handleDemo);

  // Words API
  app.get("/api/words", listWords);
  app.post("/api/words", createWord);
  app.put("/api/words/:id", updateWord);
  app.delete("/api/words/:id", deleteWord);

  // Characters API
  app.get("/api/characters", listCharacters);
  app.post("/api/characters", createCharacter);
  app.put("/api/characters/:id", updateCharacter);
  app.delete("/api/characters/:id", deleteCharacter);

  return app;
}
