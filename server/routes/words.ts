import { RequestHandler } from "express";
import { Word, ApiResponse, PaginatedResponse } from "@shared/types";
import { sampleWords } from "@shared/sampleData";
import multer from "multer";
import path from "path";
import fs from "fs/promises";

// In-memory storage (replace with database in production)
let words: Word[] = [...sampleWords];

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.mkdir(uploadDir, { recursive: true }).then(() => {
      cb(null, uploadDir);
    }).catch((error) => {
      cb(error, uploadDir);
    });
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Helper function to validate word data
function validateWord(word: Partial<Word>): string[] {
  const errors: string[] = [];
  
  if (!word.chakma_word_script?.trim()) {
    errors.push('Chakma script is required');
  }
  
  if (!word.romanized_pronunciation?.trim()) {
    errors.push('Romanized pronunciation is required');
  }
  
  if (!word.english_translation?.trim()) {
    errors.push('English translation is required');
  }
  
  if (!word.example_sentence?.trim()) {
    errors.push('Example sentence is required');
  }
  
  if (!word.etymology?.trim()) {
    errors.push('Etymology is required');
  }

  return errors;
}

// Helper function to check for duplicate words
function checkDuplicateWord(chakmaScript: string, excludeId?: string): boolean {
  return words.some(word => 
    word.chakma_word_script.toLowerCase() === chakmaScript.toLowerCase() &&
    word.id !== excludeId
  );
}

// GET /api/words - Get all words with pagination and search
export const getWords: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    let filteredWords = [...words];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredWords = filteredWords.filter(word =>
        word.chakma_word_script.toLowerCase().includes(searchLower) ||
        word.romanized_pronunciation.toLowerCase().includes(searchLower) ||
        word.english_translation.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWords = filteredWords.slice(startIndex, endIndex);
    
    const response: PaginatedResponse<Word> = {
      items: paginatedWords,
      total_count: filteredWords.length,
      page,
      per_page: limit,
      has_next: endIndex < filteredWords.length,
      has_prev: page > 1,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error getting words:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/words/:id - Get a specific word
export const getWord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const word = words.find(w => w.id === id);
    
    if (!word) {
      return res.status(404).json({
        success: false,
        error: 'Word not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: word
    } as ApiResponse<Word>);
  } catch (error) {
    console.error('Error getting word:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/words - Create a new word
export const createWord: RequestHandler = async (req, res) => {
  try {
    const wordData = req.body;
    
    // Validate required fields
    const errors = validateWord(wordData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join(', ')
      } as ApiResponse<null>);
    }
    
    // Check for duplicates
    if (checkDuplicateWord(wordData.chakma_word_script)) {
      return res.status(409).json({
        success: false,
        error: 'Word already exists'
      } as ApiResponse<null>);
    }
    
    // Create new word
    const newWord: Word = {
      ...wordData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    words.push(newWord);
    
    res.status(201).json({
      success: true,
      data: newWord,
      message: 'Word created successfully'
    } as ApiResponse<Word>);
  } catch (error) {
    console.error('Error creating word:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// PUT /api/words/:id - Update a word
export const updateWord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const wordIndex = words.findIndex(w => w.id === id);
    if (wordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Word not found'
      } as ApiResponse<null>);
    }
    
    // Validate required fields
    const errors = validateWord(updateData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join(', ')
      } as ApiResponse<null>);
    }
    
    // Check for duplicates (excluding current word)
    if (checkDuplicateWord(updateData.chakma_word_script, id)) {
      return res.status(409).json({
        success: false,
        error: 'Word already exists'
      } as ApiResponse<null>);
    }
    
    // Update word
    const updatedWord: Word = {
      ...words[wordIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };
    
    words[wordIndex] = updatedWord;
    
    res.json({
      success: true,
      data: updatedWord,
      message: 'Word updated successfully'
    } as ApiResponse<Word>);
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// DELETE /api/words/:id - Delete a word
export const deleteWord: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const wordIndex = words.findIndex(w => w.id === id);
    if (wordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Word not found'
      } as ApiResponse<null>);
    }
    
    // Remove word from array
    words.splice(wordIndex, 1);
    
    res.json({
      success: true,
      message: 'Word deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/upload/audio - Upload audio file
export const uploadAudio: RequestHandler = async (req, res) => {
  try {
    upload.single('audio')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        } as ApiResponse<null>);
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided'
        } as ApiResponse<null>);
      }
      
      // In production, you would upload to a CDN or cloud storage
      // For now, we'll return a local path
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        data: { url: fileUrl },
        message: 'Audio uploaded successfully'
      } as ApiResponse<{ url: string }>);
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/upload/image - Upload image file
export const uploadImage: RequestHandler = async (req, res) => {
  try {
    upload.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        } as ApiResponse<null>);
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image file provided'
        } as ApiResponse<null>);
      }
      
      // In production, you would upload to a CDN or cloud storage
      // For now, we'll return a local path
      const fileUrl = `/uploads/${req.file.filename}`;
      
      res.json({
        success: true,
        data: { url: fileUrl },
        message: 'Image uploaded successfully'
      } as ApiResponse<{ url: string }>);
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/health - Health check endpoint
export const healthCheck: RequestHandler = async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      wordCount: words.length
    }
  } as ApiResponse<{ status: string; timestamp: string; wordCount: number }>);
};