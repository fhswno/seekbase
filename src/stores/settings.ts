// ZUSTAND
import { create } from "zustand";

// TYPES
import type { SettingKey } from "@/types";

// DB
import * as db from "@/lib/db";

interface SettingsState {
  settings: Record<string, string>;
  loaded: boolean;

  // Actions
  loadSettings: () => Promise<void>;
  getSetting: (key: SettingKey) => string | undefined;
  setSetting: (key: SettingKey, value: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loaded: false,

  loadSettings: async () => {
    const settings = await db.getAllSettings();
    set({ settings, loaded: true });
  },

  getSetting: (key) => {
    return get().settings[key];
  },

  setSetting: async (key, value) => {
    await db.setSetting(key, value);
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
  },
}));
