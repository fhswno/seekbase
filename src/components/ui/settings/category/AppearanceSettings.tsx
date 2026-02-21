// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";
import SettingRow from "../rows/SettingRow";

// HOOKS
import useThemeForSettings from "@/hooks/useThemeForSettings";

// DATA
import { appearance_settings_options } from "@/data/settings";

// CLSX
import clsx from "clsx";

const AppearanceSettings = () => {
  // Hooks
  const { theme, setTheme } = useThemeForSettings();

  return (
    <div>
      <SettingSectionHeader
        title="Appearance"
        description="Customize the look and feel"
      />
      <SettingRow
        label="Theme"
        description="Choose your preferred color scheme"
      >
        <div className="flex items-center gap-2">
          {appearance_settings_options.map(
            ({
              mode,
              label,
              swatch,
            }: {
              mode: "dark" | "light" | "system";
              label: string;
              swatch: React.ReactNode;
            }) => (
              <button
                key={mode}
                onClick={() => setTheme(mode)}
                className={clsx(
                  "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors duration-[80ms]",
                  theme === mode
                    ? "border-accent bg-accent/10 text-text"
                    : "border-border text-text-muted hover:bg-surface-2 hover:text-text",
                )}
              >
                {swatch}
                {label}
              </button>
            ),
          )}
        </div>
      </SettingRow>
    </div>
  );
};

export default AppearanceSettings;
