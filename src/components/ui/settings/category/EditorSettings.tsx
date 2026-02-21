// HOOKS
import { useSettingsStore } from "@/stores/settings";

// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";
import SettingRow from "../rows/SettingRow";

const EditorSettings = () => {
  // Store
  const { getSetting, setSetting } = useSettingsStore();

  // Font Size
  const fontSize = getSetting("font_size") ?? "16";

  return (
    <div>
      <SettingSectionHeader
        title="Editor"
        description="Customize the writing experience"
      />
      <SettingRow
        label="Font size"
        description="Base font size for editor content"
      >
        <select
          value={fontSize}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setSetting("font_size", e.target.value)
          }
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
        >
          <option value="14">14px (Small)</option>
          <option value="16">16px (Default)</option>
          <option value="18">18px (Large)</option>
        </select>
      </SettingRow>
    </div>
  );
};

export default EditorSettings;
