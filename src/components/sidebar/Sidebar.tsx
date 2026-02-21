"use client";

// REACT
import { useCallback, useMemo } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";
import { useWorkspaceStore } from "@/stores/workspace";

// COMPONENTS
import PageTree from "./PageTree";
import FavoritesList from "./FavoritesList";
import WorkspaceSwitcher from "./WorkspaceSwitcher";
import SidebarButton from "./button/SidebarButton";
import SidebarSection from "./section/SidebarSection";

// LUCIDE
import {
  Search,
  Plus,
  Trash2,
  Settings,
  Table2,
  PanelLeftClose,
} from "lucide-react";

// TYPES
import { Page } from "@/types";

// TYPESCRIPT
type Props = {
  width: number;
  onOpenSearch: () => void;
  onOpenTrash: () => void;
  onOpenSettings: () => void;
  onOpenTemplatePicker: () => void;
  onCollapse: () => void;
};

const Sidebar = ({
  width,
  onOpenSearch,
  onOpenTrash,
  onOpenSettings,
  onOpenTemplatePicker,
  onCollapse,
}: Props) => {
  // Stores
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const createPage = usePagesStore((s) => s.createPage);
  const createDatabase = usePagesStore((s) => s.createDatabase);
  const setActivePageId = usePagesStore((s) => s.setActivePageId);
  const pages = usePagesStore((s) => s.pages);

  // Memo - Favorites List
  const favorites = useMemo(
    () => pages.filter((p: Page) => p.isFavorite),
    [pages],
  );

  // Callback - Create New Database
  const handleNewDatabase = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const page = await createDatabase(
      activeWorkspaceId,
      "Untitled Database",
      "table",
    );
    setActivePageId(page.id);
  }, [activeWorkspaceId, createDatabase, setActivePageId]);

  // Callback - Create New Page
  const handleQuickNewPage = useCallback(async () => {
    if (!activeWorkspaceId) return;
    const page: Page = await createPage(activeWorkspaceId, "Untitled");
    setActivePageId(page.id);
  }, [activeWorkspaceId, createPage, setActivePageId]);

  return (
    <div className="flex h-full flex-col bg-surface" style={{ width }}>
      {/* MACOS LIGHT SPACER */}
      <div className="h-11 flex-shrink-0 drag-region" />

      {/* WORKSPACE SWITCHER + COLLAPSE */}
      <div className="flex items-center gap-1 px-3 pb-3">
        <div className="flex-1 min-w-0">
          <WorkspaceSwitcher />
        </div>
        <button
          onClick={onCollapse}
          className="flex-shrink-0 rounded-md p-1 text-text-faint transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text-muted"
          title="Hide sidebar (⌘[)"
        >
          <PanelLeftClose size={14} />
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div className="space-y-0.5 px-2">
        <SidebarButton
          icon={<Search size={16} />}
          label="Search"
          shortcut="⌘K"
          onClick={onOpenSearch}
        />
        <SidebarButton
          icon={<Plus size={16} />}
          label="New Page"
          onClick={onOpenTemplatePicker}
        />
        <SidebarButton
          icon={<Table2 size={16} />}
          label="New Database"
          onClick={handleNewDatabase}
        />
      </div>

      {/* FAVOURITES */}
      {favorites.length > 0 && (
        <div className="mt-4">
          <SidebarSection label="Favorites">
            <FavoritesList />
          </SidebarSection>
        </div>
      )}

      {/* PAGES THREE */}
      <div className="mt-4 flex-1 overflow-y-auto">
        <SidebarSection label="Pages" onAction={handleQuickNewPage}>
          <PageTree />
        </SidebarSection>
      </div>

      {/* BOTTOM SECTION */}
      <div className="border-t border-border px-2 py-2 space-y-0.5">
        <SidebarButton
          icon={<Trash2 size={16} />}
          label="Trash"
          onClick={onOpenTrash}
        />
        <SidebarButton
          icon={<Settings size={16} />}
          label="Settings"
          onClick={onOpenSettings}
        />
      </div>
    </div>
  );
};

export default Sidebar;
