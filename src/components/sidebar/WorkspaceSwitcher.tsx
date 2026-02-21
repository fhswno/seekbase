"use client";

// REACT
import React, { useState, useRef, useEffect, useCallback } from "react";

// LUCIDE
import { Check, ChevronDown, Plus, Pencil, ArrowLeft } from "lucide-react";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// STORE
import { useWorkspaceStore } from "@/stores/workspace";

// COMPONENTS
import WorkspaceIcon from "@/components/ui/WorkspaceIcon";
import IconPicker from "@/components/ui/IconPicker";

// TYPES
import { Workspace } from "@/types";

const WorkspaceSwitcher = () => {
  // States
  const [open, setOpen] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>("");

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editNameRef = useRef<HTMLInputElement>(null);

  // Stores
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const switchWorkspace = useWorkspaceStore((s) => s.switchWorkspace);
  const createWorkspace = useWorkspaceStore((s) => s.createWorkspace);
  const updateWorkspace = useWorkspaceStore((s) => s.updateWorkspace);
  const updateWorkspaceIcon = useWorkspaceStore((s) => s.updateWorkspaceIcon);
  const saveWorkspaceIconFromFile = useWorkspaceStore(
    (s) => s.saveWorkspaceIconFromFile,
  );

  // Find - Active and Editing Workspaces
  const activeWorkspace = workspaces.find(
    (w: Workspace) => w.id === activeWorkspaceId,
  );
  const editingWorkspace = editingId
    ? workspaces.find((w: Workspace) => w.id === editingId)
    : null;

  // Effect - Close on Outside Click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        handleCloseDropdown();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect - Focus Input on Create
  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  // Effect - Focus Input on Edit
  useEffect(() => {
    if (editingId) editNameRef.current?.focus();
  }, [editingId]);

  // Callback - Close Dropdown
  const handleCloseDropdown = useCallback(() => {
    if (
      editingId &&
      editingWorkspace &&
      editName.trim() &&
      editName !== editingWorkspace.name
    ) {
      updateWorkspace(editingId, editName.trim());
    }
    setOpen(false);
    setCreating(false);
    setNewName("");
    setEditingId(null);
    setEditName("");
  }, [editingId, editingWorkspace, editName, updateWorkspace]);

  // Callback - Switch Workspace
  const handleSwitch = useCallback(
    async (id: string) => {
      if (id === activeWorkspaceId) {
        setOpen(false);
        return;
      }
      await switchWorkspace(id);
      setOpen(false);
      setEditingId(null);
    },
    [activeWorkspaceId, switchWorkspace],
  );

  // Callback - Create Workspace
  const handleCreate = useCallback(async () => {
    const trimmed: string = newName.trim();
    if (!trimmed) return;
    const ws: Workspace = await createWorkspace(trimmed, "🏠");
    await switchWorkspace(ws.id);
    setNewName("");
    setCreating(false);
    setOpen(false);
  }, [newName, createWorkspace, switchWorkspace]);

  // Callback - Start Edit
  const handleStartEdit = useCallback(
    (wsId: string) => {
      const ws = workspaces.find((w: Workspace) => w.id === wsId);
      setEditingId(wsId);
      setEditName(ws?.name ?? "");
    },
    [workspaces],
  );

  // Callback - Save Edit
  const handleSaveEditName = useCallback(() => {
    if (!editingId || !editingWorkspace) return;
    if (editName.trim() && editName !== editingWorkspace.name) {
      updateWorkspace(editingId, editName.trim());
    }
  }, [editingId, editingWorkspace, editName, updateWorkspace]);

  // Callback - Save Edit Icon
  const handleSelectIcon = useCallback(
    async (icon: string) => {
      if (!editingId) return;
      await updateWorkspaceIcon(editingId, icon);
    },
    [editingId, updateWorkspaceIcon],
  );

  // Callback - Save Edit Icon from File
  const handleUploadImage = useCallback(
    async (filePath: string) => {
      if (!editingId) return;
      await saveWorkspaceIconFromFile(editingId, filePath);
    },
    [editingId, saveWorkspaceIconFromFile],
  );

  return (
    <div ref={dropdownRef} className="relative">
      {/* TRIGGER */}
      <button
        onClick={() => {
          setOpen(!open);
          setEditingId(null);
          setCreating(false);
        }}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1 transition-colors duration-[80ms] hover:bg-surface-2"
      >
        <WorkspaceIcon icon={activeWorkspace?.icon ?? null} size={18} />
        <span className="flex-1 truncate text-left text-sm font-semibold text-text">
          {activeWorkspace?.name ?? "Seekbase"}
        </span>
        <ChevronDown
          size={14}
          className={`text-text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* DROPDOWN */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border bg-surface shadow-xl"
          >
            {/* EDIT MODE */}
            {editingId && editingWorkspace && (
              <div className="p-2">
                {/* BACK BUTTON */}
                <button
                  onClick={() => {
                    handleSaveEditName();
                    setEditingId(null);
                  }}
                  className="mb-2 flex items-center gap-1 text-xs text-text-muted transition-colors duration-[80ms] hover:text-text"
                >
                  <ArrowLeft size={12} />
                  Back
                </button>

                {/* NAME EDITOR */}
                <div className="mb-2">
                  <label className="mb-1 block text-xs text-text-faint">
                    Name
                  </label>
                  <input
                    ref={editNameRef}
                    value={editName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditName(e.target.value)
                    }
                    onBlur={handleSaveEditName}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        handleSaveEditName();
                        editNameRef.current?.blur();
                      }
                    }}
                    className="w-full rounded-md border border-border bg-bg px-2 py-1 text-sm text-text outline-none focus:border-accent"
                  />
                </div>

                {/* ICON PICKER */}
                <div className="mb-1">
                  <label className="mb-1 block text-xs text-text-faint">
                    Icon
                  </label>
                </div>
                <IconPicker
                  currentIcon={editingWorkspace.icon}
                  onSelectIcon={handleSelectIcon}
                  onUploadImage={handleUploadImage}
                />
              </div>
            )}

            {/* LIST MODE */}
            {!editingId && (
              <>
                <div className="max-h-64 overflow-y-auto p-1">
                  {workspaces.map((ws: Workspace, index: number) => (
                    <div key={index} className="group flex items-center gap-1">
                      <button
                        onClick={() => handleSwitch(ws.id)}
                        className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors duration-[80ms] hover:bg-surface-2"
                      >
                        <WorkspaceIcon icon={ws.icon} size={18} />
                        <span className="flex-1 truncate text-left text-text">
                          {ws.name}
                        </span>
                        {ws.id === activeWorkspaceId && (
                          <Check size={14} className="text-accent" />
                        )}
                      </button>
                      <button
                        onClick={(
                          e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
                        ) => {
                          e.stopPropagation();
                          handleStartEdit(ws.id);
                        }}
                        className="rounded-md p-1 text-text-faint opacity-0 transition-all duration-[80ms] hover:bg-surface-2 hover:text-text-muted group-hover:opacity-100"
                        title="Edit workspace"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border p-1">
                  {creating ? (
                    <div className="flex items-center gap-1 px-1">
                      <input
                        ref={inputRef}
                        value={newName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewName(e.target.value)
                        }
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLInputElement>,
                        ) => {
                          if (e.key === "Enter") handleCreate();
                          if (e.key === "Escape") {
                            setCreating(false);
                            setNewName("");
                          }
                        }}
                        placeholder="Workspace name"
                        className="flex-1 rounded-md border border-border bg-bg px-2 py-1 text-sm text-text outline-none focus:border-accent"
                      />
                      <button
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        className="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white transition-colors duration-[80ms] hover:bg-accent-light disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreating(true)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
                    >
                      <Plus size={14} />
                      New workspace
                    </button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceSwitcher;
