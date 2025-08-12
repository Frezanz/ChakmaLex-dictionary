import { Router, Response } from "express";
import fs from "fs";
import path from "path";
import type { Character } from "../../shared/types";
import { sampleCharacters } from "../../shared/sampleData";

const router = Router();

const DATA_DIR = path.join(process.cwd(), "server", "data");
const CHAR_FILE = path.join(DATA_DIR, "characters.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadCharacters(): Character[] {
  ensureDataDir();
  if (!fs.existsSync(CHAR_FILE)) {
    fs.writeFileSync(CHAR_FILE, JSON.stringify(sampleCharacters, null, 2));
    return sampleCharacters;
  }
  try {
    const data = fs.readFileSync(CHAR_FILE, "utf-8");
    return JSON.parse(data) as Character[];
  } catch (error) {
    console.error("Failed to read characters file:", error);
    return [];
  }
}

function saveCharacters(chars: Character[]): void {
  ensureDataDir();
  fs.writeFileSync(CHAR_FILE, JSON.stringify(chars, null, 2));
}

function setNoCache(res: Response) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
}

router.get("/", (_req, res) => {
  setNoCache(res);
  const chars = loadCharacters();
  res.json({ success: true, data: chars });
});

router.get("/:id", (req, res) => {
  setNoCache(res);
  const chars = loadCharacters();
  const found = chars.find((c) => c.id === req.params.id);
  if (!found) return res.status(404).json({ success: false, error: "Character not found" });
  res.json({ success: true, data: found });
});

router.post("/", (req, res) => {
  setNoCache(res);
  const body = req.body as Partial<Character>;
  if (!body || !body.character_script || !body.romanized_name || !body.character_type) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  const now = new Date().toISOString();
  const newChar: Character = {
    id: Date.now().toString(),
    character_script: body.character_script!,
    romanized_name: body.romanized_name!,
    character_type: body.character_type!,
    description: body.description,
    audio_pronunciation_url: body.audio_pronunciation_url,
    created_at: now,
  };

  const chars = loadCharacters();
  chars.push(newChar);
  saveCharacters(chars);

  res.status(201).json({ success: true, data: newChar });
});

router.put("/:id", (req, res) => {
  setNoCache(res);
  const id = req.params.id;
  const body = req.body as Partial<Character>;

  const chars = loadCharacters();
  const index = chars.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ success: false, error: "Character not found" });

  const updated: Character = {
    ...chars[index],
    ...body,
  } as Character;

  chars[index] = updated;
  saveCharacters(chars);

  res.json({ success: true, data: updated });
});

router.delete("/:id", (req, res) => {
  setNoCache(res);
  const id = req.params.id;
  const chars = loadCharacters();
  const exists = chars.some((c) => c.id === id);
  if (!exists) return res.status(404).json({ success: false, error: "Character not found" });
  const filtered = chars.filter((c) => c.id !== id);
  saveCharacters(filtered);
  res.json({ success: true, message: "Deleted" });
});

export default router;