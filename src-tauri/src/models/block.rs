use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct Block {
    pub id: String,
    pub page_id: String,
    pub parent_block_id: Option<String>,
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub content: String,
    pub sort_order: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BlockReorder {
    pub id: String,
    pub sort_order: f64,
}
