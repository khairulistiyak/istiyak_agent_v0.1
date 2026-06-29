/**
 * Master tool registry configuration.
 * Lists all available tool names and their categories.
 */
export const TOOLS = [
  // Filesystem tools
  "scan_project",
  "read_file",
  "write_file",
  "precise_edit",
  "create_directory",
  "delete_file",
  "rename_file",
  "move_file",
  "copy_file",
  "list_directory",
  "search_files",

  // Terminal tools
  "run_command",
  "sandbox_run",

  // Git tools
  "git_status",
  "git_checkout_branch",
  "git_commit_changes",
  "git_diff",
  "git_log",
  "git_stash",
  "git_create_branch",

  // Web tools
  "web_search",
  "web_fetch",
  "web_crawl",
  "web_screenshot",

  // Memory tools
  "read_memory",
  "write_memory",
  "compress_memory",
  "summarize_memory",

  // Planning tools
  "create_plan",
  "update_plan",
  "reflect",
  "walkthrough",

  // Agent tools
  "delegate_task",
  "spawn_sub_agent",
  "merge_results",

  // Search
  "search_workspace",
] as const;

export type ToolName = typeof TOOLS[number];

/**
 * Tool categories for grouping in the UI.
 */
export const TOOL_CATEGORIES: Record<string, ToolName[]> = {
  "Filesystem": ["scan_project", "read_file", "write_file", "precise_edit", "create_directory", "delete_file", "rename_file", "move_file", "copy_file", "list_directory", "search_files"],
  "Terminal": ["run_command", "sandbox_run"],
  "Git": ["git_status", "git_checkout_branch", "git_commit_changes", "git_diff", "git_log", "git_stash", "git_create_branch"],
  "Web": ["web_search", "web_fetch", "web_crawl", "web_screenshot"],
  "Memory": ["read_memory", "write_memory", "compress_memory", "summarize_memory", "search_workspace"],
  "Planning": ["create_plan", "update_plan", "reflect", "walkthrough"],
  "Agent": ["delegate_task", "spawn_sub_agent", "merge_results"],
};
