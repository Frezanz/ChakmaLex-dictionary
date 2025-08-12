import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import type { Word } from "../../shared/types";
import { sampleWords } from "../../shared/sampleData";

const router = Router();

const DATA_DIR = path.join(process.cwd(), "server", "data");
const WORDS_FILE = path.join(DATA_DIR, "words.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadWords(): Word[] {
  ensureDataDir();
  if (!fs.existsSync(WORDS_FILE)) {
    fs.writeFileSync(WORDS_FILE, JSON.stringify(sampleWords, null, 2));
    return sampleWords;
  }
  try {
    const data = fs.readFileSync(WORDS_FILE, "utf-8");
    return JSON.parse(data) as Word[];
  } catch (error) {
    console.error("Failed to read words file:", error);
    return [];
  }
}

function saveWords(words: Word[]): void {
  ensureDataDir();
  fs.writeFileSync(WORDS_FILE, JSON.stringify(words, null, 2));
}

function setNoCache(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

// GET /api/words
router.get("/", (_req, res) => {
  setNoCache(res);
  const words = loadWords();
  res.json({ success: true, data: words });
});

// GET /api/words/:id
router.get("/:id", (req, res) => {
  setNoCache(res);
  const words = loadWords();
  const found = words.find((w) => w.id === req.params.id);
  if (!found) return res.status(404).json({ success: false, error: "Word not found" });
  res.json({ success: true, data: found });
});

// POST /api/words
router.post("/", (req, res) => {
  setNoCache(res);
  const body = req.body as Partial<Word>;
  if (!body || !body.chakma_word_script || !body.english_translation || !body.romanized_pronunciation) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const now = new Date().toISOString();
  const newWord: Word = {
    id: Date.now().toString(),
    chakma_word_script: body.chakma_word_script!,
    romanized_pronunciation: body.romanized_pronunciation!,
    english_translation: body.english_translation!,
    synonyms: body.synonyms || [],
    antonyms: body.antonyms || [],
    example_sentence: body.example_sentence || "",
    etymology: body.etymology || "",
    explanation_media: body.explanation_media,
    audio_pronunciation_url: body.audio_pronunciation_url,
    is_verified: body.is_verified ?? false,
    created_at: now,
    updated_at: now,
  };

  const words = loadWords();
  words.push(newWord);
  saveWords(words);

  res.status(201).json({ success: true, data: newWord });
});

// PUT /api/words/:id
router.put("/:id", (req, res) => {
  setNoCache(res);
  const id = req.params.id;
  const body = req.body as Partial<Word>;

  const words = loadWords();
  const index = words.findIndex((w) => w.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: "Word not found" });

  const updated: Word = {
    ...words[index],
    ...body,
    synonyms: body.synonyms ?? words[index].synonyms ?? [],
    antonyms: body.antonyms ?? words[index].antonyms ?? [],
    updated_at: new Date().toISOString(),
  } as Word;

  words[index] = updated;
  saveWords(words);

  res.json({ success: true, data: updated });
});

// DELETE /api/words/:id
router.delete("/:id", (req, res) => {
  setNoCache(res);
  const id = req.params.id;
  const words = loadWords();
  const exists = words.some((w) => w.id === id);
  if (!exists) return res.status(404).json({ success: false, error: "Word not found" });
  const filtered = words.filter((w) => w.id !== id);
  saveWords(filtered);
  res.json({ success: true, message: "Deleted" });
});

export default router;