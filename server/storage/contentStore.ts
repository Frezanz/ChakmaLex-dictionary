import { sampleWords, sampleCharacters } from "@shared/sampleData";
import { Word, Character } from "@shared/types";
import fs from "fs";
import path from "path";

// Runtime detection for Netlify environment
const isNetlify = !!process.env.NETLIFY || !!process.env.NETLIFY_DEV;

// Local dev fallback file path
const DATA_FILE_PATH = path.resolve(process.cwd(), ".builder/content.json");

// In-memory cache for dev
let memoryCache: { words: Word[]; characters: Character[]; version: number } | null = null;

// Netlify Blobs dynamic import wrapper to keep bundling light
async function getNetlifyBlobs() {
  // Lazy import to avoid bundling when not on Netlify
  const mod = await import("@netlify/blobs");
  return mod;
}

export interface ContentData {
  words: Word[];
  characters: Character[];
  version: number; // monotonic version for sync
  updated_at: string;
}

function ensureLocalFile(): void {
  const dir = path.dirname(DATA_FILE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE_PATH)) {
    const initial: ContentData = {
      words: sampleWords,
      characters: sampleCharacters,
      version: 1,
      updated_at: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
  }
}

async function readLocal(): Promise<ContentData> {
  ensureLocalFile();
  const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
  return JSON.parse(raw) as ContentData;
}

async function writeLocal(data: ContentData): Promise<void> {
  ensureLocalFile();
  fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function loadContent(): Promise<ContentData> {
  if (isNetlify) {
    const { blobs } = await getNetlifyBlobs();
    const store = blobs();
    const raw = await store.get("content.json", { type: "json" as const });
    if (!raw) {
      const initial: ContentData = {
        words: sampleWords,
        characters: sampleCharacters,
        version: 1,
        updated_at: new Date().toISOString(),
      };
      await store.setJSON("content.json", initial);
      return initial;
    }
    return raw as ContentData;
  }

  // Dev - prefer memory cache, fallback to file
  if (memoryCache) {
    return {
      words: memoryCache.words,
      characters: memoryCache.characters,
      version: memoryCache.version,
      updated_at: new Date().toISOString(),
    };
  }

  const local = await readLocal();
  memoryCache = { words: local.words, characters: local.characters, version: local.version };
  return local;
}

export async function saveContent(update: Partial<ContentData> & { bumpVersion?: boolean }): Promise<ContentData> {
  const existing = await loadContent();
  const next: ContentData = {
    words: update.words ?? existing.words,
    characters: update.characters ?? existing.characters,
    version: (update.bumpVersion ? existing.version + 1 : existing.version) || existing.version + 1,
    updated_at: new Date().toISOString(),
  };

  if (isNetlify) {
    const { blobs } = await getNetlifyBlobs();
    await blobs().setJSON("content.json", next);
  } else {
    memoryCache = { words: next.words, characters: next.characters, version: next.version };
    await writeLocal(next);
  }

  return next;
}

export async function upsertWord(word: Word): Promise<ContentData> {
  const content = await loadContent();
  const index = content.words.findIndex((w) => w.id === word.id);
  let words: Word[];
  if (index >= 0) {
    words = [...content.words];
    words[index] = { ...word, updated_at: new Date().toISOString() };
  } else {
    words = [
      ...content.words,
      { ...word, id: word.id || Date.now().toString(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
  }
  return saveContent({ words, bumpVersion: true });
}

export async function deleteWord(id: string): Promise<ContentData> {
  const content = await loadContent();
  const words = content.words.filter((w) => w.id !== id);
  return saveContent({ words, bumpVersion: true });
}

export async function upsertCharacter(character: Character): Promise<ContentData> {
  const content = await loadContent();
  const index = content.characters.findIndex((c) => c.id === character.id);
  let characters: Character[];
  if (index >= 0) {
    characters = [...content.characters];
    characters[index] = { ...character, created_at: characters[index].created_at, updated_at: new Date().toISOString() };
  } else {
    characters = [
      ...content.characters,
      { ...character, id: character.id || Date.now().toString(), created_at: new Date().toISOString() },
    ];
  }
  return saveContent({ characters, bumpVersion: true });
}

export async function deleteCharacter(id: string): Promise<ContentData> {
  const content = await loadContent();
  const characters = content.characters.filter((c) => c.id !== id);
  return saveContent({ characters, bumpVersion: true });
}