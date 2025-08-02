// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;
use window_vibrancy::*;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[tauri::command]
fn set_dock_visibility(app: tauri::AppHandle, visible: bool) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::{NSApp, NSApplication, NSApplicationActivationPolicy};
        
        unsafe {
            let app = NSApp();
            if visible {
                app.setActivationPolicy_(NSApplicationActivationPolicy::NSApplicationActivationPolicyRegular);
            } else {
                app.setActivationPolicy_(NSApplicationActivationPolicy::NSApplicationActivationPolicyAccessory);
            }
        }
        Ok(())
    }
    
    #[cfg(not(target_os = "macos"))]
    {
        Ok(()) // No-op on non-macOS platforms
    }
}

fn main() {
    let first_show = AtomicBool::new(true);

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![]) ))
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![set_dock_visibility])
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();
            window.center().unwrap();
            window.show().unwrap();
            
            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, Some(NSVisualEffectState::Active), Some(10.0))
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            // Apply dock visibility based on settings
            #[cfg(target_os = "macos")]
            {
                // This will be applied after the frontend loads and reads the settings
                // The frontend will call set_dock_visibility if needed
            }

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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
