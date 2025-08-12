import { promises as fs } from 'fs';
import path from 'path';
import { Word, Character } from '../../shared/types';
import { sampleWords, sampleCharacters } from '../../shared/sampleData';

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');

type DbSchema = {
  words: Word[];
  characters: Character[];
  updated_at: string;
};

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_PATH);
  } catch {
    const initial: DbSchema = {
      words: sampleWords,
      characters: sampleCharacters,
      updated_at: new Date().toISOString(),
    };
    await fs.writeFile(DB_PATH, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

async function readDb(): Promise<DbSchema> {
  await ensureDataFile();
  const raw = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw) as DbSchema;
}

async function writeDb(update: Partial<DbSchema>): Promise<DbSchema> {
  const current = await readDb();
  const next: DbSchema = {
    ...current,
    ...update,
    updated_at: new Date().toISOString(),
  };
  // Atomic write
  const tmpPath = DB_PATH + '.tmp';
  await fs.writeFile(tmpPath, JSON.stringify(next, null, 2), 'utf-8');
  await fs.rename(tmpPath, DB_PATH);
  return next;
}

export async function getAllWords(): Promise<Word[]> {
  const db = await readDb();
  return db.words;
}

export async function getWordById(id: string): Promise<Word | undefined> {
  const db = await readDb();
  return db.words.find((w) => w.id === id);
}

export async function setAllWords(words: Word[]): Promise<Word[]> {
  const db = await writeDb({ words });
  return db.words;
}

export async function getAllCharacters(): Promise<Character[]> {
  const db = await readDb();
  return db.characters;
}

export async function getCharacterById(id: string): Promise<Character | undefined> {
  const db = await readDb();
  return db.characters.find((c) => c.id === id);
}

export async function setAllCharacters(characters: Character[]): Promise<Character[]> {
  const db = await writeDb({ characters });
  return db.characters;
}