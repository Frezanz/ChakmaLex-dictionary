/**
 * ChakmaLex Application Types
 * Comprehensive type definitions for dictionary, characters, and user preferences
 */

// Core dictionary word structure
export interface Word {
  id: string;
  chakma_word_script: string;
  audio_pronunciation_url?: string;
  romanized_pronunciation: string;
  english_translation: string;
  synonyms?: RelatedTerm[];
  antonyms?: RelatedTerm[];
  example_sentence: string;
  etymology: string;
  explanation_media?: ExplanationMedia;
  is_verified?: boolean; // For quiz generation filtering
  created_at?: string;
  updated_at?: string;
}

// Related terms (synonyms/antonyms) with language specification
export interface RelatedTerm {
  term: string;
  language: 'chakma' | 'english';
}

// Visual explanation media
export interface ExplanationMedia {
  type: 'url' | 'image';
  value: string; // URL or image asset ID
}

// Character data structure for learning section
export interface Character {
  id: string;
  character_script: string;
  character_type: CharacterType;
  audio_pronunciation_url?: string;
  romanized_name: string;
  description?: string;
  created_at?: string;
}

export type CharacterType = 
  | 'alphabet' 
  | 'vowel' 
  | 'conjunct' 
  | 'diacritic' 
  | 'ordinal' 
  | 'symbol';

// User preferences and settings
export interface UserPreferences {
  // Appearance settings
  theme: ThemeMode;
  custom_colors?: CustomColors;
  font_size: FontSize;
  
  // Audio settings
  sound_volume: number; // 0-100
  
  // User data
  favorites: string[]; // Array of word IDs
  search_history: SearchHistoryItem[];
  
  // Metadata
  last_updated?: string;
}

export type ThemeMode = 'light' | 'dark' | 'oled' | 'sepia' | 'warm' | 'vibrant';

export interface CustomColors {
  text_color?: string;
  ui_buttons_color?: string;
  screen_color?: string;
  background_color?: string;
}

export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';

export interface SearchHistoryItem {
  query: string;
  timestamp: string;
  result_count?: number;
}

// Quiz system types
export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  correct_answer: string;
  source_word_id?: string;
  source_character_id?: string;
  hints?: string[];
}

export type QuizType = 
  | 'english_to_chakma' 
  | 'chakma_to_english' 
  | 'character_recognition'
  | 'pronunciation';

export interface QuizSession {
  id: string;
  questions: QuizQuestion[];
  current_question_index: number;
  score: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
  time_remaining?: number;
  total_time?: number;
}

export interface QuizResult {
  question_id: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_taken?: number; // in seconds
}

// Search functionality types
export interface SearchOptions {
  query: string;
  search_fields?: SearchField[];
  max_results?: number;
  exact_match?: boolean;
}

export type SearchField = 
  | 'chakma_word_script'
  | 'romanized_pronunciation'
  | 'english_translation'
  | 'synonyms'
  | 'antonyms';

export interface SearchResult {
  word: Word;
  relevance_score?: number;
  matched_fields: SearchField[];
}

// Developer console types
export interface DeveloperConsoleAccess {
  tap_count: number;
  is_authenticated: boolean;
  last_access?: string;
}

export interface AITranslationSuggestion {
  id: string;
  english_word: string;
  suggested_context?: string;
  generated_at: string;
  status: 'pending' | 'used' | 'rejected';
}

export interface ContentManagementOperation {
  type: 'create' | 'update' | 'delete';
  target: 'word' | 'character';
  data?: Partial<Word | Character>;
  target_id?: string;
  performed_by?: string;
  timestamp: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total_count: number;
  page: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

// Application state types
export interface AppState {
  user_preferences: UserPreferences;
  current_quiz_session?: QuizSession;
  developer_console: DeveloperConsoleAccess;
  is_loading: boolean;
  error_message?: string;
}

// Component prop types
export interface WordDisplayProps {
  word: Word;
  show_actions?: boolean;
  compact_view?: boolean;
}

export interface CharacterDisplayProps {
  character: Character;
  show_audio?: boolean;
  on_audio_play?: (character: Character) => void;
}

export interface SearchBarProps {
  on_search: (query: string) => void;
  placeholder?: string;
  initial_value?: string;
  is_loading?: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  initial_theme?: ThemeMode;
}

// Utility types
export type PartialWord = Partial<Word> & Pick<Word, 'chakma_word_script' | 'english_translation'>;
export type WordFormData = Omit<Word, 'id' | 'created_at' | 'updated_at'>;
export type CharacterFormData = Omit<Character, 'id' | 'created_at'>;

// Constants
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'light',
  font_size: 'base',
  sound_volume: 70,
  favorites: [],
  search_history: [],
};

export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'ogg'] as const;
export const MAX_SEARCH_HISTORY_ITEMS = 50;
export const QUIZ_QUESTIONS_PER_SESSION = 10;
export const AI_SUGGESTIONS_PER_DAY = 10;

// Developer console configuration
export const DEVELOPER_CONSOLE_CONFIG = {
  required_taps: 10,
  tap_timeout: 5000, // 5 seconds
  valid_passwords: [
    'chakmalex2024',
    'developer',
    'admin123',
    'contentmanager'
  ],
} as const;

// Social media and contact information
export const CONTACT_INFO = {
  facebook: 'https://facebook.com/chakmalex',
  youtube: 'https://youtube.com/@chakmalex',
  telegram: 'https://t.me/chakmalex',
  email: {
    personal: 'personal@chakmalex.com',
    support: 'dupsobon@gmail.com',
  },
} as const;
