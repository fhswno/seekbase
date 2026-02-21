"use client";

// REACT
import { useState, useCallback, useMemo, useRef, useEffect } from "react";

// DATA
import { EMOJI_CATEGORIES } from "@/data/emoji";

// LUCIDE
import { Search, X } from "lucide-react";
import { EmojiCategory, EmojiEntry } from "@/types/emoji";

// TYPESCRIPT
type Props = {
  onSelect: (emoji: string) => void;
  onRemove?: () => void;
  onClose: () => void;
};

const EmojiPicker = ({ onSelect, onRemove, onClose }: Props) => {
  // States
  const [search, setSearch] = useState<string>("");

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Effect - Focus Search Input on Mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Effect - Close on Click Outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Memo - Search Results
  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q: string = search.toLowerCase();
    const results: string[] = [];
    for (const cat of EMOJI_CATEGORIES) {
      for (const entry of cat.emojis) {
        if (entry.keywords.includes(q) || cat.name.toLowerCase().includes(q)) {
          results.push(entry.emoji);
        }
      }
    }
    return results;
  }, [search]);

  // Callback - Handle Emoji Select
  const handleSelect = useCallback(
    (emoji: string) => {
      onSelect(emoji);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <div
      ref={pickerRef}
      className="w-72 rounded-lg border border-border bg-surface shadow-lg"
    >
      {/* Search */}
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Search size={14} className="flex-shrink-0 text-text-faint" />
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-text-faint hover:text-text-muted"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* REMOVE OPTION */}
      {onRemove && (
        <button
          onClick={() => {
            onRemove();
            onClose();
          }}
          className="flex w-full items-center gap-2 border-b border-border px-3 py-1.5 text-xs text-text-muted transition-colors duration-[80ms] hover:bg-surface-2"
        >
          <X size={12} />
          Remove icon
        </button>
      )}

      {/* EMOJI GRID */}
      <div className="max-h-64 overflow-y-auto p-2">
        {searchResults !== null ? (
          searchResults.length > 0 ? (
            <div className="grid grid-cols-8 gap-0.5">
              {searchResults.map((emoji: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleSelect(emoji)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors duration-[80ms] hover:bg-surface-2"
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-text-faint">
              No emojis found
            </p>
          )
        ) : (
          EMOJI_CATEGORIES.map((cat: EmojiCategory, index: number) => (
            <div key={index} className="mb-3">
              <p className="mb-1 px-1 text-[10px] font-medium uppercase tracking-wider text-text-faint">
                {cat.name}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {cat.emojis.map((entry: EmojiEntry, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(entry.emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors duration-[80ms] hover:bg-surface-2"
                  >
                    {entry.emoji}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;
