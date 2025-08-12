import { RequestHandler } from 'express';
import { 
  ApiResponse, 
  CreateCharacterRequest, 
  UpdateCharacterRequest, 
  DeleteCharacterRequest,
  GetCharactersResponse,
  GetCharacterResponse
} from '../../shared/api';
import { Character } from '../../shared/types';
import { sampleCharacters } from '../../shared/sampleData';

// In-memory storage (replace with actual database in production)
let charactersDatabase: Character[] = [...sampleCharacters];

/**
 * GET /api/characters - Get all characters with optional filtering
 */
export const getAllCharacters: RequestHandler = (req, res) => {
  try {
    const type = req.query.type as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    let filteredCharacters = charactersDatabase;
    
    // Filter by character type if specified
    if (type) {
      filteredCharacters = charactersDatabase.filter(char => char.character_type === type);
    }
    
    const totalCharacters = filteredCharacters.length;
    const paginatedCharacters = filteredCharacters.slice(offset, offset + limit);
    
    const response: ApiResponse<GetCharactersResponse> = {
      success: true,
      data: {
        characters: paginatedCharacters,
        total: totalCharacters
      }
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch characters',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * GET /api/characters/:id - Get specific character by ID
 */
export const getCharacterById: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const character = charactersDatabase.find(c => c.id === id);
    
    if (!character) {
      const response: ApiResponse = {
        success: false,
        error: 'Character not found',
        message: `No character found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse<GetCharacterResponse> = {
      success: true,
      data: { character }
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch character',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * POST /api/characters - Create new character
 */
export const createCharacter: RequestHandler = (req, res) => {
  try {
    const characterData: CreateCharacterRequest = req.body;
    
    // Validate required fields
    if (!characterData.character_script || !characterData.character_type || !characterData.romanized_name) {
      const response: ApiResponse = {
        success: false,
        error: 'Missing required fields',
        message: 'character_script, character_type, and romanized_name are required'
      };
      res.status(400).json(response);
      return;
    }
    
    // Validate character type
    const validTypes = ['alphabet', 'vowel', 'conjunct', 'diacritic', 'ordinal', 'symbol'];
    if (!validTypes.includes(characterData.character_type)) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid character type',
        message: `character_type must be one of: ${validTypes.join(', ')}`
      };
      res.status(400).json(response);
      return;
    }
    
    // Create new character with generated ID
    const newCharacter: Character = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...characterData,
      created_at: new Date().toISOString()
    };
    
    // Add to database
    charactersDatabase.push(newCharacter);
    
    const response: ApiResponse<GetCharacterResponse> = {
      success: true,
      data: { character: newCharacter },
      message: 'Character created successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to create character',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * PUT /api/characters/:id - Update existing character
 */
export const updateCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData: Partial<UpdateCharacterRequest> = req.body;
    
    const characterIndex = charactersDatabase.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Character not found',
        message: `No character found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    // Validate character type if being updated
    if (updateData.character_type) {
      const validTypes = ['alphabet', 'vowel', 'conjunct', 'diacritic', 'ordinal', 'symbol'];
      if (!validTypes.includes(updateData.character_type)) {
        const response: ApiResponse = {
          success: false,
          error: 'Invalid character type',
          message: `character_type must be one of: ${validTypes.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }
    }
    
    // Update character with new data
    const updatedCharacter: Character = {
      ...charactersDatabase[characterIndex],
      ...updateData,
      id // Ensure ID remains unchanged
    };
    
    charactersDatabase[characterIndex] = updatedCharacter;
    
    const response: ApiResponse<GetCharacterResponse> = {
      success: true,
      data: { character: updatedCharacter },
      message: 'Character updated successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update character',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/characters/:id - Delete character
 */
export const deleteCharacter: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    
    const characterIndex = charactersDatabase.findIndex(c => c.id === id);
    
    if (characterIndex === -1) {
      const response: ApiResponse = {
        success: false,
        error: 'Character not found',
        message: `No character found with ID: ${id}`
      };
      res.status(404).json(response);
      return;
    }
    
    const deletedCharacter = charactersDatabase[characterIndex];
    charactersDatabase.splice(characterIndex, 1);
    
    const response: ApiResponse<GetCharacterResponse> = {
      success: true,
      data: { character: deletedCharacter },
      message: 'Character deleted successfully'
    };
    
    res.status(200).json(response);
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: 'Failed to delete character',
      message: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(500).json(response);
  }
};