"use client";

// REACT
import { useCallback, useRef, useState, useEffect, useMemo } from "react";

// COMPONENTS
import AIToolbarButton from "./buttons/AIToolbarButton";

// BLOCKNOTE
import type { Block as BNBlock, PartialBlock } from "@blocknote/core";
import { filterSuggestionItems } from "@blocknote/core/extensions";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  FormattingToolbarController,
  FormattingToolbar,
  getFormattingToolbarItems,
  useComponentsContext,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import type { Theme } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// LUCIDE
import { Sparkles } from "lucide-react";

// FRAMER MOTION
import { AnimatePresence } from "framer-motion";

// COMPONENTS
import { AITextToolbar } from "@/components/ai/AITextToolbar";
import { AIInlinePrompt } from "@/components/ai/AIInlinePrompt";
import { AutocompleteGhost } from "@/components/ai/AutocompleteGhost";

// STORE
import { useSettingsStore } from "@/stores/settings";

// DB
import * as db from "@/lib/db";

// Seekbase dark theme for BlockNote
const seekbaseDarkTheme = {
  colors: {
    editor: {
      text: "#E8EAED",
      background: "#0D0F14",
    },
    menu: {
      text: "#E8EAED",
      background: "#13161E",
    },
    tooltip: {
      text: "#E8EAED",
      background: "#1C2030",
    },
    hovered: {
      text: "#E8EAED",
      background: "#1C2030",
    },
    selected: {
      text: "#FFFFFF",
      background: "#3B5BDB",
    },
    disabled: {
      text: "#374151",
      background: "#13161E",
    },
    shadow: "#000000",
    border: "#252A3A",
    sideMenu: "#6B7280",
  },
  borderRadius: 6,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
} satisfies Theme;

// Seekbase light theme for BlockNote
const seekbaseLightTheme = {
  colors: {
    editor: {
      text: "#1A1D23",
      background: "#FFFFFF",
    },
    menu: {
      text: "#1A1D23",
      background: "#F8F9FA",
    },
    tooltip: {
      text: "#1A1D23",
      background: "#F0F1F3",
    },
    hovered: {
      text: "#1A1D23",
      background: "#F0F1F3",
    },
    selected: {
      text: "#FFFFFF",
      background: "#3B5BDB",
    },
    disabled: {
      text: "#C0C5CE",
      background: "#F8F9FA",
    },
    shadow: "#00000020",
    border: "#E2E4E9",
    sideMenu: "#6B7280",
  },
  borderRadius: 6,
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
} satisfies Theme;

// TYPESCRIPT
type Props = {
  initialContent?: PartialBlock[];
  onContentChange?: (blocks: BNBlock[]) => void;
  editable?: boolean;
};

// TODO: This component is getting pretty large - consider splitting into smaller components or hooks if it grows more

