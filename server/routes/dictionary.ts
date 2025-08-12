import { Request, Response, Router } from "express";
import { Word, Character } from "@shared/types";
import { sampleWords, sampleCharacters } from "@shared/sampleData";

// In-memory stores seeded from shared sample data
let wordsStore: Word[] = [...sampleWords];
let charactersStore: Character[] = [...sampleCharacters];

const router = Router();

// Disable caching for all routes in this router
router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  next();
});

// Words endpoints
router.get("/words", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, items: wordsStore });
});

router.get("/words/:id", (req: Request, res: Response) => {
  const word = wordsStore.find(w => w.id === req.params.id);
  if (!word) {
    return res.status(404).json({ success: false, error: "Word not found" });
  }
  res.status(200).json({ success: true, data: word });
});

router.post("/words", (req: Request, res: Response) => {
  const payload = req.body as Partial<Word>;
  if (!payload || !payload.chakma_word_script || !payload.english_translation || !payload.romanized_pronunciation) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }
  
  // Check for duplicate Chakma word
  const existingWord = wordsStore.find(w => w.chakma_word_script === payload.chakma_word_script);
  if (existingWord) {
    return res.status(409).json({ 
      success: false, 
      error: `Word with Chakma script "${payload.chakma_word_script}" already exists` 
    });
  }
  
  const now = new Date().toISOString();
  const newWord: Word = {
    id: String(Date.now()),
    chakma_word_script: payload.chakma_word_script!,
    romanized_pronunciation: payload.romanized_pronunciation!,
    english_translation: payload.english_translation!,
    synonyms: payload.synonyms ?? [],
    antonyms: payload.antonyms ?? [],
    example_sentence: payload.example_sentence ?? "",
    etymology: payload.etymology ?? "",
    explanation_media: payload.explanation_media,
    is_verified: payload.is_verified ?? false,
    audio_pronunciation_url: payload.audio_pronunciation_url,
    created_at: now,
    updated_at: now,
  };
  wordsStore.unshift(newWord);
  res.status(201).json({ success: true, data: newWord });
});

router.put("/words/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = wordsStore.findIndex(w => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Word not found" });
  }
  const existing = wordsStore[idx];
  const payload = req.body as Partial<Word>;
  
  // Check for duplicate Chakma word (excluding current word)
  if (payload.chakma_word_script && payload.chakma_word_script !== existing.chakma_word_script) {
    const duplicateWord = wordsStore.find(w => 
      w.chakma_word_script === payload.chakma_word_script && w.id !== id
    );
    if (duplicateWord) {
      return res.status(409).json({ 
        success: false, 
        error: `Word with Chakma script "${payload.chakma_word_script}" already exists` 
      });
    }
  }
  
  const updated: Word = {
    ...existing,
    ...payload,
    synonyms: payload.synonyms ?? existing.synonyms ?? [],
    antonyms: payload.antonyms ?? existing.antonyms ?? [],
    updated_at: new Date().toISOString(),
  };
  wordsStore[idx] = updated;
  res.status(200).json({ success: true, data: updated });
});

router.delete("/words/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const exists = wordsStore.some(w => w.id === id);
  if (!exists) {
    return res.status(404).json({ success: false, error: "Word not found" });
  }
  wordsStore = wordsStore.filter(w => w.id !== id);
  res.status(200).json({ success: true });
});

// Characters endpoints
router.get("/characters", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, items: charactersStore });
});

router.get("/characters/:id", (req: Request, res: Response) => {
  const charItem = charactersStore.find(c => c.id === req.params.id);
  if (!charItem) {
    return res.status(404).json({ success: false, error: "Character not found" });
  }
  res.status(200).json({ success: true, data: charItem });
});

router.post("/characters", (req: Request, res: Response) => {
  const payload = req.body as Partial<Character>;
  if (!payload || !payload.character_script || !payload.romanized_name || !payload.character_type) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
    }
  const now = new Date().toISOString();
  const newCharacter: Character = {
    id: String(Date.now()),
    character_script: payload.character_script!,
    character_type: payload.character_type!,
    audio_pronunciation_url: payload.audio_pronunciation_url,
    romanized_name: payload.romanized_name!,
    description: payload.description ?? "",
    created_at: now,
  };
  charactersStore.unshift(newCharacter);
  res.status(201).json({ success: true, data: newCharacter });
});

router.put("/characters/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const idx = charactersStore.findIndex(c => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Character not found" });
  }
  const existing = charactersStore[idx];
  const payload = req.body as Partial<Character>;
  const updated: Character = {
    ...existing,
    ...payload,
  };
  charactersStore[idx] = updated;
  res.status(200).json({ success: true, data: updated });
});

router.delete("/characters/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  const exists = charactersStore.some(c => c.id === id);
  if (!exists) {
    return res.status(404).json({ success: false, error: "Character not found" });
  }
  charactersStore = charactersStore.filter(c => c.id !== id);
  res.status(200).json({ success: true });
});

export default router;