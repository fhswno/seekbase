# Development Guide

## Prerequisites

| Tool | Version | Check | Install |
|------|---------|-------|---------|
| Node.js | 18+ | `node -v` | [nodejs.org](https://nodejs.org) |
| pnpm | 8+ | `pnpm -v` | `npm install -g pnpm` |
| Rust | 1.70+ | `rustc --version` | [rustup.rs](https://rustup.rs) |
| Tauri CLI | 2.x | `pnpm tauri --version` | Installed via `pnpm install` |

**Optional:**
- [Ollama](https://ollama.com) — for local AI features. Pull a model: `ollama pull llama3.2`
- [Mistral API key](https://console.mistral.ai) — for cloud AI features

## Setup

```bash
git clone https://github.com/YOUR_USERNAME/seekbase.git
cd seekbase
pnpm install
```

## Running

```bash
cargo tauri dev
```

This does three things:
1. Starts the Next.js dev server on `http://localhost:2222`
2. Compiles the Rust backend
3. Opens the Tauri window pointing at the dev server

Hot reload works for both:
- **Frontend changes** — Next.js HMR reloads instantly
- **Rust changes** — Tauri watches `src-tauri/` and recompiles automatically

## Building

```bash
cargo tauri build
```

Output locations:
- **macOS:** `src-tauri/target/release/bundle/macos/Seekbase.app` and `bundle/dmg/Seekbase_*.dmg`
- **Windows:** `src-tauri/target/release/bundle/msi/` and `bundle/nsis/`

To build only the frontend (useful for checking TypeScript):
```bash
pnpm build
```

## Type Checking

Run these before pushing:

```bash
# TypeScript strict check
npx tsc --noEmit

# Rust check (no full build)
cd src-tauri && cargo check
```

## Debugging

### Frontend (JavaScript/React)

Open the WebKit Inspector inside the running app:

```
Cmd + Option + I
```

This gives you the full browser devtools: Console, Elements, Network, Sources. All `console.log()` output appears here — it does NOT appear in the terminal.

### Backend (Rust)

Rust `println!()` and `eprintln!()` output appears in the terminal where you ran `cargo tauri dev`.

For structured logging, add to your Rust code:
```rust
println!("[DEBUG] page_id={}, title={}", id, title);
```

### Database

The SQLite database file is at:
- **macOS:** `~/Library/Application Support/com.seekbase.app/seekbase.db`
- **Windows:** `%APPDATA%/com.seekbase.app/seekbase.db`

You can inspect it directly:
```bash
sqlite3 ~/Library/Application\ Support/com.seekbase.app/seekbase.db
.tables
SELECT * FROM pages LIMIT 5;
```

### Common issues

**Port 2222 already in use:**
Change the port in `package.json` (`"dev": "next dev -p XXXX"`) and `tauri.conf.json` (`"devUrl": "http://localhost:XXXX"`).

**Tauri can't find the frontend:**
Make sure `pnpm dev` is running. If the Next.js server hasn't started before Tauri opens, you'll see a blank window. Just wait or restart.

**Rust compilation slow:**
First build compiles all dependencies (~2-3 minutes). Subsequent builds are incremental (~5-10 seconds).

**App icon not updating:**
macOS caches icons aggressively. Clear the cache:
```bash
sudo rm -rf /Library/Caches/com.apple.iconservices.store
sudo killall iconservicesd
sudo killall Dock
killall Finder
```
May require a reboot.

**BlockNote editor blank:**
Check the browser console (`Cmd+Option+I`) for errors. Common cause: missing CSS imports in `SeekbaseEditor.tsx`. Required:
```ts
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
```

## App Icon

To replace the default icon:

1. Create a 1024x1024 PNG (RGBA, with transparency)
2. Generate all sizes:
   ```bash
   cd src-tauri
   cargo tauri icon /path/to/your-icon.png
   ```
3. Rebuild: `cargo tauri build`
4. Clear macOS icon cache if needed (see above)

## Project Commands Reference

| Command | What it does |
|---------|-------------|
| `cargo tauri dev` | Run app in development mode |
| `cargo tauri build` | Build production app bundle |
| `pnpm dev` | Start Next.js dev server only (port 2222) |
| `pnpm build` | Build Next.js static export to `out/` |
| `npx tsc --noEmit` | TypeScript type check |
| `cd src-tauri && cargo check` | Rust type check |
| `cd src-tauri && cargo tauri icon <path>` | Generate app icons from source image |

## Environment

### Tauri configuration

All Tauri settings are in `src-tauri/tauri.conf.json`:
- `app.windows` — window size, title bar style
- `app.security.csp` — Content Security Policy (controls which URLs the webview can access)
- `bundle.icon` — paths to icon files
- `build.devUrl` — URL of the dev server

### Tailwind configuration

Custom colors and fonts are defined as CSS variables in `src/app/globals.css` and mapped in `tailwind.config.ts`. Use the semantic names:

```
bg-bg          → main background
bg-surface     → sidebar, panels
bg-surface-2   → cards, hover states
border-border  → borders
text-text      → primary text
text-text-muted → secondary text
text-text-faint → disabled text
bg-accent      → primary actions
text-ai        → AI-related UI (purple)
```
