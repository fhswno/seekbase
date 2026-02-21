// ZUSTAND
import { create } from "zustand";

// TYPES
import type { Block, BlockType, BlockReorder } from "@/types";

// DB
import * as db from "@/lib/db";

interface BlocksState {
  blocks: Block[];
  currentPageId: string | null;

  // Actions
  loadBlocks: (pageId: string) => Promise<void>;
  clearBlocks: () => void;
  createBlock: (
    pageId: string,
    type: BlockType,
    content: string,
    sortOrder: number,
    parentBlockId?: string | null,
  ) => Promise<Block>;
  updateBlock: (id: string, content: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  reorderBlocks: (updates: BlockReorder[]) => Promise<void>;

  // Computed helpers
  getBlockById: (id: string) => Block | undefined;
  getRootBlocks: () => Block[];
  getChildBlocks: (parentBlockId: string) => Block[];
}

export const useBlocksStore = create<BlocksState>((set, get) => ({
  blocks: [],
  currentPageId: null,

  loadBlocks: async (pageId) => {
    const blocks = await db.getBlocks(pageId);
    set({ blocks, currentPageId: pageId });
  },

  clearBlocks: () => set({ blocks: [], currentPageId: null }),

  createBlock: async (pageId, type, content, sortOrder, parentBlockId) => {
    const block = await db.createBlock({
      pageId,
      type,
      content,
      sortOrder,
      parentBlockId: parentBlockId ?? null,
    });
    set((state) => ({ blocks: [...state.blocks, block] }));
    return block;
  },

  updateBlock: async (id, content) => {
    const updated = await db.updateBlock(id, content);
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? updated : b)),
    }));
  },

  deleteBlock: async (id) => {
    await db.deleteBlock(id);
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id),
    }));
  },

  reorderBlocks: async (updates) => {
    await db.reorderBlocks(updates);
    set((state) => ({
      blocks: state.blocks.map((b) => {
        const update = updates.find((u) => u.id === b.id);
        return update ? { ...b, sortOrder: update.sortOrder } : b;
      }),
    }));
  },

  getBlockById: (id) => {
    return get().blocks.find((b) => b.id === id);
  },

  getRootBlocks: () => {
    return get()
      .blocks.filter((b) => !b.parentBlockId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },

  getChildBlocks: (parentBlockId) => {
    return get()
      .blocks.filter((b) => b.parentBlockId === parentBlockId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
}));
