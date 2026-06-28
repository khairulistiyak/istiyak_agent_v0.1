export interface ToolContext {
  workspacePath: string;
  cloudSandboxEnabled?: boolean;
  token?: string;
  [key: string]: any;
}
