// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;

fn main() {
    let first_show = AtomicBool::new(true);

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            window.show().unwrap();

            // let window_clone = window.clone();
            // window.on_window_event(move |event| {
            //     if let tauri::WindowEvent::Focused(focused) = event {
            //         if !focused && !first_show.swap(false, Ordering::Relaxed) {
            //             window_clone.hide().unwrap();
            //         }
            //     }
            // });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
