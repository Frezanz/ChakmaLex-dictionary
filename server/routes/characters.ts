import { Router } from "express";
import { Character } from "@shared/types";
import { sampleCharacters } from "@shared/sampleData";
import { randomUUID } from "crypto";

const router = Router();

let characters: Character[] = [...sampleCharacters];

router.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

router.get("/", (_req, res) => {
  res.json({ success: true, data: characters });
});

router.post("/", (req, res) => {
  try {
    const newCharacter: Character = {
      ...req.body,
      id: randomUUID(),
      created_at: new Date().toISOString(),
    };
    characters.push(newCharacter);
    res.status(201).json({ success: true, data: newCharacter });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e?.message ?? "Invalid payload" });
  }
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const index = characters.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Character not found" });
  }
  const updated: Character = {
    ...characters[index],
    ...req.body,
    id,
  };
  characters[index] = updated;
  res.json({ success: true, data: updated });
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const index = characters.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: "Character not found" });
  }
  characters.splice(index, 1);
  res.json({ success: true });
});

export default router;