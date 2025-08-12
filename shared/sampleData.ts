/**
 * Sample data for ChakmaLex application
 * This provides realistic test data for development and demonstration
 */

import { Word, Character, CharacterType } from './types';

// Sample dictionary words with comprehensive data
export const sampleWords: Word[] = [
  {
    id: '1',
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
    example_sentence: '𑄃𑄘𑄮 𑄟𑄮𑄨 𑄇𑄧𑄌 𑄅𑄋𑄬 - Today I am going home',
    etymology: 'Derived from Sanskrit "adya" meaning today',
    explanation_media: {
      type: 'url',
      value: 'https://example.com/calendar-today.jpg'
    },
    is_verified: true,
    created_at: new Date('2024-01-01').toISOString(),
    updated_at: new Date('2024-01-15').toISOString()
  },
  {
    id: '2',
    chakma_word_script: '𑄛𑄧𑄢',
    romanized_pronunciation: 'por',
    english_translation: 'house',
    synonyms: [
      { term: '𑄊𑄧𑄢', language: 'chakma' },
      { term: 'home', language: 'english' },
      { term: 'dwelling', language: 'english' }
    ],
    antonyms: [
      { term: 'homeless', language: 'english' }
    ],
    example_sentence: '𑄟𑄮𑄨 𑄛𑄧𑄢𑄴 𑄝𑄧𑄛 - My house is big',
    etymology: 'From Proto-Sino-Tibetan root meaning shelter',
    explanation_media: {
      type: 'url',
      value: 'https://example.com/traditional-house.jpg'
    },
    is_verified: true,
    created_at: new Date('2024-01-02').toISOString(),
    updated_at: new Date('2024-01-16').toISOString()
  },
  {
    id: '3',
    chakma_word_script: '𑄎𑄚𑄴',
    romanized_pronunciation: 'jan',
    english_translation: 'person',
    synonyms: [
      { term: '𑄟𑄚𑄱𑄪', language: 'chakma' },
      { term: 'individual', language: 'english' },
      { term: 'human', language: 'english' }
    ],
    antonyms: [
      { term: 'animal', language: 'english' }
    ],
    example_sentence: '𑄃𑄨 𑄎𑄚𑄴 𑄟𑄮𑄨 𑄞𑄣𑄧 - This person is my friend',
    etymology: 'Cognate with Bengali "jon" meaning person',
    is_verified: true,
    created_at: new Date('2024-01-03').toISOString(),
    updated_at: new Date('2024-01-17').toISOString()
  },
  {
    id: '4',
    chakma_word_script: '𑄢𑄚𑄴',
    romanized_pronunciation: 'ran',
    english_translation: 'cook',
    synonyms: [
      { term: '𑄛𑄧𑄣', language: 'chakma' },
      { term: 'prepare food', language: 'english' }
    ],
    example_sentence: '𑄟𑄧 𑄞𑄛 𑄢𑄚 - Mom cooks rice',
    etymology: 'Related to Sanskrit "randh" meaning to cook',
    is_verified: true,
    created_at: new Date('2024-01-04').toISOString(),
    updated_at: new Date('2024-01-18').toISOString()
  },
  {
    id: '5',
    chakma_word_script: '𑄝𑄨𑄚𑄴',
    romanized_pronunciation: 'bin',
    english_translation: 'seed',
    synonyms: [
      { term: '𑄝𑄨𑄌', language: 'chakma' },
      { term: 'grain', language: 'english' }
    ],
    example_sentence: '𑄝𑄨𑄚𑄴 𑄊𑄊 𑄛𑄧𑄙 - Plant the seed in soil',
    etymology: 'From Proto-Tibeto-Burman root for seed',
    is_verified: true,
    created_at: new Date('2024-01-05').toISOString(),
    updated_at: new Date('2024-01-19').toISOString()
  },
  {
    id: '6',
    chakma_word_script: '𑄞𑄛',
    romanized_pronunciation: 'bap',
    english_translation: 'rice',
    synonyms: [
      { term: '𑄃𑄚𑄴𑄚', language: 'chakma' },
      { term: 'grain', language: 'english' }
    ],
    example_sentence: '𑄞𑄛 𑄟𑄮𑄨 𑄛𑄴𑄢𑄨𑄠 - Rice is my favorite food',
    etymology: 'Borrowed from Bengali "bhat" meaning cooked rice',
    is_verified: true,
    created_at: new Date('2024-01-06').toISOString(),
    updated_at: new Date('2024-01-20').toISOString()
  },
  {
    id: '7',
    chakma_word_script: '𑄃𑄉𑄨',
    romanized_pronunciation: 'agi',
    english_translation: 'fire',
    synonyms: [
      { term: '𑄎𑄮𑄣', language: 'chakma' },
      { term: 'flame', language: 'english' }
    ],
    antonyms: [
      { term: '𑄛𑄚𑄨', language: 'chakma' },
      { term: 'water', language: 'english' }
    ],
    example_sentence: '𑄃𑄉𑄨 𑄛𑄧𑄦 - The fire is hot',
    etymology: 'From Sanskrit "agni" meaning fire',
    is_verified: true,
    created_at: new Date('2024-01-07').toISOString(),
    updated_at: new Date('2024-01-21').toISOString()
  },
  {
    id: '8',
    chakma_word_script: '����𑄚𑄨',
    romanized_pronunciation: 'pani',
    english_translation: 'water',
    synonyms: [
      { term: '𑄎𑄮𑄣', language: 'chakma' },
      { term: 'liquid', language: 'english' }
    ],
    antonyms: [
      { term: '𑄃𑄉𑄨', language: 'chakma' },
      { term: 'fire', language: 'english' }
    ],
    example_sentence: '𑄛𑄚𑄨 𑄇𑄧𑄣 - Water is cold',
    etymology: 'From Sanskrit "paniya" meaning drinkable water',
    is_verified: true,
    created_at: new Date('2024-01-08').toISOString(),
    updated_at: new Date('2024-01-22').toISOString()
  }
];

