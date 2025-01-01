// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod db;

use db::Database;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn get_db_path(app_handle: &AppHandle) -> PathBuf {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    std::fs::create_dir_all(&app_dir).unwrap();
    app_dir.join("app.db")
}

#[tauri::command]
async fn save_setting(app_handle: AppHandle, key: String, value: String) -> Result<(), String> {
    let db = Database::new(&get_db_path(&app_handle)).map_err(|e| e.to_string())?;
    db.set_setting(&key, &value).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_setting(app_handle: AppHandle, key: String) -> Result<Option<String>, String> {
    let db = Database::new(&get_db_path(&app_handle)).map_err(|e| e.to_string())?;
    db.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_all_settings(app_handle: AppHandle) -> Result<Vec<(String, String)>, String> {
    let db = Database::new(&get_db_path(&app_handle)).map_err(|e| e.to_string())?;
    db.get_all_settings().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            save_setting,
            get_setting,
            get_all_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
