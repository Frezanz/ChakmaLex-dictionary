import { RequestHandler } from 'express';
import { 
  ApiResponse, 
  CreateWordRequest, 
  UpdateWordRequest, 
  DeleteWordRequest,
  GetWordsResponse,
  GetWordResponse,
  SearchWordsRequest,
  SearchWordsResponse
} from '../../shared/api';
import { Word } from '../../shared/types';
import { sampleWords, searchWords } from '../../shared/sampleData';

// In-memory storage (replace with actual database in production)
let wordsDatabase: Word[] = [...sampleWords];

/**
 * GET /api/words - Get all words with optional pagination
 */
export const getAllWords: RequestHandler = (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const totalWords = wordsDatabase.length;
    const paginatedWords = wordsDatabase.slice(offset, offset + limit);
    
    const response: ApiResponse<GetWordsResponse> = {
      success: true,
      data: {
        words: paginatedWords,
        total: totalWords
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch words',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/words/:id - Get specific word by ID
 */
export const getWordById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const word = wordsDatabase.find(w => w.id === id);
    
    if (!word) {
      const response: ApiResponse = {
        success: false,
        error: 'Word not found',
        message: `No word found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse<GetWordResponse> = {
      success: true,
      data: { word }
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch word',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * POST /api/words - Create new word
 */
export const createWord: RequestHandler = (req, res) => {
  try {
    const wordData: CreateWordRequest = req.body;
    
    // Validate required fields
    if (!wordData.chakma_word_script || !wordData.english_translation || !wordData.romanized_pronunciation) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'chakma_word_script, english_translation, and romanized_pronunciation are required'
      };
      res.status(400).json(response);
      return;
    }
    
    // Create new word with generated ID
    const newWord: Word = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...wordData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_verified: false
    };
    
    // Add to database
    wordsDatabase.push(newWord);
    
    const response: ApiResponse<GetWordResponse> = {
      success: true,
      data: { word: newWord },
      message: 'Word created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create word',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * PUT /api/words/:id - Update existing word
 */
export const updateWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<UpdateWordRequest> = req.body;
    
    const wordIndex = wordsDatabase.findIndex(w => w.id === id);
    
    if (wordIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Word not found',
        message: `No word found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    // Update word with new data
    const updatedWord: Word = {
      ...wordsDatabase[wordIndex],
      ...updateData,
      id, // Ensure ID remains unchanged
      updated_at: new Date().toISOString()
    };
    
    wordsDatabase[wordIndex] = updatedWord;
    
    const response: ApiResponse<GetWordResponse> = {
      success: true,
      data: { word: updatedWord },
      message: 'Word updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update word',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/words/:id - Delete word
 */
export const deleteWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const wordIndex = wordsDatabase.findIndex(w => w.id === id);
    
    if (wordIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Word not found',
        message: `No word found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    const deletedWord = wordsDatabase[wordIndex];
    wordsDatabase.splice(wordIndex, 1);
    
    const response: ApiResponse<GetWordResponse> = {
      success: true,
      data: { word: deletedWord },
      message: 'Word deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete word',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * POST /api/words/search - Search words with synonyms and antonyms
 */
export const searchWordDatabase: RequestHandler = (req, res) => {
  try {
    const searchRequest: SearchWordsRequest = req.body;
    
    if (!searchRequest.query) {
      const response: ApiResponse = {
        success: false,
        error: 'Search query is required',
        message: 'Please provide a search query'
      };
      res.status(400).json(response);
      return;
    }
    
    // Use the existing search function from sampleData
    const results = searchWords(searchRequest.query);
    
    // Apply pagination if requested
    const limit = searchRequest.limit || 50;
    const offset = searchRequest.offset || 0;
    const paginatedResults = results.slice(offset, offset + limit);
    
    const response: ApiResponse<SearchWordsResponse> = {
      success: true,
      data: {
        words: paginatedResults,
        total: results.length,
        query: searchRequest.query
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/words/sync-status - Get synchronization status
 */
export const getSyncStatus: RequestHandler = (_req, res) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: {
        isLoading: false,
        lastSync: new Date().toISOString(),
        error: null,
        pendingChanges: 0
      },
      message: 'Sync status retrieved successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get sync status',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};