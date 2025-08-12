import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Word } from '@shared/types';
import { apiClient } from './apiClient';

interface WordStoreContextType {
  words: Word[];
  isLoading: boolean;
  error: string | null;
  refreshWords: () => Promise<void>;
  addWord: (word: Omit<Word, 'id' | 'created_at' | 'updated_at'>) => Promise<Word>;
  updateWord: (id: string, updates: Partial<Word>) => Promise<Word>;
  deleteWord: (id: string) => Promise<void>;
  getWordById: (id: string) => Word | undefined;
  searchWords: (query: string) => Word[];
}

const WordStoreContext = createContext<WordStoreContextType | undefined>(undefined);

export function WordStoreProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedWords = await apiClient.getWords();
      setWords(fetchedWords);
    } catch (err: any) {
      console.error('Failed to refresh words:', err);
      setError(err?.message || 'Failed to load words');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addWord = useCallback(async (wordData: Omit<Word, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null);
      const newWord = await apiClient.createWord(wordData);
      setWords(prev => [newWord, ...prev]);
      return newWord;
    } catch (err: any) {
      console.error('Failed to add word:', err);
      setError(err?.message || 'Failed to add word');
      throw err;
    }
  }, []);

  const updateWord = useCallback(async (id: string, updates: Partial<Word>) => {
    try {
      setError(null);
      const updatedWord = await apiClient.updateWord(id, updates);
      setWords(prev => prev.map(word => word.id === id ? updatedWord : word));
      return updatedWord;
    } catch (err: any) {
      console.error('Failed to update word:', err);
      setError(err?.message || 'Failed to update word');
      throw err;
    }
  }, []);

  const deleteWord = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiClient.deleteWord(id);
      setWords(prev => prev.filter(word => word.id !== id));
    } catch (err: any) {
      console.error('Failed to delete word:', err);
      setError(err?.message || 'Failed to delete word');
      throw err;
    }
  }, []);

  const getWordById = useCallback((id: string) => {
    return words.find(word => word.id === id);
  }, [words]);

  const searchWords = useCallback((query: string) => {
    if (!query.trim()) return words.slice(0, 3);
    
    const lowerQuery = query.toLowerCase();
    return words.filter((word) =>
      word.english_translation.toLowerCase().includes(lowerQuery) ||
      word.chakma_word_script.includes(query) ||
      word.romanized_pronunciation.toLowerCase().includes(lowerQuery) ||
      (word.synonyms || []).some((syn) => syn.term.toLowerCase().includes(lowerQuery)) ||
      (word.antonyms || []).some((ant) => ant.term.toLowerCase().includes(lowerQuery))
    );
  }, [words]);

  // Initial load
  useEffect(() => {
    refreshWords();
  }, [refreshWords]);

  const value: WordStoreContextType = {
    words,
    isLoading,
    error,
    refreshWords,
    addWord,
    updateWord,
    deleteWord,
    getWordById,
    searchWords,
  };

  return React.createElement(WordStoreContext.Provider, { value }, children);
}

export function useWordStore() {
  const context = useContext(WordStoreContext);
  if (context === undefined) {
    throw new Error('useWordStore must be used within a WordStoreProvider');
  }
  return context;
}