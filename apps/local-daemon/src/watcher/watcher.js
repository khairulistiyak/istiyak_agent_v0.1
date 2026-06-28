import fs from "fs";
import path from "path";
import { IGNORED_DIRS } from "../constants.js";

// Active directory watcher instance
let watcher = null;
let activeWorkspacePath = null;

// Initialization status and callback registry
let isInitialized = false;
let todoCallback = null;

export function setTodoCallback(callback) {
  todoCallback = callback;
}

// Map of filePath -> Array of { line: number, text: string }
const todosMap = new Map();

// Map of filePath -> owner string (e.g., 'developer', 'agent')
const locksMap = new Map();

// Extensions to parse
const WATCHED_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".py",
  ".cpp",
  ".h",
  ".cs",
  ".net"
]);

// Regex to capture TODO comments: // TODO: text, # TODO: text, /* TODO: text */
const TODO_REGEX = /(?:\/\/|#|\/\*)\s*TODO:\s*(.*)$/i;

/**
 * Normalizes file path to absolute path.
 */
function normalizePath(filePath) {
  return path.resolve(filePath);
}

/**
 * Scans a file for TODO comments.
 */
function scanFileForTodos(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!WATCHED_EXTENSIONS.has(ext)) {
    return;
  }

  try {
    const previousTodos = todosMap.get(filePath) || [];
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/);
    const fileTodos = [];

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(TODO_REGEX);
      if (match) {
        // Extract comment text, removing trailing comment markers like */
        let todoText = match[1].trim();
        if (todoText.endsWith("*/")) {
          todoText = todoText.slice(0, -2).trim();
        }
        fileTodos.push({
          line: i + 1,
          text: todoText
        });
      }
    }

    // Trigger todo callback if initialized and a new TODO instruction is detected
    if (isInitialized && todoCallback) {
      for (const current of fileTodos) {
        const exists = previousTodos.some((prev) => prev.text === current.text);
        if (!exists) {
          console.log(`[Watcher] New TODO detected in ${filePath}: "${current.text}"`);
          // Lock the file for agent editing immediately
          if (lockFile(filePath, "agent")) {
            // Defer execution slightly to allow lock state to propagate
            setTimeout(() => {
              todoCallback(filePath, current.text);
            }, 50);
          }
        }
      }
    }

    if (fileTodos.length > 0) {
      todosMap.set(filePath, fileTodos);
    } else {
      todosMap.delete(filePath);
    }
  } catch (error) {
    console.error(`[Watcher] Error reading file ${filePath}:`, error.message);
    todosMap.delete(filePath);
  }
}

/**
 * Checks if a directory should be ignored.
 */
function shouldIgnoreDir(dirName) {
  return IGNORED_DIRS.has(dirName);
}

/**
 * Recursively scans a directory for initial TODO items.
 */
function scanDirectoryRecursively(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (shouldIgnoreDir(entry.name)) {
          continue;
        }
        scanDirectoryRecursively(fullPath);
      } else if (entry.isFile()) {
        scanFileForTodos(fullPath);
      }
    }
  } catch (err) {
    console.error(`[Watcher] Failed scanning directory ${dirPath}:`, err.message);
  }
}

/**
 * Ensures security guidelines are met by adding credentials/, *.json, and .env to .gitignore.
 */
