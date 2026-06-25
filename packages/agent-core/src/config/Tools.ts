export interface ToolConfig {
  name: string;
  category: "filesystem" | "terminal" | "git" | "web" | "memory" | "planning" | "agent";
  approveRequired: boolean;
  timeoutMs: number;
}

export const TOOLS_CONFIG: Record<string, ToolConfig> = {
  // Filesystem Tools
  "scan_project": { name: "scan_project", category: "filesystem", approveRequired: false, timeoutMs: 15000 },
  "list_files": { name: "list_files", category: "filesystem", approveRequired: false, timeoutMs: 5000 },
  "read_file": { name: "read_file", category: "filesystem", approveRequired: false, timeoutMs: 5000 },
  "write_file": { name: "write_file", category: "filesystem", approveRequired: true, timeoutMs: 5000 },
  "precise_edit": { name: "precise_edit", category: "filesystem", approveRequired: true, timeoutMs: 5000 },
  "ast_edit": { name: "ast_edit", category: "filesystem", approveRequired: true, timeoutMs: 10000 },
  "delete_file": { name: "delete_file", category: "filesystem", approveRequired: true, timeoutMs: 5000 },

  // Terminal Tools
  "run_command": { name: "run_command", category: "terminal", approveRequired: true, timeoutMs: 60000 },
  
  // Git Tools
  "git_status": { name: "git_status", category: "git", approveRequired: false, timeoutMs: 5000 },
  "git_diff": { name: "git_diff", category: "git", approveRequired: false, timeoutMs: 5000 },
  "git_commit": { name: "git_commit", category: "git", approveRequired: true, timeoutMs: 5000 },

  // Web Tools
  "google_search": { name: "google_search", category: "web", approveRequired: false, timeoutMs: 10000 },
  "fetch_url": { name: "fetch_url", category: "web", approveRequired: false, timeoutMs: 10000 }
};
