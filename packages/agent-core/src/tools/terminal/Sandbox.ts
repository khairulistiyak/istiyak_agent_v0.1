import { SandboxPolicy } from "../../security/SandboxPolicy.js";
import { ProcessManager } from "./ProcessManager.js";

export class Sandbox {
  private policy: SandboxPolicy;
  private processManager: ProcessManager;

  constructor(policy: SandboxPolicy, processManager: ProcessManager) {
    this.policy = policy;
    this.processManager = processManager;
  }

  public async executeCommand(
    command: string,
    cwd: string,
    timeoutMs?: number
  ): Promise<{ output: string; exitCode: number }> {
    let finalCommand = command;

    if (this.policy.shouldRunInSandbox(command)) {
      const image = this.policy.getSandboxImage();
      // Wrap command inside docker run sandbox if enabled
      finalCommand = `docker run --rm -v "${cwd}":/workspace -w /workspace ${image} sh -c "${command.replace(/"/g, '\\"')}"`;
    }

    return await this.processManager.runCommand(finalCommand, cwd, timeoutMs);
  }
}

export default Sandbox;
