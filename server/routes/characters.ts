import { RequestHandler } from "express";
import { Character, ApiResponse } from "@shared/types";

// In-memory storage for demo purposes
let characters: Character[] = [];

// GET /api/characters - Get all characters
export const getCharacters: RequestHandler = (req, res) => {
  const response: ApiResponse<Character[]> = {
    success: true,
    data: characters,
  };
  res.json(response);
};

// GET /api/characters/:id - Get a specific character
export const getCharacter: RequestHandler = (req, res) => {
  const { id } = req.params;
  const character = characters.find(c => c.id === id);
  
  if (!character) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Character not found",
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<Character> = {
    success: true,
    data: character,
  };
  res.json(response);
};

// POST /api/characters - Create a new character
export const createCharacter: RequestHandler = (req, res) => {
  try {
    const characterData = req.body as Omit<Character, 'id'>;
    
    // Validate required fields
    if (!characterData.character_script || !characterData.romanized_name || !characterData.character_type) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Missing required fields: character_script, romanized_name, character_type",
      };
      return res.status(400).json(response);
    }

    // Check for duplicate characters
    const existingCharacter = characters.find(c => c.character_script === characterData.character_script);
    if (existingCharacter) {
      const response: ApiResponse<null> = {
        success: false,
        error: "A character with this script already exists",
      };
      return res.status(409).json(response);
    }

    const newCharacter: Character = {
      ...characterData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };

    characters.push(newCharacter);

    const response: ApiResponse<Character> = {
      success: true,
      data: newCharacter,
      message: "Character created successfully",
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to create character",
    };
    res.status(500).json(response);
  }
};

// PUT /api/characters/:id - Update a character
export const updateCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body as Partial<Character>;
    
    const characterIndex = characters.findIndex(c => c.id === id);
    if (characterIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Character not found",
      };
      return res.status(404).json(response);
    }

    // Check for duplicate characters (if script is being updated)
    if (updateData.character_script) {
      const existingCharacter = characters.find(c => 
        c.character_script === updateData.character_script && c.id !== id
      );
      if (existingCharacter) {
        const response: ApiResponse<null> = {
          success: false,
          error: "A character with this script already exists",
        };
        return res.status(409).json(response);
      }
    }

    const updatedCharacter: Character = {
      ...characters[characterIndex],
      ...updateData,
      id, // Ensure ID doesn't change
    };

    characters[characterIndex] = updatedCharacter;

    const response: ApiResponse<Character> = {
      success: true,
      data: updatedCharacter,
      message: "Character updated successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to update character",
    };
    res.status(500).json(response);
  }
};

// DELETE /api/characters/:id - Delete a character
export const deleteCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const characterIndex = characters.findIndex(c => c.id === id);
    if (characterIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        error: "Character not found",
      };
      return res.status(404).json(response);
    }

    characters.splice(characterIndex, 1);

    const response: ApiResponse<null> = {
      success: true,
      message: "Character deleted successfully",
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Failed to delete character",
    };
    res.status(500).json(response);
  }
};