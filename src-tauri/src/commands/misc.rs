use crate::models::url_metadata::UrlMetadata;
use tauri::Manager;

#[tauri::command]
pub async fn print_page(webview: tauri::Webview) -> Result<(), String> {
    webview.print().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn save_editor_image(
    app: tauri::AppHandle,
    source_path: String,
) -> Result<String, String> {
    use std::path::Path;

    let source = Path::new(&source_path);
    let ext = source
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("png");

    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let images_dir = app_data.join("editor-images");
    std::fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;

    let filename = format!("{}.{}", uuid::Uuid::new_v4(), ext);
    let dest = images_dir.join(&filename);
    std::fs::copy(source, &dest).map_err(|e| e.to_string())?;

    // Return the full path so frontend can convert with convertFileSrc
    dest.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid path".to_string())
}

#[tauri::command]
pub async fn save_editor_image_bytes(
    app: tauri::AppHandle,
    data_base64: String,
    filename: String,
) -> Result<String, String> {
    use base64::Engine;
    let bytes = base64::engine::general_purpose::STANDARD
        .decode(&data_base64)
        .map_err(|e| format!("Base64 decode error: {}", e))?;

    let app_data = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let images_dir = app_data.join("editor-images");
    std::fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;

    let safe_filename = filename
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_')
        .collect::<String>();
    let dest_name = format!("{}-{}", uuid::Uuid::new_v4(), safe_filename);
    let dest = images_dir.join(&dest_name);
    std::fs::write(&dest, &bytes).map_err(|e| e.to_string())?;

    dest.to_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Invalid path".to_string())
}

#[tauri::command]
pub async fn fetch_url_metadata(url: String) -> Result<UrlMetadata, String> {
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let body = response.text().await.map_err(|e| e.to_string())?;

    let title = extract_meta_tag(&body, "og:title")
        .or_else(|| extract_tag_content(&body, "title"));
    let description = extract_meta_tag(&body, "og:description")
        .or_else(|| extract_meta_tag(&body, "description"));
    let favicon = extract_favicon(&body, &url);

    Ok(UrlMetadata {
        url,
        title,
        description,
        favicon,
    })
}

fn extract_meta_tag(html: &str, property: &str) -> Option<String> {
    // Look for <meta property="og:..." content="..."> or <meta name="..." content="...">
    let patterns = [
        format!("property=\"{}\"", property),
        format!("name=\"{}\"", property),
    ];

    for pattern in &patterns {
        if let Some(pos) = html.find(pattern.as_str()) {
            let after = &html[pos..];
            if let Some(content_start) = after.find("content=\"") {
                let value_start = content_start + 9;
                if let Some(value_end) = after[value_start..].find('"') {
                    return Some(after[value_start..value_start + value_end].to_string());
                }
            }
        }
    }

    None
}

fn extract_tag_content(html: &str, tag: &str) -> Option<String> {
    let open = format!("<{}", tag);
    let close = format!("</{}>", tag);

    if let Some(start_pos) = html.find(&open) {
        let after_open = &html[start_pos..];
        if let Some(tag_end) = after_open.find('>') {
            let content_start = tag_end + 1;
            if let Some(close_pos) = after_open[content_start..].find(&close) {
                return Some(after_open[content_start..content_start + close_pos].trim().to_string());
            }
        }
    }

    None
}

fn extract_favicon(html: &str, base_url: &str) -> Option<String> {
    // Look for <link rel="icon" href="...">
    let icon_patterns = ["rel=\"icon\"", "rel=\"shortcut icon\""];

    for pattern in &icon_patterns {
        if let Some(pos) = html.find(pattern) {
            let search_range_start = if pos > 200 { pos - 200 } else { 0 };
            let search_range = &html[search_range_start..std::cmp::min(pos + 200, html.len())];
            if let Some(href_start) = search_range.find("href=\"") {
                let value_start = href_start + 6;
                if let Some(value_end) = search_range[value_start..].find('"') {
                    let href = &search_range[value_start..value_start + value_end];
                    if href.starts_with("http") {
                        return Some(href.to_string());
                    } else {
                        // Resolve relative URL
                        if let Ok(base) = reqwest::Url::parse(base_url) {
                            if let Ok(resolved) = base.join(href) {
                                return Some(resolved.to_string());
                            }
                        }
                    }
                }
            }
        }
    }

    // Fallback: /favicon.ico
    if let Ok(base) = reqwest::Url::parse(base_url) {
        if let Ok(favicon) = base.join("/favicon.ico") {
            return Some(favicon.to_string());
        }
    }

    None
}
