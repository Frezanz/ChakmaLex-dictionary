/**
 * API Client Tests
 * Tests for dictionary management with synonyms and antonyms support
 */

import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { apiClient } from '@/lib/api';
import { CreateWordRequest, CreateCharacterRequest } from '@shared/api';

// Mock fetch globally
global.fetch = vi.fn();
const mockFetch = fetch as Mock;

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Words API', () => {
    it('should create word with synonyms and antonyms', async () => {
      const wordData: CreateWordRequest = {
        chakma_word_script: '𑄃𑄘𑄮',
        romanized_pronunciation: 'ado',
        english_translation: 'today',
        synonyms: [
          { term: '𑄃𑄏𑄮', language: 'chakma' },
          { term: 'now', language: 'english' }
        ],
        antonyms: [
          { term: '𑄇𑄣𑄌𑄢', language: 'chakma' },
          { term: 'yesterday', language: 'english' }
        ],
        example_sentence: '𑄃𑄘𑄮 𑄟𑄮𑄨 𑄇𑄧𑄌 𑄅𑄋𑄬',
        etymology: 'Derived from Sanskrit "adya" meaning today'
      };

      const mockResponse = {
        success: true,
        data: {
          word: {
            id: '123',
            ...wordData,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.createWord(wordData);

      expect(mockFetch).toHaveBeenCalledWith('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wordData)
      });

      expect(result.word.synonyms).toHaveLength(2);
      expect(result.word.antonyms).toHaveLength(2);
      expect(result.word.synonyms?.[0].term).toBe('𑄃𑄏𑄮');
      expect(result.word.antonyms?.[0].term).toBe('𑄇𑄣𑄌𑄢');
    });

    it('should update word with new synonyms and antonyms', async () => {
      const updateData = {
        id: '123',
        synonyms: [
          { term: 'present', language: 'english' as const }
        ],
        antonyms: [
          { term: 'tomorrow', language: 'english' as const }
        ]
      };

      const mockResponse = {
        success: true,
        data: {
          word: {
            id: '123',
            chakma_word_script: '𑄃𑄘𑄮',
            romanized_pronunciation: 'ado',
            english_translation: 'today',
            ...updateData,
            updated_at: '2024-01-01T01:00:00Z'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.updateWord('123', updateData);

      expect(mockFetch).toHaveBeenCalledWith('/api/words/123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      expect(result.word.synonyms).toHaveLength(1);
      expect(result.word.synonyms?.[0].term).toBe('present');
    });

    it('should search words including synonyms and antonyms', async () => {
      const searchRequest = {
        query: 'today',
        limit: 10
      };

      const mockResponse = {
        success: true,
        data: {
          words: [
            {
              id: '123',
              chakma_word_script: '𑄃𑄘𑄮',
              romanized_pronunciation: 'ado',
              english_translation: 'today',
              synonyms: [{ term: 'now', language: 'english' }],
              antonyms: [{ term: 'yesterday', language: 'english' }]
            }
          ],
          total: 1,
          query: 'today'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.searchWords(searchRequest);

      expect(mockFetch).toHaveBeenCalledWith('/api/words/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      expect(result.words).toHaveLength(1);
      expect(result.words[0].synonyms).toBeDefined();
      expect(result.words[0].antonyms).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          success: false,
          error: 'Missing required fields'
        })
      });

      await expect(apiClient.createWord({
        chakma_word_script: '',
        romanized_pronunciation: '',
        english_translation: '',
        example_sentence: '',
        etymology: ''
      })).rejects.toThrow('HTTP 400: Bad Request');
    });
  });

  describe('Characters API', () => {
    it('should create character successfully', async () => {
      const characterData: CreateCharacterRequest = {
        character_script: '𑄃',
        character_type: 'alphabet',
        romanized_name: 'a',
        description: 'The first letter of the Chakma alphabet'
      };

      const mockResponse = {
        success: true,
        data: {
          character: {
            id: '456',
            ...characterData,
            created_at: '2024-01-01T00:00:00Z'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.createCharacter(characterData);

      expect(mockFetch).toHaveBeenCalledWith('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(characterData)
      });

      expect(result.character.character_script).toBe('𑄃');
      expect(result.character.character_type).toBe('alphabet');
    });

    it('should delete character successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          character: {
            id: '456',
            character_script: '𑄃',
            character_type: 'alphabet',
            romanized_name: 'a'
          }
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.deleteCharacter('456');

      expect(mockFetch).toHaveBeenCalledWith('/api/characters/456', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      expect(result.character.id).toBe('456');
    });
  });

  describe('Sync Status', () => {
    it('should track pending changes correctly', async () => {
      const initialStatus = apiClient.getCurrentSyncStatus();
      expect(initialStatus.pendingChanges).toBe(0);

      // Mock successful API call
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { word: { id: '123' } }
        })
      });

      await apiClient.createWord({
        chakma_word_script: 'test',
        romanized_pronunciation: 'test',
        english_translation: 'test',
        example_sentence: 'test',
        etymology: 'test'
      });

      // Pending changes should reset after successful operation
      const finalStatus = apiClient.getCurrentSyncStatus();
      expect(finalStatus.pendingChanges).toBe(0);
    });
  });
});