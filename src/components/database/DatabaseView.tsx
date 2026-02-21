"use client";

// REACT
import { useEffect } from "react";

// STORES
import { useDatabaseStore } from "@/stores/database";

// COMPONENTS
import PageHeader from "@/components/editor/PageHeader";
import ActiveViewRenderer from "./renderers/ActiveViewRenderer";
import ViewSwitcher from "./ViewSwitcher";
import FilterSortBar from "./FilterSortBar";

// TYPES
import type { Page, DatabaseViewType } from "@/types";

// TYPESCRIPT
type Props = {
  page: Page;
};

const DatabaseViewContainer = ({ page }: Props) => {
  // Stores
  const { loadDatabase, clearDatabase, getActiveView, loading, views } =
    useDatabaseStore();

  // Effect - Load Database on Page Load
  useEffect(() => {
    loadDatabase(page.id);
    return () => clearDatabase();
  }, [page.id, loadDatabase, clearDatabase]);

  // Get Active View
  const activeView = getActiveView();

  // Effect - Auto-Create Default View if None Exist
  useEffect(() => {
    if (!loading && views.length === 0) {
      useDatabaseStore.getState().addView("Table view", "table");
    }
  }, [loading, views.length]);

  // Case - Loading State
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-muted">Loading database...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* PAGE HEADER */}
      <div className="overflow-y-auto">
        <PageHeader page={page} />
      </div>

      {/* VIEW SWITCHER TABS */}
      <ViewSwitcher />

      {/* FILTER/SORT BAR */}
      <FilterSortBar />

      {/* VIEW CONTENT */}
      <div className="flex-1 overflow-auto">
        {activeView ? (
          <ActiveViewRenderer viewType={activeView.type as DatabaseViewType} />
        ) : (
          <div className="p-8 text-center text-sm text-text-muted">
            No view selected. Add a view to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseViewContainer;
