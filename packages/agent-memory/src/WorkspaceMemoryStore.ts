import { JsonFileStore } from "./SQLiteMemoryStore.js";

export class WorkspaceMemoryStore {
  private store: JsonFileStore;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.store = new JsonFileStore();
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
