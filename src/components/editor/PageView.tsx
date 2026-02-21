"use client";

// REACT
import { useEffect, useState, useCallback } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";

// COMPONENTS
import EditorPageView from "./EditorPageView";
import DatabaseViewContainer from "@/components/database/DatabaseView";

// TYPESCRIPT
type Props = {
  pageId: string;
};

const PageView = ({ pageId }: Props) => {
  // Store
  const page = usePagesStore((s) => s.getPageById(pageId));

  // Case - Page Not Found
  if (!page) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-muted">Page not found</p>
      </div>
    );
  }

  // Case - Database Page
  if (page.isDatabase) {
    return <DatabaseViewContainer page={page} />;
  }

  // Regular pages render the editor
  return <EditorPageView pageId={pageId} />;
};

export default PageView;
