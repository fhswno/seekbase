"use client";

// REACT
import React, { useState, useCallback, useEffect, useRef } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";
import { useWorkspaceStore } from "@/stores/workspace";

// COMPONENTS
import SearchResultItem from "./SearchResultItem";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// DB
import * as db from "@/lib/db";

// LUCIDE
import { Search, FileText, Loader2 } from "lucide-react";

// TYPES
import type { Page, SearchResult } from "@/types";

// TYPESCRIPT
type Props = {
  open: boolean;
  onClose: () => void;
};

const SearchPalette = ({ open, onClose }: Props) => {
  // States
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searching, setSearching] = useState<boolean>(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Store
  const { activeWorkspaceId } = useWorkspaceStore();
  const { pages, setActivePageId } = usePagesStore();

  // Computed - Recent Pages (sorted by updatedAt desc, limited to 8)
  const recentPages = [...pages]
    .sort((a: Page, b: Page) => b.updatedAt - a.updatedAt)
    .slice(0, 8);

  // Effect - Focus Input when Opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Callback - Handle Search with Debounce
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(0);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      debounceRef.current = setTimeout(async () => {
        if (!activeWorkspaceId) return;
        try {
          const searchResults = await db.search(activeWorkspaceId, value);
          setResults(searchResults);
        } catch {
          setResults([]);
        }
        setSearching(false);
      }, 150);
    },
    [activeWorkspaceId],
  );

  // Callback - Navigate to Selected Page
  const handleSelect = useCallback(
    (pageId: string) => {
      setActivePageId(pageId);
      onClose();
    },
    [setActivePageId, onClose],
  );

  // Callback - Keyboard Navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items: SearchResult[] | Page[] = query.trim()
        ? results
        : recentPages;
      const maxIndex: number = items.length - 1;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (query.trim() && results[selectedIndex]) {
          handleSelect(results[selectedIndex].pageId);
        } else if (!query.trim() && recentPages[selectedIndex]) {
          handleSelect(recentPages[selectedIndex].id);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [query, results, recentPages, selectedIndex, handleSelect, onClose],
  );

  // Case - Palette Closed
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={onClose}
      >
        {/* BACKDROP */}
        <div className="absolute inset-0 bg-black/50" />

        {/* PALETTE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            e.stopPropagation()
          }
        >
          {/* SEARCH INPUT */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search size={18} className="flex-shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearch(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Search pages..."
              className="flex-1 bg-transparent text-sm text-text outline-none placeholder:text-text-faint"
            />
            {searching && (
              <Loader2 size={14} className="animate-spin text-text-faint" />
            )}
            <kbd className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-faint">
              ESC
            </kbd>
          </div>

          {/* RESULTS */}
          <div className="max-h-80 overflow-y-auto py-1">
            {query.trim() ? (
              results.length > 0 ? (
                results.map((result: SearchResult, i: number) => (
                  <SearchResultItem
                    key={`${result.pageId}-${result.blockId}`}
                    icon={result.pageIcon}
                    title={result.pageTitle}
                    snippet={result.content}
                    selected={i === selectedIndex}
                    onClick={() => handleSelect(result.pageId)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  />
                ))
              ) : !searching ? (
                <div className="px-4 py-8 text-center text-sm text-text-faint">
                  No results found
                </div>
              ) : null
            ) : (
              <>
                {recentPages.length > 0 && (
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-medium uppercase tracking-wider text-text-faint">
                      Recent pages
                    </span>
                  </div>
                )}
                {recentPages.map((page: Page, i: number) => (
                  <SearchResultItem
                    key={page.id}
                    icon={page.icon}
                    title={page.title}
                    selected={i === selectedIndex}
                    onClick={() => handleSelect(page.id)}
                    onMouseEnter={() => setSelectedIndex(i)}
                  />
                ))}
                {recentPages.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm text-text-faint">
                    No pages yet
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchPalette;
