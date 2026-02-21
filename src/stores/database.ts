// ZUSTAND
import { create } from "zustand";

// DB
import * as db from "@/lib/db";

// TYPES
import type {
  DatabaseProperty,
  DatabaseRow,
  DatabaseCell,
  DatabaseView,
  PropertyType,
  DatabaseViewType,
} from "@/types";

interface FilterCondition {
  propertyId: string;
  operator: string;
  value: string;
}

interface SortCondition {
  propertyId: string;
  direction: "asc" | "desc";
}

interface DatabaseState {
  pageId: string | null;
  properties: DatabaseProperty[];
  rows: DatabaseRow[];
  cells: Record<string, DatabaseCell[]>; // keyed by row ID
  views: DatabaseView[];
  activeViewId: string | null;
  filters: FilterCondition[];
  sorts: SortCondition[];
  loading: boolean;

  // Actions
  loadDatabase: (pageId: string) => Promise<void>;
  clearDatabase: () => void;

  // Properties
  addProperty: (name: string, type: PropertyType) => Promise<void>;
  updateProperty: (
    id: string,
    updates: { name?: string; type?: PropertyType; options?: string },
  ) => Promise<void>;
  removeProperty: (id: string) => Promise<void>;

  // Rows
  addRow: () => Promise<DatabaseRow>;
  removeRow: (id: string) => Promise<void>;
  loadRowCells: (rowId: string) => Promise<void>;

  // Cells
  updateCellValue: (
    rowId: string,
    propertyId: string,
    value: string,
  ) => Promise<void>;
  getCellValue: (rowId: string, propertyId: string) => string;

  // Views
  addView: (name: string, type: DatabaseViewType) => Promise<void>;
  setActiveView: (viewId: string) => void;
  updateViewConfig: (viewId: string, config: string) => Promise<void>;
  removeView: (id: string) => Promise<void>;

  // Filters / Sorts
  setFilters: (filters: FilterCondition[]) => void;
  setSorts: (sorts: SortCondition[]) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (index: number) => void;
  addSort: (sort: SortCondition) => void;
  removeSort: (index: number) => void;

  // Computed
  getActiveView: () => DatabaseView | undefined;
  getFilteredSortedRows: () => DatabaseRow[];
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  pageId: null,
  properties: [],
  rows: [],
  cells: {},
  views: [],
  activeViewId: null,
  filters: [],
  sorts: [],
  loading: false,

  loadDatabase: async (pageId) => {
    set({ loading: true, pageId });

    const [properties, rows, views] = await Promise.all([
      db.getDatabaseProperties(pageId),
      db.getDatabaseRows(pageId),
      db.getDatabaseViews(pageId),
    ]);

    // Load cells for all rows
    const cellMap: Record<string, DatabaseCell[]> = {};
    await Promise.all(
      rows.map(async (row) => {
        cellMap[row.id] = await db.getCells(row.id);
      }),
    );

    set({
      properties,
      rows,
      cells: cellMap,
      views,
      activeViewId: views.length > 0 ? views[0].id : null,
      filters: [],
      sorts: [],
      loading: false,
    });
  },

  clearDatabase: () =>
    set({
      pageId: null,
      properties: [],
      rows: [],
      cells: {},
      views: [],
      activeViewId: null,
      filters: [],
      sorts: [],
      loading: false,
    }),

  // Properties
  addProperty: async (name, type) => {
    const { pageId } = get();
    if (!pageId) return;
    const prop = await db.createProperty({
      pageId,
      name,
      type,
      options: "{}",
    });
    set((s) => ({ properties: [...s.properties, prop] }));
  },

  updateProperty: async (id, updates) => {
    const updated = await db.updateProperty({
      id,
      name: updates.name,
      type: updates.type,
      options: updates.options,
    });
    set((s) => ({
      properties: s.properties.map((p) => (p.id === id ? updated : p)),
    }));
  },

  removeProperty: async (id) => {
    await db.deleteProperty(id);
    set((s) => ({
      properties: s.properties.filter((p) => p.id !== id),
    }));
  },

  // Rows
  addRow: async () => {
    const { pageId } = get();
    if (!pageId) throw new Error("No database loaded");
    const row = await db.createRow(pageId);
    set((s) => ({
      rows: [...s.rows, row],
      cells: { ...s.cells, [row.id]: [] },
    }));
    return row;
  },

  removeRow: async (id) => {
    await db.deleteRow(id);
    set((s) => {
      const { [id]: _, ...rest } = s.cells;
      return {
        rows: s.rows.filter((r) => r.id !== id),
        cells: rest,
      };
    });
  },

