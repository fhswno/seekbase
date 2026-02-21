# Database

Seekbase uses SQLite for all persistent storage. The database file lives in the OS app data directory and is accessed exclusively from the Rust backend via [sqlx](https://github.com/launchbadge/sqlx).

## File Location

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/com.seekbase.app/seekbase.db` |
| Windows | `%APPDATA%/com.seekbase.app/seekbase.db` |

## Initialization

On app startup, `src-tauri/src/db/mod.rs` runs:

1. Resolves the app data directory
2. Creates `seekbase.db` if it doesn't exist
3. Opens a connection pool (max 5 connections)
4. Sets SQLite pragmas:
   - `journal_mode = WAL` — write-ahead logging for concurrent reads
   - `foreign_keys = ON` — enforces referential integrity
   - `busy_timeout = 5000` — waits 5 seconds on locked tables before failing
5. Runs migrations from `src-tauri/migrations/`

The connection pool is stored in `AppState` and injected into every Tauri command via `State<'_, AppState>`.

## Schema

All tables are defined in `src-tauri/migrations/001_initial_schema.sql`.

### workspaces

Top-level container for pages.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `name` | TEXT | Display name |
| `icon` | TEXT | Emoji or file path |
| `created_at` | INTEGER | Unix timestamp (ms) |
| `updated_at` | INTEGER | Unix timestamp (ms) |

### pages

Every page and database. Supports infinite nesting via `parent_id`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `workspace_id` | TEXT FK | References `workspaces.id` |
| `parent_id` | TEXT FK | References `pages.id`. `NULL` = root page |
| `title` | TEXT | Default: `'Untitled'` |
| `icon` | TEXT | Emoji string |
| `cover_url` | TEXT | Cover image path |
| `is_database` | INTEGER | `0` = page, `1` = database |
| `database_type` | TEXT | `table`, `board`, `gallery`, `calendar`, `list`, `timeline` |
| `sort_order` | REAL | Fractional ordering within siblings |
| `is_favorite` | INTEGER | `0` or `1` |
| `is_deleted` | INTEGER | `0` or `1` (soft delete) |
| `deleted_at` | INTEGER | Timestamp of deletion |
| `created_at` | INTEGER | Unix timestamp (ms) |
| `updated_at` | INTEGER | Unix timestamp (ms) |

**Indexes:** `workspace_id`, `parent_id`

### blocks

Individual content blocks within a page. Supports nesting via `parent_block_id` (for toggles, etc.).

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `page_id` | TEXT FK | References `pages.id`, cascades on delete |
| `parent_block_id` | TEXT FK | References `blocks.id` |
| `type` | TEXT | `paragraph`, `heading_1`, `heading_2`, `heading_3`, `bulleted_list`, `numbered_list`, `todo`, `toggle`, `quote`, `divider`, `code`, `image`, `callout`, `bookmark` |
| `content` | TEXT | JSON object — block-type-specific content |
| `sort_order` | REAL | Fractional ordering |
| `created_at` | INTEGER | Unix timestamp (ms) |
| `updated_at` | INTEGER | Unix timestamp (ms) |

**Note:** The BlockNote editor stores the entire document as a single block with `type = 'document'` and the full JSON array in `content`. The individual block rows are used by the search index.

### blocks_fts

FTS5 virtual table for full-text search. Kept in sync automatically via triggers.

| Column | Notes |
|--------|-------|
| `page_id` | Not indexed (just stored for filtering) |
| `block_id` | Not indexed (stored for reference) |
| `content` | Indexed text content |

### database_properties

Columns of a database page.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `page_id` | TEXT FK | The database page |
| `name` | TEXT | Column header |
| `type` | TEXT | `text`, `number`, `select`, `multi_select`, `date`, `checkbox`, `url`, `email`, `relation`, `formula`, `created_at`, `updated_at` |
| `options` | TEXT | JSON config. For `select`: `{"options": [{"label": "Todo", "color": "blue"}]}` |
| `sort_order` | REAL | Column ordering |

### database_rows

Rows in a database.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `page_id` | TEXT FK | The database page |
| `row_page_id` | TEXT FK | Optional linked sub-page (each row can be opened as a full page) |
| `sort_order` | REAL | Row ordering |
| `created_at` | INTEGER | Unix timestamp (ms) |
| `updated_at` | INTEGER | Unix timestamp (ms) |

### database_cells

Individual cell values, keyed by `(row_id, property_id)`.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `row_id` | TEXT FK | References `database_rows.id` |
| `property_id` | TEXT FK | References `database_properties.id` |
| `value` | TEXT | String value. Multi-select stored as JSON array. |

**Unique constraint:** `(row_id, property_id)`

### database_views

Saved view configurations for a database.

| Column | Type | Notes |
|--------|------|-------|
| `id` | TEXT PK | UUID v4 |
| `page_id` | TEXT FK | The database page |
| `name` | TEXT | View label (e.g., "All Tasks") |
| `type` | TEXT | `table`, `board`, `gallery`, `calendar`, `list`, `timeline` |
| `config` | TEXT | JSON: filters, sorts, visible properties, group-by |
| `sort_order` | REAL | View tab ordering |

### settings

Key-value store for app configuration.

| Column | Type | Notes |
|--------|------|-------|
| `key` | TEXT PK | Setting identifier |
| `value` | TEXT | Setting value |

**Known keys:** `ollama_model`, `ollama_base_url`, `onboarding_complete`, `active_workspace_id`, `font_size`, `autocomplete_enabled`, `autocomplete_delay`, `theme`, `ai_provider`, `mistral_api_key`, `mistral_model`

## Full-Text Search

Search uses SQLite FTS5. Three triggers keep the `blocks_fts` table in sync with `blocks`:

| Trigger | When | Action |
|---------|------|--------|
| `blocks_ai` | After INSERT on blocks | Insert into FTS |
| `blocks_au` | After UPDATE on blocks | Delete old, insert new |
| `blocks_ad` | After DELETE on blocks | Delete from FTS |

**Querying** (from `src-tauri/src/commands/search.rs`):

```sql
SELECT page_id, block_id, snippet(blocks_fts, 2, '<mark>', '</mark>', '...', 32) as snippet
FROM blocks_fts
WHERE content MATCH ?
```

The `search` command joins results with `pages` to return titles and icons.

## Soft Deletes

Pages use soft deletion:
- `delete_page(id)` sets `is_deleted = 1` and `deleted_at = now()`. Child pages are deleted recursively.
- `restore_page(id)` sets `is_deleted = 0` and clears `deleted_at`.
- `permanently_delete_page(id)` actually deletes the row. Cascading foreign keys clean up blocks, properties, rows, cells, and views.
- `purge_old_trash()` runs on app startup and deletes pages trashed more than 30 days ago.

## Sort Ordering

All orderable items (`pages`, `blocks`, `database_rows`, `database_properties`, `database_views`) use `REAL` sort order. This allows inserting between two items by averaging their sort orders:

```
Item A: sort_order = 1.0
Item B: sort_order = 2.0
Insert C between A and B: sort_order = 1.5
```

## Migrations

Migration files live in `src-tauri/migrations/` and are run on startup. The current schema is in `001_initial_schema.sql`.

### Adding a new migration

1. Create `src-tauri/migrations/002_your_change.sql`
2. The migration runner in `db/mod.rs` splits on `;` and executes each statement
3. Use `IF NOT EXISTS` for safety (migrations might run multiple times)

**Important:** The migration runner has a custom statement splitter that preserves `BEGIN...END` blocks for triggers. Regular `;` inside trigger bodies won't cause premature splitting.

### Adding a new table

1. Add the `CREATE TABLE` to a new migration file
2. Add a Rust model in `src-tauri/src/models/`
3. Add commands in `src-tauri/src/commands/`
4. Register commands in `src-tauri/src/lib.rs`
5. Add TypeScript types in `src/types/`
6. Add wrapper functions in `src/lib/db.ts`

See [Extending](EXTENDING.md) for a full walkthrough.