const SeekbaseEditor = ({
  initialContent,
  onContentChange,
  editable = true,
}: Props) => {
  // State
  const [selectedText, setSelectedText] = useState<string>("");
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [showAIPrompt, setShowAIPrompt] = useState<boolean>(false);
  const [editorFocused, setEditorFocused] = useState<boolean>(false);

  // Refs
  const cachedSelectionText = useRef("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const cachedSelectionRect = useRef<DOMRect | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stores
  const currentThemeSetting =
    useSettingsStore((s) => s.getSetting("theme")) ?? "dark";
  const resolvedTheme = useMemo(() => {
    if (currentThemeSetting === "system") {
      if (typeof window !== "undefined") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return "dark";
    }
    return currentThemeSetting;
  }, [currentThemeSetting]);

  // Memo - Seekbase Theme
  const seekbaseTheme = useMemo(
    () =>
      resolvedTheme === "light"
        ? { light: seekbaseLightTheme, dark: seekbaseLightTheme }
        : { light: seekbaseDarkTheme, dark: seekbaseDarkTheme },
    [resolvedTheme],
  );

  // Components Context - Override default BlockNote components
  const editor = useCreateBlockNote({
    initialContent:
      initialContent && initialContent.length > 0
        ? initialContent
        : [{ type: "paragraph" as const }],
    uploadFile: async (file: File) => {
      try {
        const { convertFileSrc } = await import("@tauri-apps/api/core");
        const buffer = await file.arrayBuffer();
        // Convert to base64 for efficient IPC transfer
        const uint8 = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < uint8.length; i++) {
          binary += String.fromCharCode(uint8[i]);
        }
        const base64 = btoa(binary);
        const savedPath = await db.saveEditorImageBytes(
          base64,
          file.name || "image.png",
        );
        return convertFileSrc(savedPath);
      } catch {
        return URL.createObjectURL(file);
      }
    },
  });

  // Callback - Handle Content Change with Debounce
  const handleChange = useCallback(() => {
    if (!onContentChange) return;

    // 300ms debounce per spec
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onContentChange(editor.document);
    }, 300);
  }, [editor, onContentChange]);

  // Effect - Cache Selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !editorContainerRef.current) {
        cachedSelectionText.current = "";
        cachedSelectionRect.current = null;
        return;
      }
      const range = selection.getRangeAt(0);
      if (!editorContainerRef.current.contains(range.commonAncestorContainer))
        return;
      const text = selection.toString().trim();
      if (text.length >= 3) {
        cachedSelectionText.current = text;
        cachedSelectionRect.current = range.getBoundingClientRect();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  // Callback - Show AI Toolbar for Selection
  const showAIToolbarForSelection = useCallback(() => {
    // Try live selection first, fall back to cached
    let text = "";
    let rect: DOMRect | null = null;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed && editorContainerRef.current) {
      const range = selection.getRangeAt(0);
      if (editorContainerRef.current.contains(range.commonAncestorContainer)) {
        text = selection.toString().trim();
        rect = range.getBoundingClientRect();
      }
    }

    // Fall back to cached selection (for toolbar button clicks where selection collapsed)
    if (text.length < 3 && cachedSelectionText.current.length >= 3) {
      text = cachedSelectionText.current;
      rect = cachedSelectionRect.current;
    }

    if (text.length < 3 || !rect) return;

    setSelectedText(text);
    setToolbarPosition({
      top: rect.bottom + 8,
      left: Math.max(8, rect.left + rect.width / 2 - 120),
    });
  }, []);

  // Effect - Listen for Cmd+J to trigger AI toolbar for current selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        showAIToolbarForSelection();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showAIToolbarForSelection]);

  // Callback - Handle AI Replace
  const handleAIReplace = useCallback(
    async (newText: string) => {
      const selection = editor.getSelection();
      if (selection) {
        const blocks = selection.blocks;
        if (blocks.length > 0) {
          const parsed = await editor.tryParseMarkdownToBlocks(newText);
          if (parsed.length > 0) {
            // Update first selected block with first parsed block
            editor.updateBlock(blocks[0], parsed[0]);
            // Insert remaining parsed blocks after the first
            if (parsed.length > 1) {
              editor.insertBlocks(parsed.slice(1), blocks[0], "after");
            }
            // Remove extra originally-selected blocks
            for (let i = 1; i < blocks.length; i++) {
              editor.removeBlocks([blocks[i]]);
            }
          }
        }
      }
    },
    [editor],
  );

  // Callback - Handle AI Insert Below
  const handleAIInsertBelow = useCallback(
    async (text: string) => {
      const selection = editor.getSelection();
      const cursorBlock =
        selection?.blocks[selection.blocks.length - 1] ??
        editor.document[editor.document.length - 1];
      if (cursorBlock) {
        const parsed = await editor.tryParseMarkdownToBlocks(text);
        editor.insertBlocks(
          parsed.length > 0 ? parsed : [{ type: "paragraph", content: text }],
          cursorBlock,
          "after",
        );
      }
    },
    [editor],
  );

  // Callback - Handle AI Insert
  const handleAIInsert = useCallback(
    async (text: string) => {
      const parsed = await editor.tryParseMarkdownToBlocks(text);
      const blocksToInsert =
        parsed.length > 0
          ? parsed
          : [{ type: "paragraph" as const, content: text }];

      const lastBlock = editor.document[editor.document.length - 1];
      if (lastBlock) {
        editor.insertBlocks(blocksToInsert, lastBlock, "after");
      }

      setShowAIPrompt(false);
    },
    [editor],
  );

  // Callback - Get Context for Autocomplete
  const getContext = useCallback(() => {
    const blocks = editor.document;
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
    // Return last ~500 words
    const words = text.split(/\s+/);
    return words.slice(-500).join(" ");
  }, [editor]);

  // Callback - Handle Autocomplete Accept
  const handleAutocompleteAccept = useCallback(
    (text: string) => {
      const cursor = editor.getTextCursorPosition();
      if (cursor?.block) {
        const block = cursor.block;
        const currentContent = block.content;
        if (Array.isArray(currentContent) && currentContent.length > 0) {
          const lastItem = currentContent[currentContent.length - 1];
          if ("text" in lastItem && typeof lastItem.text === "string") {
            // Append to last text item
            editor.updateBlock(block, {
              content: [
                ...currentContent.slice(0, -1),
                { ...lastItem, text: lastItem.text + text },
              ],
            });
            return;
          }
        }
        // Fallback: insert as new paragraph after cursor block
        editor.insertBlocks(
          [{ type: "paragraph", content: text }],
          block,
          "after",
        );
      }
    },
    [editor],
  );

  // Callback - Get Slash Menu Items
  const getSlashMenuItems = useCallback(
    async (query: string) => {
      const defaultItems = getDefaultReactSlashMenuItems(editor);
      const aiItem = {
        title: "Ask AI",
        onItemClick: () => {
          setShowAIPrompt(true);
        },
        aliases: ["ai", "ask"],
        group: "AI",
        icon: <Sparkles size={18} />,
        subtext: "Ask AI to write content",
      };
      return filterSuggestionItems([...defaultItems, aiItem], query);
    },
    [editor],
  );

  return (
    <div
      ref={editorContainerRef}
      className="seekbase-editor relative"
      onFocus={() => setEditorFocused(true)}
      onBlur={() => setEditorFocused(false)}
    >
      <BlockNoteView
        editor={editor}
        theme={seekbaseTheme}
        editable={editable}
        onChange={handleChange}
        slashMenu={false}
        formattingToolbar={false}
      >
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={getSlashMenuItems}
        />
        <FormattingToolbarController
          formattingToolbar={() => (
            <FormattingToolbar>
              {getFormattingToolbarItems()}
              <AIToolbarButton onTrigger={showAIToolbarForSelection} />
            </FormattingToolbar>
          )}
        />
      </BlockNoteView>

      {/* AI TEXT TOOLBAR */}
      <AnimatePresence>
        {selectedText && toolbarPosition && !showAIPrompt && (
          <AITextToolbar
            selectedText={selectedText}
            position={toolbarPosition}
            onReplace={handleAIReplace}
            onInsertBelow={handleAIInsertBelow}
            onDismiss={() => {
              setSelectedText("");
              setToolbarPosition(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* INLINE AI PROMPT */}
      <AnimatePresence>
        {showAIPrompt && (
          <AIInlinePrompt
            onInsert={handleAIInsert}
            onDismiss={() => setShowAIPrompt(false)}
          />
        )}
      </AnimatePresence>

      {/* AUTOCOMPLETE GHOST TESt */}
      <AutocompleteGhost
        editorElement={editorContainerRef.current}
        getContext={getContext}
        onAccept={handleAutocompleteAccept}
        editorFocused={editorFocused}
      />
    </div>
  );
};

export default SeekbaseEditor;
