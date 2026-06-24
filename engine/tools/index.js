import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import os from "os";
import fsSync from "fs";
import { isLocked, lockFile, unlockFile } from "../watcher.js";

/**
 * Reads configuration from the local user directory.
 */
function getSandboxConfig() {
  try {
    const home = os.homedir();
    const configPath = path.join(home, ".istiyak_agent_config.json");
    if (fsSync.existsSync(configPath)) {
      const content = fsSync.readFileSync(configPath, "utf-8");
      const config = JSON.parse(content);
      return {
        dockerSandboxEnabled: !!config.DOCKER_SANDBOX_ENABLED,
        sandboxImage: config.SANDBOX_IMAGE || "node:20-alpine"
      };
    }
  } catch (error) {
    // Ignore error and fall back to default
  }
  return { dockerSandboxEnabled: false, sandboxImage: "node:20-alpine" };
}

/**
 * Recursively scans workspace and returns list of relative file paths.
 * Excludes typical dependency/build directories.
 * @param {string} workspacePath
 * @returns {Promise<Array<string>>}
 */
export async function scanProject(workspacePath) {
  const result = [];
  const walk = async (dir) => {
    const list = await fs.readdir(dir, { withFileTypes: true });
    for (const item of list) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        const name = item.name;
        if (
          name === "node_modules" ||
          name === ".git" ||
          name === "dist" ||
          name === "target" ||
          name === ".next" ||
          name === "build" ||
          name === ".svelte-kit" ||
          name === ".tauri"
        ) {
          continue;
        }
        await walk(fullPath);
      } else {
        const relPath = path.relative(workspacePath, fullPath);
        result.push(relPath.replace(/\\/g, "/")); // normalize separators
      }
    }
  };
  await walk(workspacePath);
  return result;
}

/**
 * Reads file contents relative to the workspace path.
 * @param {string} workspacePath
 * @param {string} relPath
 * @returns {Promise<string>}
 */
export async function readFile(workspacePath, relPath) {
  const fullPath = path.resolve(workspacePath, relPath);
  // Security guard: Ensure target path resides inside workspacePath
  if (!fullPath.startsWith(path.resolve(workspacePath))) {
    throw new Error("Security Violation: Access denied outside workspace path.");
  }
  return await fs.readFile(fullPath, "utf-8");
}

/**
 * Overwrites file contents relative to the workspace path.
 * Creates parent directories if missing.
 * @param {string} workspacePath
 * @param {string} relPath
 * @param {string} content
 * @returns {Promise<void>}
 */
export async function writeFile(workspacePath, relPath, content) {
  const fullPath = path.resolve(workspacePath, relPath);
  // Security guard: Ensure target path resides inside workspacePath
  if (!fullPath.startsWith(path.resolve(workspacePath))) {
    throw new Error("Security Violation: Access denied outside workspace path.");
  }
  
  // File Lock check: Ensure file is not locked by another owner
  if (isLocked(fullPath, "agent")) {
    throw new Error(`File Locking Violation: File is locked by another process: ${relPath}`);
  }

  // Acquire lock for agent write operation
  lockFile(fullPath, "agent");

  try {
    const parent = path.dirname(fullPath);
    await fs.mkdir(parent, { recursive: true });
    await fs.writeFile(fullPath, content, "utf-8");
  } finally {
    // Release the lock
    unlockFile(fullPath);
  }
}

/**
 * Runs a terminal command inside the workspace path.
 * Supports running inside isolated Docker containers when sandboxing is enabled.
 * @param {string} workspacePath
 * @param {string} command
 * @param {boolean} cloudSandboxEnabled
 * @param {string} token
 * @returns {Promise<string>} stdout & stderr combined
 */
export async function runCommand(workspacePath, command, cloudSandboxEnabled = false, token = "") {
  if (cloudSandboxEnabled && token) {
    try {
      // Scan workspace and read files to synchronize with the remote sandbox
      const fileList = await scanProject(workspacePath);
      const files = {};
      for (const relPath of fileList) {
        try {
          const content = await readFile(workspacePath, relPath);
          files[relPath] = content;
        } catch (e) {
          // ignore directory or binary files
        }
      }

      const res = await fetch("http://localhost:3002/api/sandbox/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ command, files })
      });

      const data = await res.json();
      if (!res.ok) {
        return `Cloud Sandbox Execution Failed: ${data.error || res.statusText}`;
      }
      return data.output || "";
    } catch (err) {
      return `Cloud Sandbox Error: Failed to execute command remotely. Details: ${err.message}`;
    }
  }

  const { dockerSandboxEnabled, sandboxImage } = getSandboxConfig();

  if (dockerSandboxEnabled) {
    const tempScriptName = `.sandbox_${Date.now()}.sh`;
    const tempScriptPath = path.join(workspacePath, tempScriptName);
    
    try {
      await fs.writeFile(tempScriptPath, command, "utf-8");
      
      const dockerCmd = `docker run --rm -v "${workspacePath}:/workspace" -w /workspace ${sandboxImage} sh ${tempScriptName}`;
      
      return await new Promise((resolve) => {
        exec(dockerCmd, { cwd: workspacePath }, async (error, stdout, stderr) => {
          // Cleanup temp script
          try {
            await fs.unlink(tempScriptPath);
          } catch (e) {
            // ignore
          }
          const output = [];
          if (stdout) output.push(stdout);
          if (stderr) output.push(stderr);
          if (error) output.push(`Error: ${error.message}`);
          resolve(output.join("\n"));
        });
      });
    } catch (err) {
      return `Sandbox Error: Failed to initialize execution script. Details: ${err.message}`;
    }
  }

  return new Promise((resolve) => {
    exec(command, { cwd: workspacePath }, (error, stdout, stderr) => {
      const output = [];
      if (stdout) output.push(stdout);
      if (stderr) output.push(stderr);
      if (error) output.push(`Error: ${error.message}`);
      resolve(output.join("\n"));
    });
  });
}

export async function gitCheckoutBranch(workspacePath, branchName, createNew = false) {
  const flag = createNew ? "-b" : "";
  const sanitizedBranch = branchName.replace(/[^a-zA-Z0-9_\-\/]/g, "");
  const cmd = `git checkout ${flag} "${sanitizedBranch}"`;
  return await runCommand(workspacePath, cmd);
}

export async function gitCommitChanges(workspacePath, message) {
  const sanitizedMsg = message.replace(/"/g, '\\"');
  const cmd = `git add . && git commit -m "${sanitizedMsg}"`;
  return await runCommand(workspacePath, cmd);
}

// Export a unified tools map for the runner engine
export async function searchWorkspaceTool(workspacePath, query, limit = 5) {
  const { searchWorkspace } = await import("../rag.js");
  return searchWorkspace(query, limit);
}

export const tools = {
  scan_project: scanProject,
  read_file: readFile,
  write_file: writeFile,
  run_command: runCommand,
  search_workspace: searchWorkspaceTool,
  git_checkout_branch: gitCheckoutBranch,
  git_commit_changes: gitCommitChanges
};

