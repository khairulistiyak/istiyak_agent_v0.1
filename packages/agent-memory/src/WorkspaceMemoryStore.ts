import { SQLiteMemoryStore } from "./SQLiteMemoryStore.js";

export class WorkspaceMemoryStore {
  private store: SQLiteMemoryStore;

  constructor(workspacePath: string) {
    this.store = new SQLiteMemoryStore(workspacePath);
  }

  public getWorkspaceRules(): string[] {
    return this.store.get("workspace_rules") || [];
  }

  public setWorkspaceRules(rules: string[]): void {
    this.store.set("workspace_rules", rules);
  }

  public saveStepResult(step: number, action: string, output: string): void {
    const history = this.store.get("execution_history") || [];
    history.push({ step, action, output, timestamp: Date.now() });
    this.store.set("execution_history", history);
  }

  public getExecutionHistory(): any[] {
    return this.store.get("execution_history") || [];
  }
}
