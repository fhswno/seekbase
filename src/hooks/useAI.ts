"use client";

// REACT
import { useState, useCallback, useRef, useEffect } from "react";

// STORE
import { useSettingsStore } from "@/stores/settings";

// LIB
import * as ollama from "@/lib/ollama";
import * as mistral from "@/lib/mistral";

// TYPES
import { UseAIOptions, UseAIReturn } from "@/types/ai";

export function useAI(options?: UseAIOptions): UseAIReturn {
  // States
  const [generating, setGenerating] = useState<boolean>(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ollamaAvailable, setOllamaAvailable] = useState<boolean>(false);

  // Refs
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef("");
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Store - Settings
  const { getSetting } = useSettingsStore();

  // Settings
  const aiProvider = getSetting("ai_provider") ?? "ollama";
  const baseUrl = getSetting("ollama_base_url") ?? "http://localhost:11434";
  const ollamaModel = getSetting("ollama_model") ?? null;
  const mistralApiKey = getSetting("mistral_api_key") ?? null;
  const mistralModel = getSetting("mistral_model") ?? null;

  // Models - Choose based on Provider
  const model = aiProvider === "mistral" ? mistralModel : ollamaModel;

  // Effect - Check Ollama availability on Mount
  useEffect(() => {
    if (aiProvider === "ollama") {
      ollama.checkOllamaStatus(baseUrl).then(setOllamaAvailable);
    }
  }, [baseUrl, aiProvider]);

  // Callback - Generate AI Response
  const generate = useCallback(
    async (prompt: string, system?: string): Promise<string> => {
      if (!model) {
        const err = "No AI model selected. Configure one in Settings.";
        setError(err);
        optionsRef.current?.onError?.(err);
        return "";
      }

      if (aiProvider === "mistral" && !mistralApiKey) {
        const err = "No Mistral API key configured. Add one in Settings.";
        setError(err);
        optionsRef.current?.onError?.(err);
        return "";
      }

      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setGenerating(true);
      setResult("");
      resultRef.current = "";
      setError(null);

      try {
        const onChunk = (chunk: string, accumulated: string) => {
          setResult(accumulated);
          resultRef.current = accumulated;
          optionsRef.current?.onChunk?.(chunk, accumulated);
        };

        let fullText: string;
        if (aiProvider === "mistral" && mistralApiKey) {
          fullText = await mistral.generateWithCallback(
            {
              model,
              prompt,
              system,
              apiKey: mistralApiKey,
              signal: controller.signal,
            },
            onChunk,
          );
        } else {
          fullText = await ollama.generateWithCallback(
            { model, prompt, system, baseUrl, signal: controller.signal },
            onChunk,
          );
        }

        setGenerating(false);
        optionsRef.current?.onComplete?.(fullText);
        return fullText;
      } catch (e) {
        if ((e as Error).name === "AbortError") {
          setGenerating(false);
          return resultRef.current;
        }
        const errMsg = e instanceof Error ? e.message : "AI generation failed";
        setError(errMsg);
        setGenerating(false);
        optionsRef.current?.onError?.(errMsg);
        return "";
      }
    },
    [model, baseUrl, aiProvider, mistralApiKey],
  );

  // Callback - Cancel Generation
  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
  }, []);

  // Callback - Reset State
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setGenerating(false);
    setResult("");
    resultRef.current = "";
    setError(null);
  }, []);

  return {
    generating,
    result,
    error,
    ollamaAvailable,
    currentModel: model,
    generate,
    cancel,
    reset,
  };
}
