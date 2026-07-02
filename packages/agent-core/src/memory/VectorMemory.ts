import { indexWorkspace, searchWorkspace, SearchResult } from "@istiyak/agent-memory";

export class VectorMemory {
  static index(workspacePath: string, apiKey?: string): Promise<boolean> {
    return indexWorkspace(workspacePath, apiKey);
  }

  static search(query: string, limit = 5, workspacePath?: string, apiKey?: string): Promise<SearchResult[]> {
    return searchWorkspace(query, limit, workspacePath, apiKey);
  }
}
