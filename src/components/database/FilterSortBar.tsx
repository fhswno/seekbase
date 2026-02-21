"use client";

// REACT
import { useState } from "react";

// STORE
import { useDatabaseStore } from "@/stores/database";

// DATA
import { DATABASE_FILTER_OPERATORS } from "@/data/database";

// CLSX
import clsx from "clsx";

// LUCIDE
import { Filter, ArrowUpDown, X } from "lucide-react";

// TYPES
import { DatabaseProperty } from "@/types";

const FilterSortBar = () => {
  // Store
  const {
    properties,
    filters,
    sorts,
    addFilter,
    removeFilter,
    addSort,
    removeSort,
  } = useDatabaseStore();

  // States
  const [showFilterAdd, setShowFilterAdd] = useState<boolean>(false);
  const [showSortAdd, setShowSortAdd] = useState<boolean>(false);

  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-1.5">
      {/* FILTER BUTTON */}
      <div className="relative">
        <button
          onClick={() => setShowFilterAdd(!showFilterAdd)}
          className={clsx(
            "flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors duration-[80ms]",
            filters.length > 0
              ? "bg-accent/10 text-accent-light"
              : "text-text-muted hover:bg-surface-2 hover:text-text",
          )}
        >
          <Filter size={12} />
          Filter
          {filters.length > 0 && (
            <span className="ml-1 rounded-full bg-accent/20 px-1.5 text-[10px] font-medium">
              {filters.length}
            </span>
          )}
        </button>

        {showFilterAdd && properties.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowFilterAdd(false)}
            />
            <div className="absolute left-0 top-full z-30 mt-1 min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-lg">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                  onClick={() => {
                    addFilter({
                      propertyId: prop.id,
                      operator: "contains",
                      value: "",
                    });
                    setShowFilterAdd(false);
                  }}
                >
                  {prop.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* SORT BUTTON */}
      <div className="relative">
        <button
          onClick={() => setShowSortAdd(!showSortAdd)}
          className={clsx(
            "clex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors duration-[80ms]",
            sorts.length > 0
              ? "bg-accent/10 text-accent-light"
              : "text-text-muted hover:bg-surface-2 hover:text-text",
          )}
        >
          <ArrowUpDown size={12} />
          Sort
          {sorts.length > 0 && (
            <span className="ml-1 rounded-full bg-accent/20 px-1.5 text-[10px] font-medium">
              {sorts.length}
            </span>
          )}
        </button>

        {showSortAdd && properties.length > 0 && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowSortAdd(false)}
            />
            <div className="absolute left-0 top-full z-30 mt-1 min-w-[180px] rounded-md border border-border bg-surface p-1 shadow-lg">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  className="flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                  onClick={() => {
                    addSort({
                      propertyId: prop.id,
                      direction: "asc",
                    });
                    setShowSortAdd(false);
                  }}
                >
                  {prop.name}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ACTIVE FILTERS DISPLAY */}
      {filters.map((filter, i) => {
        const prop = properties.find((p) => p.id === filter.propertyId);
        return (
          <div
            key={i}
            className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs text-text-muted"
          >
            <span className="font-medium text-text">
              {prop?.name ?? "Unknown"}
            </span>
            <select
              value={filter.operator}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const newFilters = [...filters];
                newFilters[i] = { ...filter, operator: e.target.value };
                useDatabaseStore.getState().setFilters(newFilters);
              }}
              className="bg-transparent text-text-muted outline-none"
            >
              {DATABASE_FILTER_OPERATORS.map(
                (op: { value: string; label: string }, index: number) => (
                  <option key={index} value={op.value}>
                    {op.label}
                  </option>
                ),
              )}
            </select>
            {!filter.operator.startsWith("is_") && (
              <input
                className="w-20 bg-transparent text-text outline-none placeholder:text-text-faint"
                value={filter.value}
                placeholder="value"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const newFilters = [...filters];
                  newFilters[i] = { ...filter, value: e.target.value };
                  useDatabaseStore.getState().setFilters(newFilters);
                }}
              />
            )}
            <button
              onClick={() => removeFilter(i)}
              className="ml-1 text-text-faint hover:text-text-muted"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}

      {/* ACTIVE SORTS DISPLAY */}
      {sorts.map((sort, i) => {
        const prop = properties.find(
          (p: DatabaseProperty) => p.id === sort.propertyId,
        );
        return (
          <div
            key={i}
            className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 text-xs text-text-muted"
          >
            <ArrowUpDown size={10} />
            <span className="font-medium text-text">
              {prop?.name ?? "Unknown"}
            </span>
            <button
              onClick={() => {
                const newSorts = [...sorts];
                newSorts[i] = {
                  ...sort,
                  direction: sort.direction === "asc" ? "desc" : "asc",
                };
                useDatabaseStore.getState().setSorts(newSorts);
              }}
              className="text-accent-light"
            >
              {sort.direction === "asc" ? "↑" : "↓"}
            </button>
            <button
              onClick={() => removeSort(i)}
              className="ml-1 text-text-faint hover:text-text-muted"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default FilterSortBar;
