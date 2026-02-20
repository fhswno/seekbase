"use client";

// REACT
import { useEffect, useCallback, useState } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";
import { useWorkspaceStore } from "@/stores/workspace";
import { useSettingsStore } from "@/stores/settings";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// LUCIDE
import { PanelLeft } from "lucide-react";

// COMPONENTS
import Sidebar from "@/components/sidebar/Sidebar";
import { PageView } from "@/components/editor/PageView";
import { SearchPalette } from "@/components/ui/SearchPalette";
import { SettingsPage } from "@/components/ui/SettingsPage";
import { TrashPanel } from "@/components/ui/TrashPanel";
import { TemplatePicker } from "@/components/ui/TemplatePicker";
import { Onboarding } from "@/components/ui/Onboarding";
import AppLoading from "../loading/AppLoading";
import AppEmpty from "../empty/AppEmpty";

// NEXT THEME
import { useTheme } from "@/hooks/useTheme";

// DB
import * as db from "@/lib/db";

// TYPES
import { Workspace } from "@/types";

// CONSTANTS
const SIDEBAR_MIN = 200;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 260;

const AppShell = () => {
  const [sidebarWidth, setSidebarWidth] = useState<number>(SIDEBAR_DEFAULT);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  // Modal states
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTrash, setShowTrash] = useState<boolean>(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const { setActiveWorkspaceId, setWorkspaces } = useWorkspaceStore();
  const { loadPages, activePageId } = usePagesStore();
  const { loadSettings } = useSettingsStore();

  // Apply persisted theme on init
  useTheme();

  // Callback - Shared Init
  const initApp = useCallback(async () => {
    try {
      await loadSettings();

      const workspaces = await db.getWorkspaces();

      if (workspaces.length > 0) {
        setWorkspaces(workspaces);
        const savedId = await db.getSetting("active_workspace_id");
        const activeId = savedId ?? workspaces[0].id;
        setActiveWorkspaceId(activeId);
        await loadPages(activeId);
      } else {
        // Fallback: create default workspace
        const workspace = await db.createWorkspace("My Workspace", "🏠");
        setWorkspaces([workspace]);
        setActiveWorkspaceId(workspace.id);
        await db.setSetting("active_workspace_id", workspace.id);
        await loadPages(workspace.id);
      }

      // Trigger trash auto-purge (30 days)
      try {
        await db.purgeOldTrash();
      } catch {
        // purgeOldTrash may not exist yet — ignore
      }
    } catch {
      // Tauri not available (SSG build) — skip
    }
  }, [loadSettings, setWorkspaces, setActiveWorkspaceId, loadPages]);

  // Effect - Initialize App
  useEffect(() => {
    async function init() {
      try {
        await loadSettings();

        // Check onboarding
        const onboardingComplete = await db.getSetting("onboarding_complete");
        if (onboardingComplete !== "true") {
          const workspaces: Workspace[] = await db.getWorkspaces();
          if (workspaces.length === 0) {
            setShowOnboarding(true);
            setReady(true);
            return;
          }
        }

        // Normal startup — load from DB
        await initApp();
      } catch {
        // Tauri not available (SSG build) — skip
        // TODO: What are we doing here? Show an error message? Handle another case
      }
      setReady(true);
    }
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect - Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Cmd+\ or Cmd+[ to toggle sidebar
      if (e.metaKey && (e.key === "\\" || e.key === "[")) {
        e.preventDefault();
        setSidebarCollapsed((prev: boolean) => !prev);
        return;
      }

      // Cmd+K to open search
      if (e.metaKey && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      // Cmd+Shift+P for command palette (same as Cmd+K)
      if (e.metaKey && e.shiftKey && e.key === "p") {
        e.preventDefault();
        setShowSearch(true);
        return;
      }

      // Cmd+N for new page (via template picker)
      if (e.metaKey && e.key === "n") {
        e.preventDefault();
        setShowTemplatePicker(true);
        return;
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handler - Sidebar Resize
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);

      const startX: number = e.clientX;
      const startWidth: number = sidebarWidth;

      function onMouseMove(e: MouseEvent) {
        const delta: number = e.clientX - startX;
        const newWidth: number = Math.min(
          SIDEBAR_MAX,
          Math.max(SIDEBAR_MIN, startWidth + delta),
        );
        setSidebarWidth(newWidth);
      }

      function onMouseUp() {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [sidebarWidth],
  );

  // Callback - Onboarding Complete
  const handleOnboardingComplete = useCallback(async () => {
    await initApp();
    setShowOnboarding(false);
    setReady(true);
  }, [initApp]);

  // Case - Loading
  if (!ready) return <AppLoading />;

  // Case - Onboarding
  if (showOnboarding)
    return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* SIDEBAR */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: sidebarWidth, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative flex-shrink-0 overflow-hidden print-hide"
          >
            <Sidebar
              width={sidebarWidth}
              onOpenSearch={() => setShowSearch(true)}
              onOpenTrash={() => setShowTrash(true)}
              onOpenSettings={() => setShowSettings(true)}
              onOpenTemplatePicker={() => setShowTemplatePicker(true)}
              onCollapse={() => setSidebarCollapsed(true)}
            />

            {/* RESIZE */}
            <div
              className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-accent/30 active:bg-accent/50"
              onMouseDown={handleResizeStart}
              style={{
                transition: isResizing ? "none" : "background-color 80ms",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTENT */}
      <main className="relative flex-1 pt-11 print-main">
        {/* SIDEBAR TOGGLE */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="absolute left-3 top-12 z-20 rounded-md p-1.5 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            title="Show sidebar (⌘[)"
          >
            <PanelLeft size={16} />
          </button>
        )}

        <AnimatePresence mode="wait">
          {activePageId ? (
            <motion.div
              key={activePageId}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="h-full"
            >
              <PageView pageId={activePageId} />
            </motion.div>
          ) : (
            <AppEmpty
              onToggleSidebar={() => setSidebarCollapsed(false)}
              sidebarCollapsed={sidebarCollapsed}
            />
          )}
        </AnimatePresence>
      </main>

      {/* MODALS */}
      <SearchPalette open={showSearch} onClose={() => setShowSearch(false)} />
      <SettingsPage
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
      <TrashPanel open={showTrash} onClose={() => setShowTrash(false)} />
      <TemplatePicker
        open={showTemplatePicker}
        onClose={() => setShowTemplatePicker(false)}
      />
    </div>
  );
};

export default AppShell;
