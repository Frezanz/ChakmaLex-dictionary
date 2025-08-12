import { RequestHandler } from "express";
import { Word, ApiResponse, PaginatedResponse } from "@shared/types";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// File paths for data storage
const WORDS_FILE = join(process.cwd(), "data", "words.json");
const CHARACTERS_FILE = join(process.cwd(), "data", "characters.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    const fs = require("fs");
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load words from file
const loadWords = (): Word[] => {
  try {
    ensureDataDir();
    if (existsSync(WORDS_FILE)) {
      const data = readFileSync(WORDS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading words:", error);
    return [];
  }
};

// Save words to file
const saveWords = (words: Word[]): void => {
  try {
    ensureDataDir();
    writeFileSync(WORDS_FILE, JSON.stringify(words, null, 2));
  } catch (error) {
    console.error("Error saving words:", error);
    throw error;
  }
};

// Get all words with pagination
export const getWords: RequestHandler = (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const words = loadWords();

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedWords = words.slice(startIndex, endIndex);

    const response: ApiResponse<PaginatedResponse<Word>> = {
      success: true,
      data: {
        items: paginatedWords,
        total_count: words.length,
        page,
        per_page: limit,
        has_next: endIndex < words.length,
        has_prev: page > 1,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting words:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve words",
    });
  }
};

// Get word by ID
export const getWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const words = loadWords();
    const word = words.find((w) => w.id === id);

    if (!word) {
      return res.status(404).json({
        success: false,
        error: "Word not found",
      });
    }

    const response: ApiResponse<Word> = {
      success: true,
      data: word,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting word:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve word",
    });
  }
};

// Create new word
export const createWord: RequestHandler = (req, res) => {
  try {
    const wordData = req.body;
    const words = loadWords();

    // Check for duplicate Chakma words
    const existingWord = words.find(
      (w) => w.chakma_word_script === wordData.chakma_word_script
    );

    if (existingWord) {
      return res.status(400).json({
        success: false,
        error: "Word already exists",
      });
    }

    const newWord: Word = {
      ...wordData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    words.push(newWord);
    saveWords(words);

    const response: ApiResponse<Word> = {
      success: true,
      data: newWord,
      message: "Word created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating word:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create word",
    });
  }
};

// Update word
export const updateWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const words = loadWords();

    const wordIndex = words.findIndex((w) => w.id === id);

    if (wordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Word not found",
      });
    }

    // Check for duplicate Chakma words (excluding current word)
    const existingWord = words.find(
      (w) =>
        w.chakma_word_script === updateData.chakma_word_script && w.id !== id
    );

    if (existingWord) {
      return res.status(400).json({
        success: false,
        error: "Word already exists",
      });
    }

    const updatedWord: Word = {
      ...words[wordIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    words[wordIndex] = updatedWord;
    saveWords(words);

    const response: ApiResponse<Word> = {
      success: true,
      data: updatedWord,
      message: "Word updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating word:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update word",
    });
  }
};

// Delete word
export const deleteWord: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const words = loadWords();

    const wordIndex = words.findIndex((w) => w.id === id);

    if (wordIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Word not found",
      });
    }

    words.splice(wordIndex, 1);
    saveWords(words);

    const response: ApiResponse<void> = {
      success: true,
      message: "Word deleted successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting word:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete word",
    });
  }
};

// Search words
export const searchWords: RequestHandler = (req, res) => {
  try {
    const { query, fields } = req.query;
    const words = loadWords();

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const searchFields = fields
      ? (fields as string).split(",")
      : ["chakma_word_script", "romanized_pronunciation", "english_translation"];

    const searchResults = words.filter((word) => {
      return searchFields.some((field) => {
        const value = word[field as keyof Word];
        if (typeof value === "string") {
          return value.toLowerCase().includes((query as string).toLowerCase());
        }
        return false;
      });
    });

    const response: ApiResponse<Word[]> = {
      success: true,
      data: searchResults,
    };

    res.json(response);
  } catch (error) {
    console.error("Error searching words:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search words",
    });
  }
};

// Batch create words
export const batchCreateWords: RequestHandler = (req, res) => {
  try {
    const { words: wordData } = req.body;
    const existingWords = loadWords();

    const newWords: Word[] = [];
    const errors: string[] = [];

    for (const wordDataItem of wordData) {
      // Check for duplicates
      const existingWord = existingWords.find(
        (w) => w.chakma_word_script === wordDataItem.chakma_word_script
      );

      if (existingWord) {
        errors.push(`Word "${wordDataItem.chakma_word_script}" already exists`);
        continue;
      }

      const newWord: Word = {
        ...wordDataItem,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      newWords.push(newWord);
    }

    if (newWords.length > 0) {
      existingWords.push(...newWords);
      saveWords(existingWords);
    }

    const response: ApiResponse<Word[]> = {
      success: true,
      data: newWords,
      message: `Created ${newWords.length} words${errors.length > 0 ? `, ${errors.length} skipped` : ""}`,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error batch creating words:", error);
    res.status(500).json({
      success: false,
      error: "Failed to batch create words",
    });
  }
};