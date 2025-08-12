export type ApiWord = {
  id: string;
  chakma_word_script: string;
  audio_pronunciation_url?: string;
  romanized_pronunciation: string;
  english_translation: string;
  synonyms?: { term: string; language: 'chakma' | 'english' }[];
  antonyms?: { term: string; language: 'chakma' | 'english' }[];
  example_sentence: string;
  etymology: string;
  explanation_media?: { type: 'url' | 'image'; value: string };
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
};

const BASE_URL = '/api';

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}

async function getWords(): Promise<ApiWord[]> {
  const data = await http<{ success: boolean; data: ApiWord[] }>(`${BASE_URL}/words`);
  return data.data || [];
}

async function createWord(word: Omit<ApiWord, 'id'> & { id?: string }): Promise<ApiWord> {
  const data = await http<{ success: boolean; data: ApiWord }>(`${BASE_URL}/words`, {
    method: 'POST',
    body: JSON.stringify(word),
  });
  return data.data as ApiWord;
}

async function updateWord(id: string, update: Partial<ApiWord>): Promise<ApiWord> {
  const data = await http<{ success: boolean; data: ApiWord }>(`${BASE_URL}/words/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(update),
  });
  return data.data as ApiWord;
}

async function deleteWord(id: string): Promise<void> {
  await http<{ success: boolean; message: string }>(`${BASE_URL}/words/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

async function triggerRebuild(): Promise<void> {
  await http<{ success: boolean; message: string }>(`${BASE_URL}/rebuild`, { method: 'POST' });
}

async function uploadBase64(kind: 'audio' | 'image', fileName: string, base64Data: string): Promise<string> {
  const data = await http<{ success: boolean; url: string }>(`${BASE_URL}/upload/${kind}`, {
    method: 'POST',
    body: JSON.stringify({ fileName, contentBase64: base64Data }),
  });
  return data.url;
}

async function uploadFile(kind: 'audio' | 'image', file: File): Promise<string> {
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  return uploadBase64(kind, safeName, base64Data);
}

export const apiClient = {
  getWords,
  createWord,
  updateWord,
  deleteWord,
  uploadAudio: (file: File) => uploadFile('audio', file),
  uploadImage: (file: File) => uploadFile('image', file),
  triggerRebuild,
};

declare global {
  interface Window {
    apiclient?: typeof apiClient;
  }
}

if (typeof window !== 'undefined') {
  window.apiclient = apiClient;
}