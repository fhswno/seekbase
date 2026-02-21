"use client";

// REACT
import { useState, useCallback, useRef, useEffect } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";

// COMPONENTS
import EmojiPicker from "../ui/EmojiPicker";

// CLSX
import clsx from "clsx";

// DB
import * as db from "@/lib/db";

// LUCIDE
import {
  ImagePlus,
  Smile,
  ChevronRight,
  Sparkles,
  Download,
} from "lucide-react";

// TYPES
import type { Page } from "@/types";

// TYPESCRIPT
type Props = {
  page: Page;
  onSummarize?: () => void;
};

const PageHeader = ({ page, onSummarize }: Props) => {
  // Store
  const { updatePage, getBreadcrumbs, setActivePageId } = usePagesStore();

  // States
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState<string>(page.title);
  const [showCoverHint, setShowCoverHint] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  // Refs
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Breadcrumbs
  const breadcrumbs: Page[] = getBreadcrumbs(page.id);

  // Effect - Sync Title with Store
  useEffect(() => {
    setTitleValue(page.title);
  }, [page.title]);

  // Effect - Auto-Resize Textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [titleValue]);

  // Callback - Handle Title Change
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setTitleValue(e.target.value);
    },
    [],
  );

  // Callback - Handle Title Blur (Save)
  const handleTitleBlur = useCallback(async () => {
    setIsEditingTitle(false);
    if (titleValue !== page.title) {
      await updatePage(page.id, { title: titleValue || "Untitled" });
    }
  }, [titleValue, page.id, page.title, updatePage]);

  // Callback - Handle Title Key Down (Save on Enter)
  const handleTitleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleTitleBlur();
      }
    },
    [handleTitleBlur],
  );

  // Callback - Handle Emoji Select
  const handleSelectEmoji = useCallback(
    async (emoji: string) => {
      await updatePage(page.id, { icon: emoji });
      setShowEmojiPicker(false);
    },
    [page.id, updatePage],
  );

  // Callback - Handle Remove Icon
  const handleRemoveIcon = useCallback(async () => {
    await updatePage(page.id, { icon: "" });
    setShowEmojiPicker(false);
  }, [page.id, updatePage]);

  // Helper - Format Timestamp
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="w-full">
      {/* COVER IMAGE */}
      {page.coverUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={page.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div
          className="h-4"
          onMouseEnter={() => setShowCoverHint(true)}
          onMouseLeave={() => setShowCoverHint(false)}
        >
          {showCoverHint && (
            <button className="flex items-center gap-1 px-4 py-1 text-xs text-text-faint transition-colors duration-[80ms] hover:text-text-muted">
              <ImagePlus size={12} />
              Add cover
            </button>
          )}
        </div>
      )}

      <div className="mx-auto max-w-3xl px-12 pt-8">
        {/* BREADCRUMBS */}
        {breadcrumbs.length > 1 && (
          <nav className="mb-4 flex items-center gap-1 text-sm text-text-muted">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1">
                {i > 0 && (
                  <ChevronRight size={12} className="text-text-faint" />
                )}
                <button
                  onClick={() => setActivePageId(crumb.id)}
                  className={clsx(
                    "rounded px-1 transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text",
                    i === breadcrumbs.length - 1 ? "text-text font-medium" : "",
                  )}
                >
                  {crumb.icon && <span className="mr-1">{crumb.icon}</span>}
                  {crumb.title || "Untitled"}
                </button>
              </span>
            ))}
          </nav>
        )}

        {/* ICON + TITLE */}
        <div className="flex items-start gap-1">
          {/* EMOJI */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="mt-1 flex-shrink-0 rounded-md p-1 text-3xl transition-colors duration-[80ms] hover:bg-surface-2"
              title="Change icon"
            >
              {page.icon || <Smile size={32} className="text-text-faint" />}
            </button>
            {showEmojiPicker && (
              <div className="absolute left-0 top-full z-30 mt-1">
                <EmojiPicker
                  onSelect={handleSelectEmoji}
                  onRemove={handleRemoveIcon}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>
        </div>

        {/* TITLE */}
        <textarea
          ref={titleRef}
          value={titleValue}
          onChange={handleTitleChange}
          onBlur={handleTitleBlur}
          onKeyDown={handleTitleKeyDown}
          onFocus={() => setIsEditingTitle(true)}
          placeholder="Untitled"
          className="mt-2 w-full resize-none bg-transparent font-display text-4xl font-bold leading-tight text-text outline-none placeholder:text-text-faint"
          rows={1}
        />

        {/* METADATA & SUMMARIZE */}
        <div className="mt-1 flex items-center gap-3 text-xs text-text-faint">
          <span>Created {formatDate(page.createdAt)}</span>
          {page.updatedAt !== page.createdAt && (
            <span>Edited {formatDate(page.updatedAt)}</span>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => {
                db.printPage().catch(() => {});
              }}
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
              title="Export PDF"
            >
              <Download size={12} />
              <span>PDF</span>
            </button>
            {onSummarize && (
              <button
                onClick={onSummarize}
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-ai transition-colors duration-[80ms] hover:bg-ai/10"
              >
                <Sparkles size={12} />
                <span>Summarize</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
