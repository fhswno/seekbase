"use client";

// REACT
import React, { useState, useEffect, useCallback } from "react";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// LUCIDE
import { Trash2, RotateCcw, X, AlertTriangle, FileText } from "lucide-react";

// STORE
import { useWorkspaceStore } from "@/stores/workspace";
import { usePagesStore } from "@/stores/pages";

// DB
import * as db from "@/lib/db";

// TYPES
import { Page } from "@/types";

// TYPESCRIPT
type Props = {
  open: boolean;
  onClose: () => void;
};

const TrashPanel = ({ open, onClose }: Props) => {
  // States
  const [deletedPages, setDeletedPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Stores
  const { activeWorkspaceId } = useWorkspaceStore();
  const { restorePage } = usePagesStore();

  // Effect - Load Deleted Pages
  useEffect(() => {
    if (!open || !activeWorkspaceId) return;

    setLoading(true);
    db.getDeletedPages(activeWorkspaceId)
      .then(setDeletedPages)
      .catch(() => setDeletedPages([]))
      .finally(() => setLoading(false));
  }, [open, activeWorkspaceId]);

  // Callback - Restore Page
  const handleRestore = useCallback(
    async (pageId: string) => {
      await restorePage(pageId);
      setDeletedPages((prev) => prev.filter((p) => p.id !== pageId));
    },
    [restorePage],
  );

  // Callback - Permanently Delete Page
  const handlePermanentDelete = useCallback(async (pageId: string) => {
    await db.permanentlyDeletePage(pageId);
    setDeletedPages((prev: Page[]) =>
      prev.filter((p: Page) => p.id !== pageId),
    );
    setConfirmDelete(null);
  }, []);

  // Handler - Format Deleted Date
  const formatDeletedDate = (ts: number | null) => {
    if (!ts) return "";
    const date: Date = new Date(ts);
    const now: Date = new Date();
    const diffMs: number = now.getTime() - date.getTime();
    const diffDays: number = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Effect - Close on Escape Key
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* BACKDROP */}
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* PANEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-bg shadow-2xl"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            e.stopPropagation()
          }
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Trash2 size={16} className="text-text-muted" />
              <h2 className="text-sm font-semibold text-text">Trash</h2>
              <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-faint">
                {deletedPages.length}
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            >
              <X size={14} />
            </button>
          </div>

          {/* CONTENT */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center text-sm text-text-faint">
                Loading...
              </div>
            ) : deletedPages.length === 0 ? (
              <div className="py-12 text-center">
                <Trash2 size={32} className="mx-auto text-text-faint" />
                <p className="mt-2 text-sm text-text-faint">Trash is empty</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {deletedPages.map((page: Page, index: number) => (
                  <div
                    key={index}
                    className="group flex items-center gap-3 px-4 py-2.5"
                  >
                    <span className="flex-shrink-0 text-base">
                      {page.icon || (
                        <FileText size={16} className="text-text-faint" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text-muted">
                        {page.title || "Untitled"}
                      </p>
                      <p className="text-xs text-text-faint">
                        Deleted {formatDeletedDate(page.deletedAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity duration-[80ms] group-hover:opacity-100">
                      <button
                        onClick={() => handleRestore(page.id)}
                        className="rounded-md p-1.5 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                        title="Restore"
                      >
                        <RotateCcw size={14} />
                      </button>
                      {confirmDelete === page.id ? (
                        <button
                          onClick={() => handlePermanentDelete(page.id)}
                          className="rounded-md bg-red-500/20 px-2 py-1 text-[11px] text-red-400 transition-colors duration-[80ms] hover:bg-red-500/30"
                        >
                          Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(page.id)}
                          className="rounded-md p-1.5 text-text-faint transition-colors duration-[80ms] hover:bg-red-500/10 hover:text-red-400"
                          title="Delete permanently"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          {deletedPages.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <p className="text-[11px] text-text-faint">
                <AlertTriangle size={10} className="mr-1 inline" />
                Items are automatically deleted after 30 days
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrashPanel;
