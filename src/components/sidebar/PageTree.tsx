"use client";

// REACT
import { useMemo } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";

// COMPONENTS
import PageTreeItem from "./items/PageTreeItem";

// TYPES
import { Page, PageTreeNode } from "@/types/page";

const PageTree = () => {
  // Stores
  const pages = usePagesStore((s) => s.pages);

  // Memo - Build Tree Structure
  const tree = useMemo(() => {
    const rootPages = pages
      .filter((p: Page) => !p.parentId)
      .sort((a: Page, b: Page) => a.sortOrder - b.sortOrder);

    function buildTree(parentId: string | null): PageTreeNode[] {
      return pages
        .filter((p: Page) => p.parentId === parentId)
        .sort((a: Page, b: Page) => a.sortOrder - b.sortOrder)
        .map((page) => ({
          page,
          children: buildTree(page.id),
        }));
    }

    return rootPages.map((page: Page) => ({
      page,
      children: buildTree(page.id),
    }));
  }, [pages]);

  // Case - No Pages
  if (tree.length === 0) {
    return (
      <div className="px-4 py-3 text-xs text-text-faint">
        No pages yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="px-1">
      {tree.map((node) => (
        <PageTreeItem key={node.page.id} node={node} depth={0} />
      ))}
    </div>
  );
};

export default PageTree;
