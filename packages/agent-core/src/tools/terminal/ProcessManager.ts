import { BaseTool, ToolContext } from "@istiyak/agent-tools";

export class ProcessManager extends BaseTool {
  name = "process_manager";
  description = "Manages active background processes (list, kill).";
  parameterSchema = {
    type: "object",
    required: ["action"],
    properties: {
      action: { type: "string", enum: ["list", "kill"] },
      pid: { type: "number" }
    }
  };

  async execute(params: { action: "list" | "kill"; pid?: number }, context: ToolContext): Promise<string> {
    if (params.action === "kill" && params.pid) {
      try {
        process.kill(params.pid);
        return `Successfully killed process PID ${params.pid}`;
      } catch (e: unknown) {
        return `Failed to kill process PID ${params.pid}: ${e instanceof Error ? e.message : String(e)}`;
      }
    }
    return `Active process tracking is currently managed by host OS. No sub-processes spawned.`;
  }
}
