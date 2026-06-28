import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

export class WorkspaceMemory {
  private store: WorkspaceMemoryStore;

  constructor(workspacePath: string) {
    this.store = new WorkspaceMemoryStore(workspacePath);
  }

  async getRule(key: string): Promise<any> {
    return this.store.getRule(key);
  }

  async setRule(key: string, value: any): Promise<void> {
    await this.store.setRule(key, value);
  }
}
