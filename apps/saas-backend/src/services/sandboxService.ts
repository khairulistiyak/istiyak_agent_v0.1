import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export async function startSandboxSession(image: string, name: string) {
  return {
    containerId: "dind_container_hash_stub",
    status: "running",
    ipAddress: "127.0.0.1",
    port: 32768,
    image,
    name
  };
}

export async function stopSandboxSession(containerId: string) {
  return {
    containerId,
    status: "stopped"
  };
}

export async function executeCommandInSandbox(
  userId: string,
  command: string,
  files: Record<string, string>,
  onChunk: (chunk: string) => void
): Promise<void> {
  // Use a user-specific isolated sandbox directory inside saas-backend
  const sandboxDir = path.join(process.cwd(), "sandboxes", userId);
  
  // Ensure sandbox directory exists
  if (!fs.existsSync(sandboxDir)) {
    fs.mkdirSync(sandboxDir, { recursive: true });
  }

  // Write any provided virtual files
  if (files && typeof files === "object") {
    for (const [filePath, fileContent] of Object.entries(files)) {
      const fullPath = path.join(sandboxDir, filePath);
      // Prevent path traversal outside the user sandbox
      const relative = path.relative(sandboxDir, fullPath);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        continue;
      }
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, String(fileContent), "utf-8");
    }
  }

  // Spawn command shell execution in this directory
  return new Promise<void>((resolve, reject) => {
    const child = spawn("/bin/sh", ["-c", command], {
      cwd: sandboxDir,
      env: { ...process.env, PATH: process.env.PATH }
    });

    child.stdout.on("data", (data) => {
      onChunk(data.toString());
    });

    child.stderr.on("data", (data) => {
      onChunk(data.toString());
    });

    child.on("error", (err) => {
      reject(err);
    });

    child.on("close", (code) => {
      resolve();
    });
  });
}

