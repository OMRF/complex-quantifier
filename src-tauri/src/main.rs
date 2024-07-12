// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod parser;
mod calculator;
mod writer;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::process_data, commands::process_data_bulk])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
