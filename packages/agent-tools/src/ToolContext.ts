export interface ToolContext {
  workspacePath: string;
  projectId?: string;
  location?: string;
  googleSearchEnabled?: boolean;
  cloudSandboxEnabled?: boolean;
  token?: string;
  logger?: any;
}
