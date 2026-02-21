"use client";

// STORE
import { useDatabaseStore } from "@/stores/database";

// LUCIDE
import { Plus } from "lucide-react";

// TYPES
import {
  DatabaseCell,
  DatabaseProperty,
  DatabaseRow,
  PropertyType,
} from "@/types";

const ListView = () => {
  // Store
  const { properties, getFilteredSortedRows, cells, addRow } =
    useDatabaseStore();

  // Filtered Sorted Rows
  const rows = getFilteredSortedRows();

  // Find - Title Property
  const titleProp = properties.find((p: DatabaseProperty) => p.type === "text");
  const visibleProps = properties
    .filter(
      (p: DatabaseProperty) =>
        p.type !== "text" && p.type !== "created_at" && p.type !== "updated_at",
    )
    .slice(0, 3); // Show up to 3 inline properties

  // Handler - Format Cell Value for Display
  const formatCellDisplay = (value: string, type: PropertyType): string => {
    if (!value || value === "{}") return "";
    switch (type) {
      case "date": {
        const ts = parseInt(value);
        return ts
          ? new Date(ts).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : "";
      }
      case "checkbox":
        return value === "true" || value === "1" ? "✓" : "";
      case "multi_select": {
        try {
          const arr = JSON.parse(value);
          return Array.isArray(arr) ? arr.join(", ") : value;
        } catch {
          return value;
        }
      }
      default:
        return value;
    }
  };

  return (
    <div className="py-2">
      {rows.map((row: DatabaseRow, index: number) => {
        const rowCells: DatabaseCell[] = cells[row.id] ?? [];
        const titleCell = titleProp
          ? rowCells.find((c: DatabaseCell) => c.propertyId === titleProp.id)
          : undefined;

        return (
          <div
            key={index}
            className="group flex items-center border-b border-border px-4 py-2 transition-colors duration-[80ms] hover:bg-surface-2/50 cursor-pointer"
          >
            <div className="flex-1 text-sm text-text">
              {titleCell?.value || "Untitled"}
            </div>

            {/* INLINE PROPERTY VALUE */}
            <div className="flex items-center gap-4">
              {visibleProps.map((prop: DatabaseProperty, index: number) => {
                const cell = rowCells.find(
                  (c: DatabaseCell) => c.propertyId === prop.id,
                );
                const display: string = formatCellDisplay(
                  cell?.value ?? "",
                  prop.type as PropertyType,
                );
                if (!display) return null;

                if (prop.type === "select") {
                  return (
                    <span
                      key={index}
                      className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent-light"
                    >
                      {display}
                    </span>
                  );
                }

                if (prop.type === "checkbox") {
                  return (
                    <span key={index} className="text-xs text-accent">
                      {display}
                    </span>
                  );
                }

                return (
                  <span key={index} className="text-xs text-text-muted">
                    {display}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => addRow()}
        className="flex w-full items-center gap-1 px-4 py-2 text-sm text-text-faint transition-colors duration-[80ms] hover:bg-surface-2/50 hover:text-text-muted"
      >
        <Plus size={14} />
        New
      </button>
    </div>
  );
};

export default ListView;
