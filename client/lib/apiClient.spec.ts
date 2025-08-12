import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './apiClient';
import { Word } from '@shared/types';

const mockWord = {
  id: '123',
  chakma_word_script: '𑄃𑄘𑄮',
  romanized_pronunciation: 'ado',
  english_translation: 'today',
  synonyms: [ { term: 'now', language: 'english' as const } ],
  antonyms: [ { term: 'yesterday', language: 'english' as const } ],
  example_sentence: '',
  etymology: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
} satisfies Word;

const jsonResponse = (data: any, ok = true, status = 200) => {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as unknown as Response;
};

describe('apiClient words', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a word with synonyms and antonyms', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(
      jsonResponse({ success: true, data: mockWord })
    );

    const created = await apiClient.createWord({
      chakma_word_script: mockWord.chakma_word_script,
      romanized_pronunciation: mockWord.romanized_pronunciation,
      english_translation: mockWord.english_translation,
      synonyms: mockWord.synonyms,
      antonyms: mockWord.antonyms,
      example_sentence: '',
      etymology: ''
    } as any);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/words');
    expect((options as RequestInit).method).toBe('POST');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.synonyms[0].term).toBe('now');
    expect(body.antonyms[0].term).toBe('yesterday');

    expect(created.id).toBe('123');
  });

  it('updates a word with new synonyms', async () => {
    const updatedWord = { ...mockWord, synonyms: [ { term: 'present', language: 'english' as const } ] } as Word;

    const fetchSpy = vi.spyOn(global, 'fetch' as any).mockResolvedValueOnce(
      jsonResponse({ success: true, data: updatedWord })
    );

    const result = await apiClient.updateWord('123', { synonyms: updatedWord.synonyms });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/words/123');
    expect((options as RequestInit).method).toBe('PUT');
    const body = JSON.parse((options as RequestInit).body as string);
    expect(body.synonyms[0].term).toBe('present');

    expect(result.synonyms?.[0].term).toBe('present');
  });
});