use crate::db::AppState;
use crate::models::page::{Page, UpdatePageFields};
use tauri::State;

#[tauri::command]
pub async fn get_pages(
    state: State<'_, AppState>,
    workspace_id: String,
) -> Result<Vec<Page>, String> {
    sqlx::query_as::<_, Page>(
        "SELECT * FROM pages WHERE workspace_id = ? AND is_deleted = 0 ORDER BY sort_order",
    )
    .bind(&workspace_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_page(state: State<'_, AppState>, id: String) -> Result<Page, String> {
    sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_page(
    state: State<'_, AppState>,
    workspace_id: String,
    parent_id: Option<String>,
    title: String,
    is_database: bool,
    database_type: Option<String>,
) -> Result<Page, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO pages (id, workspace_id, parent_id, title, is_database, database_type, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&workspace_id)
    .bind(&parent_id)
    .bind(&title)
    .bind(is_database)
    .bind(&database_type)
    .bind(0.0)
    .bind(now)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    get_page(state, id).await
}

#[tauri::command]
pub async fn update_page(
    state: State<'_, AppState>,
    id: String,
    fields: UpdatePageFields,
) -> Result<Page, String> {
    let now = chrono::Utc::now().timestamp_millis();
    let current = get_page(state.clone(), id.clone()).await?;

    let title = fields.title.unwrap_or(current.title);
    let icon = fields.icon.or(current.icon);
    let cover_url = fields.cover_url.or(current.cover_url);
    let is_favorite = fields.is_favorite.unwrap_or(current.is_favorite);
    let database_type = fields.database_type.or(current.database_type);

    sqlx::query(
        "UPDATE pages SET title = ?, icon = ?, cover_url = ?, is_favorite = ?, database_type = ?, updated_at = ? WHERE id = ?",
    )
    .bind(&title)
    .bind(&icon)
    .bind(&cover_url)
    .bind(is_favorite)
    .bind(&database_type)
    .bind(now)
    .bind(&id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    get_page(state, id).await
}

#[tauri::command]
pub async fn delete_page(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();

    // Soft-delete the page and all its children recursively
    soft_delete_recursive(&state, &id, now).await
}

async fn soft_delete_recursive(state: &AppState, id: &str, now: i64) -> Result<(), String> {
    sqlx::query("UPDATE pages SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?")
        .bind(now)
        .bind(now)
        .bind(id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let children: Vec<Page> =
        sqlx::query_as::<_, Page>("SELECT * FROM pages WHERE parent_id = ? AND is_deleted = 0")
            .bind(id)
            .fetch_all(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    for child in children {
        Box::pin(soft_delete_recursive(state, &child.id, now)).await?;
    }

    Ok(())
}

#[tauri::command]
pub async fn restore_page(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "UPDATE pages SET is_deleted = 0, deleted_at = NULL, updated_at = ? WHERE id = ?",
    )
    .bind(now)
    .bind(&id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn get_deleted_pages(
    state: State<'_, AppState>,
    workspace_id: String,
) -> Result<Vec<Page>, String> {
    sqlx::query_as::<_, Page>(
        "SELECT * FROM pages WHERE workspace_id = ? AND is_deleted = 1 ORDER BY deleted_at DESC",
    )
    .bind(&workspace_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn permanently_delete_page(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    // CASCADE will handle blocks, database_properties, database_rows, database_views
    sqlx::query("DELETE FROM pages WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn move_page(
    state: State<'_, AppState>,
    id: String,
    new_parent_id: Option<String>,
    new_sort_order: f64,
) -> Result<(), String> {
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query("UPDATE pages SET parent_id = ?, sort_order = ?, updated_at = ? WHERE id = ?")
        .bind(&new_parent_id)
        .bind(new_sort_order)
        .bind(now)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Auto-purge pages deleted more than 30 days ago
#[tauri::command]
pub async fn purge_old_trash(state: State<'_, AppState>) -> Result<u64, String> {
    let thirty_days_ms: i64 = 30 * 24 * 60 * 60 * 1000;
    let cutoff = chrono::Utc::now().timestamp_millis() - thirty_days_ms;

    let result = sqlx::query("DELETE FROM pages WHERE is_deleted = 1 AND deleted_at < ?")
        .bind(cutoff)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(result.rows_affected())
}
