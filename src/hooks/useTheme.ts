"use client";

// REACT
import { useCallback, useEffect } from "react";

// STORE
import { useSettingsStore } from "@/stores/settings";

// TYPES
import { ThemeMode } from "@/types/theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(mode: ThemeMode) {
  const resolved = mode === "system" ? getSystemTheme() : mode;
  document.documentElement.setAttribute("data-theme", resolved);
}

export function useTheme() {
  const getSetting = useSettingsStore((s) => s.getSetting);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const loaded = useSettingsStore((s) => s.loaded);

  const theme: ThemeMode = (getSetting("theme") as ThemeMode) ?? "dark";

  // Apply data-theme attribute whenever theme changes
  useEffect(() => {
    if (!loaded) return;
    applyTheme(theme);
  }, [theme, loaded]);

  // Listen for OS preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      applyTheme(mode);
      await setSetting("theme", mode);
    },
    [setSetting],
  );

  return { theme, setTheme } as const;
}
