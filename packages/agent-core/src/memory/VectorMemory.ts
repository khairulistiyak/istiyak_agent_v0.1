import { indexWorkspace, searchWorkspace, SearchResult } from "@istiyak/agent-memory";

export class VectorMemory {
  static index(workspacePath: string): boolean {
    return indexWorkspace(workspacePath);
  }

  static search(query: string, limit = 5, workspacePath?: string): SearchResult[] {
    return searchWorkspace(query, limit, workspacePath);
  }
}
