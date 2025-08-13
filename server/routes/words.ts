import { Router } from 'express';
import { getRepoFile, putRepoFile, triggerNetlifyBuildIfConfigured } from './github';

type RelatedTerm = { term: string; language: 'chakma' | 'english' };
export type Word = {
  id: string;
  chakma_word_script: string;
  audio_pronunciation_url?: string;
  romanized_pronunciation: string;
  english_translation: string;
  synonyms?: RelatedTerm[];
  antonyms?: RelatedTerm[];
  example_sentence: string;
  etymology: string;
  explanation_media?: { type: 'url' | 'image'; value: string };
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
};

const WORDS_PATH = process.env.WORDS_JSON_PATH || 'data/words.json';

export const wordsRouter = Router();

async function loadWords(): Promise<{ words: Word[]; sha: string | null }> {
  try {
    const { content, sha } = await getRepoFile(WORDS_PATH);
    if (!content) return { words: [], sha: null };
    try {
      const data = JSON.parse(content);
      if (Array.isArray(data)) return { words: data as Word[], sha };
      if (Array.isArray((data as any).words)) return { words: (data as any).words as Word[], sha };
      return { words: [], sha };
    } catch (e) {
      console.error('Failed parsing words.json from repo', e);
      return { words: [], sha };
    }
  } catch (e) {
    // Fallback to sample data when GitHub integration is not available
    console.warn('GitHub integration not configured, using sample data:', e);
    const { sampleWords } = await import('../../shared/sampleData');
    return { words: sampleWords as any, sha: null };
  }
}

async function saveWords(words: Word[], prevSha: string | null): Promise<string> {
  try {
    const payload = JSON.stringify(words, null, 2);
    const result = await putRepoFile(WORDS_PATH, payload, 'chore(words): sync via developer console', prevSha || undefined);
    await triggerNetlifyBuildIfConfigured();
    return result.sha;
  } catch (e) {
    console.warn('GitHub integration not configured, cannot save words:', e);
    // Return a mock SHA when GitHub is not available
    return Date.now().toString();
  }
}

wordsRouter.get('/', async (_req, res) => {
  try {
    const { words } = await loadWords();
    res.json({ success: true, data: words });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to load words' });
  }
});

wordsRouter.post('/', async (req, res) => {
  try {
    const newWord = req.body as Partial<Word>;
    if (!newWord.chakma_word_script || !newWord.romanized_pronunciation || !newWord.english_translation) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    const { words, sha } = await loadWords();
    const duplicate = words.find((w) => w.chakma_word_script.trim() === newWord.chakma_word_script!.trim());
    if (duplicate) {
      return res.status(409).json({ success: false, error: 'Duplicate Chakma word' });
    }
    const now = new Date().toISOString();
    const word: Word = {
      id: newWord.id || String(Date.now()),
      chakma_word_script: newWord.chakma_word_script!,
      romanized_pronunciation: newWord.romanized_pronunciation!,
      english_translation: newWord.english_translation!,
      synonyms: newWord.synonyms || [],
      antonyms: newWord.antonyms || [],
      example_sentence: newWord.example_sentence || '',
      etymology: newWord.etymology || '',
      explanation_media: newWord.explanation_media,
      audio_pronunciation_url: newWord.audio_pronunciation_url,
      is_verified: Boolean(newWord.is_verified),
      created_at: now,
      updated_at: now,
    };
    const updated = [...words, word];
    await saveWords(updated, sha);
    res.status(201).json({ success: true, data: word });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to create word' });
  }
});

wordsRouter.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const patch = req.body as Partial<Word>;
    const { words, sha } = await loadWords();
    const index = words.findIndex((w) => w.id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Word not found' });
    const existing = words[index];
    const updated: Word = { ...existing, ...patch, updated_at: new Date().toISOString() };
    // Prevent changing to duplicate Chakma word
    if (patch.chakma_word_script) {
      const dup = words.find((w, i) => i !== index && w.chakma_word_script.trim() === patch.chakma_word_script!.trim());
      if (dup) return res.status(409).json({ success: false, error: 'Duplicate Chakma word' });
    }
    const final = words.slice();
    final[index] = updated;
    await saveWords(final, sha);
    res.json({ success: true, data: updated });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to update word' });
  }
});

wordsRouter.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { words, sha } = await loadWords();
    const exists = words.some((w) => w.id === id);
    if (!exists) return res.status(404).json({ success: false, error: 'Word not found' });
    const final = words.filter((w) => w.id !== id);
    await saveWords(final, sha);
    res.json({ success: true, message: 'Deleted' });
  } catch (e: any) {
    res.status(500).json({ success: false, error: e?.message || 'Failed to delete word' });
  }
});
