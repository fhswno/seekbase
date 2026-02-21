// REACT
import { useEffect, useState, useCallback } from "react";

// STORE
import { usePagesStore } from "@/stores/pages";

// COMPONENTS
import PageHeader from "./PageHeader";
import SeekbaseEditor from "./SeekbaseEditor";
import SummarySidebar from "../ai/SummarySidebar";

// FRAMER MOTION
import { AnimatePresence } from "framer-motion";

// DB
import * as db from "@/lib/db";

// TYPES
import { Block as BNBlock, PartialBlock } from "@blocknote/core";

const EditorPageView = ({ pageId }: { pageId: string }) => {
  // Store
  const page = usePagesStore((s) => s.getPageById(pageId));

  // States
  const [initialContent, setInitialContent] = useState<PartialBlock[] | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [showSummary, setShowSummary] = useState<boolean>(false);
  const [pageContent, setPageContent] = useState<string>("");

  // Effect - Load Page Content
  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      setLoading(true);
      setShowSummary(false);
      try {
        const contentJson = await db.getPageContent(pageId);
        if (cancelled) return;

        if (contentJson) {
          const parsed = JSON.parse(contentJson) as PartialBlock[];
          setInitialContent(parsed);
        } else {
          setInitialContent([{ type: "paragraph" as const }]);
        }
      } catch {
        if (!cancelled) {
          setInitialContent([{ type: "paragraph" as const }]);
        }
      }
      if (!cancelled) {
        setLoading(false);
        setEditorKey((k) => k + 1);
      }
    }

    loadContent();
    return () => {
      cancelled = true;
    };
  }, [pageId]);

  // Callback - Handle Content Change
  const handleContentChange = useCallback(
    async (blocks: BNBlock[]) => {
      try {
        const json: string = JSON.stringify(blocks);
        await db.savePageContent(pageId, json);

        // Extract plain text for summary
        let text = "";
        for (const block of blocks) {
          if (block.content && Array.isArray(block.content)) {
            for (const item of block.content) {
              if ("text" in item && typeof item.text === "string") {
                text += item.text + "\n";
              }
            }
          }
        }
        setPageContent(text);
      } catch {
        // Silently fail on save errors for now
      }
    },
    [pageId],
  );

  // Callback - Toggle Summary Sidebar
  const handleSummarize = useCallback(() => {
    setShowSummary((prev: boolean) => !prev);
  }, []);

  // Case - Page Not Found
  if (!page) return null;

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <PageHeader page={page} onSummarize={handleSummarize} />

        <div className="mx-auto max-w-3xl px-4 pb-24 pt-4">
          {loading ? (
            <div className="py-8 text-center text-sm text-text-faint">
              Loading...
            </div>
          ) : (
            initialContent && (
              <SeekbaseEditor
                key={editorKey}
                initialContent={initialContent}
                onContentChange={handleContentChange}
              />
            )
          )}
        </div>
      </div>

      {/* SUMMARY SIDEBAR */}
      <AnimatePresence>
        {showSummary && (
          <SummarySidebar
            pageContent={pageContent}
            onClose={() => setShowSummary(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditorPageView;
