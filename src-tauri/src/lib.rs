mod ai;
mod commands;
mod db;
mod models;

use db::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let pool = db::init_db(&handle)
                    .await
                    .expect("failed to initialize database");
                handle.manage(AppState { db: pool });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Workspaces
            commands::workspaces::get_workspaces,
            commands::workspaces::create_workspace,
            commands::workspaces::update_workspace,
            commands::workspaces::save_workspace_icon,
            // Pages
            commands::pages::get_pages,
            commands::pages::get_page,
            commands::pages::create_page,
            commands::pages::update_page,
            commands::pages::delete_page,
            commands::pages::restore_page,
            commands::pages::get_deleted_pages,
            commands::pages::permanently_delete_page,
            commands::pages::move_page,
            commands::pages::purge_old_trash,
            // Blocks
            commands::blocks::get_blocks,
            commands::blocks::create_block,
            commands::blocks::update_block,
            commands::blocks::delete_block,
            commands::blocks::reorder_blocks,
            commands::blocks::get_page_content,
            commands::blocks::save_page_content,
            // Database properties
            commands::databases::get_database_properties,
            commands::databases::create_property,
            commands::databases::update_property,
            commands::databases::delete_property,
            // Database rows
            commands::databases::get_database_rows,
            commands::databases::create_row,
            commands::databases::delete_row,
            // Database cells
            commands::databases::get_cells,
            commands::databases::update_cell,
            // Database views
            commands::databases::get_database_views,
            commands::databases::create_view,
            commands::databases::update_view,
            commands::databases::delete_view,
            // Search
            commands::search::search,
            // Settings
            commands::settings::get_setting,
            commands::settings::set_setting,
            commands::settings::get_all_settings,
            // AI
            ai::ollama::fetch_ollama_models,
            // Misc
            commands::misc::fetch_url_metadata,
            commands::misc::save_editor_image,
            commands::misc::save_editor_image_bytes,
            commands::misc::print_page,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
