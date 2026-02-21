// LUCIDE
import {
  Settings,
  Sparkles,
  Type,
  Palette,
  Keyboard,
  Heart,
  Info,
} from "lucide-react";

// TYPES
import { SettingsTab } from "@/types/settings";

export const SETTINGS_TABS: {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "workspace", label: "Workspace", icon: <Settings size={16} /> },
  { id: "ai", label: "AI", icon: <Sparkles size={16} /> },
  { id: "editor", label: "Editor", icon: <Type size={16} /> },
  { id: "appearance", label: "Appearance", icon: <Palette size={16} /> },
  { id: "shortcuts", label: "Shortcuts", icon: <Keyboard size={16} /> },
  { id: "credits", label: "Credits", icon: <Heart size={16} /> },
  { id: "about", label: "About", icon: <Info size={16} /> },
];

export const SETTINGS_SHORTCUTS: { key: string; description: string }[] = [
  { key: "Cmd+B", description: "Bold" },
  { key: "Cmd+I", description: "Italic" },
  { key: "Cmd+U", description: "Underline" },
  { key: "Cmd+Shift+S", description: "Strikethrough" },
  { key: "Cmd+K", description: "Search / Insert link" },
  { key: "Cmd+E", description: "Inline code" },
  { key: "Cmd+[ / Cmd+\\", description: "Toggle sidebar" },
  { key: "Cmd+N", description: "New page" },
  { key: "Cmd+D", description: "Duplicate block" },
  { key: "Cmd+/", description: "Toggle block type menu" },
  { key: "Cmd+Enter", description: "Toggle todo / open toggle" },
  { key: "Tab", description: "Indent block" },
  { key: "Shift+Tab", description: "Outdent block" },
  { key: "Cmd+Z", description: "Undo" },
  { key: "Cmd+Shift+Z", description: "Redo" },
  { key: "Cmd+A", description: "Select all blocks" },
  { key: "Cmd+Shift+P", description: "Command palette" },
  { key: "/", description: "Open slash command menu" },
  { key: "Esc", description: "Dismiss menu / close panel" },
];

export const CREDIT_LINKS: { name: string; desc: string; url: string }[] = [
  {
    name: "Tauri",
    desc: "Native app framework",
    url: "https://tauri.app",
  },
  {
    name: "Next.js",
    desc: "React framework",
    url: "https://nextjs.org",
  },
  {
    name: "BlockNote",
    desc: "Block editor",
    url: "https://blocknotejs.org",
  },
  {
    name: "Ollama",
    desc: "Local AI runtime",
    url: "https://ollama.com",
  },
  {
    name: "SQLite",
    desc: "Database engine",
    url: "https://sqlite.org",
  },
  {
    name: "Tailwind CSS",
    desc: "Styling",
    url: "https://tailwindcss.com",
  },
  {
    name: "Zustand",
    desc: "State management",
    url: "https://zustand.docs.pmnd.rs",
  },
  {
    name: "Framer Motion",
    desc: "Animations",
    url: "https://motion.dev",
  },
  { name: "Lucide", desc: "Icon library", url: "https://lucide.dev" },
  {
    name: "Rust",
    desc: "Backend language",
    url: "https://rust-lang.org",
  },
];

export const appearance_settings_options: {
  mode: "dark" | "light" | "system";
  label: string;
  swatch: React.ReactNode;
}[] = [
  {
    mode: "dark",
    label: "Dark",
    swatch: (
      <span className="h-3 w-3 rounded-full bg-[#0D0F14] ring-1 ring-border" />
    ),
  },
  {
    mode: "light",
    label: "Light",
    swatch: (
      <span className="h-3 w-3 rounded-full bg-white ring-1 ring-border" />
    ),
  },
  {
    mode: "system",
    label: "System",
    swatch: (
      <span className="relative h-3 w-3 overflow-hidden rounded-full ring-1 ring-border">
        <span className="absolute inset-0 bg-white" />
        <span
          className="absolute inset-0 bg-[#0D0F14]"
          style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
        />
      </span>
    ),
  },
];
