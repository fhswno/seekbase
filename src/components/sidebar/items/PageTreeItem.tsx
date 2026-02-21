// REACT
import { useState, useEffect, useRef, useCallback } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";
import { useWorkspaceStore } from "@/stores/workspace";

// COMPONENTS
import PageMenuItem from "./PageMenuItem";

// FRAMER MOTION
import { motion, AnimatePresence } from "framer-motion";

// CLSX
import clsx from "clsx";

// DB
import * as db from "@/lib/db";

// LUCIDE
import {
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Star,
  StarOff,
  Trash2,
} from "lucide-react";

// TYPES
import { Page, PageTreeNode } from "@/types/page";

const PageTreeItem = ({
  node,
  depth,
}: {
  node: PageTreeNode;
  depth: number;
}) => {
  // State
  const [expanded, setExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState(node.page.title);
  const [showMenu, setShowMenu] = useState<boolean>(false);

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);

  // Stores
  const activePageId = usePagesStore((s) => s.activePageId);
  const setActivePageId = usePagesStore((s) => s.setActivePageId);
  const createPage = usePagesStore((s) => s.createPage);
  const updatePage = usePagesStore((s) => s.updatePage);
  const deletePage = usePagesStore((s) => s.deletePage);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  // Effect - Close Menu on Click Outside
  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  // Computed - Active & Children
  const isActive: boolean = activePageId === node.page.id;
  const hasChildren: boolean = node.children.length > 0;

  // Callback - Click to Set Active
  const handleClick = useCallback(() => {
    setActivePageId(node.page.id);
  }, [node.page.id, setActivePageId]);

  // Callback - Toggle Expand
  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev: boolean) => !prev);
  }, []);

  // Callback - Add Child Page
  const handleAddChild = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!activeWorkspaceId) return;
      const page: Page = await createPage(
        activeWorkspaceId,
        "Untitled",
        node.page.id,
      );
      setExpanded(true);
      setActivePageId(page.id);
    },
    [activeWorkspaceId, createPage, node.page.id, setActivePageId],
  );

  // Callback - Double Click to Rename
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsRenaming(true);
      setRenameValue(node.page.title);
    },
    [node.page.title],
  );

  // Callback - Submit Rename
  const handleRenameSubmit = useCallback(async () => {
    setIsRenaming(false);
    if (renameValue.trim() && renameValue !== node.page.title) {
      await updatePage(node.page.id, { title: renameValue.trim() });
    }
  }, [renameValue, node.page.id, node.page.title, updatePage]);

  // Callback - Handle Rename Key Down
  const handleRenameKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleRenameSubmit();
      } else if (e.key === "Escape") {
        setIsRenaming(false);
        setRenameValue(node.page.title);
      }
    },
    [handleRenameSubmit, node.page.title],
  );

  // Callback - Menu Actions
  const handleMenuAction = useCallback(
    async (action: "rename" | "duplicate" | "favorite" | "trash") => {
      setShowMenu(false);
      switch (action) {
        case "rename":
          setIsRenaming(true);
          setRenameValue(node.page.title);
          break;
        case "duplicate":
          if (!activeWorkspaceId) return;
          try {
            const newPage = await createPage(
              activeWorkspaceId,
              node.page.title + " (copy)",
              node.page.parentId ?? undefined,
            );
            // Copy content
            const content = await db.getPageContent(node.page.id);
            if (content) {
              await db.savePageContent(newPage.id, content);
            }
            setActivePageId(newPage.id);
          } catch {
            // ignore duplicate errors
          }
          break;
        case "favorite":
          await updatePage(node.page.id, { isFavorite: !node.page.isFavorite });
          break;
        case "trash":
          await deletePage(node.page.id);
          break;
      }
    },
    [
      node.page,
      activeWorkspaceId,
      createPage,
      updatePage,
      deletePage,
      setActivePageId,
    ],
  );

  return (
    <div>
      <div
        className={clsx(
          "group flex items-center rounded-md py-0.5 pr-1 transition-colors duration-[80ms]",
          isActive
            ? "bg-surface-2 border-l-2 border-accent"
            : "hover:bg-surface-2 border-l-2 border-transparent",
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* EXPAND/COLLAPSE */}
        <button
          onClick={handleToggle}
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-sm transition-colors duration-[80ms] hover:bg-border ${
            !hasChildren ? "invisible" : ""
          }`}
        >
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.12 }}
          >
            <ChevronRight size={14} className="text-text-muted" />
          </motion.div>
        </button>

        {/* PAGE ICON */}
        <span className="mr-1.5 flex-shrink-0 text-sm">
          {node.page.icon || (node.page.isDatabase ? "🗄️" : "")}
        </span>

        {/* TITLE/RENAME INPUT */}
        {isRenaming ? (
          <input
            className="flex-1 bg-transparent text-sm text-text outline-none"
            value={renameValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setRenameValue(e.target.value)
            }
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            autoFocus
            onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) =>
              e.stopPropagation()
            }
          />
        ) : (
          <span
            className={clsx(
              "flex-1 truncate text-sm",
              isActive ? "text-text font-medium" : "text-text-muted",
            )}
          >
            {node.page.title || "Untitled"}
          </span>
        )}

        {/* HOVER ACTIONS */}
        {isHovered && !isRenaming && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleAddChild}
              className="flex h-5 w-5 items-center justify-center rounded-sm transition-colors duration-[80ms] hover:bg-border"
              title="Add subpage"
            >
              <Plus size={14} className="text-text-muted" />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                className="flex h-5 w-5 items-center justify-center rounded-sm transition-colors duration-[80ms] hover:bg-border"
                title="More options"
                onClick={(
                  e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
                ) => {
                  e.stopPropagation();
                  setShowMenu((v: boolean) => !v);
                }}
              >
                <MoreHorizontal size={14} className="text-text-muted" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border bg-surface py-1 shadow-lg">
                  <PageMenuItem
                    icon={<Pencil size={14} />}
                    label="Rename"
                    onClick={() => handleMenuAction("rename")}
                  />
                  <PageMenuItem
                    icon={<Copy size={14} />}
                    label="Duplicate"
                    onClick={() => handleMenuAction("duplicate")}
                  />
                  <PageMenuItem
                    icon={
                      node.page.isFavorite ? (
                        <StarOff size={14} />
                      ) : (
                        <Star size={14} />
                      )
                    }
                    label={
                      node.page.isFavorite
                        ? "Remove from Favorites"
                        : "Add to Favorites"
                    }
                    onClick={() => handleMenuAction("favorite")}
                  />
                  <div className="my-1 border-t border-border" />
                  <PageMenuItem
                    icon={<Trash2 size={14} />}
                    label="Move to Trash"
                    onClick={() => handleMenuAction("trash")}
                    destructive
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CHILDREN */}
      <AnimatePresence initial={false}>
        {expanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="overflow-hidden"
          >
            {node.children.map((child: PageTreeNode) => (
              <PageTreeItem
                key={child.page.id}
                node={child}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PageTreeItem;
