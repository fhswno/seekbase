// LUCIDE
import {
  Table2,
  Kanban,
  LayoutGrid,
  Calendar,
  List,
  GanttChart,
  Plus,
} from "lucide-react";

// TYPES
import type { DatabaseViewType } from "@/types";

export const DATABASE_VIEW_ICONS: Record<DatabaseViewType, React.ReactNode> = {
  table: <Table2 size={14} />,
  board: <Kanban size={14} />,
  gallery: <LayoutGrid size={14} />,
  calendar: <Calendar size={14} />,
  list: <List size={14} />,
  timeline: <GanttChart size={14} />,
};

export const DATABASE_VIEW_LABELS: Record<DatabaseViewType, string> = {
  table: "Table",
  board: "Board",
  gallery: "Gallery",
  calendar: "Calendar",
  list: "List",
  timeline: "Timeline",
};

export const DATABASE_FILTER_OPERATORS = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];
