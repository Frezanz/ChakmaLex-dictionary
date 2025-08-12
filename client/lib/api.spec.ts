import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WordsApi } from './api';
import type { Word } from '@shared/types';

const sampleWord: Word = {
  id: 'w1',
  chakma_word_script: '𑄃𑄘𑄮',
  romanized_pronunciation: 'ado',
  english_translation: 'today',
  synonyms: [ { term: 'now', language: 'english' } ],
  antonyms: [ { term: 'yesterday', language: 'english' } ],
  example_sentence: 'example',
  etymology: 'ety',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const resetFetch = () => {
  // @ts-ignore
  global.fetch && (global.fetch as any).mockRestore?.();
};

describe('WordsApi', () => {
  beforeEach(() => {
    resetFetch();
  });

  it('lists words including synonyms/antonyms', async () => {
    const payload = { success: true, data: [sampleWord] };
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    // @ts-ignore
    global.fetch = mock;
    const words = await WordsApi.list();
    expect(words[0].synonyms?.[0].term).toBe('now');
    expect(words[0].antonyms?.[0].term).toBe('yesterday');
    expect(mock).toHaveBeenCalledWith('/api/words', expect.any(Object));
  });

  it('propagates server error', async () => {
    const mock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false, error: 'Bad' }) });
    // @ts-ignore
    global.fetch = mock;
    await expect(WordsApi.list()).rejects.toThrow('Bad');
  });

  it('creates word with synonyms/antonyms', async () => {
    const toCreate: Omit<Word, 'id' | 'created_at' | 'updated_at'> = {
      chakma_word_script: sampleWord.chakma_word_script,
      romanized_pronunciation: sampleWord.romanized_pronunciation,
      english_translation: sampleWord.english_translation,
      synonyms: sampleWord.synonyms,
      antonyms: sampleWord.antonyms,
      example_sentence: sampleWord.example_sentence,
      etymology: sampleWord.etymology,
    };
    const payload = { success: true, data: sampleWord };
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload });
    // @ts-ignore
    global.fetch = mock;
    const created = await WordsApi.create(toCreate);
    expect(created.id).toBe('w1');
    expect(mock).toHaveBeenCalledWith('/api/words', expect.objectContaining({ method: 'POST' }));
  });
});