/**
 * Handles tool errors, API errors, and recovery strategies.
 * Classifies errors and returns human-readable messages for the agent.
 */
export class ExceptionHandler {
  static handle(error: unknown): string {
    const message = error instanceof Error ? error.message : String(error);
    const status =
      typeof error === "object" && error !== null
        ? ((error as Record<string, number>).status ??
          (error as Record<string, number>).statusCode ??
          0)
        : 0;
    console.error(`[ExceptionHandler] Caught error:`, message);

    // File system errors
    if (message.includes("ENOENT")) {
      return `Error: File or directory not found. Please double check the target path before retrying.`;
    }
    if (message.includes("EACCES") || message.includes("EPERM")) {
      return `Error: Permission denied. The agent does not have access to this path.`;
    }
    if (message.includes("EEXIST")) {
      return `Error: File already exists at that path. Use write_file to overwrite or choose a different path.`;
    }
    if (message.includes("EISDIR")) {
      return `Error: Target is a directory, not a file. Provide a file path instead.`;
    }
    if (message.includes("ENOSPC")) {
      return `Error: Disk is full. Cannot write file.`;
    }

    // Network / API errors
    if (status === 429 || message.includes("429") || message.toLowerCase().includes("rate limit")) {
      return `Error: Rate limit exceeded. The LLM API is throttling requests. Wait and retry.`;
    }
    if (
      status === 401 ||
      message.includes("401") ||
      message.toLowerCase().includes("unauthorized") ||
      message.toLowerCase().includes("invalid api key")
    ) {
      return `Error: Authentication failed. The API key is invalid or expired. Check settings.`;
    }
    if (status === 403 || message.includes("403") || message.toLowerCase().includes("forbidden")) {
      return `Error: Access forbidden. Check API permissions.`;
    }
    if (status === 404 || message.includes("404")) {
      return `Error: Resource not found (404). Check the URL or model name.`;
    }
    if (
      status === 500 ||
      message.includes("500") ||
      message.toLowerCase().includes("internal server error")
    ) {
      return `Error: LLM provider returned a server error (500). This is usually temporary. Retry the step.`;
    }
    if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("timed out")) {
      return `Error: Operation timed out. The command or request took too long. Try a shorter command or break the task into smaller parts.`;
    }
    if (
      message.toLowerCase().includes("network") ||
      message.toLowerCase().includes("econnrefused") ||
      message.toLowerCase().includes("enotfound")
    ) {
      return `Error: Network connection failed. Check internet connection and API endpoint.`;
    }

    // Tool-specific errors
    if (message.includes("Tool Registry Error: Tool not found")) {
      const toolName = message.split("Tool not found: ")[1] || "unknown";
      return `Error: Tool "${toolName}" is not registered. Use only the tools listed in the system prompt.`;
    }
    if (message.includes("Parameter validation failed")) {
      return `Error: Invalid tool parameters. ${message}. Check the tool schema and provide all required fields.`;
    }

    // JSON parse errors
    if (message.toLowerCase().includes("json") || message.toLowerCase().includes("parse")) {
      return `Error: JSON parsing failed. Ensure your response is valid JSON. ${message}`;
    }

    // Git errors
    if (message.toLowerCase().includes("not a git repository")) {
      return `Error: Not a git repository. Run git init first or navigate to a git-managed directory.`;
    }
    if (message.toLowerCase().includes("nothing to commit")) {
      return `Error: Nothing to commit. There are no staged changes.`;
    }

    return `Error: Execution failed: ${message}`;
  }

  /**
   * Determines if an error is retryable (transient).
   */
  static isRetryable(error: unknown): boolean {
    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
    const status =
      typeof error === "object" && error !== null
        ? ((error as Record<string, number>).status ??
          (error as Record<string, number>).statusCode ??
          0)
        : 0;
    return (
      status === 429 ||
      status === 500 ||
      status === 503 ||
      message.includes("rate limit") ||
      message.includes("timeout") ||
      message.includes("network") ||
      message.includes("econnrefused") ||
      message.includes("internal server error")
    );
  }
}
