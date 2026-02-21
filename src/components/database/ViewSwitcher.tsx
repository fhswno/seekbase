"use client";

// REACT
import { useState } from "react";

// STORES
import { useDatabaseStore } from "@/stores/database";

// DATA
import { DATABASE_VIEW_LABELS, DATABASE_VIEW_ICONS } from "@/data/database";

// CLSX
import clsx from "clsx";

// LUCIDE
import { Plus } from "lucide-react";

// TYPES
import type { DatabaseView, DatabaseViewType } from "@/types";

const ViewSwitcher = () => {
  // Store
  const { views, activeViewId, setActiveView, addView } = useDatabaseStore();

  // States
  const [showAddMenu, setShowAddMenu] = useState<boolean>(false);

  // Handler - Add New View
  const handleAddView = async (type: DatabaseViewType) => {
    await addView(`${DATABASE_VIEW_ICONS[type]} view`, type);
    setShowAddMenu(false);
  };

  return (
    <div className="flex items-center gap-0.5 border-b border-border px-4">
      {views.map((view: DatabaseView, index: number) => (
        <button
          key={index}
          onClick={() => setActiveView(view.id)}
          className={clsx(
            "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm transition-colors duration-[80ms]",
            view.id === activeViewId
              ? "border-accent text-text"
              : "border-transparent text-text-muted hover:text-text",
          )}
        >
          {DATABASE_VIEW_ICONS[view.type as DatabaseViewType]}
          {view.name}
        </button>
      ))}

      {/* ADD VIEW BUTTON */}
      <div className="relative">
        <button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-1 border-b-2 border-transparent px-2 py-2 text-sm text-text-faint transition-colors duration-[80ms] hover:text-text-muted"
        >
          <Plus size={14} />
        </button>

        {showAddMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowAddMenu(false)}
            />
            <div className="absolute left-0 top-full z-30 mt-1 min-w-[160px] rounded-md border border-border bg-surface p-1 shadow-lg">
              {(Object.keys(DATABASE_VIEW_LABELS) as DatabaseViewType[]).map(
                (type: DatabaseViewType, index: number) => (
                  <button
                    key={index}
                    className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                    onClick={() => handleAddView(type)}
                  >
                    {DATABASE_VIEW_ICONS[type]}
                    {DATABASE_VIEW_LABELS[type]}
                  </button>
                ),
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewSwitcher;
