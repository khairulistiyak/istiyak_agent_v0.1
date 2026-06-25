import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

export class WorkspaceMemory {
  private store: WorkspaceMemoryStore;

  constructor(workspacePath: string) {
    this.store = new WorkspaceMemoryStore(workspacePath);
  }

  public getRules(): string[] {
    return this.store.getWorkspaceRules();
  }

  public addRule(rule: string): void {
    const rules = this.getRules();
    rules.push(rule);
    this.store.setWorkspaceRules(rules);
  }

  public logStep(step: number, action: string, output: string): void {
    this.store.saveStepResult(step, action, output);
  }

  public getHistory(): any[] {
    return this.store.getExecutionHistory();
  }
}

export default WorkspaceMemory;
