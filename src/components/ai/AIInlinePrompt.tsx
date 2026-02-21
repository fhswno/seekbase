"use client";

// REACT
import { useState, useCallback, useRef, useEffect } from "react";

// HOOKS
import { useAI } from "@/hooks/useAI";

// FRAMER MOTION
import { motion } from "framer-motion";

// LUCIDE
import { Sparkles, Loader2, X, ArrowRight } from "lucide-react";

// TYPESCRIPT
type Props = {
  onInsert: (text: string) => void;
  onDismiss: () => void;
};

const AIInlinePrompt = ({ onInsert, onDismiss }: Props) => {
  // States
  const [prompt, setPrompt] = useState<string>("");

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Hooks - AI
  const { generating, result, error, generate, cancel, reset } = useAI();

  // Effect - Auto-Focus Input when Prompt Opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Callback - Handle Prompt Submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim() || generating) return;

      reset();
      await generate(
        prompt,
        "You are a helpful writing assistant. Write content directly — no preamble, no explanations, just the requested content. Match the tone and style of the surrounding document.",
      );
    },
    [prompt, generating, generate, reset],
  );

  // Callback - Handle Key Down for Accepting or Dismissing Prompt
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (generating) {
          cancel();
        } else {
          onDismiss();
        }
      }
    },
    [generating, cancel, onDismiss],
  );

  // Callback - Handle Insert Action
  const handleInsert = useCallback(() => {
    if (result) {
      onInsert(result);
    }
  }, [result, onInsert]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="my-2 rounded-lg border border-ai/30 bg-surface shadow-lg shadow-ai/5"
    >
      {/* PROMPT INPUT */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-2"
      >
        <Sparkles size={14} className="flex-shrink-0 text-ai" />
        <input
          ref={inputRef}
          value={prompt}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPrompt(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Ask AI to write something..."
          disabled={generating}
          className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-faint disabled:opacity-50"
        />
        {!generating && !result && (
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text disabled:opacity-30"
          >
            <ArrowRight size={14} />
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-md p-1 text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
        >
          <X size={14} />
        </button>
      </form>

      {/* STREAMING RESULT */}
      {(generating || result || error) && (
        <div className="border-t border-border px-3 py-2">
          {error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : generating ? (
            <div className="text-sm text-text">
              {result ? (
                <div className="whitespace-pre-wrap">
                  {result}
                  <span className="inline-block h-3 w-0.5 animate-pulse bg-ai ml-0.5" />
                </div>
              ) : (
                <span className="flex items-center gap-1.5 text-text-muted">
                  <Loader2 size={12} className="animate-spin" />
                  Thinking...
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-text whitespace-pre-wrap">
              {result}
            </div>
          )}

          {/* INSERT ACTION */}
          {result && !generating && (
            <div className="mt-2 flex items-center gap-1">
              <button
                onClick={handleInsert}
                className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1 text-xs font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light"
              >
                <ArrowRight size={12} />
                Insert
              </button>
              <button
                onClick={() => {
                  reset();
                  setPrompt("");
                  inputRef.current?.focus();
                }}
                className="rounded-md px-3 py-1 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
              >
                Try again
              </button>
              <button
                onClick={onDismiss}
                className="rounded-md px-3 py-1 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
              >
                Discard
              </button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AIInlinePrompt;
