"use client";

// REACT
import { useCallback, useMemo } from "react";

// LUCIDE
import { Plus } from "lucide-react";

// STORE
import { useDatabaseStore } from "@/stores/database";
import { DatabaseCell, DatabaseProperty, DatabaseRow } from "@/types";

const BoardView = () => {
  // Store
  const { properties, getFilteredSortedRows, cells, addRow, updateCellValue } =
    useDatabaseStore();

  // Filtered Sorted Rows
  const rows = getFilteredSortedRows();

  // Find - First Select Property to Group By
  const groupByProp = properties.find(
    (p: DatabaseProperty) => p.type === "select" || p.type === "multi_select",
  );

  // Memo - Columns based on groupByProp options
  const columns = useMemo(() => {
    if (!groupByProp) return [{ label: "No Status", value: "" }];

    let options: Array<{ label: string; color: string }> = [];
    try {
      const parsed = JSON.parse(groupByProp.options);
      if (Array.isArray(parsed.options)) {
        options = parsed.options;
      }
    } catch {
      // ignore
    }

    return [
      { label: "No Status", value: "" },
      ...options.map((o) => ({ label: o.label, value: o.label })),
    ];
  }, [groupByProp]);

  // Callback - Get Group Value for a Row
  const getRowGroup = useCallback(
    (rowId: string): string => {
      if (!groupByProp) return "";
      const rowCells = cells[rowId] ?? [];
      const cell = rowCells.find((c) => c.propertyId === groupByProp.id);
      return cell?.value ?? "";
    },
    [groupByProp, cells],
  );

  // Find - Title Property
  const titleProp = properties.find((p) => p.type === "text");

  // Callback - Handle Add to Column
  const handleAddToColumn = useCallback(
    async (columnValue: string) => {
      const row = await addRow();
      if (groupByProp) {
        await updateCellValue(row.id, groupByProp.id, columnValue);
      }
    },
    [addRow, groupByProp, updateCellValue],
  );

  // Case - No groupByProp available
  if (!groupByProp) {
    return (
      <div className="p-8 text-center text-sm text-text-muted">
        Add a <span className="font-medium text-text">Select</span> property to
        use Board view.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {columns.map((col: { label: string; value: string }, index: number) => {
        const columnRows = rows.filter(
          (row: DatabaseRow) => getRowGroup(row.id) === col.value,
        );

        return (
          <div
            key={index}
            className="flex w-64 flex-shrink-0 flex-col rounded-lg"
          >
            {/* COLUMN HEADER */}
            <div className="flex items-center justify-between px-2 py-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-muted">
                  {col.label}
                </span>
                <span className="rounded-full bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-faint">
                  {columnRows.length}
                </span>
              </div>
            </div>

            {/* CARDS */}
            <div className="flex flex-1 flex-col gap-1.5">
              {columnRows.map((row: DatabaseRow, index: number) => {
                const rowCells: DatabaseCell[] = cells[row.id] ?? [];
                const titleCell = titleProp
                  ? rowCells.find(
                      (c: DatabaseCell) => c.propertyId === titleProp.id,
                    )
                  : undefined;

                return (
                  <div
                    key={index}
                    className="rounded-md border border-border bg-surface p-3 transition-colors duration-[80ms] hover:border-border hover:bg-surface-2/50 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-text">
                      {titleCell?.value || "Untitled"}
                    </div>

                    {/* SHOW SELECT TAG */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {properties
                        .filter(
                          (p: DatabaseProperty) =>
                            p.id !== groupByProp.id &&
                            (p.type === "select" || p.type === "multi_select"),
                        )
                        .map((prop: DatabaseProperty, index: number) => {
                          const cell = rowCells.find(
                            (c: DatabaseCell) => c.propertyId === prop.id,
                          );
                          if (!cell?.value) return null;
                          return (
                            <span
                              key={index}
                              className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-medium text-accent-light"
                            >
                              {cell.value}
                            </span>
                          );
                        })}
                    </div>

                    {/* SHOW DATE IF EXISTS */}
                    {properties
                      .filter((p: DatabaseProperty) => p.type === "date")
                      .map((prop: DatabaseProperty, index: number) => {
                        const cell = rowCells.find(
                          (c: DatabaseCell) => c.propertyId === prop.id,
                        );
                        if (!cell?.value) return null;
                        const dateStr: string = new Date(
                          parseInt(cell.value),
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <div
                            key={index}
                            className="mt-1 text-xs text-text-faint"
                          >
                            {dateStr}
                          </div>
                        );
                      })}
                  </div>
                );
              })}

              {/* ADD CARD */}
              <button
                onClick={() => handleAddToColumn(col.value)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm text-text-faint transition-colors duration-[80ms] hover:bg-surface-2/50 hover:text-text-muted"
              >
                <Plus size={14} />
                Add
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BoardView;
