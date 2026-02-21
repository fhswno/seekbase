// TYPES
import { AIAction } from "@/types/ai";

export const ACTION_PROMPTS: Record<
  AIAction,
  (text: string, lang?: string) => string
> = {
  summarize: (text: string) =>
    `Summarize the following text concisely in 1-2 sentences:\n\n${text}`,
  rewrite: (text: string) =>
    `Rewrite the following text to be clearer and more polished. Only return the rewritten text, nothing else:\n\n${text}`,
  explain: (text: string) =>
    `Explain the following text in simple terms:\n\n${text}`,
  translate: (text: string, lang) =>
    `Translate the following text to ${lang ?? "Spanish"}. Only return the translation, nothing else:\n\n${text}`,
};
