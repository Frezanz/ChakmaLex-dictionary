import { Word, Character } from "@shared/types";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiOptions extends RequestInit {
  method?: HttpMethod;
}

const request = async <T>(url: string, options: ApiOptions = {}): Promise<T> => {
  const res = await fetch(`${API_BASE}${url}`, {
    cache: "no-store", // avoid stale responses
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error ?? res.statusText);
  }

  return data.data as T;
};

/* ----------------------------- Words API ----------------------------- */
export const fetchWords = () => request<Word[]>("/api/words");
export const addWord = (word: Partial<Word>) =>
  request<Word>("/api/words", { method: "POST", body: JSON.stringify(word) });
export const updateWord = (id: string, word: Partial<Word>) =>
  request<Word>(`/api/words/${id}`, {
    method: "PUT",
    body: JSON.stringify(word),
  });
export const deleteWord = (id: string) =>
  request<void>(`/api/words/${id}`, { method: "DELETE" });

/* --------------------------- Characters API -------------------------- */
export const fetchCharacters = () => request<Character[]>("/api/characters");
export const addCharacter = (char: Partial<Character>) =>
  request<Character>("/api/characters", {
    method: "POST",
    body: JSON.stringify(char),
  });
export const updateCharacter = (id: string, char: Partial<Character>) =>
  request<Character>(`/api/characters/${id}`, {
    method: "PUT",
    body: JSON.stringify(char),
  });
export const deleteCharacter = (id: string) =>
  request<void>(`/api/characters/${id}`, { method: "DELETE" });