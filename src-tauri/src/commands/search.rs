use crate::db::AppState;
use crate::models::search::SearchResult;
use tauri::State;

#[tauri::command]
pub async fn search(
    state: State<'_, AppState>,
    workspace_id: String,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    if query.trim().is_empty() {
        return Ok(vec![]);
    }

    // Escape FTS5 special characters and append wildcard for prefix matching
    let fts_query = format!("\"{}\"*", query.replace('"', "\"\""));

    sqlx::query_as::<_, SearchResult>(
        "SELECT
            fts.page_id,
            fts.block_id,
            fts.content,
            p.title AS page_title,
            p.icon AS page_icon
         FROM blocks_fts fts
         JOIN pages p ON p.id = fts.page_id
         WHERE blocks_fts MATCH ?
           AND p.workspace_id = ?
           AND p.is_deleted = 0
         LIMIT 50",
    )
    .bind(&fts_query)
    .bind(&workspace_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}