  loadRowCells: async (rowId) => {
    const cells = await db.getCells(rowId);
    set((s) => ({
      cells: { ...s.cells, [rowId]: cells },
    }));
  },

  // Cells
  updateCellValue: async (rowId, propertyId, value) => {
    const cell = await db.updateCell(rowId, propertyId, value);
    set((s) => {
      const rowCells = s.cells[rowId] ?? [];
      const existingIdx = rowCells.findIndex(
        (c) => c.propertyId === propertyId,
      );
      const newCells =
        existingIdx >= 0
          ? rowCells.map((c, i) => (i === existingIdx ? cell : c))
          : [...rowCells, cell];
      return {
        cells: { ...s.cells, [rowId]: newCells },
      };
    });
  },

  getCellValue: (rowId, propertyId) => {
    const rowCells = get().cells[rowId] ?? [];
    const cell = rowCells.find((c) => c.propertyId === propertyId);
    return cell?.value ?? "";
  },

  // Views
  addView: async (name, type) => {
    const { pageId } = get();
    if (!pageId) return;
    const view = await db.createView({ pageId, name, type });
    set((s) => ({
      views: [...s.views, view],
      activeViewId: s.activeViewId ?? view.id,
    }));
  },

  setActiveView: (viewId) => set({ activeViewId: viewId }),

  updateViewConfig: async (viewId, config) => {
    const updated = await db.updateView({ id: viewId, config });
    set((s) => ({
      views: s.views.map((v) => (v.id === viewId ? updated : v)),
    }));
  },

  removeView: async (id) => {
    await db.deleteView(id);
    set((s) => {
      const remaining = s.views.filter((v) => v.id !== id);
      return {
        views: remaining,
        activeViewId:
          s.activeViewId === id
            ? remaining.length > 0
              ? remaining[0].id
              : null
            : s.activeViewId,
      };
    });
  },

  // Filters / Sorts
  setFilters: (filters) => set({ filters }),
  setSorts: (sorts) => set({ sorts }),

  addFilter: (filter) => set((s) => ({ filters: [...s.filters, filter] })),

  removeFilter: (index) =>
    set((s) => ({
      filters: s.filters.filter((_, i) => i !== index),
    })),

  addSort: (sort) => set((s) => ({ sorts: [...s.sorts, sort] })),

  removeSort: (index) =>
    set((s) => ({
      sorts: s.sorts.filter((_, i) => i !== index),
    })),

  // Computed
  getActiveView: () => {
    const { views, activeViewId } = get();
    return views.find((v) => v.id === activeViewId);
  },

  getFilteredSortedRows: () => {
    const { rows, cells, filters, sorts, properties } = get();
    let result = [...rows];

    // Apply filters
    for (const filter of filters) {
      result = result.filter((row) => {
        const rowCells = cells[row.id] ?? [];
        const cell = rowCells.find((c) => c.propertyId === filter.propertyId);
        const cellValue = cell?.value ?? "";

        switch (filter.operator) {
          case "equals":
            return cellValue === filter.value;
          case "not_equals":
            return cellValue !== filter.value;
          case "contains":
            return cellValue.toLowerCase().includes(filter.value.toLowerCase());
          case "not_contains":
            return !cellValue
              .toLowerCase()
              .includes(filter.value.toLowerCase());
          case "is_empty":
            return !cellValue || cellValue === "" || cellValue === "{}";
          case "is_not_empty":
            return cellValue !== "" && cellValue !== "{}";
          default:
            return true;
        }
      });
    }

    // Apply sorts
    if (sorts.length > 0) {
      result.sort((a, b) => {
        for (const sort of sorts) {
          const prop = properties.find((p) => p.id === sort.propertyId);
          const aCells = cells[a.id] ?? [];
          const bCells = cells[b.id] ?? [];
          const aCell = aCells.find((c) => c.propertyId === sort.propertyId);
          const bCell = bCells.find((c) => c.propertyId === sort.propertyId);
          const aVal = aCell?.value ?? "";
          const bVal = bCell?.value ?? "";

          let comparison = 0;
          if (prop?.type === "number") {
            comparison = (parseFloat(aVal) || 0) - (parseFloat(bVal) || 0);
          } else if (prop?.type === "date") {
            comparison = (parseInt(aVal) || 0) - (parseInt(bVal) || 0);
          } else {
            comparison = aVal.localeCompare(bVal);
          }

          if (comparison !== 0) {
            return sort.direction === "asc" ? comparison : -comparison;
          }
        }
        return a.sortOrder - b.sortOrder;
      });
    }

    return result;
  },
}));
