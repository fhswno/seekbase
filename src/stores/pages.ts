// ZUSTAND
import { create } from "zustand";

// TYPES
import type { Page, UpdatePageParams, DatabaseViewType } from "@/types";

// DATABASE
import * as db from "@/lib/db";

interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
}

interface PagesState {
  pages: Page[];
  activePageId: string | null;

  // Actions
  loadPages: (workspaceId: string) => Promise<void>;
  setActivePageId: (id: string | null) => void;
  createPage: (
    workspaceId: string,
    title: string,
    parentId?: string | null,
  ) => Promise<Page>;
  createDatabase: (
    workspaceId: string,
    title: string,
    databaseType: DatabaseViewType,
  ) => Promise<Page>;
  updatePage: (id: string, fields: UpdatePageParams) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  movePage: (
    id: string,
    newParentId: string | null,
    newSortOrder: number,
  ) => Promise<void>;

  // Computed helpers
  getPageTree: () => PageTreeNode[];
  getFavorites: () => Page[];
  getActivePage: () => Page | undefined;
  getPageById: (id: string) => Page | undefined;
  getBreadcrumbs: (pageId: string) => Page[];
}

export const usePagesStore = create<PagesState>((set, get) => ({
  pages: [],
  activePageId: null,

  loadPages: async (workspaceId) => {
    const pages = await db.getPages(workspaceId);
    set({ pages });
  },

  setActivePageId: (id) => set({ activePageId: id }),

  createPage: async (workspaceId, title, parentId) => {
    const page = await db.createPage({
      workspaceId,
      parentId: parentId ?? null,
      title,
      isDatabase: false,
    });
    set((state) => ({ pages: [...state.pages, page] }));
    return page;
  },

  createDatabase: async (workspaceId, title, databaseType) => {
    const page = await db.createPage({
      workspaceId,
      title,
      isDatabase: true,
      databaseType,
    });
    set((state) => ({ pages: [...state.pages, page] }));
    return page;
  },

  updatePage: async (id, fields) => {
    const updated = await db.updatePage(id, fields);
    set((state) => ({
      pages: state.pages.map((p) => (p.id === id ? updated : p)),
    }));
  },

  deletePage: async (id) => {
    await db.deletePage(id);
    set((state) => ({
      pages: state.pages.filter((p) => p.id !== id),
      activePageId: state.activePageId === id ? null : state.activePageId,
    }));
  },

  restorePage: async (id) => {
    await db.restorePage(id);
    // Reload pages after restore since the page needs to come back
    const { pages } = get();
    if (pages.length > 0) {
      const workspaceId = pages[0].workspaceId;
      const reloaded = await db.getPages(workspaceId);
      set({ pages: reloaded });
    }
  },

  movePage: async (id, newParentId, newSortOrder) => {
    await db.movePage(id, newParentId, newSortOrder);
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === id
          ? { ...p, parentId: newParentId, sortOrder: newSortOrder }
          : p,
      ),
    }));
  },

  getPageTree: () => {
    const { pages } = get();
    const rootPages = pages.filter((p) => !p.parentId);

    function buildTree(parentId: string | null): PageTreeNode[] {
      return pages
        .filter((p) => p.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((page) => ({
          page,
          children: buildTree(page.id),
        }));
    }

    return rootPages
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((page) => ({
        page,
        children: buildTree(page.id),
      }));
  },

  getFavorites: () => {
    return get().pages.filter((p) => p.isFavorite);
  },

  getActivePage: () => {
    const { pages, activePageId } = get();
    return pages.find((p) => p.id === activePageId);
  },

  getPageById: (id) => {
    return get().pages.find((p) => p.id === id);
  },

  getBreadcrumbs: (pageId) => {
    const { pages } = get();
    const breadcrumbs: Page[] = [];
    let current = pages.find((p) => p.id === pageId);

    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId
        ? pages.find((p) => p.id === current!.parentId)
        : undefined;
    }

    return breadcrumbs;
  },
}));
