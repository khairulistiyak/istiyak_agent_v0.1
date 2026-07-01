import { BaseTool, ToolContext } from "@istiyak/agent-tools";
import fs from "fs/promises";
import path from "path";

const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico", ".webp", ".svg",
  ".mp3", ".mp4", ".wav", ".avi", ".mov", ".mkv", ".flv",
  ".zip", ".tar", ".gz", ".rar", ".7z", ".bz2",
  ".exe", ".dll", ".so", ".dylib", ".bin",
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".woff", ".woff2", ".ttf", ".otf", ".eot",
  ".pyc", ".class", ".o", ".obj",
  ".sqlite", ".db",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export class ReadFileTool extends BaseTool {
  name = "read_file";
  description = "Reads the content of a target file. Rejects binary files and files larger than 10MB.";
  parameterSchema = {
    type: "object",
    required: ["relPath"],
    properties: {
      relPath: { type: "string" }
    }
  };

  async execute(params: { relPath: string }, context: ToolContext): Promise<string> {
    const fullPath = path.resolve(context.workspacePath, params.relPath);
    if (!fullPath.startsWith(path.resolve(context.workspacePath))) {
      throw new Error("Security Violation: Access denied outside workspace path.");
    }

    // Check file extension for binary files
    const ext = path.extname(fullPath).toLowerCase();
    if (BINARY_EXTENSIONS.has(ext)) {
      throw new Error(`Cannot read binary file: ${params.relPath} (extension: ${ext}). Use a different approach for binary files.`);
    }

    // Check file size
    const stat = await fs.stat(fullPath);
    if (stat.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${params.relPath} is ${(stat.size / 1024 / 1024).toFixed(2)}MB. Maximum is 10MB.`);
    }

    return await fs.readFile(fullPath, "utf-8");
  }
}
