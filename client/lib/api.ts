import { Word, Character } from "@shared/types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  const data = await res.json();
  return data.data ?? data;
}

const fetchOptions: RequestInit = {
  cache: "no-store",
  headers: JSON_HEADERS,
};

// Words API
export async function fetchWords(): Promise<Word[]> {
  const res = await fetch("/api/words", { ...fetchOptions, method: "GET" });
  return handleResponse<Word[]>(res);
}

export async function createWord(payload: Partial<Word>): Promise<Word> {
  const res = await fetch("/api/words", {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<Word>(res);
}

export async function updateWord(id: string, payload: Partial<Word>): Promise<Word> {
  const res = await fetch(`/api/words/${id}`, {
    ...fetchOptions,
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return handleResponse<Word>(res);
}

export async function deleteWord(id: string): Promise<void> {
  const res = await fetch(`/api/words/${id}`, { ...fetchOptions, method: "DELETE" });
  await handleResponse(res);
}

// Characters API
export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch("/api/characters", { ...fetchOptions, method: "GET" });
  return handleResponse<Character[]>(res);
}

export async function createCharacter(payload: Partial<Character>): Promise<Character> {
  const res = await fetch("/api/characters", {
    ...fetchOptions,
    method: "POST",
    body: JSON.stringify(payload),
  });
  return handleResponse<Character>(res);
}

export async function updateCharacter(id: string, payload: Partial<Character>): Promise<Character> {
  const res = await fetch(`/api/characters/${id}`, {
    ...fetchOptions,
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return handleResponse<Character>(res);
}

export async function deleteCharacter(id: string): Promise<void> {
  const res = await fetch(`/api/characters/${id}`, { ...fetchOptions, method: "DELETE" });
  await handleResponse(res);
}