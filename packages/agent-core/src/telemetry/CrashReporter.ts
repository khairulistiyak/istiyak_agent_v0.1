import fs from "fs";
import path from "path";
import os from "os";

/**
 * Records, persists, and retrieves crash reports for debugging.
 * Stores structured crash logs on disk with stack trace parsing
 * and crash history management.
 */
export class CrashReporter {
  /** Directory for crash log files */
  private static readonly CRASH_DIR = path.join(os.homedir(), ".istiyak_crash_logs");

  /** Maximum number of crash logs to retain */
  private static readonly MAX_CRASH_LOGS = 50;

  /**
   * Reports a crash: logs it, parses the stack trace, and persists to disk.
   */
  static reportCrash(err: Error, context?: Record<string, any>): string {
    const crashId = `crash-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const report = {
      id: crashId,
      timestamp: new Date().toISOString(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack || "",
      },
      parsedStack: CrashReporter.parseStackTrace(err.stack || ""),
      context: context || {},
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
    };

    console.error(`[CrashReporter] Crash ${crashId}: ${err.name}: ${err.message}`);

    // Persist to disk
    try {
      CrashReporter.ensureCrashDir();
      const filePath = path.join(CrashReporter.CRASH_DIR, `${crashId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");
      CrashReporter.pruneOldLogs();
    } catch (writeErr: any) {
      console.error(`[CrashReporter] Failed to write crash log: ${writeErr.message}`);
    }

    return crashId;
  }

  /**
   * Retrieves the last N crash reports from disk.
   */
  static getRecentCrashes(count = 10): any[] {
    try {
      CrashReporter.ensureCrashDir();
      const files = fs.readdirSync(CrashReporter.CRASH_DIR)
        .filter(f => f.endsWith(".json"))
        .sort()
        .reverse()
        .slice(0, count);

      return files.map(f => {
        try {
          const content = fs.readFileSync(path.join(CrashReporter.CRASH_DIR, f), "utf-8");
          return JSON.parse(content);
        } catch {
          return null;
        }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }

  /**
   * Gets a specific crash report by ID.
   */
  static getCrash(crashId: string): any | null {
    try {
      const filePath = path.join(CrashReporter.CRASH_DIR, `${crashId}.json`);
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Clears all crash logs.
   */
  static clearCrashLogs(): void {
    try {
      CrashReporter.ensureCrashDir();
      const files = fs.readdirSync(CrashReporter.CRASH_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CrashReporter.CRASH_DIR, file));
      }
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Parses a stack trace string into structured frame objects.
   */
  private static parseStackTrace(stack: string): Array<{
    function: string;
    file: string;
    line: number;
    column: number;
  }> {
    if (!stack) return [];

    return stack
      .split("\n")
      .filter(line => line.trim().startsWith("at "))
      .map(line => {
        const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (match) {
          return {
            function: match[1],
            file: match[2],
            line: parseInt(match[3], 10),
            column: parseInt(match[4], 10),
          };
        }

        // Anonymous function format: at /path/to/file:line:col
        const anonMatch = line.match(/at\s+(.+?):(\d+):(\d+)/);
        if (anonMatch) {
          return {
            function: "<anonymous>",
            file: anonMatch[1],
            line: parseInt(anonMatch[2], 10),
            column: parseInt(anonMatch[3], 10),
          };
        }

        return {
          function: line.trim().replace(/^at\s+/, ""),
          file: "",
          line: 0,
          column: 0,
        };
      });
  }

  /**
   * Ensures the crash log directory exists.
   */
  private static ensureCrashDir(): void {
    if (!fs.existsSync(CrashReporter.CRASH_DIR)) {
      fs.mkdirSync(CrashReporter.CRASH_DIR, { recursive: true });
    }
  }

  /**
   * Removes oldest crash logs if count exceeds MAX_CRASH_LOGS.
   */
  private static pruneOldLogs(): void {
    try {
      const files = fs.readdirSync(CrashReporter.CRASH_DIR)
        .filter(f => f.endsWith(".json"))
        .sort();

      while (files.length > CrashReporter.MAX_CRASH_LOGS) {
        const oldest = files.shift();
        if (oldest) {
          fs.unlinkSync(path.join(CrashReporter.CRASH_DIR, oldest));
        }
      }
    } catch {
      // Ignore prune errors
    }
  }
}
