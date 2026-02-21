use sqlx::sqlite::{SqlitePool, SqlitePoolOptions};
use std::fs;
use tauri::{AppHandle, Manager};

pub struct AppState {
    pub db: SqlitePool,
}

pub async fn init_db(app: &AppHandle) -> Result<SqlitePool, Box<dyn std::error::Error>> {
    let app_dir = app
        .path()
        .app_data_dir()
        .expect("failed to resolve app data dir");

    fs::create_dir_all(&app_dir)?;

    let db_path = app_dir.join("seekbase.db");
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Set pragmas for performance and correctness
    sqlx::query("PRAGMA journal_mode=WAL")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA foreign_keys=ON")
        .execute(&pool)
        .await?;
    sqlx::query("PRAGMA busy_timeout=5000")
        .execute(&pool)
        .await?;

    // Run migrations — split on ';' but respect BEGIN...END trigger blocks
    let migration_sql = include_str!("../../migrations/001_initial_schema.sql");
    let statements = split_sql_statements(migration_sql);
    for stmt in &statements {
        let trimmed = stmt.trim();
        if !trimmed.is_empty() {
            sqlx::query(trimmed).execute(&pool).await?;
        }
    }

    Ok(pool)
}

/// Split SQL into individual statements, keeping BEGIN...END blocks intact.
fn split_sql_statements(sql: &str) -> Vec<String> {
    let mut statements = Vec::new();
    let mut current = String::new();
    let mut in_begin_block = false;

    for line in sql.lines() {
        let trimmed = line.trim();

        // Skip empty lines and comments
        if trimmed.is_empty() || trimmed.starts_with("--") {
            current.push_str(line);
            current.push('\n');
            continue;
        }

        let upper = trimmed.to_uppercase();

        // Detect BEGIN block start
        if upper.ends_with("BEGIN") {
            in_begin_block = true;
        }

        current.push_str(line);
        current.push('\n');

        // Detect END of trigger block
        if in_begin_block && upper.starts_with("END") {
            in_begin_block = false;
            // The END; line closes this statement
            let stmt = current.trim().trim_end_matches(';').trim().to_string();
            if !stmt.is_empty() {
                statements.push(stmt);
            }
            current.clear();
            continue;
        }

        // Outside of BEGIN blocks, split on semicolons at end of line
        if !in_begin_block && trimmed.ends_with(';') {
            let stmt = current.trim().trim_end_matches(';').trim().to_string();
            if !stmt.is_empty() {
                statements.push(stmt);
            }
            current.clear();
        }
    }

    // Handle any remaining content
    let remaining = current.trim().trim_end_matches(';').trim().to_string();
    if !remaining.is_empty() {
        statements.push(remaining);
    }

    statements
}
