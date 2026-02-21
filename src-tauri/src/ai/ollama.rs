use serde::Deserialize;

#[derive(Deserialize)]
struct OllamaTagsResponse {
    models: Vec<OllamaModel>,
}

#[derive(Deserialize)]
struct OllamaModel {
    name: String,
}

#[tauri::command]
pub async fn fetch_ollama_models() -> Result<Vec<String>, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await;

    match response {
        Ok(resp) => {
            let tags: OllamaTagsResponse = resp.json().await.map_err(|e| e.to_string())?;
            Ok(tags.models.into_iter().map(|m| m.name).collect())
        }
        Err(_) => {
            // Ollama not running — return empty list gracefully
            Ok(vec![])
        }
    }
}
