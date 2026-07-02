use std::path::{Path, PathBuf};
use std::fs;

fn get_config_path() -> Result<PathBuf, String> {
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "Could not locate home directory. Please set HOME environment variable.".to_string())?;
    let mut path = PathBuf::from(home);
    path.push(".istiyak_agent_config.json");
    Ok(path)
}

fn load_env_file() {
    // Attempt to load .env file from the current directory
    if let Ok(content) = std::fs::read_to_string(".env") {
        for line in content.lines() {
            let line = line.trim();
            if line.is_empty() || line.starts_with('#') {
                continue;
            }
            if let Some((key, val)) = line.split_once('=') {
                let key = key.trim();
                let val = val.trim().trim_matches('"').trim_matches('\'');
                if std::env::var(key).is_err() {
                    std::env::set_var(key, val);
                }
            }
        }
    }
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn load_config() -> Result<serde_json::Value, String> {
    let path = get_config_path()?;
    if path.exists() {
        let content = std::fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read config file: {}", e))?;
        let json: serde_json::Value = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse config JSON: {}", e))?;
        Ok(json)
    } else {
        // Migrate from .env in either current directory or parent directory
        let mut map = serde_json::Map::new();
        let env_paths = vec![".env", "../.env"];
        for env_path in env_paths {
            if let Ok(content) = std::fs::read_to_string(env_path) {
                for line in content.lines() {
                    let line = line.trim();
                    if line.is_empty() || line.starts_with('#') {
                        continue;
                    }
                    if let Some((key, val)) = line.split_once('=') {
                        let key = key.trim();
                        let val = val.trim().trim_matches('"').trim_matches('\'');
                        map.insert(key.to_string(), serde_json::Value::String(val.to_string()));
                    }
                }
            }
        }
        
        let json = serde_json::Value::Object(map);
        let content = serde_json::to_string_pretty(&json)
            .map_err(|e| format!("Failed to serialize config: {}", e))?;
        std::fs::write(&path, content)
            .map_err(|e| format!("Failed to write config file: {}", e))?;
            
        Ok(json)
    }
}

#[tauri::command]
fn save_config(config: serde_json::Value) -> Result<(), String> {
    let path = get_config_path()?;
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;
    std::fs::write(&path, content)
        .map_err(|e| format!("Failed to write config file: {}", e))?;
    Ok(())
}

#[tauri::command]
fn get_env_var(name: &str) -> Result<String, String> {
    // 1. Try to load from config JSON file first
    if let Ok(config) = load_config() {
        if let Some(val) = config.get(name) {
            if let Some(s) = val.as_str() {
                return Ok(s.to_string());
            }
        }
    }
    // 2. Fallback to process env var
    std::env::var(name).map_err(|_| format!("Environment variable {} is not set.", name))
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create directories: {}", e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write file: {}", e))
}

fn walk_dir(dir: &Path, base_dir: &Path, files: &mut Vec<String>) -> std::io::Result<()> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir() {
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name == "node_modules"
                        || name == ".git"
                        || name == "dist"
                        || name == "target"
                        || name == ".next"
                        || name == "build"
                        || name == ".svelte-kit"
                        || name == ".tauri"
                    {
                        continue;
                    }
                }
                walk_dir(&path, base_dir, files)?;
            } else {
                if let Ok(rel_path) = path.strip_prefix(base_dir) {
                    if let Some(rel_str) = rel_path.to_str() {
                        files.push(rel_str.to_string());
                    }
                }
            }
        }
    }
    Ok(())
}

#[tauri::command]
fn scan_project(path: String) -> Result<Vec<String>, String> {
    let base_path = Path::new(&path);
    if !base_path.exists() || !base_path.is_dir() {
        return Err(format!("Directory path does not exist or is not a directory: {}", path));
    }
    let mut files = Vec::new();
    walk_dir(base_path, base_path, &mut files).map_err(|e| format!("Failed to scan project: {}", e))?;
    Ok(files)
}

