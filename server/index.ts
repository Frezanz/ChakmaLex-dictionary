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
  searchWords 
} from "./routes/words";
import { 
  getCharacters, 
  getCharacter, 
  createCharacter, 
  updateCharacter, 
  deleteCharacter 
} from "./routes/characters";
import { 
  uploadFile, 
  serveFile, 
  deleteFile, 
  upload 
} from "./routes/upload";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Health check
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "pong";
    res.json({ 
      message: ping,
      timestamp: new Date().toISOString(),
      status: "healthy"
    });
  });

  // Demo route
  app.get("/api/demo", handleDemo);

  // Word routes
  app.get("/api/words", getWords);
  app.get("/api/words/:id", getWord);
  app.post("/api/words", createWord);
  app.put("/api/words/:id", updateWord);
  app.delete("/api/words/:id", deleteWord);
  app.post("/api/words/search", searchWords);

  // Character routes
  app.get("/api/characters", getCharacters);
  app.get("/api/characters/:id", getCharacter);
  app.post("/api/characters", createCharacter);
  app.put("/api/characters/:id", updateCharacter);
  app.delete("/api/characters/:id", deleteCharacter);

  // Upload routes
  app.post("/api/upload", upload.single('file'), uploadFile);
  app.get("/api/uploads/:filename", serveFile);
  app.delete("/api/upload/:filename", deleteFile);

  // Error handling middleware
  app.use((error: any, req: any, res: any, next: any) => {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 5MB.'
      });
    }
    
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }

    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  });

  return app;
}
