import { Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Word } from '../../shared/types';
import { getAllWords, setAllWords, getWordById } from '../data/store';

const relatedTermSchema = z.object({
  term: z.string().min(1),
  language: z.enum(['chakma', 'english']),
});

const wordSchema = z.object({
  id: z.string().optional(),
  chakma_word_script: z.string().min(1),
  romanized_pronunciation: z.string().min(1),
  english_translation: z.string().min(1),
  synonyms: z.array(relatedTermSchema).optional(),
  antonyms: z.array(relatedTermSchema).optional(),
  example_sentence: z.string().min(1),
  etymology: z.string().min(1),
  audio_pronunciation_url: z.string().url().optional(),
  explanation_media: z
    .object({ type: z.enum(['url', 'image']), value: z.string().min(1) })
    .optional(),
  is_verified: z.boolean().optional(),
});

export async function listWords(_req: Request, res: Response) {
  try {
    const words = await getAllWords();
    res.json({ success: true, data: words });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to load words' });
  }
}

export async function createWord(req: Request, res: Response) {
  try {
    const parsed = wordSchema.parse(req.body);
    const now = new Date().toISOString();
    const word: Word = {
      ...parsed,
      id: randomUUID(),
      created_at: now,
      updated_at: now,
    } as Word;

    const all = await getAllWords();
    const next = [...all, word];
    await setAllWords(next);
    res.status(201).json({ success: true, data: word });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: error.issues });
    }
    res.status(500).json({ success: false, error: error?.message || 'Failed to create word' });
  }
}

export async function updateWord(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parsed = wordSchema.partial().parse(req.body);

    const existing = await getWordById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Word not found' });
    }
    const updated: Word = {
      ...existing,
      ...parsed,
      updated_at: new Date().toISOString(),
    };

    const all = await getAllWords();
    const next = all.map((w) => (w.id === id ? updated : w));
    await setAllWords(next);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: error.issues });
    }
    res.status(500).json({ success: false, error: error?.message || 'Failed to update word' });
  }
}

export async function deleteWord(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const all = await getAllWords();
    const exists = all.some((w) => w.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Word not found' });
    }
    const next = all.filter((w) => w.id !== id);
    await setAllWords(next);
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete word' });
  }
}