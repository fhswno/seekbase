use crate::db::AppState;
use crate::models::database::{DatabaseCell, DatabaseProperty, DatabaseRow, DatabaseView};
use tauri::State;

// --- Properties ---

#[tauri::command]
pub async fn get_database_properties(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Vec<DatabaseProperty>, String> {
    sqlx::query_as::<_, DatabaseProperty>(
        "SELECT * FROM database_properties WHERE page_id = ? ORDER BY sort_order",
    )
    .bind(&page_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_property(
    state: State<'_, AppState>,
    page_id: String,
    name: String,
    r#type: String,
    options: String,
) -> Result<DatabaseProperty, String> {
    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO database_properties (id, page_id, name, type, options, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&page_id)
    .bind(&name)
    .bind(&r#type)
    .bind(&options)
    .bind(0.0)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseProperty>("SELECT * FROM database_properties WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_property(
    state: State<'_, AppState>,
    id: String,
    name: Option<String>,
    r#type: Option<String>,
    options: Option<String>,
    sort_order: Option<f64>,
) -> Result<DatabaseProperty, String> {
    let current =
        sqlx::query_as::<_, DatabaseProperty>("SELECT * FROM database_properties WHERE id = ?")
            .bind(&id)
            .fetch_one(&state.db)
            .await
            .map_err(|e| e.to_string())?;

    let name = name.unwrap_or(current.name);
    let prop_type = r#type.unwrap_or(current.r#type);
    let options = options.unwrap_or(current.options);
    let sort_order = sort_order.unwrap_or(current.sort_order);

    sqlx::query(
        "UPDATE database_properties SET name = ?, type = ?, options = ?, sort_order = ? WHERE id = ?",
    )
    .bind(&name)
    .bind(&prop_type)
    .bind(&options)
    .bind(sort_order)
    .bind(&id)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseProperty>("SELECT * FROM database_properties WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_property(state: State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM database_properties WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// --- Rows ---

#[tauri::command]
pub async fn get_database_rows(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Vec<DatabaseRow>, String> {
    sqlx::query_as::<_, DatabaseRow>(
        "SELECT * FROM database_rows WHERE page_id = ? ORDER BY sort_order",
    )
    .bind(&page_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_row(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<DatabaseRow, String> {
    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().timestamp_millis();

    sqlx::query(
        "INSERT INTO database_rows (id, page_id, sort_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&page_id)
    .bind(0.0)
    .bind(now)
    .bind(now)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseRow>("SELECT * FROM database_rows WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_row(state: State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM database_rows WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

// --- Cells ---

#[tauri::command]
pub async fn get_cells(
    state: State<'_, AppState>,
    row_id: String,
) -> Result<Vec<DatabaseCell>, String> {
    sqlx::query_as::<_, DatabaseCell>("SELECT * FROM database_cells WHERE row_id = ?")
        .bind(&row_id)
        .fetch_all(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_cell(
    state: State<'_, AppState>,
    row_id: String,
    property_id: String,
    value: String,
) -> Result<DatabaseCell, String> {
    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO database_cells (id, row_id, property_id, value)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(row_id, property_id) DO UPDATE SET value = excluded.value",
    )
    .bind(&id)
    .bind(&row_id)
    .bind(&property_id)
    .bind(&value)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseCell>(
        "SELECT * FROM database_cells WHERE row_id = ? AND property_id = ?",
    )
    .bind(&row_id)
    .bind(&property_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| e.to_string())
}

// --- Views ---

#[tauri::command]
pub async fn get_database_views(
    state: State<'_, AppState>,
    page_id: String,
) -> Result<Vec<DatabaseView>, String> {
    sqlx::query_as::<_, DatabaseView>(
        "SELECT * FROM database_views WHERE page_id = ? ORDER BY sort_order",
    )
    .bind(&page_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn create_view(
    state: State<'_, AppState>,
    page_id: String,
    name: String,
    r#type: String,
) -> Result<DatabaseView, String> {
    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO database_views (id, page_id, name, type, config, sort_order)
         VALUES (?, ?, ?, ?, '{}', ?)",
    )
    .bind(&id)
    .bind(&page_id)
    .bind(&name)
    .bind(&r#type)
    .bind(0.0)
    .execute(&state.db)
    .await
    .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseView>("SELECT * FROM database_views WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn update_view(
    state: State<'_, AppState>,
    id: String,
    name: Option<String>,
    config: Option<String>,
    sort_order: Option<f64>,
) -> Result<DatabaseView, String> {
    let current = sqlx::query_as::<_, DatabaseView>("SELECT * FROM database_views WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    let name = name.unwrap_or(current.name);
    let config = config.unwrap_or(current.config);
    let sort_order = sort_order.unwrap_or(current.sort_order);

    sqlx::query("UPDATE database_views SET name = ?, config = ?, sort_order = ? WHERE id = ?")
        .bind(&name)
        .bind(&config)
        .bind(sort_order)
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query_as::<_, DatabaseView>("SELECT * FROM database_views WHERE id = ?")
        .bind(&id)
        .fetch_one(&state.db)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_view(state: State<'_, AppState>, id: String) -> Result<(), String> {
    sqlx::query("DELETE FROM database_views WHERE id = ?")
        .bind(&id)
        .execute(&state.db)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