// Sample character data for learning section
export const sampleCharacters: Character[] = [
  // Alphabets
  {
    id: 'char-1',
    character_script: '𑄃',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'a',
    description: 'The first letter of the Chakma alphabet',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'char-2',
    character_script: '𑄇',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'ka',
    description: 'Consonant sound similar to English "k"',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'char-3',
    character_script: '𑄈',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'kha',
    description: 'Aspirated consonant sound',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'char-4',
    character_script: '𑄉',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'ga',
    description: 'Consonant sound similar to English "g"',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'char-5',
    character_script: '𑄊',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'gha',
    description: 'Aspirated voiced consonant',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'char-6',
    character_script: '𑄌',
    character_type: 'alphabet' as CharacterType,
    romanized_name: 'ca',
    description: 'Consonant sound similar to English "ch"',
    created_at: new Date('2024-01-01').toISOString()
  },
  
  // Vowels
  {
    id: 'vowel-1',
    character_script: '𑄣',
    character_type: 'vowel' as CharacterType,
    romanized_name: 'la',
    description: 'Vowel sound similar to English "la"',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'vowel-2',
    character_script: '𑄢',
    character_type: 'vowel' as CharacterType,
    romanized_name: 'ra',
    description: 'Vowel sound similar to English "ra"',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'vowel-3',
    character_script: '𑄦',
    character_type: 'vowel' as CharacterType,
    romanized_name: 'ha',
    description: 'Vowel sound similar to English "ha"',
    created_at: new Date('2024-01-01').toISOString()
  },

  // Diacritics
  {
    id: 'diacritic-1',
    character_script: '𑄧',
    character_type: 'diacritic' as CharacterType,
    romanized_name: 'o',
    description: 'Diacritic mark for "o" sound',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'diacritic-2',
    character_script: '𑄨',
    character_type: 'diacritic' as CharacterType,
    romanized_name: 'i',
    description: 'Diacritic mark for "i" sound',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'diacritic-3',
    character_script: '𑄩',
    character_type: 'diacritic' as CharacterType,
    romanized_name: 'u',
    description: 'Diacritic mark for "u" sound',
    created_at: new Date('2024-01-01').toISOString()
  },

  // Ordinal numbers
  {
    id: 'ordinal-1',
    character_script: '𑄷',
    character_type: 'ordinal' as CharacterType,
    romanized_name: '1',
    description: 'Chakma digit one',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'ordinal-2',
    character_script: '𑄸',
    character_type: 'ordinal' as CharacterType,
    romanized_name: '2',
    description: 'Chakma digit two',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'ordinal-3',
    character_script: '𑄹',
    character_type: 'ordinal' as CharacterType,
    romanized_name: '3',
    description: 'Chakma digit three',
    created_at: new Date('2024-01-01').toISOString()
  },

  // Mathematical symbols
  {
    id: 'symbol-1',
    character_script: '𑄀',
    character_type: 'symbol' as CharacterType,
    romanized_name: 'section',
    description: 'Section marker symbol',
    created_at: new Date('2024-01-01').toISOString()
  },
  {
    id: 'symbol-2',
    character_script: '𑄁',
    character_type: 'symbol' as CharacterType,
    romanized_name: 'double-section',
    description: 'Double section marker symbol',
    created_at: new Date('2024-01-01').toISOString()
  }
];

