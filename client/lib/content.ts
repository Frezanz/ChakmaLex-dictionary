import { Word, Character, CharacterType } from "@shared/types";

let wordsCache: Word[] = [];
let charactersCache: Character[] = [];
let version = 0;

const listeners = new Set<() => void>();

function notify() {
  for (const cb of listeners) cb();
}

export function subscribeContent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getWords(): Word[] {
  return wordsCache;
}

export function getCharacters(): Character[] {
  return charactersCache;
}

export function getCharactersByType(): Record<CharacterType, Character[]> {
  return {
    alphabet: charactersCache.filter((c) => c.character_type === "alphabet"),
    vowel: charactersCache.filter((c) => c.character_type === "vowel"),
    conjunct: charactersCache.filter((c) => c.character_type === "conjunct"),
    diacritic: charactersCache.filter((c) => c.character_type === "diacritic"),
    ordinal: charactersCache.filter((c) => c.character_type === "ordinal"),
    symbol: charactersCache.filter((c) => c.character_type === "symbol"),
  } as Record<CharacterType, Character[]>;
}

export function searchWordsLocal(query: string): Word[] {
  const lower = query.toLowerCase();
  return wordsCache.filter(
    (w) =>
      w.english_translation.toLowerCase().includes(lower) ||
      w.chakma_word_script.includes(query) ||
      w.romanized_pronunciation.toLowerCase().includes(lower) ||
      (w.synonyms || []).some((s) => s.term.toLowerCase().includes(lower)) ||
      (w.antonyms || []).some((a) => a.term.toLowerCase().includes(lower)),
  );
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

export async function loadContent(): Promise<void> {
  const response = await fetchJSON<{ success: boolean; data: { words: Word[]; characters: Character[]; version: number } }>(
    "/api/content",
  );
  wordsCache = response.data.words || [];
  charactersCache = response.data.characters || [];
  version = response.data.version || 0;
  notify();
}

function ensureSSE() {
  if (typeof window === "undefined" || !("EventSource" in window)) return;
  // Start SSE once
  if ((window as any).__chakmalex_sse_started) return;
  (window as any).__chakmalex_sse_started = true;

  try {
    const es = new EventSource("/api/events");
    es.onmessage = () => {};
    es.addEventListener("content_updated", async (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data || "{}");
        if (!data) return;
        // Simple strategy: reload content if version increased
        await loadContent();
      } catch (e) {
        console.error("Failed to process SSE event", e);
      }
    });
    es.onerror = () => {
      // Auto-retry handled by EventSource, no-op
    };
  } catch (e) {
    console.warn("SSE not available, falling back to polling", e);
    setInterval(loadContent, 4000);
  }
}

// Initialize on import
if (typeof window !== "undefined") {
  loadContent().catch(() => {});
  ensureSSE();
}