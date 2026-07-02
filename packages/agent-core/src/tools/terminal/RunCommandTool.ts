import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { exec } from "child_process";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import os from "os";

function getSandboxConfig() {
  try {
    const home = os.homedir();
    const configPath = path.join(home, ".istiyak_agent_config.json");
    if (fsSync.existsSync(configPath)) {
      const content = fsSync.readFileSync(configPath, "utf-8");
      const config = JSON.parse(content);
      return {
        dockerSandboxEnabled: !!config.DOCKER_SANDBOX_ENABLED,
        sandboxImage: config.SANDBOX_IMAGE || "node:20-alpine"
      };
    }
  } catch (error) {
    // ignore
  }
  return { dockerSandboxEnabled: false, sandboxImage: "node:20-alpine" };
}

export class RunCommandTool extends BaseTool {
  name = "run_command";
  description = "Runs shell commands locally or inside a Docker sandbox container.";
  parameterSchema = {
    type: "object",
    required: ["command"],
    properties: {
      command: { type: "string" }
    }
  };

  async execute(params: { command: string }, context: ToolContext): Promise<string> {
    const { dockerSandboxEnabled, sandboxImage } = getSandboxConfig();
    const workspacePath = context.workspacePath;

    if (dockerSandboxEnabled) {
      const tempScriptName = `.sandbox_${Date.now()}.sh`;
      const tempScriptPath = path.join(workspacePath, tempScriptName);
      
      try {
        await fs.writeFile(tempScriptPath, params.command, "utf-8");
        const dockerCmd = `docker run --rm -v "${workspacePath}:/workspace" -w /workspace ${sandboxImage} sh ${tempScriptName}`;
        
        return await new Promise<string>((resolve) => {
          exec(dockerCmd, { cwd: workspacePath, timeout: 60000 }, async (error, stdout, stderr) => {
            try {
              await fs.unlink(tempScriptPath);
            } catch (e) {
              // ignore
            }
            const output: string[] = [];
            if (stdout) output.push(stdout);
            if (stderr) output.push(stderr);
            if (error) output.push(`Error: ${error.message}`);
            resolve(output.join("\n"));
          });
        });
      } catch (err: unknown) {
        return `Sandbox Error: Failed to initialize execution script. Details: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    // Run with a 120-second timeout to prevent infinite-running commands from
    // blocking the agent. Docker sandbox gets 60s due to longer startup times.
    return new Promise<string>((resolve) => {
      exec(params.command, { cwd: workspacePath, timeout: 120000, maxBuffer: 5 * 1024 * 1024 }, (error, stdout, stderr) => {
        const output: string[] = [];
        if (stdout) output.push(stdout);
        if (stderr) output.push(stderr);
        if (error) output.push(`Error: ${error.message}`);
        resolve(output.join("\n"));
      });
    });
  }
}
