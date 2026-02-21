"use client";

// REACT
import { useState, useCallback } from "react";

// LUCIDE
import { Plus, ChevronUp, ChevronDown } from "lucide-react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// COMPONENTS
import AddPropertyButton from "../buttons/AddPropertyButton";
import PropertyHeaderMenu from "../headers/PropertyHeaderMenu";
import CellRenderer from "../cells/CellRenderer";

// TYPES
import { DatabaseProperty, DatabaseRow, PropertyType } from "@/types";

const TableView = () => {
  // States
  const [menuPropertyId, setMenuPropertyId] = useState<string | null>(null);

  // Stores
  const { properties, getFilteredSortedRows, addRow, addSort, sorts } =
    useDatabaseStore();

  // Filtered Rows
  const rows = getFilteredSortedRows();

  // Callback - Add Row
  const handleAddRow = useCallback(async () => {
    await addRow();
  }, [addRow]);

  // Callback - Header Click
  const handleHeaderClick = useCallback(
    (propertyId: string) => {
      const existingSort = sorts.find((s) => s.propertyId === propertyId);
      if (existingSort) {
        const newSorts = sorts.map((s) =>
          s.propertyId === propertyId
            ? {
                ...s,
                direction:
                  s.direction === "asc" ? ("desc" as const) : ("asc" as const),
              }
            : s,
        );
        useDatabaseStore.getState().setSorts(newSorts);
      } else {
        addSort({ propertyId, direction: "asc" });
      }
    },
    [sorts, addSort],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        {/* HEADER */}
        <thead>
          <tr className="border-b border-border">
            {properties.map((prop: DatabaseProperty, index: number) => {
              const sort = sorts.find((s) => s.propertyId === prop.id);
              return (
                <th
                  key={index}
                  className="relative min-w-[150px] border-r border-border px-2 py-1.5 text-left"
                >
                  <button
                    className="flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wider text-text-muted transition-colors duration-[80ms] hover:text-text"
                    onClick={() => handleHeaderClick(prop.id)}
                    onContextMenu={(
                      e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
                    ) => {
                      e.preventDefault();
                      setMenuPropertyId(prop.id);
                    }}
                  >
                    {prop.name}
                    {sort &&
                      (sort.direction === "asc" ? (
                        <ChevronUp size={12} className="text-accent" />
                      ) : (
                        <ChevronDown size={12} className="text-accent" />
                      ))}
                  </button>

                  {menuPropertyId === prop.id && (
                    <PropertyHeaderMenu
                      propertyId={prop.id}
                      propertyName={prop.name}
                      propertyType={prop.type as PropertyType}
                      onClose={() => setMenuPropertyId(null)}
                    />
                  )}
                </th>
              );
            })}
            <th className="w-10 px-1 py-1.5">
              <AddPropertyButton />
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {rows.map((row: DatabaseRow) => (
            <tr
              key={row.id}
              className="border-b border-border transition-colors duration-[80ms] hover:bg-surface-2/50"
            >
              {properties.map((prop: DatabaseProperty, index: number) => (
                <td key={index} className="border-r border-border">
                  <CellRenderer
                    rowId={row.id}
                    propertyId={prop.id}
                    propertyType={prop.type as PropertyType}
                    propertyOptions={prop.options}
                  />
                </td>
              ))}
              <td />
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD ROW BUTTON */}
      <button
        onClick={handleAddRow}
        className="flex w-full items-center gap-1 border-b border-border px-3 py-2 text-sm text-text-faint transition-colors duration-[80ms] hover:bg-surface-2/50 hover:text-text-muted"
      >
        <Plus size={14} />
        New row
      </button>
    </div>
  );
};

export default TableView;
