// REACT
import { useState, useCallback } from "react";

// STORE
import { useWorkspaceStore } from "@/stores/workspace";

// COMPONENTS
import SettingSectionHeader from "../headers/SettingSectionHeader";
import SettingRow from "../rows/SettingRow";
import WorkspaceIcon from "../../WorkspaceIcon";
import IconPicker from "../../IconPicker";

const WorkspaceSettings = () => {
  // Stores
  const {
    getActiveWorkspace,
    updateWorkspace,
    updateWorkspaceIcon,
    saveWorkspaceIconFromFile,
  } = useWorkspaceStore();
  const workspace = getActiveWorkspace();

  // States
  const [name, setName] = useState(workspace?.name ?? "");
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);

  // Callback - Handle Save
  const handleSave = useCallback(async () => {
    if (!workspace || name.trim() === "" || name === workspace.name) return;
    await updateWorkspace(workspace.id, name);
  }, [workspace, name, updateWorkspace]);

  // Callback - Handle Select Icon
  const handleSelectIcon = useCallback(
    async (icon: string) => {
      if (!workspace) return;
      await updateWorkspaceIcon(workspace.id, icon);
      setShowIconPicker(false);
    },
    [workspace, updateWorkspaceIcon],
  );

  // Callback - Handle Upload Image
  const handleUploadImage = useCallback(
    async (filePath: string) => {
      if (!workspace) return;
      await saveWorkspaceIconFromFile(workspace.id, filePath);
      setShowIconPicker(false);
    },
    [workspace, saveWorkspaceIconFromFile],
  );

  return (
    <div>
      <SettingSectionHeader
        title="Workspace"
        description="Manage your workspace settings"
      />
      <SettingRow label="Workspace name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="w-48 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text outline-none focus:border-accent"
        />
      </SettingRow>
      <SettingRow label="Icon" description="Click to change workspace icon">
        <div className="relative">
          <button
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="rounded-md p-1 transition-colors duration-[80ms] hover:bg-surface-2"
          >
            <WorkspaceIcon icon={workspace?.icon ?? null} size={32} />
          </button>
          {showIconPicker && (
            <div className="absolute right-0 top-full z-10 mt-1 rounded-lg border border-border bg-surface shadow-xl">
              <IconPicker
                currentIcon={workspace?.icon ?? null}
                onSelectIcon={handleSelectIcon}
                onUploadImage={handleUploadImage}
              />
            </div>
          )}
        </div>
      </SettingRow>
    </div>
  );
};

export default WorkspaceSettings;
