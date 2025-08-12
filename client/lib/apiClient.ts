import { Word, Character } from "@shared/types";

const API_BASE = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const defaultHeaders = {
  "Content-Type": "application/json",
  "Cache-Control": "no-cache",
};

export const apiClient = {
  // Words
  async getWords(): Promise<Word[]> {
    const res = await fetch(`${API_BASE}/words`, { cache: "no-store", headers: defaultHeaders });
    const body = await handleResponse<{ success: boolean; items: Word[] }>(res);
    return body.items;
  },
  async getWord(id: string): Promise<Word> {
    const res = await fetch(`${API_BASE}/words/${id}`, { cache: "no-store", headers: defaultHeaders });
    const body = await handleResponse<{ success: boolean; data: Word }>(res);
    return body.data;
  },
  async createWord(data: Omit<Word, "id" | "created_at" | "updated_at">): Promise<Word> {
    const res = await fetch(`${API_BASE}/words`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const body = await handleResponse<{ success: boolean; data: Word }>(res);
    return body.data;
  },
  async updateWord(id: string, data: Partial<Word>): Promise<Word> {
    const res = await fetch(`${API_BASE}/words/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const body = await handleResponse<{ success: boolean; data: Word }>(res);
    return body.data;
  },
  async deleteWord(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/words/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });
    await handleResponse<{ success: boolean }>(res);
  },

  // Characters
  async getCharacters(): Promise<Character[]> {
    const res = await fetch(`${API_BASE}/characters`, { cache: "no-store", headers: defaultHeaders });
    const body = await handleResponse<{ success: boolean; items: Character[] }>(res);
    return body.items;
  },
  async createCharacter(data: Omit<Character, "id" | "created_at">): Promise<Character> {
    const res = await fetch(`${API_BASE}/characters`, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const body = await handleResponse<{ success: boolean; data: Character }>(res);
    return body.data;
  },
  async updateCharacter(id: string, data: Partial<Character>): Promise<Character> {
    const res = await fetch(`${API_BASE}/characters/${id}`, {
      method: "PUT",
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    const body = await handleResponse<{ success: boolean; data: Character }>(res);
    return body.data;
  },
  async deleteCharacter(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/characters/${id}`, {
      method: "DELETE",
      headers: defaultHeaders,
    });
    await handleResponse<{ success: boolean }>(res);
  },
};