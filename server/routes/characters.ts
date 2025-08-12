import { RequestHandler } from "express";
import { Character, ApiResponse } from "@shared/types";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// File paths for data storage
const CHARACTERS_FILE = join(process.cwd(), "data", "characters.json");

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    const fs = require("fs");
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load characters from file
const loadCharacters = (): Character[] => {
  try {
    ensureDataDir();
    if (existsSync(CHARACTERS_FILE)) {
      const data = readFileSync(CHARACTERS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error("Error loading characters:", error);
    return [];
  }
};

// Save characters to file
const saveCharacters = (characters: Character[]): void => {
  try {
    ensureDataDir();
    writeFileSync(CHARACTERS_FILE, JSON.stringify(characters, null, 2));
  } catch (error) {
    console.error("Error saving characters:", error);
    throw error;
  }
};

// Get all characters
export const getCharacters: RequestHandler = (req, res) => {
  try {
    const characters = loadCharacters();

    const response: ApiResponse<Character[]> = {
      success: true,
      data: characters,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting characters:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve characters",
    });
  }
};

// Get character by ID
export const getCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const characters = loadCharacters();
    const character = characters.find((c) => c.id === id);

    if (!character) {
      return res.status(404).json({
        success: false,
        error: "Character not found",
      });
    }

    const response: ApiResponse<Character> = {
      success: true,
      data: character,
    };

    res.json(response);
  } catch (error) {
    console.error("Error getting character:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve character",
    });
  }
};

// Create new character
export const createCharacter: RequestHandler = (req, res) => {
  try {
    const characterData = req.body;
    const characters = loadCharacters();

    // Check for duplicate character scripts
    const existingCharacter = characters.find(
      (c) => c.character_script === characterData.character_script
    );

    if (existingCharacter) {
      return res.status(400).json({
        success: false,
        error: "Character already exists",
      });
    }

    const newCharacter: Character = {
      ...characterData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    characters.push(newCharacter);
    saveCharacters(characters);

    const response: ApiResponse<Character> = {
      success: true,
      data: newCharacter,
      message: "Character created successfully",
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating character:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create character",
    });
  }
};

// Update character
export const updateCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const characters = loadCharacters();

    const characterIndex = characters.findIndex((c) => c.id === id);

    if (characterIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Character not found",
      });
    }

    // Check for duplicate character scripts (excluding current character)
    const existingCharacter = characters.find(
      (c) =>
        c.character_script === updateData.character_script && c.id !== id
    );

    if (existingCharacter) {
      return res.status(400).json({
        success: false,
        error: "Character already exists",
      });
    }

    const updatedCharacter: Character = {
      ...characters[characterIndex],
      ...updateData,
    };

    characters[characterIndex] = updatedCharacter;
    saveCharacters(characters);

    const response: ApiResponse<Character> = {
      success: true,
      data: updatedCharacter,
      message: "Character updated successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating character:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update character",
    });
  }
};

// Delete character
export const deleteCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const characters = loadCharacters();

    const characterIndex = characters.findIndex((c) => c.id === id);

    if (characterIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Character not found",
      });
    }

    characters.splice(characterIndex, 1);
    saveCharacters(characters);

    const response: ApiResponse<void> = {
      success: true,
      message: "Character deleted successfully",
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting character:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete character",
    });
  }
};