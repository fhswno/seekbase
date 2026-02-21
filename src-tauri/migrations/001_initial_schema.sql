-- Seekbase initial schema

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    icon TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pages (
    id TEXT PRIMARY KEY NOT NULL,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id),
    parent_id TEXT REFERENCES pages(id),
    title TEXT NOT NULL DEFAULT 'Untitled',
    icon TEXT,
    cover_url TEXT,
    is_database INTEGER NOT NULL DEFAULT 0,
    database_type TEXT,
    sort_order REAL NOT NULL DEFAULT 0,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pages_workspace ON pages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_pages_parent ON pages(parent_id);

CREATE TABLE IF NOT EXISTS blocks (
    id TEXT PRIMARY KEY NOT NULL,
    page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    parent_block_id TEXT REFERENCES blocks(id),
    type TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '{}',
    sort_order REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blocks_page ON blocks(page_id);

-- Full-text search virtual table
CREATE VIRTUAL TABLE IF NOT EXISTS blocks_fts USING fts5(
    page_id UNINDEXED,
    block_id UNINDEXED,
    content
);

-- FTS sync triggers
CREATE TRIGGER IF NOT EXISTS blocks_ai AFTER INSERT ON blocks BEGIN
    INSERT INTO blocks_fts(page_id, block_id, content)
    VALUES (NEW.page_id, NEW.id, NEW.content);
END;

CREATE TRIGGER IF NOT EXISTS blocks_au AFTER UPDATE ON blocks BEGIN
    DELETE FROM blocks_fts WHERE block_id = OLD.id;
    INSERT INTO blocks_fts(page_id, block_id, content)
    VALUES (NEW.page_id, NEW.id, NEW.content);
END;

CREATE TRIGGER IF NOT EXISTS blocks_ad AFTER DELETE ON blocks BEGIN
    DELETE FROM blocks_fts WHERE block_id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS database_properties (
    id TEXT PRIMARY KEY NOT NULL,
    page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    options TEXT NOT NULL DEFAULT '{}',
    sort_order REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_db_props_page ON database_properties(page_id);

CREATE TABLE IF NOT EXISTS database_rows (
    id TEXT PRIMARY KEY NOT NULL,
    page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    row_page_id TEXT REFERENCES pages(id),
    sort_order REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_rows_page ON database_rows(page_id);

CREATE TABLE IF NOT EXISTS database_cells (
    id TEXT PRIMARY KEY NOT NULL,
    row_id TEXT NOT NULL REFERENCES database_rows(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL REFERENCES database_properties(id) ON DELETE CASCADE,
    value TEXT NOT NULL DEFAULT '{}',
    UNIQUE(row_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_db_cells_row ON database_cells(row_id);

CREATE TABLE IF NOT EXISTS database_views (
    id TEXT PRIMARY KEY NOT NULL,
    page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config TEXT NOT NULL DEFAULT '{}',
    sort_order REAL NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_db_views_page ON database_views(page_id);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);
