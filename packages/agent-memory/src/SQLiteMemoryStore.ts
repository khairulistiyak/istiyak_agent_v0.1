import fs from "fs";
import path from "path";

export class SQLiteMemoryStore {
  private dbPath: string;
  private memoryCache: Record<string, any> = {};

  constructor(workspacePath: string) {
    // Falls back to a local json file as local SQLite replacement for robustness
    this.dbPath = path.join(workspacePath, ".istiyak_agent_memory.json");
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(this.dbPath)) {
        this.memoryCache = JSON.parse(fs.readFileSync(this.dbPath, "utf-8"));
      }
    } catch (e) {
      console.warn("Failed to load local agent memory file:", e);
    }
  }

  private save(): void {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.memoryCache, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write agent memory file:", e);
    }
  }

  public set(key: string, value: any): void {
    this.memoryCache[key] = value;
    this.save();
  }

  public get(key: string): any {
    this.load();
    return this.memoryCache[key];
  }

  public delete(key: string): void {
    delete this.memoryCache[key];
    this.save();
  }
}
