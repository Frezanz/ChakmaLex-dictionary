import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { wordsRouter } from "./routes/words";
import { uploadsRouter } from "./routes/uploads";

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

  // Health
  app.get("/api/health", (_req, res) => res.json({ success: true }));

  // JSON body parser already configured above
  // Words CRUD
  app.use("/api/words", wordsRouter);

  // Uploads
  app.use("/api/upload", uploadsRouter);

  // Optional rebuild trigger
  app.post("/api/rebuild", async (_req, res) => {
    try {
      const hook = process.env.NETLIFY_BUILD_HOOK_URL;
      if (!hook) return res.json({ success: false, message: "No build hook configured" });
      await fetch(hook, { method: "POST" });
      res.json({ success: true, message: "Rebuild triggered" });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || "Failed to trigger rebuild" });
    }
  });

  return app;
}
