<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="80" />
</p>

<h1 align="center">Seekbase</h1>

<p align="center">
  <strong>Your second brain. Fully yours.</strong>
</p>

<p align="center">
  A local-first, AI-native knowledge base for macOS and Windows.<br/>
  Open-source Notion alternative. No cloud. No subscriptions. Your data stays on your machine.
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#quick-start">Quick Start</a> &bull;
  <a href="#tech-stack">Tech Stack</a> &bull;
  <a href="docs/ARCHITECTURE.md">Architecture</a> &bull;
  <a href="docs/DEVELOPMENT.md">Development</a> &bull;
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img alt="Platform" src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-lightgrey.svg" />
  <img alt="Built with Tauri" src="https://img.shields.io/badge/built%20with-Tauri%20v2-orange.svg" />
</p>

---

<!-- TODO: Add screenshot -->
<!-- <p align="center"><img src="docs/assets/screenshot.png" width="800" /></p> -->

## Why Seekbase?

Most productivity tools lock your data in someone else's cloud, charge monthly, and break when the internet is down. Seekbase is different:

- **100% local.** SQLite on your machine. No servers. No accounts. No sync fees.
- **AI built in.** Summarize, rewrite, translate, and autocomplete — powered by [Ollama](https://ollama.com) (local) or [Mistral](https://mistral.ai) (cloud). Your choice.
- **Native performance.** Tauri v2 + Rust backend. Starts in under a second. Uses ~80MB of RAM.
- **Familiar UX.** If you've used Notion, you already know how to use Seekbase.

## Features

### Editor
- Block-based editor (headings, lists, todos, code, images, quotes, callouts, bookmarks, dividers)
- Slash command menu (`/`) with search
- Keyboard shortcuts matching Notion conventions
- PDF export via native print dialog

### Databases
- 6 view types: **Table**, **Board** (Kanban), **Gallery**, **Calendar**, **List**, **Timeline**
- 12 property types (text, number, select, multi-select, date, checkbox, URL, email, and more)
- Filters, sorts, and per-view configuration
- Each row is a full page — click to expand

### AI
- **Text actions** — select text, press `Cmd+J` to summarize, rewrite, explain, or translate
- **Inline generation** — type `/ai` to prompt the AI directly in the editor
- **Page summarization** — one-click TL;DR, key points, and action items in a sidebar
- **Autocomplete** — ghost text suggestions as you type (Tab to accept)
- **Dual providers** — Ollama for fully local AI, Mistral for cloud models

### Organization
- Infinite page nesting with drag-and-drop sidebar
- Workspaces with custom icons
- Favorites
- Full-text search (`Cmd+K`) powered by SQLite FTS5
- Soft-delete trash with 30-day auto-purge

### Polish
- Dark and light themes (plus system auto-detect)
- Onboarding flow with workspace setup and AI configuration
- Page templates (blank, meeting notes, project tracker, journal, reading list, task board)
- Custom emoji picker for page icons

## Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Rust** | 1.70+ | [rustup.rs](https://rustup.rs) |
| **Ollama** *(optional)* | latest | [ollama.com](https://ollama.com) |

### Run in development

```bash
git clone https://github.com/YOUR_USERNAME/seekbase.git
cd seekbase
pnpm install
cargo tauri dev
```

The app opens automatically. Next.js dev server runs on port 2222.

### Build for production

```bash
cargo tauri build
```

Output:
- **macOS:** `src-tauri/target/release/bundle/macos/Seekbase.app` and `.dmg`
- **Windows:** `src-tauri/target/release/bundle/msi/` and `.exe`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Desktop framework** | [Tauri v2](https://v2.tauri.app) (Rust + WebKit/WebView2) |
| **Frontend** | [Next.js 14](https://nextjs.org) (static export) |
| **Editor** | [BlockNote](https://blocknotejs.org) 0.46 |
| **Database** | SQLite via [sqlx](https://github.com/launchbadge/sqlx) |
| **State** | [Zustand](https://zustand-demo.pmnd.rs) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) |
| **Animations** | [Framer Motion](https://www.framer.com/motion) |
| **Icons** | [Lucide](https://lucide.dev) |
| **AI (local)** | [Ollama](https://ollama.com) |
| **AI (cloud)** | [Mistral AI](https://mistral.ai) |

## Project Structure

```
seekbase/
├── src/                          # Frontend (TypeScript)
│   ├── app/                      # Next.js app router + global styles
│   ├── components/
│   │   ├── editor/               # BlockNote editor, page header
│   │   ├── sidebar/              # Sidebar, page tree
│   │   ├── database/             # 6 database view components
│   │   ├── ai/                   # AI toolbar, inline prompt, autocomplete
│   │   ├── ui/                   # Settings, search, trash, onboarding
│   │   ├── loading/              # Loading screen
│   │   └── layout/               # App shell
│   ├── hooks/                    # useAI, useTheme
│   ├── stores/                   # Zustand: pages, workspace, settings, database, blocks
│   ├── lib/                      # db.ts (Tauri IPC), ollama.ts, mistral.ts
│   └── types/                    # TypeScript types matching Rust models
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── commands/             # Tauri command handlers
│   │   ├── models/               # Serde models (Page, Block, etc.)
│   │   ├── db/                   # SQLite pool + migrations
│   │   └── ai/                   # Ollama API client
│   ├── migrations/               # SQL schema files
│   └── tauri.conf.json           # Tauri configuration
├── docs/                         # Documentation
├── CONTRIBUTING.md
└── LICENSE
```

## Documentation

| Document | Description |
|----------|-------------|
| **[Architecture](docs/ARCHITECTURE.md)** | How the Rust backend and TypeScript frontend communicate. When to write Rust vs. JS. |
| **[Development](docs/DEVELOPMENT.md)** | Setting up your environment, running, building, debugging. |
| **[Database](docs/DATABASE.md)** | SQLite schema, migrations, FTS5 search, adding new tables. |
| **[Extending](docs/EXTENDING.md)** | Step-by-step guides to add features: commands, blocks, views, AI providers. |

## Contributing

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup instructions, code conventions, and the PR process.

## License

[MIT](LICENSE)
