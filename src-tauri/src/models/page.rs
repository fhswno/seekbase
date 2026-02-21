use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    pub id: String,
    pub workspace_id: String,
    pub parent_id: Option<String>,
    pub title: String,
    pub icon: Option<String>,
    pub cover_url: Option<String>,
    pub is_database: bool,
    pub database_type: Option<String>,
    pub sort_order: f64,
    pub is_favorite: bool,
    pub is_deleted: bool,
    pub deleted_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePageFields {
    pub title: Option<String>,
    pub icon: Option<String>,
    pub cover_url: Option<String>,
    pub is_favorite: Option<bool>,
    pub database_type: Option<String>,
}
