use crate::db::AppState;
use crate::models::workspace::Workspace;
use tauri::{Manager, State};

#[tauri::command]
pub async fn get_workspaces(state: State<'_, AppState>) -> Result<Vec<Workspace>, String> {
    sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces ORDER BY created_at")
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_workspace(
    state: State<'_, AppState>,
    name: String,
    icon: Option<String>,
) -> Result<Workspace, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO workspaces (id, name, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&name)
    .bind(&icon)
    .bind(now)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_workspace(
    state: State<'_, AppState>,
    id: String,
    name: Option<String>,
    icon: Option<String>,
) -> Result<Workspace, String> {
    let now = chrono::Utc::now().timestamp_millis();

    if let Some(ref new_name) = name {
        sqlx::query("UPDATE workspaces SET name = ?, updated_at = ? WHERE id = ?")
            .bind(new_name)
            .bind(now)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }

    if let Some(ref new_icon) = icon {
        sqlx::query("UPDATE workspaces SET icon = ?, updated_at = ? WHERE id = ?")
            .bind(new_icon)
            .bind(now)
            .bind(&id)
            .execute(&state.db)
            .await
            .map_err(|e| e.to_string())?;
    }

    sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_workspace_icon(
    app: tauri::AppHandle,
    state: State<'_, AppState>,
    workspace_id: String,
    source_path: String,
) -> Result<Workspace, String> {
    use std::path::Path;

    let source = Path::new(&source_path);
    let ext = source
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png");

    // Create workspace-icons directory in app data
    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let icons_dir = app_data.join("workspace-icons");
    std::fs::create_dir_all(&icons_dir).map_err(|e| e.to_string())?;

    // Copy file with a unique name
    let filename = format!("{}.{}", uuid::Uuid::new_v4(), ext);
    let dest = icons_dir.join(&filename);
    std::fs::copy(source, &dest).map_err(|e| e.to_string())?;

    // Update workspace icon to image: prefixed path
    let icon_value = format!("image:workspace-icons/{}", filename);
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query("UPDATE workspaces SET icon = ?, updated_at = ? WHERE id = ?")
        .bind(&icon_value)
        .bind(now)
        .bind(&workspace_id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, Workspace>("SELECT * FROM workspaces WHERE id = ?")
        .bind(&workspace_id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}
