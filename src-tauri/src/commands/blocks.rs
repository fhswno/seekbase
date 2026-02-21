use crate::db::AppState;
use crate::models::block::{Block, BlockReorder};
use tauri::State;

#[tauri::command]
pub async fn get_blocks(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Vec<Block>, String> {
    sqlx::query_as::<_, Block>("SELECT * FROM blocks WHERE page_id = ? ORDER BY sort_order")
        .bind(&page_id)
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_block(
    state: State<'_, AppState>,
    page_id: String,
    r#type: String,
    content: String,
    sort_order: f64,
    parent_block_id: Option<String>,
) -> Result<Block, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO blocks (id, page_id, parent_block_id, type, content, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&page_id)
    .bind(&parent_block_id)
    .bind(&r#type)
    .bind(&content)
    .bind(sort_order)
    .bind(now)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Block>("SELECT * FROM blocks WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_block(
    state: State<'_, AppState>,
    id: String,
    content: String,
) -> Result<Block, String> {
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query("UPDATE blocks SET content = ?, updated_at = ? WHERE id = ?")
        .bind(&content)
        .bind(now)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Block>("SELECT * FROM blocks WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_block(state: State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM blocks WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn reorder_blocks(
    state: State<'_, AppState>,
    updates: Vec<BlockReorder>,
) -> Result<(), String> {
    for update in updates {
        sqlx::query("UPDATE blocks SET sort_order = ? WHERE id = ?")
            .bind(update.sort_order)
            .bind(&update.id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

/// Get the full BlockNote document JSON for a page.
/// Stored as a single block with type="document".
#[tauri::command]
pub async fn get_page_content(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Option<String>, String> {
    let result: Option<(String,)> = sqlx::query_as(
        "SELECT content FROM blocks WHERE page_id = ? AND type = 'document' LIMIT 1",
    )
    .bind(&page_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(result.map(|r| r.0))
}

/// Save the full BlockNote document JSON for a page.
/// Upserts a single block with type="document".
#[tauri::command]
pub async fn save_page_content(
    state: State<'_, AppState>,
    page_id: String,
    content: String,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();

    // Check if a document block already exists
    let existing: Option<(String,)> = sqlx::query_as(
        "SELECT id FROM blocks WHERE page_id = ? AND type = 'document' LIMIT 1",
    )
    .bind(&page_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    if let Some((id,)) = existing {
        sqlx::query("UPDATE blocks SET content = ?, updated_at = ? WHERE id = ?")
            .bind(&content)
            .bind(now)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    } else {
        let id = uuid::Uuid::new_v4().to_string();
        sqlx::query(
            "INSERT INTO blocks (id, page_id, type, content, sort_order, created_at, updated_at)
             VALUES (?, ?, 'document', ?, 0, ?, ?)",
        )
        .bind(&id)
        .bind(&page_id)
        .bind(&content)
        .bind(now)
        .bind(now)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;
    }

    // Also update the page's updated_at timestamp
    sqlx::query("UPDATE pages SET updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(&page_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
