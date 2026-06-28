export interface Message {
  id?: string;
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AgentResponse {
  thought: string;
  action: "scan_project" | "read_file" | "write_file" | "run_command" | "search_workspace" | "git_checkout_branch" | "git_commit_changes" | "done";
  params: {
    relPath?: string;
    content?: string;
    command?: string;
    query?: string;
    branchName?: string;
    createNew?: boolean;
    message?: string;
    summary?: string;
  };
}

export interface SandboxExecuteResponse {
  output: string;
  success: boolean;
  error?: string;
}

export interface LocalConfig {
  PROVIDER?: string;
  SELECTED_MODEL?: string;
  AUTH_METHOD?: string;
  API_KEY?: string;
  SERVICE_ACCOUNT_PATH?: string;
  PROJECT_ID?: string;
  LOCATION?: string;
  WORKSPACE_PATH?: string;
  GOOGLE_SEARCH_ENABLED?: boolean;
  CLOUD_SANDBOX_ENABLED?: boolean;
  DOCKER_SANDBOX_ENABLED?: boolean;
  SANDBOX_IMAGE?: string;
  TOKEN?: string;
  EMAIL?: string;
}
