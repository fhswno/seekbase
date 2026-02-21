export type SettingKey =
  | "ollama_model"
  | "ollama_base_url"
  | "onboarding_complete"
  | "active_workspace_id"
  | "font_size"
  | "autocomplete_enabled"
  | "autocomplete_delay"
  | "theme"
  | "ai_provider"
  | "mistral_api_key"
  | "mistral_model";

export type SettingsTab =
  | "workspace"
  | "ai"
  | "editor"
  | "appearance"
  | "shortcuts"
  | "credits"
  | "about";