#[tauri::command]
fn select_directory() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .args(&["-e", "POSIX path of (choose folder with prompt \"Select Workspace Path\")"])
            .output()
            .map_err(|e| format!("Failed to run osascript: {}", e))?;
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if path_str.is_empty() {
                return Err("Cancelled".to_string());
            }
            return Ok(path_str);
        } else {
            return Err("Cancelled or failed to pick directory".to_string());
        }
    }

    #[cfg(target_os = "windows")]
    {
        let script = "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object std::Windows.Forms.FolderBrowserDialog; if ($f.ShowDialog() -eq 'OK') { $f.SelectedPath }";
        let output = std::process::Command::new("powershell")
            .args(&["-Command", script])
            .output()
            .map_err(|e| format!("Failed to run powershell: {}", e))?;
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if path_str.is_empty() {
                return Err("Cancelled".to_string());
            }
            return Ok(path_str);
        } else {
            return Err("Cancelled or failed".to_string());
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("Unsupported platform for folder dialog. Please enter path manually.".to_string())
    }
}

#[tauri::command]
fn select_file() -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("osascript")
            .args(&["-e", "POSIX path of (choose file with prompt \"Select Service Account JSON Key\" of type {\"public.json\", \"json\"})"])
            .output()
            .map_err(|e| format!("Failed to run osascript: {}", e))?;
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if path_str.is_empty() {
                return Err("Cancelled".to_string());
            }
            return Ok(path_str);
        } else {
            return Err("Cancelled or failed to pick file".to_string());
        }
    }

    #[cfg(target_os = "windows")]
    {
        let script = "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Filter = 'JSON files (*.json)|*.json|All files (*.*)|*.*'; if ($f.ShowDialog() -eq 'OK') { $f.FileName }";
        let output = std::process::Command::new("powershell")
            .args(&["-Command", script])
            .output()
            .map_err(|e| format!("Failed to run powershell: {}", e))?;
        if output.status.success() {
            let path_str = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if path_str.is_empty() {
                return Err("Cancelled".to_string());
            }
            return Ok(path_str);
        } else {
            return Err("Cancelled or failed".to_string());
        }
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Err("Unsupported platform for file dialog. Please enter path manually.".to_string())
    }
}

