"use client";

// REACT
import { useState, useCallback, useRef, useEffect, useMemo } from "react";

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
  Replace,
  Trash2,
  ArrowUpDown,
  Check,
} from "lucide-react";

// TYPES
import type { Page } from "@/types";

// TYPESCRIPT
type Props = {
  page: Page;
  onSummarize?: () => void;
};

// HELPERS
function parseCoverUrl(coverUrl: string | null): {
  src: string;
  position: string;
} {
  if (!coverUrl) return { src: "", position: "center" };
  const parts = coverUrl.split("::");
  return { src: parts[0], position: parts[1] || "center" };
}

function buildCoverUrl(src: string, position: string): string {
  if (position === "center") return src;
  return `${src}::${position}`;
}

const POSITION_OPTIONS: { value: string; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
];

const PageHeader = ({ page, onSummarize }: Props) => {
  // Store
  const { updatePage, getBreadcrumbs, setActivePageId } = usePagesStore();

  // Parse cover
  const { src: coverSrc, position: coverPosition } = useMemo(
    () => parseCoverUrl(page.coverUrl),
    [page.coverUrl],
  );

  // States
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleValue, setTitleValue] = useState<string>(page.title);
  const [coverHover, setCoverHover] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const [repositioning, setRepositioning] = useState<boolean>(false);

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

  // Effect - Reset repositioning when page changes
  useEffect(() => {
    setRepositioning(false);
  }, [page.id]);

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

  // Callback - Add/Change Cover
  const handleAddCover = useCallback(async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "webp"] },
        ],
      });
      if (selected && typeof selected === "string") {
        const savedPath = await db.saveEditorImage(selected);
        const { convertFileSrc } = await import("@tauri-apps/api/core");
        const url = convertFileSrc(savedPath);
        await updatePage(page.id, { coverUrl: url });
      }
    } catch {
      // Dialog cancelled or Tauri not available
    }
  }, [page.id, updatePage]);

  // Callback - Remove Cover
  const handleRemoveCover = useCallback(async () => {
    await updatePage(page.id, { coverUrl: "" });
    setRepositioning(false);
  }, [page.id, updatePage]);

  // Callback - Set Cover Position
  const handleSetPosition = useCallback(
    async (position: string) => {
      await updatePage(page.id, {
        coverUrl: buildCoverUrl(coverSrc, position),
      });
    },
    [page.id, coverSrc, updatePage],
  );

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
      {coverSrc ? (
        <div
          className="group relative h-48 w-full overflow-hidden"
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => {
            setCoverHover(false);
          }}
        >
          <img
            src={coverSrc}
            alt=""
            className="h-full w-full object-cover transition-[object-position] duration-300"
            style={{ objectPosition: coverPosition }}
          />

          {/* REPOSITION MODE */}
          {repositioning && (
            <div className="absolute inset-x-0 top-0 flex items-center justify-center gap-2 bg-black/40 py-2">
              {POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSetPosition(opt.value)}
                  className={clsx(
                    "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-[80ms]",
                    coverPosition === opt.value
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {coverPosition === opt.value && <Check size={12} />}
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setRepositioning(false)}
                className="ml-2 rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium text-white transition-colors duration-[80ms] hover:bg-white/30"
              >
                Done
              </button>
            </div>
          )}

          {/* COVER CONTROLS */}
          {!repositioning && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <button
                onClick={handleAddCover}
                className="flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors duration-[80ms] hover:bg-black/70 hover:text-white"
              >
                <Replace size={12} />
                Change
              </button>
              <button
                onClick={() => setRepositioning(true)}
                className="flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors duration-[80ms] hover:bg-black/70 hover:text-white"
              >
                <ArrowUpDown size={12} />
                Reposition
              </button>
              <button
                onClick={handleRemoveCover}
                className="flex items-center gap-1.5 rounded-md bg-black/50 px-2.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-colors duration-[80ms] hover:bg-black/70 hover:text-white"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="relative h-[150px] cursor-pointer"
          onMouseEnter={() => setCoverHover(true)}
          onMouseLeave={() => setCoverHover(false)}
          onClick={handleAddCover}
        >
          {/* GRADIENT OVERLAY */}
          <div
            className={clsx(
              "absolute inset-0 bg-gradient-to-r from-surface-2/60 via-surface-2/30 to-transparent transition-opacity duration-200",
              coverHover ? "opacity-100" : "opacity-0",
            )}
          />

          {/* ADD COVER LABEL */}
          <div
            className={clsx(
              "absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-200",
              coverHover ? "opacity-100" : "opacity-0",
            )}
          >
            <ImagePlus size={16} className="text-text-faint" />
            <span className="text-sm text-text-faint">Add cover</span>
          </div>
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
                className="flex items-center gap-1 rounded-md px-2 py-0.5 text-ai transition-colors duration-[80ms] hover:bg-blue-500/10"
              >
                <span>AI Summary</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
