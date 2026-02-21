"use client";

// REACT
import { useState, useCallback, useMemo } from "react";

// COMPONENTS
import WorkspaceIcon from "./WorkspaceIcon";

// CLSX
import clsx from "clsx";

// DATA
import { LUCIDE_ICON_MAP } from "@/data/icon";
import { EMOJI_GRID } from "@/data/emoji";

// LUCIDE
import { Upload, Search } from "lucide-react";

// TYPESCRIPT
type Props = {
  currentIcon: string | null;
  onSelectIcon: (icon: string) => void;
  onUploadImage?: (filePath: string) => void;
};

type Tab = "emoji" | "icons" | "upload";

const IconPicker = ({ currentIcon, onSelectIcon, onUploadImage }: Props) => {
  const [tab, setTab] = useState<Tab>("emoji");
  const [iconSearch, setIconSearch] = useState("");

  const filteredIcons = useMemo(() => {
    const entries = Object.entries(LUCIDE_ICON_MAP);
    if (!iconSearch.trim()) return entries;
    const q = iconSearch.toLowerCase();
    return entries.filter(([name]) => name.includes(q));
  }, [iconSearch]);

  const handleUpload = useCallback(async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: false,
        filters: [
          { name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "svg"] },
        ],
      });
      if (selected && typeof selected === "string") {
        onUploadImage?.(selected);
      }
    } catch {
      // Dialog cancelled or Tauri not available
    }
  }, [onUploadImage]);

  return (
    <div className="w-64">
      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["emoji", "icons", "upload"] as Tab[]).map(
          (t: Tab, index: number) => (
            <button
              key={index}
              onClick={() => setTab(t)}
              className={clsx(
                "flex-1 px-2 py-1.5 text-xs font-medium capitalize transition-colors duration-[80ms]",
                tab === t
                  ? "border-b-2 border-accent text-text"
                  : "text-text-muted hover:text-text",
              )}
            >
              {t}
            </button>
          ),
        )}
      </div>

      {/* CONTENT */}
      <div className="p-2">
        {tab === "emoji" && (
          <div className="grid grid-cols-8 gap-0.5">
            {EMOJI_GRID.map((emoji: string, index: number) => (
              <button
                key={index}
                onClick={() => onSelectIcon(emoji)}
                className={clsx(
                  "rounded-md p-1.5 text-lg transition-colors duration-[80ms]",
                  currentIcon === emoji
                    ? "bg-accent/20 ring-1 ring-accent"
                    : "hover:bg-surface-2",
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {tab === "icons" && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 rounded-md border border-border bg-bg px-2 py-1">
              <Search size={12} className="text-text-faint" />
              <input
                value={iconSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setIconSearch(e.target.value)
                }
                placeholder="Search icons..."
                className="flex-1 bg-transparent text-xs text-text outline-none placeholder:text-text-faint"
              />
            </div>
            <div className="grid max-h-48 grid-cols-8 gap-0.5 overflow-y-auto">
              {filteredIcons.map(([name, Icon]) => (
                <button
                  key={name}
                  onClick={() => onSelectIcon(`lucide:${name}`)}
                  title={name}
                  className={clsx(
                    "flex items-center justify-center rounded-md p-1.5 transition-colors duration-[80ms]",
                    currentIcon === `lucide:${name}`
                      ? "bg-accent/20 ring-1 ring-accent"
                      : "hover:bg-surface-2",
                  )}
                >
                  <Icon size={16} className="text-text-muted" />
                </button>
              ))}
              {filteredIcons.length === 0 && (
                <p className="col-span-8 py-2 text-center text-xs text-text-faint">
                  No icons found
                </p>
              )}
            </div>
          </div>
        )}

        {/* UPLOAD TAB */}
        {tab === "upload" && (
          <div className="flex flex-col items-center gap-3 py-4">
            {currentIcon?.startsWith("image:") && (
              <div className="mb-2">
                <WorkspaceIcon icon={currentIcon} size={48} />
              </div>
            )}
            <button
              onClick={handleUpload}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            >
              <Upload size={14} />
              Choose image
            </button>
            <p className="text-xs text-text-faint">PNG, JPG, WebP, or SVG</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IconPicker;
