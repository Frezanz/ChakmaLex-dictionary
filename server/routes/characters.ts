import { Request, Response } from 'express';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Character, CharacterType } from '../../shared/types';
import { getAllCharacters, setAllCharacters, getCharacterById } from '../data/store';

const characterSchema = z.object({
  id: z.string().optional(),
  character_script: z.string().min(1),
  character_type: z.custom<CharacterType>((val) => typeof val === 'string').refine((v) => !!v, 'required'),
  romanized_name: z.string().min(1),
  description: z.string().optional(),
  audio_pronunciation_url: z.string().url().optional(),
});

export async function listCharacters(_req: Request, res: Response) {
  try {
    const characters = await getAllCharacters();
    res.json({ success: true, data: characters });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to load characters' });
  }
}

export async function createCharacter(req: Request, res: Response) {
  try {
    const parsed = characterSchema.parse(req.body);
    const now = new Date().toISOString();
    const character: Character = {
      ...parsed,
      id: randomUUID(),
      created_at: now,
    } as Character;

    const all = await getAllCharacters();
    const next = [...all, character];
    await setAllCharacters(next);
    res.status(201).json({ success: true, data: character });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: error.issues });
    }
    res.status(500).json({ success: false, error: error?.message || 'Failed to create character' });
  }
}

export async function updateCharacter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const parsed = characterSchema.partial().parse(req.body);

    const existing = await getCharacterById(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }
    const updated: Character = {
      ...existing,
      ...parsed,
    };

    const all = await getAllCharacters();
    const next = all.map((c) => (c.id === id ? updated : c));
    await setAllCharacters(next);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error?.issues) {
      return res.status(400).json({ success: false, error: 'Invalid payload', details: error.issues });
    }
    res.status(500).json({ success: false, error: error?.message || 'Failed to update character' });
  }
}

export async function deleteCharacter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const all = await getAllCharacters();
    const exists = all.some((c) => c.id === id);
    if (!exists) {
      return res.status(404).json({ success: false, error: 'Character not found' });
    }
    const next = all.filter((c) => c.id !== id);
    await setAllCharacters(next);
    res.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete character' });
  }
}