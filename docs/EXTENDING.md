# Extending Seekbase

Step-by-step guides for adding features to Seekbase. Each section is self-contained — jump to the one you need.

## Table of Contents

- [Add a Tauri command](#add-a-tauri-command)
- [Add a database table](#add-a-database-table)
- [Add an AI provider](#add-an-ai-provider)
- [Add a database view type](#add-a-database-view-type)
- [Add a setting](#add-a-setting)
- [Add a keyboard shortcut](#add-a-keyboard-shortcut)

---

## Add a Tauri Command

A Tauri command is a Rust function callable from TypeScript. This is how the frontend reads and writes data.

### 1. Write the Rust command

Create or edit a file in `src-tauri/src/commands/`. Every command follows this pattern:

```rust
// src-tauri/src/commands/example.rs
use crate::db::AppState;
use tauri::State;

#[tauri::command]
pub async fn my_command(
    state: State<'_, AppState>,
    some_arg: String,
) -> Result<String, String> {
    sqlx::query_scalar::<_, String>("SELECT value FROM settings WHERE key = ?")
        .bind(&some_arg)
        .fetch_optional(&state.db)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Not found".to_string())
}
```

**Rules:**
- Return type must be `Result<T, String>` where `T` is serializable
- Use `State<'_, AppState>` to access the database pool
- Use `async` — never block the main thread
- Error handling: `.map_err(|e| e.to_string())` converts any error to a user-facing string

### 2. Export the module

If you created a new file, add it to `src-tauri/src/commands/mod.rs`:

```rust
pub mod example;
```

### 3. Register the command

Add it to the handler list in `src-tauri/src/lib.rs`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::example::my_command,
])
```

### 4. Add a TypeScript wrapper

In `src/lib/db.ts`:

```ts
export async function myCommand(someArg: string): Promise<string> {
  return invoke<string>("my_command", { someArg });
}
```

**Important:** Rust uses `snake_case` for function and parameter names. Tauri automatically converts the command name to `snake_case`, but argument names must match exactly. If the Rust parameter is `some_arg`, the TypeScript key must be `someArg` (Tauri handles the conversion because the Rust model uses `#[serde(rename_all = "camelCase")]` — but for raw command args, the names are matched directly by Tauri's convention).

### 5. Use it from a component or store

```ts
import * as db from "@/lib/db";

const result = await db.myCommand("hello");
```

---

## Add a Database Table

### 1. Create a migration

Create `src-tauri/migrations/002_add_comments.sql`:

```sql
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY NOT NULL,
    page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_comments_page ON comments(page_id);
```

### 2. Create a Rust model

Create `src-tauri/src/models/comment.rs`:

```rust
use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Comment {
    pub id: String,
    pub page_id: String,
    pub content: String,
    pub created_at: i64,
}
```

Add to `src-tauri/src/models/mod.rs`:

```rust
pub mod comment;
```

### 3. Create commands

Create `src-tauri/src/commands/comments.rs`:

```rust
use crate::db::AppState;
use crate::models::comment::Comment;
use tauri::State;

#[tauri::command]
pub async fn get_comments(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Vec<Comment>, String> {
    sqlx::query_as::<_, Comment>(
        "SELECT * FROM comments WHERE page_id = ? ORDER BY created_at ASC"
    )
    .bind(&page_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_comment(
    state: State<'_, AppState>,
    page_id: String,
    content: String,
) -> Result<Comment, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query_as::<_, Comment>(
        "INSERT INTO comments (id, page_id, content, created_at) VALUES (?, ?, ?, ?) RETURNING *"
    )
    .bind(&id)
    .bind(&page_id)
    .bind(&content)
    .bind(now)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())
}
```

### 4. Register, export, and add TypeScript types

Follow steps 2-5 from [Add a Tauri command](#add-a-tauri-command).

TypeScript type in `src/types/comment.ts`:

```ts
export type Comment = {
  id: string;
  pageId: string;
  content: string;
  createdAt: number;
};
```

---

## Add an AI Provider

Seekbase supports multiple AI providers through a common interface. To add a new one (e.g., OpenAI):

### 1. Create the client

Create `src/lib/openai.ts`:

```ts
export type OpenAIParams = {
  model: string;
  prompt: string;
  system?: string;
  apiKey: string;
  signal?: AbortSignal;
};

export async function generateWithCallback(
  params: OpenAIParams,
  onChunk: (chunk: string, fullText: string) => void,
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${params.apiKey}`,
    },
    body: JSON.stringify({
      model: params.model,
      stream: true,
      messages: [
        ...(params.system ? [{ role: "system", content: params.system }] : []),
        { role: "user", content: params.prompt },
      ],
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    // Parse SSE lines, extract content deltas
    for (const line of chunk.split("\n")) {
      if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
      const data = JSON.parse(line.slice(6));
      const text = data.choices?.[0]?.delta?.content ?? "";
      if (text) {
        fullText += text;
        onChunk(text, fullText);
      }
    }
  }

  return fullText;
}

export async function getModels(apiKey: string): Promise<string[]> {
  const res = await fetch("https://api.openai.com/v1/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const data = await res.json();
  return data.data.map((m: { id: string }) => m.id).sort();
}
```

### 2. Add settings keys

In `src/types/settings.ts`:

```ts
export type SettingKey =
  | // ... existing keys
  | "openai_api_key"
  | "openai_model";
```

### 3. Route in the useAI hook

In `src/hooks/useAI.ts`, add a case for the new provider:

```ts
const provider = settingsStore.getSetting("ai_provider");

if (provider === "openai") {
  const apiKey = settingsStore.getSetting("openai_api_key") ?? "";
  const model = settingsStore.getSetting("openai_model") ?? "gpt-4o";
  result = await openai.generateWithCallback(
    { model, prompt, system, apiKey, signal },
    onChunk,
  );
}
```

### 4. Update CSP

In `src-tauri/tauri.conf.json`, add the API domain to `connect-src`:

```
connect-src 'self' ... https://api.openai.com
```

### 5. Add settings UI

Add a section to `src/components/ui/SettingsPage.tsx` following the Mistral pattern: provider toggle, API key input, verify button, model selector.

---

## Add a Database View Type

### 1. Add the type

In `src/types/page.ts`, extend `DatabaseViewType`:

```ts
export type DatabaseViewType =
  | "table"
  | "board"
  | "gallery"
  | "calendar"
  | "list"
  | "timeline"
  | "chart";  // new
```

### 2. Create the view component

Create `src/components/database/ChartView.tsx`:

```tsx
import { useDatabaseStore } from "@/stores/database";

type Props = {
  pageId: string;
};

export function ChartView({ pageId }: Props) {
  const { properties, getFilteredSortedRows } = useDatabaseStore();
  const rows = getFilteredSortedRows();

  return (
    <div className="p-4">
      {/* Render your chart using rows and properties */}
    </div>
  );
}
```

### 3. Register in the view container

In `src/components/database/DatabaseView.tsx`, add the view to the switch statement that renders the active view:

```tsx
case "chart":
  return <ChartView pageId={page.id} />;
```

### 4. Add to the view creation UI

Update the view type selector (in the view tabs area) to include "Chart" as an option.

---

## Add a Setting

### 1. Add the key type

In `src/types/settings.ts`:

```ts
export type SettingKey =
  | // ... existing keys
  | "my_new_setting";
```

### 2. Use it

**Read:**
```ts
const value = useSettingsStore((s) => s.getSetting("my_new_setting"));
```

**Write:**
```ts
const { setSetting } = useSettingsStore();
await setSetting("my_new_setting", "value");
```

Settings are stored in the `settings` table as key-value pairs. No migration needed — the table accepts any key.

### 3. Add UI

Add a control to the appropriate section in `src/components/ui/SettingsPage.tsx`. Follow the existing patterns for toggles, dropdowns, and text inputs.

---

## Add a Keyboard Shortcut

### Global shortcuts

Global shortcuts (work anywhere in the app) are registered in `src/components/layout/AppShell.tsx`:

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.metaKey && e.key === "k") {
      e.preventDefault();
      setShowSearch(true);
    }
  }
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

### Editor shortcuts

Shortcuts that should only work inside the editor go in `src/components/editor/SeekbaseEditor.tsx`:

```tsx
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
```

For shortcuts that interact with BlockNote's editing (bold, italic, etc.), BlockNote handles these internally. You don't need to register them manually.
