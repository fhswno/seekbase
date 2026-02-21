use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseProperty {
    pub id: String,
    pub page_id: String,
    pub name: String,
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub options: String,
    pub sort_order: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseRow {
    pub id: String,
    pub page_id: String,
    pub row_page_id: Option<String>,
    pub sort_order: f64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseCell {
    pub id: String,
    pub row_id: String,
    pub property_id: String,
    pub value: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseView {
    pub id: String,
    pub page_id: String,
    pub name: String,
    #[sqlx(rename = "type")]
    pub r#type: String,
    pub config: String,
    pub sort_order: f64,
}
