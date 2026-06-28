export class ExceptionHandler {
  static handle(error: any): string {
    const message = error?.message || String(error);
    console.error(`[ExceptionHandler] Caught runner error:`, message);

    if (message.includes("ENOENT")) {
      return `Error: File or directory not found. Please double check target path.`;
    }
    if (message.includes("EACCES")) {
      return `Error: Permission denied. Access restricted.`;
    }
    return `Error: Execution failed: ${message}`;
  }
}
