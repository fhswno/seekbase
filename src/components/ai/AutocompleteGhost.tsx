"use client";

// REACT
import { useState, useEffect, useRef, useCallback } from "react";

// STORES
import { useSettingsStore } from "@/stores/settings";

// OLLAMA
import * as ollama from "@/lib/ollama";

// TYPESCRIPT
type Props = {
  editorElement: HTMLElement | null;
  getContext: () => string;
  onAccept: (text: string) => void;
  editorFocused: boolean;
};

const AutocompleteGhost = ({
  editorElement,
  getContext,
  onAccept,
  editorFocused,
}: Props) => {
  // States
  const [suggestion, setSuggestion] = useState<string>("");
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Refs
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContextRef = useRef("");

  // Store
  const { getSetting } = useSettingsStore();

  // Settings
  const baseUrl = getSetting("ollama_base_url") ?? "http://localhost:11434";
  const model = getSetting("ollama_model") ?? null;
  const autocompleteEnabled = getSetting("autocomplete_enabled") !== "false";

  // Delay - Autocomplete
  const autocompleteDelay = parseInt(
    getSetting("autocomplete_delay") ?? "1000",
    10,
  );

  // Callback - Fetch Suggestion from Ollama
  const fetchSuggestion = useCallback(async () => {
    if (!model || !autocompleteEnabled) return;

    const context = getContext();
    if (!context.trim() || context === lastContextRef.current) return;
    lastContextRef.current = context;

    // Cancel any previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const result = await ollama.generateComplete({
        model,
        prompt: `Continue writing the following text naturally. Only output the continuation (1-2 sentences max), nothing else:\n\n${context}`,
        system:
          "You are an autocomplete assistant. Continue the text naturally and concisely. Output ONLY the continuation text, no quotes, no explanation.",
        baseUrl,
        signal: controller.signal,
      });

      if (!controller.signal.aborted && result.trim()) {
        setSuggestion(result.trim());
        updatePosition();
      }
    } catch {
      // Silently fail — autocomplete is non-critical
    }
  }, [model, baseUrl, autocompleteEnabled, getContext]);

  // Callback - Update position of the Suggestion Ghost
  const updatePosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (rect.width === 0 && rect.height > 0) {
      setPosition({ top: rect.top, left: rect.left });
    }
  }, []);

  // Callback - Handle Input in the Editor
  const handleInput = useCallback(() => {
    setSuggestion("");
    setPosition(null);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (!autocompleteEnabled || !model) return;

    timerRef.current = setTimeout(() => {
      fetchSuggestion();
    }, autocompleteDelay);
  }, [autocompleteEnabled, autocompleteDelay, model, fetchSuggestion]);

  // Callback - Handle Key Down for Accepting or Dismissing Suggestion
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!suggestion) return;

      if (e.key === "Tab") {
        e.preventDefault();
        onAccept(suggestion);
        setSuggestion("");
        setPosition(null);
      } else if (e.key === "Escape") {
        setSuggestion("");
        setPosition(null);
      } else {
        // Any other key dismisses the suggestion
        setSuggestion("");
        setPosition(null);
      }
    },
    [suggestion, onAccept],
  );

  // Effect - Attach Input and Keydown Listeners to the Editor
  useEffect(() => {
    if (!editorElement || !editorFocused) return;

    editorElement.addEventListener("input", handleInput);
    editorElement.addEventListener("keydown", handleKeyDown);

    return () => {
      editorElement.removeEventListener("input", handleInput);
      editorElement.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
      abortRef.current?.abort();
    };
  }, [editorElement, editorFocused, handleInput, handleKeyDown]);

  // Effect - Clear suggestion when Editor Loses Focus
  useEffect(() => {
    if (!editorFocused) {
      setSuggestion("");
      setPosition(null);
    }
  }, [editorFocused]);

  if (!suggestion || !position || !autocompleteEnabled) return null;

  return (
    <span
      className="pointer-events-none fixed z-40 text-text-faint/50 italic"
      style={{
        top: position.top,
        left: position.left,
        fontSize: "inherit",
        lineHeight: "inherit",
        fontFamily: "inherit",
      }}
    >
      {suggestion}
    </span>
  );
};

export default AutocompleteGhost;