#[tauri::command]
fn detect_ide_workspaces() -> Result<serde_json::Value, String> {
    let home = std::env::var("HOME")
        .or_else(|_| std::env::var("USERPROFILE"))
        .map_err(|_| "Could not locate home directory".to_string())?;
    let home_path = Path::new(&home);

    // Step 1: Detect running IDEs via process list
    let running_ides = detect_running_ides();

    // Step 2: Scan workspace storage for each known IDE
    let mut workspaces: Vec<serde_json::Value> = Vec::new();

    let ide_configs: Vec<(&str, PathBuf)> = {
        let mut configs = Vec::new();
        #[cfg(target_os = "macos")]
        {
            let app_support = PathBuf::from(&home).join("Library/Application Support");
            configs.push(("VS Code", app_support.join("Code/User/workspaceStorage")));
            configs.push(("Cursor", app_support.join("Cursor/User/workspaceStorage")));
        }
        #[cfg(target_os = "windows")]
        {
            if let Ok(appdata) = std::env::var("APPDATA") {
                let appdata = PathBuf::from(appdata);
                configs.push(("VS Code", appdata.join("Code/User/workspaceStorage")));
                configs.push(("Cursor", appdata.join("Cursor/User/workspaceStorage")));
            }
        }
        #[cfg(target_os = "linux")]
        {
            let config_dir = PathBuf::from(&home).join(".config");
            configs.push(("VS Code", config_dir.join("Code/User/workspaceStorage")));
            configs.push(("Cursor", config_dir.join("Cursor/User/workspaceStorage")));
        }
        configs
    };

    for (ide_name, storage_path) in &ide_configs {
        if !storage_path.exists() {
            continue;
        }
        // Collect workspace dirs sorted by modification time (most recent first)
        let mut dirs: Vec<(PathBuf, std::time::SystemTime)> = Vec::new();
        if let Ok(entries) = fs::read_dir(storage_path) {
            for entry in entries.flatten() {
                let dir = entry.path();
                if dir.is_dir() {
                    let ws_json = dir.join("workspace.json");
                    if ws_json.exists() {
                        let mtime = dir.metadata()
                            .and_then(|m| m.modified())
                            .unwrap_or(std::time::UNIX_EPOCH);
                        dirs.push((ws_json, mtime));
                    }
                }
            }
        }
        dirs.sort_by(|a, b| b.1.cmp(&a.1));

        // Take top 10 most recent
        for (ws_json, mtime) in dirs.into_iter().take(10) {
            if let Ok(content) = fs::read_to_string(&ws_json) {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&content) {
                    if let Some(folder_uri) = parsed.get("folder").and_then(|v| v.as_str()) {
                        // Decode file:///path → /path (URL decode)
                        let decoded_path = folder_uri
                            .strip_prefix("file://")
                            .unwrap_or(folder_uri);
                        let decoded_path = url_decode(decoded_path);

                        // Canonicalize and verify path is within home directory
                        let canonical = fs::canonicalize(&decoded_path).ok();
                        let is_safe = canonical.as_ref()
                            .map(|p| p.starts_with(home_path))
                            .unwrap_or(false);
                        if !is_safe {
                            continue;
                        }
                        let safe_path = canonical.unwrap();

                        let is_active = running_ides.contains(&ide_name.to_string());
                        let folder_name = safe_path
                            .file_name()
                            .and_then(|n| n.to_str())
                            .unwrap_or("unknown")
                            .to_string();

                        let elapsed_secs = mtime
                            .duration_since(std::time::UNIX_EPOCH)
                            .map(|d| d.as_secs())
                            .unwrap_or(0);

                        workspaces.push(serde_json::json!({
                            "path": safe_path.to_string_lossy(),
                            "folderName": folder_name,
                            "ide": ide_name,
                            "lastUsed": elapsed_secs,
                            "isActive": is_active,
                        }));
                    }
                }
            }
        }
    }

    let active_ide = if !running_ides.is_empty() {
        serde_json::Value::String(running_ides[0].clone())
    } else {
        serde_json::Value::Null
    };

    Ok(serde_json::json!({
        "workspaces": workspaces,
        "activeIde": active_ide,
    }))
}

fn detect_running_ides() -> Vec<String> {
    let mut ides = Vec::new();
    let check = |process_pattern: &str, ide_label: &str, list: &mut Vec<String>| {
        let result = std::process::Command::new("pgrep")
            .args(&["-f", process_pattern])
            .output();
        if let Ok(output) = result {
            if output.status.success() && !output.stdout.is_empty() {
                list.push(ide_label.to_string());
            }
        }
    };

    check("Visual Studio Code", "VS Code", &mut ides);
    check("Cursor.app", "Cursor", &mut ides);
    check("IntelliJ IDEA.app", "IntelliJ IDEA", &mut ides);
    check("WebStorm.app", "WebStorm", &mut ides);
    check("PyCharm.app", "PyCharm", &mut ides);

    ides
}

fn url_decode(s: &str) -> String {
    let mut bytes: Vec<u8> = Vec::with_capacity(s.len());
    let mut chars = s.chars();
    while let Some(c) = chars.next() {
        if c == '%' {
            let hex: String = chars.by_ref().take(2).collect();
            if let Ok(byte) = u8::from_str_radix(&hex, 16) {
                bytes.push(byte);
            } else {
                bytes.push(b'%');
                bytes.extend_from_slice(hex.as_bytes());
            }
        } else if c.len_utf8() == 1 {
            bytes.push(c as u8);
        } else {
            let mut buf = [0u8; 4];
            let encoded = c.encode_utf8(&mut buf);
            bytes.extend_from_slice(encoded.as_bytes());
        }
    }
    String::from_utf8(bytes).unwrap_or_default()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Load .env variables before starting the application builder
    load_env_file();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_env_var, 
            load_config, 
            save_config,
            read_file,
            write_file,
            scan_project,
            select_directory,
            select_file,
            detect_ide_workspaces
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
