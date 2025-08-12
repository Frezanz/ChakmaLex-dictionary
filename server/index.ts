import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import wordsRouter from "./routes/words";
import charactersRouter from "./routes/characters";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors({ maxAge: 0 }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Prevent caching for API responses globally
  app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
    next();
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Dictionary API routes
  app.use("/api/words", wordsRouter);
  app.use("/api/characters", charactersRouter);

  return app;
}
