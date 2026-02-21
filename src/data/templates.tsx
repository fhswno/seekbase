// LUCIDE
import {
  FileText,
  ClipboardList,
  Table2,
  BookOpen,
  Library,
  Kanban,
} from "lucide-react";

// TYPES
import { Template } from "@/types/template";

export const TEMPLATES: Template[] = [
  {
    id: "blank",
    name: "Blank Page",
    description: "Start from scratch",
    icon: <FileText size={20} />,
    emoji: "📝",
    isDatabase: false,
    content: JSON.stringify([{ type: "paragraph" }]),
  },
  {
    id: "meeting-notes",
    name: "Meeting Notes",
    description: "Capture meeting outcomes",
    icon: <ClipboardList size={20} />,
    emoji: "📋",
    isDatabase: false,
    content: JSON.stringify([
      {
        type: "heading",
        props: { level: 2 },
        content: [{ type: "text", text: "Meeting Notes", styles: {} }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Date: ",
            styles: { bold: true },
          },
          { type: "text", text: new Date().toLocaleDateString(), styles: {} },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Attendees: ", styles: { bold: true } },
        ],
      },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Agenda", styles: {} }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "Topic 1", styles: {} }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "Topic 2", styles: {} }],
      },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Discussion Notes", styles: {} }],
      },
      { type: "paragraph" },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Action Items", styles: {} }],
      },
      {
        type: "checkListItem",
        content: [{ type: "text", text: "Action item 1", styles: {} }],
      },
      {
        type: "checkListItem",
        content: [{ type: "text", text: "Action item 2", styles: {} }],
      },
    ]),
  },
  {
    id: "project-tracker",
    name: "Project Tracker",
    description: "Track tasks and progress",
    icon: <Table2 size={20} />,
    emoji: "🎯",
    isDatabase: true,
    databaseType: "table",
  },
  {
    id: "journal",
    name: "Personal Journal",
    description: "Daily thoughts and reflections",
    icon: <BookOpen size={20} />,
    emoji: "📓",
    isDatabase: false,
    content: JSON.stringify([
      {
        type: "heading",
        props: { level: 2 },
        content: [
          {
            type: "text",
            text: new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            styles: {},
          },
        ],
      },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Gratitude", styles: {} }],
      },
      {
        type: "bulletListItem",
        content: [{ type: "text", text: "I am grateful for...", styles: {} }],
      },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Today's Focus", styles: {} }],
      },
      { type: "paragraph" },
      {
        type: "heading",
        props: { level: 3 },
        content: [{ type: "text", text: "Reflections", styles: {} }],
      },
      { type: "paragraph" },
    ]),
  },
  {
    id: "reading-list",
    name: "Reading List",
    description: "Track books and articles",
    icon: <Library size={20} />,
    emoji: "📚",
    isDatabase: true,
    databaseType: "gallery",
  },
  {
    id: "task-board",
    name: "Task Board",
    description: "Kanban-style task management",
    icon: <Kanban size={20} />,
    emoji: "📌",
    isDatabase: true,
    databaseType: "board",
  },
];
