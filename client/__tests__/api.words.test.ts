import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import { createServer } from "../../server/index";

const app = createServer();
let server: http.Server;
let baseUrl: string;

describe("Words API synonyms/antonyms", () => {
  beforeAll(async () => {
    server = app.listen(0);
    const address = server.address();
    if (typeof address === "object" && address && address.port) {
      baseUrl = `http://127.0.0.1:${address.port}`;
    } else {
      throw new Error("Failed to get server port");
    }
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("should create a word with synonyms and antonyms and then retrieve them", async () => {
    const payload = {
      chakma_word_script: "𑄃𑄘𑄮",
      romanized_pronunciation: "ado",
      english_translation: "today-new",
      synonyms: [
        { term: "𑄃𑄏𑄮", language: "chakma" },
        { term: "now", language: "english" },
      ],
      antonyms: [
        { term: "𑄇𑄣𑄌𑄢", language: "chakma" },
        { term: "yesterday", language: "english" },
      ],
      example_sentence: "test",
      etymology: "test",
    };

    const createRes = await fetch(`${baseUrl}/api/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    expect(createRes.ok).toBe(true);
    const created = await createRes.json();
    expect(created?.data?.id).toBeTruthy();
    expect(created?.data?.synonyms?.length).toBe(2);
    expect(created?.data?.antonyms?.length).toBe(2);

    const listRes = await fetch(`${baseUrl}/api/words`);
    expect(listRes.ok).toBe(true);
    const listJson = await listRes.json();
    const found = listJson.data.find((w: any) => w.id === created.data.id);
    expect(found).toBeTruthy();
    expect(found.synonyms.length).toBe(2);
    expect(found.antonyms.length).toBe(2);

    const updatedPayload = {
      synonyms: [...found.synonyms, { term: "present", language: "english" }],
      antonyms: [...found.antonyms, { term: "past", language: "english" }],
    };
    const updateRes = await fetch(`${baseUrl}/api/words/${created.data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPayload),
    });
    expect(updateRes.ok).toBe(true);
    const updated = await updateRes.json();
    expect(updated.data.synonyms.length).toBe(3);
    expect(updated.data.antonyms.length).toBe(3);

    const delRes = await fetch(`${baseUrl}/api/words/${created.data.id}`, { method: "DELETE" });
    expect(delRes.ok).toBe(true);
  });
});