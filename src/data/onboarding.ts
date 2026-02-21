export const ONBOARDING_CONTENT: {
  type: "heading" | "paragraph" | "bulletListItem";
  props?: any;
  content: any[];
}[] = [
  {
    type: "heading",
    props: { level: 1 },
    content: [{ type: "text", text: "Welcome to Seekbase", styles: {} }],
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "Seekbase is your local-first knowledge base. Everything stays on your device — no cloud, no tracking, fully yours.",
        styles: {},
      },
    ],
  },
  {
    type: "heading",
    props: { level: 2 },
    content: [{ type: "text", text: "Quick Tips", styles: {} }],
  },
  {
    type: "bulletListItem",
    content: [
      {
        type: "text",
        text: 'Type "/" to open the slash command menu and add different block types',
        styles: {},
      },
    ],
  },
  {
    type: "bulletListItem",
    content: [
      {
        type: "text",
        text: "Use Cmd+K to quickly search across all your pages",
        styles: {},
      },
    ],
  },
  {
    type: "bulletListItem",
    content: [
      {
        type: "text",
        text: "Create databases for structured data — tables, boards, calendars, and more",
        styles: {},
      },
    ],
  },
  {
    type: "bulletListItem",
    content: [
      {
        type: "text",
        text: "Select text and use AI to summarize, rewrite, explain, or translate",
        styles: {},
      },
    ],
  },
  {
    type: "heading",
    props: { level: 2 },
    content: [{ type: "text", text: "AI Features", styles: {} }],
  },
  {
    type: "paragraph",
    content: [
      {
        type: "text",
        text: "Seekbase uses Ollama for on-device AI. Make sure Ollama is running to use AI features. You can configure your model in Settings.",
        styles: {},
      },
    ],
  },
];
