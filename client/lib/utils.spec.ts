import { describe, it, expect } from "vitest";
import { cn, parseRelatedText, stringifyRelated } from "./utils";

describe("cn function", () => {
  it("should merge classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base-class", isActive && "active-class")).toBe(
      "base-class active-class",
    );
  });

  it("should handle false and null conditions", () => {
    const isActive = false;
    expect(cn("base-class", isActive && "active-class", null)).toBe(
      "base-class",
    );
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should work with object notation", () => {
    expect(cn("base", { conditional: true, "not-included": false })).toBe(
      "base conditional",
    );
  });

  it("should parse and stringify related terms correctly", () => {
    const text = "𑄃𑄘𑄮:chakma\nnow:english";
    const parsed = parseRelatedText(text);
    expect(parsed).toEqual([
      { term: "𑄃𑄘𑄮", language: "chakma" },
      { term: "now", language: "english" },
    ]);

    const stringified = stringifyRelated(parsed);
    expect(stringified).toBe("𑄃𑄘𑄮:chakma\nnow:english");
  });
});
