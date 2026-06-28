import path from "path";

export class WorkspaceGuard {
  static isInsideWorkspace(workspacePath: string, targetPath: string): boolean {
    const resolvedWorkspace = path.resolve(workspacePath);
    const resolvedTarget = path.resolve(resolvedWorkspace, targetPath);
    return resolvedTarget.startsWith(resolvedWorkspace);
  }
}
