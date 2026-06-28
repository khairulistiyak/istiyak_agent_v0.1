export const TOOLS = [
  "scan_project",
  "read_file",
  "write_file",
  "run_command",
  "search_workspace",
  "git_checkout_branch",
  "git_commit_changes"
] as const;
export type ToolName = typeof TOOLS[number];
