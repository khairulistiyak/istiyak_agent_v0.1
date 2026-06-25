import { ChildProcess, exec } from "child_process";

export class ProcessManager {
  private activeProcesses: Map<string, ChildProcess> = new Map();

  public runCommand(
    command: string,
    cwd: string,
    timeoutMs: number = 60000
  ): Promise<{ output: string; exitCode: number }> {
    return new Promise((resolve) => {
      const processId = Math.random().toString(36).substring(7);
      
      const child = exec(command, { cwd }, (error: any, stdout: string, stderr: string) => {
        this.activeProcesses.delete(processId);
        const output = stdout + stderr;
        const exitCode = error ? (error.code ?? 1) : 0;
        resolve({ output, exitCode });
      });

      this.activeProcesses.set(processId, child);

      // Setup timeout
      const timeout = setTimeout(() => {
        if (this.activeProcesses.has(processId)) {
          child.kill("SIGKILL");
          this.activeProcesses.delete(processId);
          resolve({ output: "[Timeout Error] Command timed out and was killed.", exitCode: -1 });
        }
      }, timeoutMs);

      child.on("close", () => clearTimeout(timeout));
    });
  }

  public killAll(): void {
    for (const [id, child] of this.activeProcesses.entries()) {
      child.kill("SIGKILL");
      this.activeProcesses.delete(id);
    }
  }
}

export default ProcessManager;
