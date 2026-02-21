"use client";

// REACT
import React, { useState, useCallback } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";
import { useWorkspaceStore } from "@/stores/workspace";

// DB
import * as db from "@/lib/db";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// LUCIDE
import { X, Loader2 } from "lucide-react";

// TYPES
import { Template } from "@/types/template";
import { TEMPLATES } from "@/data/templates";

// TYPESCRIPT
type Props = {
  open: boolean;
  parentId?: string | null;
  onClose: () => void;
};

const TemplatePicker = ({ open, parentId, onClose }: Props) => {
  // States
  const [creating, setCreating] = useState<string | null>(null);

  // Store
  const { activeWorkspaceId } = useWorkspaceStore();
  const { setActivePageId } = usePagesStore();

  // Callback - Select
  const handleSelect = useCallback(
    async (template: Template) => {
      if (!activeWorkspaceId || creating) return;

      setCreating(template.id);
      try {
        let page;
        if (template.isDatabase) {
          page = await db.createPage({
            workspaceId: activeWorkspaceId,
            parentId: parentId ?? null,
            title: template.name,
            isDatabase: true,
            databaseType: template.databaseType,
          });

          // Create default properties for database templates
          if (template.id === "project-tracker") {
            await db.createProperty({
              pageId: page.id,
              name: "Status",
              type: "select",
              options: JSON.stringify({
                options: [
                  { value: "Not Started", color: "gray" },
                  { value: "In Progress", color: "blue" },
                  { value: "Done", color: "green" },
                ],
              }),
            });
            await db.createProperty({
              pageId: page.id,
              name: "Priority",
              type: "select",
              options: JSON.stringify({
                options: [
                  { value: "Low", color: "gray" },
                  { value: "Medium", color: "yellow" },
                  { value: "High", color: "red" },
                ],
              }),
            });
            await db.createProperty({
              pageId: page.id,
              name: "Due Date",
              type: "date",
              options: "{}",
            });
          } else if (template.id === "reading-list") {
            await db.createProperty({
              pageId: page.id,
              name: "Author",
              type: "text",
              options: "{}",
            });
            await db.createProperty({
              pageId: page.id,
              name: "Status",
              type: "select",
              options: JSON.stringify({
                options: [
                  { value: "To Read", color: "gray" },
                  { value: "Reading", color: "blue" },
                  { value: "Finished", color: "green" },
                ],
              }),
            });
            await db.createProperty({
              pageId: page.id,
              name: "Rating",
              type: "select",
              options: JSON.stringify({
                options: [
                  { value: "1", color: "red" },
                  { value: "2", color: "yellow" },
                  { value: "3", color: "yellow" },
                  { value: "4", color: "green" },
                  { value: "5", color: "green" },
                ],
              }),
            });
          } else if (template.id === "task-board") {
            await db.createProperty({
              pageId: page.id,
              name: "Status",
              type: "select",
              options: JSON.stringify({
                options: [
                  { value: "Backlog", color: "gray" },
                  { value: "To Do", color: "blue" },
                  { value: "In Progress", color: "yellow" },
                  { value: "Done", color: "green" },
                ],
              }),
            });
            await db.createProperty({
              pageId: page.id,
              name: "Assignee",
              type: "text",
              options: "{}",
            });
          }
        } else {
          page = await db.createPage({
            workspaceId: activeWorkspaceId,
            parentId: parentId ?? null,
            title: template.id === "blank" ? "Untitled" : template.name,
            isDatabase: false,
          });

          // Save template content
          if (template.content) {
            await db.savePageContent(page.id, template.content);
          }
        }

        // Update page icon
        await db.updatePage(page.id, { icon: template.emoji });

        // Reload pages store and navigate
        const { loadPages } = usePagesStore.getState();
        await loadPages(activeWorkspaceId);
        setActivePageId(page.id);
        onClose();
      } catch (e) {
        console.error("Failed to create from template:", e);
      }
      setCreating(null);
    },
    [activeWorkspaceId, parentId, setActivePageId, onClose, creating],
  );

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
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />

        {/* MODAL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border bg-bg shadow-2xl"
          onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
            e.stopPropagation()
          }
        >
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-sm font-semibold text-text">
              Choose a template
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-text-muted transition-colors duration-[80ms] hover:bg-surface-2 hover:text-text"
            >
              <X size={14} />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-2 gap-2 p-4">
            {TEMPLATES.map((template: Template) => (
              <button
                key={template.id}
                onClick={() => handleSelect(template)}
                disabled={creating !== null}
                className="group flex items-start gap-3 rounded-lg border border-border p-3 text-left transition-all duration-[80ms] hover:border-accent/50 hover:bg-surface disabled:opacity-50"
              >
                <span className="mt-0.5 flex-shrink-0 rounded-md bg-surface-2 p-2 text-text-muted group-hover:text-accent">
                  {creating === template.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    template.icon
                  )}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">
                    {template.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-faint">
                    {template.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TemplatePicker;
