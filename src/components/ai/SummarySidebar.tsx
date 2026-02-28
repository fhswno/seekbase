"use client";

// REACT
import { useCallback, useState, useEffect, useRef } from "react";

// COMPONENTS
import SummaryContent from "./SummaryContent";
import OllamaOffline from "./offline/OllamaOffline";
import NoModelSelected from "./empty/NoModelSelected";

// HOOKS
import { useAI } from "@/hooks/useAI";

// FRAMER MOTION
import { motion } from "framer-motion";

// DATA
import { SUMMARY_SYSTEM_PROMPT } from "@/data/prompts";

// LUCIDE
import {
  X,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";

// CONSTANTS
const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 520;
const SIDEBAR_DEFAULT = 300;

// TYPESCRIPT
type Props = {
  pageContent: string;
  onClose: () => void;
};

const SummarySidebar = ({ pageContent, onClose }: Props) => {
  // States
  const [width, setWidth] = useState<number>(SIDEBAR_DEFAULT);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const {
    generating,
    result,
    error,
    ollamaAvailable,
    currentModel,
    generate,
    reset,
  } = useAI();

  // Refs
  const hasStarted = useRef(false);

  // Callback - Generate Summary
  const handleGenerate = useCallback(async () => {
    reset();
    await generate(
      `Summarize the following page content:\n\n${pageContent}`,
      SUMMARY_SYSTEM_PROMPT,
    );
  }, [pageContent, generate, reset]);

  // Effect - Auto-Generate on Mount, if Ollama is available
  useEffect(() => {
    if (!hasStarted.current && ollamaAvailable && currentModel) {
      hasStarted.current = true;
      handleGenerate();
    }
  }, [ollamaAvailable, currentModel, handleGenerate]);

  // Callback - Handle Copy to Clipboard
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  // Handler - Resize
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX: number = e.clientX;
      const startWidth: number = width;

      function onMouseMove(e: MouseEvent) {
        // Dragging left increases width (panel is on the right)
        const delta: number = startX - e.clientX;
        const newWidth: number = Math.min(
          SIDEBAR_MAX,
          Math.max(SIDEBAR_MIN, startWidth + delta),
        );
        setWidth(newWidth);
      }

      function onMouseUp() {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [width],
  );

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={isResizing ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
      className="relative h-full flex-shrink-0 overflow-hidden border-l border-border bg-surface"
    >
      {/* RESIZE HANDLE */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-accent/30 active:bg-accent/50"
        onMouseDown={handleResizeStart}
        style={{
          transition: isResizing ? "none" : "background-color 80ms",
        }}
      />

      <div className="flex h-full flex-col" style={{ width }}>
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text">AI Summary</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
          >
            <X size={14} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {!ollamaAvailable ? (
            <OllamaOffline />
          ) : !currentModel ? (
            <NoModelSelected />
          ) : error ? (
            <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-400">
              <div className="flex items-center gap-1.5 font-medium">
                <AlertCircle size={14} />
                Error
              </div>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          ) : generating ? (
            <div className="text-sm text-text leading-relaxed">
              {result ? (
                <SummaryContent text={result} />
              ) : (
                <div className="flex items-center gap-2 text-text-muted">
                  <Loader2 size={14} className="animate-spin" />
                  Analyzing page...
                </div>
              )}
              {result && (
                <span className="inline-block h-3 w-0.5 animate-pulse bg-ai ml-0.5" />
              )}
            </div>
          ) : result ? (
            <SummaryContent text={result} />
          ) : (
            <div className="text-center text-sm text-text-muted">
              <p>Click Regenerate to generate a summary.</p>
            </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex items-center justify-center gap-1 border-t border-border px-3 py-2">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text disabled:opacity-50"
          >
            <RefreshCw size={12} className={generating ? "animate-spin" : ""} />
            Regenerate
          </button>
          {result && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SummarySidebar;
