import { Word, Character, ApiResponse } from '@shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = (await res.json()) as ApiResponse<T> | T;
  if (!res.ok) {
    const err = (data as any)?.error || res.statusText;
    throw new Error(typeof err === 'string' ? err : 'Request failed');
  }
  // If backend wraps in { success, data }
  if ((data as any)?.data !== undefined) {
    return (data as any).data as T;
  }
  return data as T;
}

// Words
export const WordsApi = {
  list: (): Promise<Word[]> => request<Word[]>(`${API_BASE}/words`, { cache: 'no-store' as any }),
  create: (word: Omit<Word, 'id' | 'created_at' | 'updated_at'>): Promise<Word> =>
    request<Word>(`${API_BASE}/words`, { method: 'POST', body: JSON.stringify(word) }),
  update: (id: string, updates: Partial<Word>): Promise<Word> =>
    request<Word>(`${API_BASE}/words/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${API_BASE}/words/${id}`, { method: 'DELETE' }),
};

// Characters
export const CharactersApi = {
  list: (): Promise<Character[]> => request<Character[]>(`${API_BASE}/characters`, { cache: 'no-store' as any }),
  create: (character: Omit<Character, 'id' | 'created_at'>): Promise<Character> =>
    request<Character>(`${API_BASE}/characters`, { method: 'POST', body: JSON.stringify(character) }),
  update: (id: string, updates: Partial<Character>): Promise<Character> =>
    request<Character>(`${API_BASE}/characters/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  delete: (id: string): Promise<{ message: string }> =>
    request<{ message: string }>(`${API_BASE}/characters/${id}`, { method: 'DELETE' }),
};