function ensureGitignoreSecurity(workspacePath) {
  try {
    const gitignorePath = path.join(workspacePath, ".gitignore");
    let content = "";
    if (fs.existsSync(gitignorePath)) {
      content = fs.readFileSync(gitignorePath, "utf-8");
    }

    // Only ignore agent-specific sensitive files — NOT all *.json, as that would
    // accidentally gitignore package.json, tsconfig.json, turbo.json, etc.
    const requiredIgnores = [
      "credentials/",
      ".istiyak_agent_config.json",
      ".istiyak_rag_cache.json",
      ".istiyak_sqlite_memory.json",
      ".env"
    ];
    let updated = false;

    const lines = content.split(/\r?\n/).map(l => l.trim());

    for (const rule of requiredIgnores) {
      if (!lines.includes(rule)) {
        if (content.length > 0 && !content.endsWith("\n")) {
          content += "\n";
        }
        content += `${rule}\n`;
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(gitignorePath, content, "utf-8");
      console.log(`[Security Guard] Automatically updated '.gitignore' rules in ${workspacePath}`);
    }
  } catch (err) {
    console.error("[Security Guard] Failed to verify/update .gitignore:", err.message);
  }
}

/**
 * Starts watching a directory for changes.
 */
export function startWatcher(workspacePath) {
  if (!workspacePath) return false;
  
  const absPath = normalizePath(workspacePath);
  
  // Enforce security rules by updating workspace .gitignore
  ensureGitignoreSecurity(absPath);

  if (watcher) {
    if (activeWorkspacePath === absPath) {
      return true; // Already watching the same folder
    }
    stopWatcher();
  }

  activeWorkspacePath = absPath;
  console.log(`[Watcher] Starting watcher on workspace: ${absPath}`);

  // 1. Initial workspace scan
  scanDirectoryRecursively(absPath);
  isInitialized = true;

  // 2. Setup dynamic FS watcher
  try {
    watcher = fs.watch(absPath, { recursive: true }, (eventType, filename) => {
      if (!filename) return;

      const fullPath = path.join(absPath, filename);

      // Check if file is inside ignored directories
      const pathParts = filename.split(path.sep);
      const isIgnored = pathParts.some(part => shouldIgnoreDir(part));
      if (isIgnored) return;

      const ext = path.extname(fullPath).toLowerCase();
      if (!WATCHED_EXTENSIONS.has(ext)) return;

      try {
        if (fs.existsSync(fullPath)) {
          const stats = fs.statSync(fullPath);
          if (stats.isFile()) {
            scanFileForTodos(fullPath);
          }
        } else {
          // File was deleted
          todosMap.delete(fullPath);
        }
      } catch (err) {
        // If file access failed (e.g. deleted/locked), delete from tracker
        todosMap.delete(fullPath);
      }
    });

    return true;
  } catch (error) {
    console.error(`[Watcher] Failed to start native watcher:`, error.message);
    return false;
  }
}

/**
 * Stops the active directory watcher.
 */
export function stopWatcher() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log(`[Watcher] Stopped watcher on: ${activeWorkspacePath}`);
  }
  activeWorkspacePath = null;
  todosMap.clear();
  isInitialized = false;
}

/**
 * Returns all detected TODO comments in a flattened list format.
 */
export function getTodos() {
  const allTodos = [];
  for (const [filePath, fileTodos] of todosMap.entries()) {
    const relativePath = activeWorkspacePath 
      ? path.relative(activeWorkspacePath, filePath) 
      : filePath;

    for (const todo of fileTodos) {
      allTodos.push({
        filePath,
        relativePath,
        line: todo.line,
        text: todo.text
      });
    }
  }
  return allTodos;
}

// ==========================================
// File Locking Implementation
// ==========================================

export function lockFile(filePath, owner) {
  if (!filePath || !owner) return false;
  const absPath = normalizePath(filePath);
  
  const currentOwner = locksMap.get(absPath);
  if (currentOwner && currentOwner !== owner) {
    return false; // Already locked by someone else
  }
  
  locksMap.set(absPath, owner);
  console.log(`[Lock Manager] Locked file: ${absPath} by ${owner}`);
  return true;
}

export function unlockFile(filePath) {
  if (!filePath) return false;
  const absPath = normalizePath(filePath);
  if (locksMap.has(absPath)) {
    locksMap.delete(absPath);
    console.log(`[Lock Manager] Unlocked file: ${absPath}`);
    return true;
  }
  return false;
}

export function isLocked(filePath, requestingOwner) {
  if (!filePath) return false;
  const absPath = normalizePath(filePath);
  const activeOwner = locksMap.get(absPath);
  
  if (!activeOwner) {
    return false; // Not locked
  }
  
  if (requestingOwner && activeOwner === requestingOwner) {
    return false; // Requesting owner is the lock holder
  }
  
  return true;
}

export function getLocks() {
  const locks = [];
  for (const [filePath, owner] of locksMap.entries()) {
    const relativePath = activeWorkspacePath 
      ? path.relative(activeWorkspacePath, filePath) 
      : filePath;
    locks.push({ filePath, relativePath, owner });
  }
  return locks;
}
