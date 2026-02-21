"use client";

// REACT
import { useState, useCallback, useRef } from "react";

// HOOKS
import { useAI } from "@/hooks/useAI";

// COMPONENTS
import AIToolbarButton from "./buttons/AIToolbarButton";
import AIResultButton from "./buttons/AIResultButton";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// DATA
import { ACTION_PROMPTS } from "@/data/ai";

// LUCIDE
import {
  Sparkles,
  RefreshCw,
  MessageSquare,
  Languages,
  Copy,
  Check,
  ArrowDown,
  X,
  Loader2,
} from "lucide-react";

// TYPES
import { AIAction, AI_LANGUAGES } from "@/types/ai";

// TYPESCRIPT
type Props = {
  selectedText: string;
  position: { top: number; left: number } | null;
  onReplace?: (newText: string) => void;
  onInsertBelow?: (text: string) => void;
  onDismiss: () => void;
};

const AITextToolbar = ({
  selectedText,
  position,
  onReplace,
  onInsertBelow,
  onDismiss,
}: Props) => {
  // States
  const [activeAction, setActiveAction] = useState<AIAction | null>(null);
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Hooks - AI
  const { generating, result, error, generate, reset } = useAI();

  // Refs
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Callback - Handle Action Selection
  const handleAction = useCallback(
    async (action: AIAction, language?: string) => {
      setActiveAction(action);
      setShowLanguagePicker(false);
      const prompt = ACTION_PROMPTS[action](selectedText, language);
      await generate(
        prompt,
        "You are a helpful writing assistant. Be concise and direct.",
      );
    },
    [selectedText, generate],
  );

  // Callback - Handle Translate Click
  const handleTranslateClick = useCallback(() => {
    setShowLanguagePicker(true);
  }, []);

  // Callback - Handle Copy Result
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  // Callback - Handle Discard Action
  const handleDiscard = useCallback(() => {
    reset();
    setActiveAction(null);
    onDismiss();
  }, [reset, onDismiss]);

  // Case - No Position or Text
  if (!position || !selectedText) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={toolbarRef}
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50"
        style={{
          top: position.top,
          left: Math.max(8, position.left),
        }}
      >
        {/* ACTION BUTTONS */}
        {!activeAction && (
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-lg">
            <AIToolbarButton
              icon={<Sparkles size={14} />}
              label="Summarize"
              onClick={() => handleAction("summarize")}
            />
            <AIToolbarButton
              icon={<RefreshCw size={14} />}
              label="Rewrite"
              onClick={() => handleAction("rewrite")}
            />
            <AIToolbarButton
              icon={<MessageSquare size={14} />}
              label="Explain"
              onClick={() => handleAction("explain")}
            />
            <div className="relative">
              <AIToolbarButton
                icon={<Languages size={14} />}
                label="Translate"
                onClick={handleTranslateClick}
              />
              {showLanguagePicker && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowLanguagePicker(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-lg">
                    {AI_LANGUAGES.map((lang: string, index: number) => (
                      <button
                        key={lang}
                        className="flex w-full items-center px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text rounded"
                        onClick={() => handleAction("translate", lang)}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* RESULT PANEL */}
        {activeAction && (
          <div className="w-80 rounded-lg border border-border bg-surface shadow-lg">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <div className="flex items-center gap-1.5 text-xs text-ai">
                <Sparkles size={12} />
                <span className="font-medium capitalize">{activeAction}</span>
              </div>
              <button
                onClick={handleDiscard}
                className="rounded p-0.5 text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
              >
                <X size={14} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="max-h-48 overflow-y-auto px-3 py-2">
              {error ? (
                <p className="text-sm text-red-400">{error}</p>
              ) : generating ? (
                <div className="text-sm text-text">
                  {result || (
                    <span className="flex items-center gap-1.5 text-text-muted">
                      <Loader2 size={12} className="animate-spin" />
                      Generating...
                    </span>
                  )}
                  {result && (
                    <span className="inline-block h-3 w-0.5 animate-pulse bg-ai ml-0.5" />
                  )}
                </div>
              ) : (
                <p className="text-sm text-text whitespace-pre-wrap">
                  {result}
                </p>
              )}
            </div>

            {/* ACTIONS */}
            {result && !generating && (
              <div className="flex items-center gap-1 border-t border-border px-2 py-1.5">
                {onReplace && (
                  <AIResultButton
                    icon={<RefreshCw size={12} />}
                    label="Replace"
                    onClick={() => {
                      onReplace(result);
                      handleDiscard();
                    }}
                  />
                )}
                {onInsertBelow && (
                  <AIResultButton
                    icon={<ArrowDown size={12} />}
                    label="Insert below"
                    onClick={() => {
                      onInsertBelow(result);
                      handleDiscard();
                    }}
                  />
                )}
                <AIResultButton
                  icon={copied ? <Check size={12} /> : <Copy size={12} />}
                  label={copied ? "Copied" : "Copy"}
                  onClick={handleCopy}
                />
                <AIResultButton
                  icon={<X size={12} />}
                  label="Discard"
                  onClick={handleDiscard}
                />
              </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AITextToolbar;