// Character type groupings for display
export const charactersByType = {
  alphabet: sampleCharacters.filter(char => char.character_type === 'alphabet'),
  vowel: sampleCharacters.filter(char => char.character_type === 'vowel'),
  conjunct: sampleCharacters.filter(char => char.character_type === 'conjunct'),
  diacritic: sampleCharacters.filter(char => char.character_type === 'diacritic'),
  ordinal: sampleCharacters.filter(char => char.character_type === 'ordinal'),
  symbol: sampleCharacters.filter(char => char.character_type === 'symbol'),
};

// Sample search history data
export const sampleSearchHistory = [
  {
    query: 'house',
    timestamp: new Date('2024-01-25T10:30:00').toISOString(),
    result_count: 2
  },
  {
    query: '𑄛𑄧𑄢',
    timestamp: new Date('2024-01-25T09:15:00').toISOString(),
    result_count: 1
  },
  {
    query: 'today',
    timestamp: new Date('2024-01-24T16:45:00').toISOString(),
    result_count: 1
  },
  {
    query: 'water',
    timestamp: new Date('2024-01-24T14:20:00').toISOString(),
    result_count: 1
  },
  {
    query: 'fire',
    timestamp: new Date('2024-01-23T11:10:00').toISOString(),
    result_count: 1
  }
];

// Sample favorite word IDs
export const sampleFavorites = ['1', '2', '7', '8'];

// Helper functions for data manipulation
export const findWordById = (id: string): Word | undefined => {
  return sampleWords.find(word => word.id === id);
};

export const findCharacterById = (id: string): Character | undefined => {
  return sampleCharacters.find(char => char.id === id);
};

export const searchWords = (query: string, dataset: Word[] = sampleWords): Word[] => {
  const lowerQuery = query.toLowerCase();
  return dataset.filter(word => 
    word.english_translation.toLowerCase().includes(lowerQuery) ||
    word.chakma_word_script.includes(query) ||
    word.romanized_pronunciation.toLowerCase().includes(lowerQuery) ||
    word.synonyms?.some(syn => syn.term.toLowerCase().includes(lowerQuery)) ||
    word.antonyms?.some(ant => ant.term.toLowerCase().includes(lowerQuery))
  );
};

export const getRandomWords = (count: number): Word[] => {
  const shuffled = [...sampleWords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, sampleWords.length));
};

export const getRandomCharacters = (count: number): Character[] => {
  const shuffled = [...sampleCharacters].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, sampleCharacters.length));
};

// Mock AI translation suggestions
export const mockAITranslations = [
  'happiness',
  'mountain',
  'river',
  'beautiful',
  'friendship',
  'journey',
  'wisdom',
  'courage',
  'peaceful',
  'traditional'
];
