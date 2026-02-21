// REACT
import { useCallback } from "react";

// STORE
import { useSettingsStore } from "@/stores/settings";

const useThemeForSettings = () => {
  const getSetting = useSettingsStore((s) => s.getSetting);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const theme = (getSetting("theme") ?? "dark") as "dark" | "light" | "system";

  const setTheme = useCallback(
    async (mode: "dark" | "light" | "system") => {
      // Apply immediately
      if (mode === "system") {
        const resolved = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        document.documentElement.setAttribute("data-theme", resolved);
      } else {
        document.documentElement.setAttribute("data-theme", mode);
      }
      await setSetting("theme", mode);
    },
    [setSetting],
  );

  return { theme, setTheme };
};

export default useThemeForSettings;
