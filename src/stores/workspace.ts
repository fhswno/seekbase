// ZUSTAND
import { create } from "zustand";

// TYPES
import type { Workspace } from "@/types";

// DB
import * as db from "@/lib/db";

// STORES
import { usePagesStore } from "@/stores/pages";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;

  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  getActiveWorkspace: () => Workspace | undefined;
  createWorkspace: (name: string, icon?: string) => Promise<Workspace>;
  switchWorkspace: (id: string) => Promise<void>;
  updateWorkspace: (id: string, name?: string, icon?: string) => Promise<void>;
  updateWorkspaceIcon: (id: string, icon: string) => Promise<void>;
  saveWorkspaceIconFromFile: (id: string, filePath: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,

  setWorkspaces: (workspaces) => set({ workspaces }),

  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),

  getActiveWorkspace: () => {
    const { workspaces, activeWorkspaceId } = get();
    return workspaces.find((w) => w.id === activeWorkspaceId);
  },

  createWorkspace: async (name, icon) => {
    const workspace = await db.createWorkspace(name, icon ?? null);
    set((state) => ({ workspaces: [...state.workspaces, workspace] }));
    return workspace;
  },

  switchWorkspace: async (id) => {
    await db.setSetting("active_workspace_id", id);
    set({ activeWorkspaceId: id });
    usePagesStore.getState().setActivePageId(null);
    await usePagesStore.getState().loadPages(id);
  },

  updateWorkspace: async (id, name, icon) => {
    const updated = await db.updateWorkspace(id, name, icon);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
    }));
  },

  updateWorkspaceIcon: async (id, icon) => {
    const updated = await db.updateWorkspace(id, undefined, icon);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
    }));
  },

  saveWorkspaceIconFromFile: async (id, filePath) => {
    const updated = await db.saveWorkspaceIcon(id, filePath);
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
    }));
  },
}));
