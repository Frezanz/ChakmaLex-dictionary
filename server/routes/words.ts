import { Router } from "express";
import { Word } from "@shared/types";
import { sampleWords } from "@shared/sampleData";
import { randomUUID } from "crypto";

const router = Router();

// In-memory store. Replace with a real DB (Mongo, Postgres, etc.) in production.
let words: Word[] = [...sampleWords];

// Disable caching for every request so clients always get the most recent data.
router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// GET   /api/words -> list all words
router.get("/", (_req, res) => {
  res.json({ success: true, data: words });
});

// POST  /api/words -> create a new word
router.post("/", (req, res) => {
  try {
    const newWord: Word = {
      ...req.body,
      id: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    words.push(newWord);
    res.status(201).json({ success: true, data: newWord });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error?.message ?? "Invalid payload" });
  }
});

// PUT   /api/words/:id -> update an existing word
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Word not found" });
  }

  const updated: Word = {
    ...words[index],
    ...req.body,
    id, // ensure id stays the same
    updated_at: new Date().toISOString(),
  };
  words[index] = updated;
  res.json({ success: true, data: updated });
});

// DELETE /api/words/:id -> delete a word
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Word not found" });
  }
  words.splice(index, 1);
  res.json({ success: true });
});

export default router;