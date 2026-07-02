import fs from "fs";
import path from "path";
import os from "os";

/**
 * A simple key-value store backed by a local JSON file in the user's home directory.
 * Used by WorkspaceMemoryStore for persisting workspace-level rules/conventions.
 * Data is loaded once at construction and persisted synchronously on every write.
 *
 * Note: renamed from SQLiteMemoryStore (which was misleading — it never used SQLite).
 */
export class JsonFileStore {
  private filePath: string;
  private data: Record<string, any> = {};

  constructor() {
    const home = os.homedir();
    this.filePath = path.join(home, ".istiyak_json_store.json");
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        this.data = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
      }
    } catch (e) {
      this.data = {};
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[JsonFileStore] Save failed:", e);
    }
  }

  async get(key: string): Promise<any> {
    // Data is already in-memory from constructor load — no need to re-read from disk
    // on every get() call, which was causing unnecessary I/O on every memory lookup.
    return this.data[key];
  }

  async set(key: string, value: any): Promise<void> {
    this.data[key] = value;
    this.save();
  }

  async delete(key: string): Promise<void> {
    delete this.data[key];
    this.save();
  }
}
