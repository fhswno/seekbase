export type AIAction = "summarize" | "rewrite" | "explain" | "translate";

export const AI_LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Korean",
  "Portuguese",
  "Italian",
  "Russian",
  "Hebrew",
  "Arabic",
];

export type UseAIOptions = {
  onChunk?: (chunk: string, fullText: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
};

export type UseAIReturn = {
  generating: boolean;
  result: string;
  error: string | null;
  ollamaAvailable: boolean;
  currentModel: string | null;
  generate: (prompt: string, system?: string) => Promise<string>;
  cancel: () => void;
  reset: () => void;
};
