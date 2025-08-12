import { RequestHandler } from "express";
import { Character, ApiResponse } from "@shared/types";
import { sampleCharacters } from "@shared/sampleData";

// In-memory storage (replace with database in production)
let characters: Character[] = [...sampleCharacters];

// Helper function to validate character data
function validateCharacter(character: Partial<Character>): string[] {
  const errors: string[] = [];
  
  if (!character.character_script?.trim()) {
    errors.push('Character script is required');
  }
  
  if (!character.romanized_name?.trim()) {
    errors.push('Romanized name is required');
  }
  
  if (!character.character_type) {
    errors.push('Character type is required');
  }

  return errors;
}

// Helper function to check for duplicate characters
function checkDuplicateCharacter(characterScript: string, excludeId?: string): boolean {
  return characters.some(character => 
    character.character_script.toLowerCase() === characterScript.toLowerCase() &&
    character.id !== excludeId
  );
}

// GET /api/characters - Get all characters
export const getCharacters: RequestHandler = async (req, res) => {
  try {
    res.json({
      success: true,
      data: characters
    } as ApiResponse<Character[]>);
  } catch (error) {
    console.error('Error getting characters:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// GET /api/characters/:id - Get a specific character
export const getCharacter: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const character = characters.find(c => c.id === id);
    
    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      } as ApiResponse<null>);
    }
    
    res.json({
      success: true,
      data: character
    } as ApiResponse<Character>);
  } catch (error) {
    console.error('Error getting character:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// POST /api/characters - Create a new character
export const createCharacter: RequestHandler = async (req, res) => {
  try {
    const characterData = req.body;
    
    // Validate required fields
    const errors = validateCharacter(characterData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join(', ')
      } as ApiResponse<null>);
    }
    
    // Check for duplicates
    if (checkDuplicateCharacter(characterData.character_script)) {
      return res.status(409).json({
        success: false,
        error: 'Character already exists'
      } as ApiResponse<null>);
    }
    
    // Create new character
    const newCharacter: Character = {
      ...characterData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    
    characters.push(newCharacter);
    
    res.status(201).json({
      success: true,
      data: newCharacter,
      message: 'Character created successfully'
    } as ApiResponse<Character>);
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// PUT /api/characters/:id - Update a character
export const updateCharacter: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const characterIndex = characters.findIndex(c => c.id === id);
    if (characterIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      } as ApiResponse<null>);
    }
    
    // Validate required fields
    const errors = validateCharacter(updateData);
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: errors.join(', ')
      } as ApiResponse<null>);
    }
    
    // Check for duplicates (excluding current character)
    if (checkDuplicateCharacter(updateData.character_script, id)) {
      return res.status(409).json({
        success: false,
        error: 'Character already exists'
      } as ApiResponse<null>);
    }
    
    // Update character
    const updatedCharacter: Character = {
      ...characters[characterIndex],
      ...updateData,
      id, // Ensure ID doesn't change
    };
    
    characters[characterIndex] = updatedCharacter;
    
    res.json({
      success: true,
      data: updatedCharacter,
      message: 'Character updated successfully'
    } as ApiResponse<Character>);
  } catch (error) {
    console.error('Error updating character:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};

// DELETE /api/characters/:id - Delete a character
export const deleteCharacter: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const characterIndex = characters.findIndex(c => c.id === id);
    if (characterIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Character not found'
      } as ApiResponse<null>);
    }
    
    // Remove character from array
    characters.splice(characterIndex, 1);
    
    res.json({
      success: true,
      message: 'Character deleted successfully'
    } as ApiResponse<null>);
  } catch (error) {
    console.error('Error deleting character:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    } as ApiResponse<null>);
  }
};