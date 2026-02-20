"use client";

// REACT
import { useMemo } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";

// CLSX
import clsx from "clsx";

// TYPES
import { Page } from "@/types";

const FavoritesList = () => {
  // Stores
  const pages = usePagesStore((s) => s.pages);
  const activePageId = usePagesStore((s) => s.activePageId);
  const setActivePageId = usePagesStore((s) => s.setActivePageId);

  // Memo - Favorites List
  const favorites = useMemo(
    () => pages.filter((p: Page) => p.isFavorite),
    [pages],
  );

  return (
    <div className="px-1">
      {favorites.map((page) => {
        const isActive = activePageId === page.id;
        return (
          <button
            key={page.id}
            onClick={() => setActivePageId(page.id)}
            className={clsx(
              "flex w-full items-center gap-2 rounded-md px-3 py-1 text-sm transition-colors duration-[80ms]",
              isActive
                ? "bg-surface-2 text-text border-l-2 border-accent"
                : "text-text-muted hover:bg-surface-2 hover:text-text border-l-2 border-transparent",
            )}
          >
            <span className="flex-shrink-0 text-sm">{page.icon || ""}</span>
            <span className="truncate">{page.title || "Untitled"}</span>
          </button>
        );
      })}
    </div>
  );
};

export default FavoritesList;
