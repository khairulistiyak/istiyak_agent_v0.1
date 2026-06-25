import path from "path";

export class WorkspaceGuard {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = path.resolve(workspacePath);
  }

  public isSafePath(targetPath: string): boolean {
    const resolvedTarget = path.resolve(targetPath);
    
    // Check if target path starts with the workspace path prefix
    return resolvedTarget.startsWith(this.workspacePath);
  }

  public assertSafePath(targetPath: string): void {
    if (!this.isSafePath(targetPath)) {
      throw new Error(`WorkspaceGuard Violation: Access to path '${targetPath}' outside workspace is blocked.`);
    }
  }
}
