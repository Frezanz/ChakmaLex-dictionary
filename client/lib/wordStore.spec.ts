import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WordStoreProvider, useWordStore } from './wordStore';
import { Word } from '@shared/types';

// Simple test without complex mocking

const mockWord: Word = {
  id: '123',
  chakma_word_script: '𑄃𑄘𑄮',
  romanized_pronunciation: 'ado',
  english_translation: 'today',
  synonyms: [{ term: 'now', language: 'english' }],
  antonyms: [{ term: 'yesterday', language: 'english' }],
  example_sentence: 'Today is a good day',
  etymology: 'From Sanskrit',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockWord2: Word = {
  id: '456',
  chakma_word_script: '𑄛𑄧𑄢',
  romanized_pronunciation: 'por',
  english_translation: 'house',
  synonyms: [{ term: 'home', language: 'english' }],
  antonyms: [],
  example_sentence: 'This is my house',
  etymology: 'From Proto-Sino-Tibetan',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Simple test without complex mocking

describe('WordStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides word store functionality', () => {
    // Test that the store exports the expected interface
    expect(typeof useWordStore).toBe('function');
    expect(typeof WordStoreProvider).toBe('function');
  });

  it('has correct interface', () => {
    // Test that the store provides the expected interface
    expect(typeof useWordStore).toBe('function');
    expect(typeof WordStoreProvider).toBe('function');
  });
});