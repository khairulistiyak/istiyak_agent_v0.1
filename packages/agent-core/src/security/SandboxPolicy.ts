export class SandboxPolicy {
  private sandboxEnabled: boolean;
  private defaultImage: string;

  constructor(sandboxEnabled: boolean, defaultImage: string = "node:20-alpine") {
    this.sandboxEnabled = sandboxEnabled;
    this.defaultImage = defaultImage;
  }

  public shouldRunInSandbox(command: string): boolean {
    // If global sandbox is active, run all shell commands in docker container
    return this.sandboxEnabled;
  }

  public getSandboxImage(): string {
    return this.defaultImage;
  }
}
