/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

import { Word, Character, RelatedTerm } from './types';

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Generic API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Word management API types
 */
export interface CreateWordRequest {
  chakma_word_script: string;
  romanized_pronunciation: string;
  english_translation: string;
  synonyms?: RelatedTerm[];
  antonyms?: RelatedTerm[];
  example_sentence: string;
  etymology: string;
  audio_pronunciation_url?: string;
  explanation_media?: {
    type: 'url' | 'image';
    value: string;
  };
}

export interface UpdateWordRequest extends Partial<CreateWordRequest> {
  id: string;
}

export interface DeleteWordRequest {
  id: string;
}

export interface GetWordsResponse {
  words: Word[];
  total: number;
}

export interface GetWordResponse {
  word: Word;
}

/**
 * Character management API types
 */
export interface CreateCharacterRequest {
  character_script: string;
  character_type: 'alphabet' | 'vowel' | 'conjunct' | 'diacritic' | 'ordinal' | 'symbol';
  romanized_name: string;
  description?: string;
  audio_pronunciation_url?: string;
}

export interface UpdateCharacterRequest extends Partial<CreateCharacterRequest> {
  id: string;
}

export interface DeleteCharacterRequest {
  id: string;
}

export interface GetCharactersResponse {
  characters: Character[];
  total: number;
}

export interface GetCharacterResponse {
  character: Character;
}

/**
 * Search API types
 */
export interface SearchWordsRequest {
  query: string;
  fields?: ('chakma_word_script' | 'romanized_pronunciation' | 'english_translation' | 'synonyms' | 'antonyms')[];
  limit?: number;
  offset?: number;
}

export interface SearchWordsResponse {
  words: Word[];
  total: number;
  query: string;
}

/**
 * Sync status and error handling
 */
export interface SyncStatus {
  isLoading: boolean;
  lastSync?: string;
  error?: string;
  pendingChanges: number;
}

export interface BatchOperation {
  type: 'create' | 'update' | 'delete';
  target: 'word' | 'character';
  data: any;
  id?: string;
}

export interface BatchUpdateRequest {
  operations: BatchOperation[];
}

export interface BatchUpdateResponse {
  results: {
    success: boolean;
    id?: string;
    error?: string;
  }[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}
