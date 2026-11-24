use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Serialize, Deserialize)]
pub struct DiscoveredApp {
    pub id: String,
    pub name: String,
    pub path: String,
    pub category: String,
    pub description: Option<String>,
}

#[tauri::command]
pub fn discover_installed_apps() -> Vec<DiscoveredApp> {
    vec![
        DiscoveredApp {
            id: "app_calc".into(),
            name: "Calculator".into(),
            path: "calc.exe".into(),
            category: "system".into(),
            description: Some("Windows Calculator".into()),
        },
        DiscoveredApp {
            id: "app_notepad".into(),
            name: "Notepad".into(),
            path: "notepad.exe".into(),
            category: "system".into(),
            description: Some("Windows Text Editor".into()),
        },
        DiscoveredApp {
            id: "app_cmd".into(),
            name: "Command Prompt".into(),
            path: "cmd.exe".into(),
            category: "system".into(),
            description: Some("Command Interpreter".into()),
        },
        DiscoveredApp {
            id: "app_powershell".into(),
            name: "PowerShell".into(),
            path: "powershell.exe".into(),
            category: "system".into(),
            description: Some("Windows PowerShell Engine".into()),
        },
        DiscoveredApp {
            id: "app_taskmgr".into(),
            name: "Task Manager".into(),
            path: "taskmgr.exe".into(),
            category: "system".into(),
            description: Some("Process Monitor".into()),
        },
    ]
}

#[tauri::command]
pub fn launch_application(app_path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", "start", "", &app_path])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Launched: {}", app_path))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Simulated launch: {}", app_path))
    }
}

#[tauri::command]
pub fn execute_system_command(action: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        match action.as_str() {
            "lock" => {
                Command::new("rundll32.exe")
                    .args(["user32.dll,LockWorkStation"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            "sleep" => {
                Command::new("rundll32.exe")
                    .args(["powrprof.dll,SetSuspendState", "0,1,0"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            "shutdown" => {
                Command::new("shutdown")
                    .args(["/s", "/t", "0"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            "restart" => {
                Command::new("shutdown")
                    .args(["/r", "/t", "0"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            "taskmgr" => {
                Command::new("taskmgr").spawn().map_err(|e| e.to_string())?;
            }
            "open_settings" => {
                Command::new("cmd")
                    .args(["/c", "start", "ms-settings:"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            "open_terminal" => {
                Command::new("cmd")
                    .args(["/c", "start", "powershell"])
                    .spawn()
                    .map_err(|e| e.to_string())?;
            }
            _ => return Err(format!("Unknown action: {}", action)),
        }
        Ok(format!("Executed system action: {}", action))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Simulated action: {}", action))
    }
}

#[tauri::command]
pub fn execute_terminal_command(command: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", &command])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Executed: {}", command))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Simulated command: {}", command))
    }
}

#[tauri::command]
pub fn open_file_or_folder(target_path: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        Command::new("cmd")
            .args(["/c", "start", "", &target_path])
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(format!("Opened path: {}", target_path))
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(format!("Simulated open: {}", target_path))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            discover_installed_apps,
            launch_application,
            execute_system_command,
            execute_terminal_command,
            open_file_or_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running quickkey tauri application");
}
