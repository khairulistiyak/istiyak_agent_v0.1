import fs from "fs";
import path from "path";
import os from "os";

export class SQLiteMemoryStore {
  private filePath: string;
  private data: Record<string, any> = {};

  constructor() {
    const home = os.homedir();
    this.filePath = path.join(home, ".istiyak_sqlite_memory.json");
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
      console.error("[SQLiteMemoryStore] Save failed:", e);
    }
  }

  async get(key: string): Promise<any> {
    this.load();
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
