# Architecture

Seekbase is a desktop app built on [Tauri v2](https://v2.tauri.app). It has two halves:

- **Rust backend** (`src-tauri/`) — SQLite database, file system access, OS integration
- **TypeScript frontend** (`src/`) — UI, editor, state management, AI API calls

They communicate over Tauri's IPC bridge: the frontend calls Rust functions, Rust returns data as JSON.

```
┌──────────────────────────────────────────────────────┐
│                    Tauri Window                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │              WebView (WebKit/WV2)               │ │
│  │                                                 │ │
│  │  Next.js App                                    │ │
│  │  ├── Zustand Stores (state)                     │ │
│  │  ├── React Components (UI)                      │ │
│  │  ├── BlockNote Editor                           │ │
│  │  └── lib/db.ts ──── invoke("command") ──┐       │ │
│  │                                         │       │ │
│  └─────────────────────────────────────────│───────┘ │
│                                            │ IPC     │
│  ┌─────────────────────────────────────────│───────┐ │
│  │              Rust Backend               ▼       │ │
│  │  ├── commands/ (Tauri command handlers)          │ │
│  │  ├── models/ (Serde structs)                     │ │
│  │  ├── db/ (SQLite pool + migrations)              │ │
│  │  └── ai/ (Ollama HTTP client)                    │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

## Tauri IPC: How Frontend Talks to Backend

Every database operation goes through this chain:

```
React Component
  → Zustand Store (action)
    → lib/db.ts (TypeScript wrapper)
      → tauri invoke("command_name", { args })
        → Rust #[tauri::command] fn
          → SQLite query via sqlx
        ← Returns Result<T, String>
      ← Deserialized to TypeScript type
    ← Store updates state
  ← Component re-renders
```

### Example: Creating a page

**Frontend** — `src/stores/pages.ts`:
```ts
createPage: async (workspaceId, title) => {
  const page = await db.createPage({ workspaceId, title, isDatabase: false });
  set((s) => ({ pages: [...s.pages, page] }));
}
```

**IPC wrapper** — `src/lib/db.ts`:
```ts
export async function createPage(params: CreatePageParams): Promise<Page> {
  return invoke<Page>("create_page", {
    workspaceId: params.workspaceId,
    title: params.title,
    isDatabase: params.isDatabase,
  });
}
```

**Backend** — `src-tauri/src/commands/pages.rs`:
```rust
#[tauri::command]
pub async fn create_page(
    state: State<'_, AppState>,
    workspace_id: String,
    title: String,
    is_database: bool,
) -> Result<Page, String> {
    let id = Uuid::new_v4().to_string();
    sqlx::query_as::<_, Page>("INSERT INTO pages ...")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}
```

### Key rules

1. **All Tauri commands return `Result<T, String>`** — the `String` is the error message shown to users
2. **Rust models use `#[serde(rename_all = "camelCase")]`** — TypeScript expects `camelCase`, Rust conventions are `snake_case`, Serde bridges them automatically
3. **`lib/db.ts` wraps every command** — the frontend never calls `invoke()` directly from components
4. **SSG safety** — `lib/db.ts` checks `isTauri()` before invoking. During `next build` (static export), Tauri APIs don't exist, so the guard prevents crashes.

## When to Write Rust vs. TypeScript

### Write Rust when you need:

| Need | Why Rust |
|------|----------|
| **Database queries** | SQLite runs in the Rust process. All reads and writes go through sqlx. |
| **File system access** | Saving images, reading files, resolving app data paths. Tauri sandboxes FS access. |
| **OS integration** | Print dialog, native file picker, window management. |
| **Security-sensitive operations** | API keys stored in settings should be read from Rust, not exposed to the webview. |
| **Heavy computation** | Anything that would block the UI thread (batch operations, data processing). |

### Write TypeScript when you need:

| Need | Why TypeScript |
|------|----------------|
| **UI rendering** | React components, layouts, animations. |
| **State management** | Zustand stores hold the app's client-side state. |
| **Editor logic** | BlockNote is a JavaScript library. All editor customization is in TS. |
| **AI streaming** | Ollama and Mistral use HTTP streaming (SSE). Fetch API in the browser handles this naturally. |
| **User interactions** | Click handlers, keyboard shortcuts, drag-and-drop. |

### Gray area

Some things could go in either layer. The rule of thumb: **if it touches the filesystem or database, it's Rust. If it touches the UI or makes HTTP requests, it's TypeScript.**

AI is the exception — even though it's an HTTP call, it uses streaming responses that are easier to handle in JS with `fetch()` and `ReadableStream` than in Rust with `reqwest`.

## State Management

All client-side state lives in Zustand stores:

| Store | Purpose | Key state |
|-------|---------|-----------|
| `usePagesStore` | Page tree, active page, CRUD | `pages`, `activePageId` |
| `useWorkspaceStore` | Workspaces, active workspace | `workspaces`, `activeWorkspaceId` |
| `useSettingsStore` | Key-value settings from DB | `settings` |
| `useDatabaseStore` | Properties, rows, cells, views for active database | `properties`, `rows`, `cells`, `views` |
| `useBlocksStore` | Blocks for the active page | `blocks`, `currentPageId` |

### Data flow

```
App startup
  → loadSettings() from DB
  → getWorkspaces() from DB
  → setActiveWorkspaceId()
  → loadPages(workspaceId) from DB
  → User clicks page → setActivePageId()
  → PageView loads content → getPageContent() from DB
  → If database page → useDatabaseStore.load(pageId)
```

Stores call `lib/db.ts` to read/write data. Components subscribe to stores via Zustand selectors. When store state changes, subscribed components re-render.

## Editor Architecture

The editor uses [BlockNote](https://blocknotejs.org), which is built on [ProseMirror](https://prosemirror.net) and [TipTap](https://tiptap.dev).

```
SeekbaseEditor (wrapper)
  └── BlockNoteView (renders the editor)
       ├── SuggestionMenuController (slash commands)
       ├── FormattingToolbarController (bold, italic, AI button)
       └── ProseMirror (core text editing engine)
```

### Content storage

BlockNote represents documents as an array of block objects. On every change (debounced 300ms), the entire block array is serialized to JSON and saved via `save_page_content(pageId, json)`. Loading a page calls `get_page_content(pageId)` and parses the JSON back into blocks.

This is stored in the `blocks` table as a single row with `type = 'document'` and the full JSON in `content`.

### Custom extensions

- **Seekbase theme** — custom colors matching the app's dark/light theme (defined in `SeekbaseEditor.tsx`)
- **AI toolbar button** — added to the formatting toolbar via `FormattingToolbarController`
- **`/ai` slash command** — custom slash menu item that opens an inline AI prompt
- **Autocomplete ghost text** — `AutocompleteGhost` component watches for idle state and fetches suggestions

## Database (Feature) Architecture

A "database" in Seekbase is a page with `is_database = true`. It has a relational structure:

```
Page (is_database = true)
  ├── DatabaseProperty[] — columns (name, type, options)
  ├── DatabaseRow[] — rows (each optionally linked to a sub-page)
  ├── DatabaseCell[] — values (keyed by row + property)
  └── DatabaseView[] — saved view configs (type, filters, sorts)
```

The `useDatabaseStore` loads all of this when a database page is opened. Views, filters, and sorts are applied client-side via `getFilteredSortedRows()`.

### View rendering

```
DatabaseViewContainer
  ├── ViewTabs (switch between views)
  ├── FilterBar (add/remove filters)
  ├── SortBar (add/remove sorts)
  └── [ActiveView]
       ├── TableView
       ├── BoardView (Kanban, grouped by select property)
       ├── GalleryView (card grid)
       ├── CalendarView (month grid, grouped by date)
       ├── ListView (compact rows)
       └── TimelineView (horizontal date range)
```

## AI Architecture

AI features use two providers with a unified interface:

```
useAI hook
  ├── reads ai_provider setting
  ├── if "ollama" → ollama.generateWithCallback()
  └── if "mistral" → mistral.generateWithCallback()
```

Both providers expose the same API:
- `generateWithCallback(params, onChunk)` — streams text chunks via callback
- `generateComplete(params)` — returns full text (non-streaming)

The `useAI` hook abstracts this, so components don't care which provider is active. They just call `generate(prompt)` and read the streaming `result`.

### Streaming flow

```
User triggers AI action
  → useAI.generate(prompt, systemPrompt)
    → Provider streams SSE chunks
      → onChunk callback appends text to result state
      → Component re-renders with new text (typing animation)
    → onComplete callback fires
  → Result displayed with action buttons (Replace, Insert, Copy, Discard)
```

## Security Model

- **No cloud by default.** All data is in a local SQLite file.
- **CSP enforced.** The webview's Content Security Policy restricts network access to `localhost` (Ollama) and `api.mistral.ai`.
- **Asset protocol.** Images are served via Tauri's `asset://` protocol from the app data directory, not from `file://`.
- **Input sanitization.** Filenames are stripped of special characters before saving. Base64 is used for binary IPC.
- **No `eval()`.** The CSP includes `unsafe-eval` only because Next.js requires it in development. Production builds should tighten this.
