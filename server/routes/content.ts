import { Request, Response, Router } from "express";
import { loadContent, upsertWord, deleteWord, upsertCharacter, deleteCharacter } from "../storage/contentStore";
import { Word, Character } from "@shared/types";

const router = Router();

// Simple in-memory list of SSE clients
const sseClients: Response[] = [];

function broadcast(event: string, data: unknown) {
  const payload = `event: ${event}\n` + `data: ${JSON.stringify(data)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      // ignore broken pipes
    }
  }
}

router.get("/content", async (_req: Request, res: Response) => {
  const content = await loadContent();
  res.json({ success: true, data: content });
});

router.get("/words", async (req: Request, res: Response) => {
  const { query } = req.query as { query?: string };
  const content = await loadContent();
  const words = content.words;
  if (!query) {
    return res.json({ success: true, data: words });
  }
  const lower = query.toLowerCase();
  const filtered = words.filter((w) =>
    w.english_translation.toLowerCase().includes(lower) ||
    w.chakma_word_script.includes(query) ||
    w.romanized_pronunciation.toLowerCase().includes(lower) ||
    (w.synonyms || []).some((s) => s.term.toLowerCase().includes(lower)) ||
    (w.antonyms || []).some((a) => a.term.toLowerCase().includes(lower))
  );
  res.json({ success: true, data: filtered });
});

router.post("/words", async (req: Request, res: Response) => {
  const word = req.body as Word;
  const next = await upsertWord(word);
  broadcast("content_updated", { version: next.version, type: "word", action: "upsert", id: word.id });
  res.json({ success: true, data: next });
});

router.put("/words/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const word = { ...(req.body as Word), id } as Word;
  const next = await upsertWord(word);
  broadcast("content_updated", { version: next.version, type: "word", action: "upsert", id });
  res.json({ success: true, data: next });
});

router.delete("/words/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const next = await deleteWord(id);
  broadcast("content_updated", { version: next.version, type: "word", action: "delete", id });
  res.json({ success: true, data: next });
});

router.get("/characters", async (req: Request, res: Response) => {
  const { type } = req.query as { type?: string };
  const content = await loadContent();
  let characters = content.characters;
  if (type) {
    characters = characters.filter((c) => c.character_type === type);
  }
  res.json({ success: true, data: characters });
});

router.post("/characters", async (req: Request, res: Response) => {
  const character = req.body as Character;
  const next = await upsertCharacter(character);
  broadcast("content_updated", { version: next.version, type: "character", action: "upsert", id: character.id });
  res.json({ success: true, data: next });
});

router.put("/characters/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const character = { ...(req.body as Character), id } as Character;
  const next = await upsertCharacter(character);
  broadcast("content_updated", { version: next.version, type: "character", action: "upsert", id });
  res.json({ success: true, data: next });
});

router.delete("/characters/:id", async (req: Request, res: Response) => {
  const id = req.params.id;
  const next = await deleteCharacter(id);
  broadcast("content_updated", { version: next.version, type: "character", action: "delete", id });
  res.json({ success: true, data: next });
});

// SSE endpoint for real-time updates
router.get("/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.write("\n");
  sseClients.push(res);

  req.on("close", () => {
    const idx = sseClients.indexOf(res);
    if (idx >= 0) sseClients.splice(idx, 1);
  });
});

export default router;