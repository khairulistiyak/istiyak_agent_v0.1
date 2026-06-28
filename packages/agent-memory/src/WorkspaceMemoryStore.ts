import { SQLiteMemoryStore } from "./SQLiteMemoryStore.js";

export class WorkspaceMemoryStore {
  private store: SQLiteMemoryStore;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.store = new SQLiteMemoryStore();
    this.workspacePath = workspacePath;
  }

  private getWorkspaceKey(key: string): string {
    return `${this.workspacePath}:${key}`;
  }

  async getRule(key: string): Promise<any> {
    return this.store.get(this.getWorkspaceKey(key));
  }

  async setRule(key: string, value: any): Promise<void> {
    await this.store.set(this.getWorkspaceKey(key), value);
  }

  async deleteRule(key: string): Promise<void> {
    await this.store.delete(this.getWorkspaceKey(key));
  }
}
