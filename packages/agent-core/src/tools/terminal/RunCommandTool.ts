import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import { Sandbox } from "./Sandbox.js";
import { SandboxPolicy } from "../../security/SandboxPolicy.js";
import { ProcessManager } from "./ProcessManager.js";

export interface RunCommandParams {
  command: string;
}

export class RunCommandTool extends BaseTool<RunCommandParams, { output: string; exitCode: number }> {
  public readonly name = "run_command";
  public readonly description = "Executes a shell command in the local workspace directory.";
  public readonly approveRequired = true;
  public readonly parametersSchema = {
    type: "object",
    properties: {
      command: { type: "string", description: "The command to run in the terminal." }
    },
    required: ["command"]
  };

  private sandbox: Sandbox;

  constructor() {
    super();
    // Default direct execution or docker fallback configuration
    const policy = new SandboxPolicy(false);
    const processManager = new ProcessManager();
    this.sandbox = new Sandbox(policy, processManager);
  }

  public async execute(params: RunCommandParams, context: ToolContext) {
    const workspace = context.workspacePath;
    return await this.sandbox.executeCommand(params.command, workspace);
  }
}

export default RunCommandTool;
