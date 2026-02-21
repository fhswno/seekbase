"use client";

// STORE
import { useDatabaseStore } from "@/stores/database";

// LUCIDE
import { Plus } from "lucide-react";

// TYPES
import { DatabaseCell, DatabaseProperty, DatabaseRow } from "@/types";

const GalleryView = () => {
  // Store
  const { properties, getFilteredSortedRows, cells, addRow } =
    useDatabaseStore();

  // Filtered Sorted Rows
  const rows = getFilteredSortedRows();

  // Find - First Select Property to Group By
  const titleProp = properties.find((p: DatabaseProperty) => p.type === "text");
  const selectProps = properties.filter(
    (p: DatabaseProperty) => p.type === "select" || p.type === "multi_select",
  );

  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {rows.map((row: DatabaseRow, index: number) => {
          const rowCells: DatabaseCell[] = cells[row.id] ?? [];
          const titleCell = titleProp
            ? rowCells.find((c: DatabaseCell) => c.propertyId === titleProp.id)
            : undefined;

          return (
            <div
              key={index}
              className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-surface transition-colors duration-[80ms] hover:border-accent/30"
            >
              {/* COVER */}
              <div className="h-28 bg-surface-2" />

              {/* CONTENT */}
              <div className="p-3">
                <div className="text-sm font-medium text-text">
                  {titleCell?.value || "Untitled"}
                </div>

                {/* TAGS */}
                {selectProps.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectProps.map((prop: DatabaseProperty) => {
                      const cell = rowCells.find(
                        (c: DatabaseCell) => c.propertyId === prop.id,
                      );
                      if (!cell?.value) return null;

                      let values: string[] = [];
                      if (prop.type === "multi_select") {
                        try {
                          values = JSON.parse(cell.value);
                        } catch {
                          values = [cell.value];
                        }
                      } else {
                        values = [cell.value];
                      }

                      return values.map((v: string, index: number) => (
                        <span
                          key={index}
                          className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent-light"
                        >
                          {v}
                        </span>
                      ));
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* ADD CARD */}
        <button
          onClick={() => addRow()}
          className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border transition-colors duration-[80ms] hover:border-text-faint hover:bg-surface-2/30"
        >
          <div className="flex items-center gap-1 text-sm text-text-faint">
            <Plus size={14} />
            New
          </div>
        </button>
      </div>
    </div>
  );
};

export default GalleryView;
