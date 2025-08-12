import { RequestHandler } from "express";
import { Word, ApiResponse } from "@shared/types";

// In-memory storage for demo purposes
// In production, this would connect to a real database
let words: Word[] = [];

// GET /api/words - Get all words
export const getWords: RequestHandler = (req, res) => {
  const response: ApiResponse<Word[]> = {
    success: true,
    data: words,
  };
  res.json(response);
};

// GET /api/words/:id - Get a specific word
export const getWord: RequestHandler = (req, res) => {
  const { id } = req.params;
  const word = words.find(w => w.id === id);
  
  if (!word) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Word not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Word> = {
    success: true,
    data: word,
  };
  res.json(response);
};

// POST /api/words - Create a new word
export const createWord: RequestHandler = (req, res) => {
  try {
    const wordData = req.body as Omit<Word, 'id'>;
    
    // Validate required fields
    if (!wordData.chakma_word_script || !wordData.english_translation || !wordData.romanized_pronunciation) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Missing required fields: chakma_word_script, english_translation, romanized_pronunciation",
      };
      return res.status(400).json(response);
    }

    // Check for duplicate Chakma words
    const existingWord = words.find(w => w.chakma_word_script === wordData.chakma_word_script);
    if (existingWord) {
      const response: ApiResponse<null> = {
        success: false,
        error: "A word with this Chakma script already exists",
      };
      return res.status(409).json(response);
    }

    const newWord: Word = {
      ...wordData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    words.push(newWord);

    const response: ApiResponse<Word> = {
      success: true,
      data: newWord,
      message: "Word created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create word",
    };
    res.status(500).json(response);
  }
};

// PUT /api/words/:id - Update a word
export const updateWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<Word>;
    
    const wordIndex = words.findIndex(w => w.id === id);
    if (wordIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Word not found",
      };
      return res.status(404).json(response);
    }

    // Check for duplicate Chakma words (if script is being updated)
    if (updateData.chakma_word_script) {
      const existingWord = words.find(w => 
        w.chakma_word_script === updateData.chakma_word_script && w.id !== id
      );
      if (existingWord) {
        const response: ApiResponse<null> = {
          success: false,
          error: "A word with this Chakma script already exists",
        };
        return res.status(409).json(response);
      }
    }

    const updatedWord: Word = {
      ...words[wordIndex],
      ...updateData,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
    };

    words[wordIndex] = updatedWord;

    const response: ApiResponse<Word> = {
      success: true,
      data: updatedWord,
      message: "Word updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update word",
    };
    res.status(500).json(response);
  }
};

// DELETE /api/words/:id - Delete a word
export const deleteWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const wordIndex = words.findIndex(w => w.id === id);
    if (wordIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Word not found",
      };
      return res.status(404).json(response);
    }

    words.splice(wordIndex, 1);

    const response: ApiResponse<null> = {
      success: true,
      message: "Word deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete word",
    };
    res.status(500).json(response);
  }
};

// POST /api/words/search - Search words
export const searchWords: RequestHandler = (req, res) => {
  try {
    const { query, fields = ['chakma_word_script', 'english_translation', 'romanized_pronunciation'] } = req.body;
    
    if (!query || query.trim() === '') {
      const response: ApiResponse<Word[]> = {
        success: true,
        data: words,
      };
      return res.json(response);
    }

    const searchQuery = query.toLowerCase().trim();
    const matchedWords = words.filter(word => {
      return fields.some((field: keyof Word) => {
        const fieldValue = word[field];
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(searchQuery);
        }
        return false;
      });
    });

    const response: ApiResponse<Word[]> = {
      success: true,
      data: matchedWords,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Search failed",
    };
    res.status(500).json(response);
  }
};