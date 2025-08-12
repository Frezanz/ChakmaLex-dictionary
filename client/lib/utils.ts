import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RelatedTerm } from "@shared/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseRelatedText = (text: string): RelatedTerm[] => {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [term, langRaw] = line.split(":");
      const language = langRaw?.trim().toLowerCase() === "chakma" ? "chakma" : "english";
      return { term: term.trim(), language } as RelatedTerm;
    });
};

export const stringifyRelated = (terms: RelatedTerm[] | undefined): string => {
  if (!terms || terms.length === 0) return "";
  return terms.map((t) => `${t.term}:${t.language}`).join("\n");
};
