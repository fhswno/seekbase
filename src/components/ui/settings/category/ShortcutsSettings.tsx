// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";

// DATA
import { SETTINGS_SHORTCUTS } from "@/data/settings";

const ShortcutsSettings = () => {
  return (
    <div>
      <SettingSectionHeader
        title="Keyboard Shortcuts"
        description="Reference for all available shortcuts"
      />
      <div className="divide-y divide-border rounded-md border border-border">
        {SETTINGS_SHORTCUTS.map(
          (shortcut: { key: string; description: string }, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between px-4 py-2"
            >
              <span className="text-sm text-text-muted">
                {shortcut.description}
              </span>
              <kbd className="rounded bg-surface-2 px-2 py-0.5 text-xs font-mono text-text-faint">
                {shortcut.key}
              </kbd>
            </div>
          ),
        )}
      </div>
    </div>
  );
};

export default ShortcutsSettings;
