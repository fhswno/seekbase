# Contributing to Seekbase

Thanks for your interest in contributing. This document covers everything you need to get started.

## Getting Started

### Prerequisites

- **Node.js 18+** and **pnpm 8+**
- **Rust 1.70+** (install via [rustup](https://rustup.rs))
- **Tauri CLI** — installed automatically via `pnpm`

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/seekbase.git
cd seekbase
pnpm install
cargo tauri dev
```

This starts the Next.js dev server on port 2222 and opens the Tauri window. Hot reload works for both frontend and backend changes.

## Code Organization

```
src/            → TypeScript frontend (Next.js, React, Zustand)
src-tauri/src/  → Rust backend (Tauri commands, SQLite, models)
```

**When to write Rust:**
- Database queries and mutations
- File system operations (saving images, reading files)
- Anything that needs OS-level access (print, dialogs)
- Heavy computation that would block the UI thread

**When to write TypeScript:**
- UI components and layouts
- State management (Zustand stores)
- Editor logic (BlockNote)
- AI streaming (Ollama/Mistral API calls from the frontend)

See [Architecture](docs/ARCHITECTURE.md) for the full breakdown.

## Development Workflow

### Branch naming

```
feature/short-description
fix/issue-description
docs/what-changed
```

### Commit messages

Use clear, imperative commit messages:

```
Add board view drag-and-drop between columns
Fix emoji picker search not filtering results
Update database schema docs
```

No prefixes like `feat:` or `fix:` required — just be descriptive.

### Making changes

1. **Create a branch** off `main`
2. **Make your changes** — keep PRs focused on one thing
3. **Check types** before pushing:
   ```bash
   npx tsc --noEmit          # TypeScript
   cd src-tauri && cargo check # Rust
   ```
4. **Build** to verify nothing breaks:
   ```bash
   pnpm build                # Next.js static export
   ```
5. **Open a PR** with a clear description of what changed and why

### Pull requests

- Keep PRs small and focused. One feature or fix per PR.
- Include screenshots for UI changes.
- Describe what you tested manually.
- PRs need one approval before merge.

## Code Conventions

### TypeScript

- **Strict mode** — zero `any` types
- **Functional components** — no class components
- **Named exports** for components, `default export` only when the file IS the component
- **Zustand** for all shared state — no prop drilling beyond 2 levels
- **`isTauri()` guard** — wrap all Tauri API calls to prevent SSG build failures:
  ```ts
  if (!isTauri()) throw new Error("Tauri not available");
  ```

### Rust

- **`Result<T, String>`** for all Tauri command return types
- **`#[serde(rename_all = "camelCase")]`** on all models — frontend expects camelCase
- **`State<'_, AppState>`** to access the SQLite pool
- **No blocking** the main thread — use `async` for all database operations
- **`use tauri::Manager`** — required for `.path()`, `.manage()`, and other AppHandle methods

### CSS / Styling

- **Tailwind utilities** for everything — avoid custom CSS unless overriding BlockNote
- **CSS variables** for all colors (defined in `globals.css`)
- **`transition-colors duration-[80ms]`** on all interactive elements
- **`clsx`** for conditional class composition

### File structure

When adding a new component:

```
src/components/feature/
├── MyComponent.tsx    # Component
├── SubComponent.tsx   # Child components in the same folder
```

When adding a new Tauri command:

```
src-tauri/src/commands/feature.rs   # Command handler
src-tauri/src/models/feature.rs     # Serde model (if new types needed)
src/lib/db.ts                       # TypeScript wrapper
src/types/feature.ts                # TypeScript type
```

## Testing

There are no automated tests yet. This is a great area for contribution. When testing manually:

1. **Editor** — create blocks of each type, reorder them, undo/redo
2. **Databases** — create rows, edit cells, switch views, apply filters/sorts
3. **AI** — test with Ollama running and with it stopped (should show friendly error)
4. **Search** — create pages with content, search for keywords
5. **Sidebar** — create nested pages, drag to reorder, rename, delete, restore from trash

## Reporting Issues

When filing an issue, include:

- **OS and version** (e.g., macOS 15.1, Windows 11)
- **Steps to reproduce**
- **Expected vs. actual behavior**
- **Console output** — open WebKit Inspector with `Cmd+Option+I` to capture frontend errors

## Areas Where Help Is Needed

- **Automated tests** — unit tests for stores, integration tests for Tauri commands
- **Windows testing** — most development happens on macOS
- **Accessibility** — screen reader support, keyboard navigation audit
- **Performance** — profiling with large page counts (1000+ pages)
- **Localization** — i18n support for non-English users
- **New database views** — improving Timeline and Calendar views
- **Mobile** — Tauri supports iOS and Android, but no mobile UI exists yet

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
