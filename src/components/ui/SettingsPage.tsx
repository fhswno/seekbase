"use client";

// REACT
import { useState, useEffect } from "react";

// COMPONENTS
import WorkspaceSettings from "./settings/category/WorkspaceSettings";
import AISettings from "./settings/category/AISettings";
import EditorSettings from "./settings/category/EditorSettings";
import AppearanceSettings from "./settings/category/AppearanceSettings";
import ShortcutsSettings from "./settings/category/ShortcutsSettings";
import CreditsSettings from "./settings/category/CreditsSettings";
import AboutSettings from "./settings/category/AboutSettings";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// CLSX
import clsx from "clsx";

// LUCIDE
import { X } from "lucide-react";

// DATA
import { SETTINGS_TABS } from "@/data/settings";

// TYPES
import { SettingsTab } from "@/types/settings";

// TYPESCRIPT
type Props = {
  open: boolean;
  onClose: () => void;
};

const SettingsPage = ({ open, onClose }: Props) => {
  // State
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace");

  // Effect - Reset to Workspace Tab on Open
  useEffect(() => {
    if (open) setActiveTab("workspace");
  }, [open]);

  // Effect - Escape to Close
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Case - Not Open
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* BACKDROP */}
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        {/* SETTINGS PANEL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="relative flex h-[80vh] w-[720px] max-w-[90vw] overflow-hidden rounded-xl border border-border bg-bg shadow-2xl"
        >
          {/* SIDEBAR */}
          <div className="w-48 flex-shrink-0 border-r border-border bg-surface p-3">
            <div className="mb-4 flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold text-text">Settings</h2>
              <button
                onClick={onClose}
                className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
              >
                <X size={14} />
              </button>
            </div>
            <nav className="space-y-0.5">
              {SETTINGS_TABS.map((tab, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-[80ms]",
                    activeTab === tab.id
                      ? "bg-surface-2 text-text"
                      : "text-text-muted hover:bg-surface-2/50 hover:text-text",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "workspace" && <WorkspaceSettings />}
            {activeTab === "ai" && <AISettings />}
            {activeTab === "editor" && <EditorSettings />}
            {activeTab === "appearance" && <AppearanceSettings />}
            {activeTab === "shortcuts" && <ShortcutsSettings />}
            {activeTab === "credits" && <CreditsSettings />}
            {activeTab === "about" && <AboutSettings />}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsPage;
