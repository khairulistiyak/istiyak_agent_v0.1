/**
 * Defines security policy boundaries for agent execution.
 * Controls network access, filesystem limits, process constraints,
 * and resource usage limits.
 */
export interface SandboxPolicyConfig {
  /** Whether outbound network access is allowed */
  networkEnabled: boolean;

  /** Allowed network domains (if networkEnabled is true) */
  allowedDomains: string[];

  /** Read-only filesystem paths the agent should not modify */
  readOnlyRoots: string[];

  /** Paths the agent is forbidden from accessing entirely */
  forbiddenPaths: string[];

  /** Max command execution time in milliseconds */
  maxExecutionTimeMs: number;

  /** Max output size in bytes for a single command */
  maxOutputSizeBytes: number;

  /** Max number of concurrent processes */
  maxConcurrentProcesses: number;

  /** Whether Docker container isolation is enabled */
  containerIsolation: boolean;

  /** Container resource limits (only applies when containerIsolation is true) */
  containerLimits: {
    memory: string;
    cpus: string;
    pidsLimit: number;
  };
}

export class SandboxPolicy {
  /**
   * Returns the default security policy.
   */
  static getPolicy(): SandboxPolicyConfig {
    return {
      networkEnabled: true,
      allowedDomains: [
        "api.github.com",
        "registry.npmjs.org",
        "api.openai.com",
        "generativelanguage.googleapis.com",
        "api.anthropic.com",
        "api.deepseek.com",
      ],
      readOnlyRoots: [
        "/bin", "/sbin", "/lib", "/usr",
        "/System", "/Library",
        "/etc",
      ],
      forbiddenPaths: [
        "/dev/sda", "/dev/disk",
        "/boot", "/proc/sysrq-trigger",
      ],
      maxExecutionTimeMs: 120000,     // 2 minutes per command
      maxOutputSizeBytes: 5242880,     // 5MB per command output
      maxConcurrentProcesses: 5,
      containerIsolation: false,
      containerLimits: {
        memory: "512m",
        cpus: "0.5",
        pidsLimit: 100,
      },
    };
  }

  /**
   * Returns a restrictive policy for untrusted code execution.
   */
  static getRestrictivePolicy(): SandboxPolicyConfig {
    return {
      ...SandboxPolicy.getPolicy(),
      networkEnabled: false,
      allowedDomains: [],
      maxExecutionTimeMs: 30000,       // 30 seconds
      maxOutputSizeBytes: 1048576,      // 1MB
      maxConcurrentProcesses: 2,
      containerIsolation: true,
    };
  }

  /**
   * Checks if a given path is allowed under the current policy.
   */
  static isPathAllowed(targetPath: string, policy?: SandboxPolicyConfig): boolean {
    const p = policy || SandboxPolicy.getPolicy();

    // Check forbidden paths
    for (const forbidden of p.forbiddenPaths) {
      if (targetPath.startsWith(forbidden)) return false;
    }

    // Check read-only roots (allowed for reading, not writing)
    for (const root of p.readOnlyRoots) {
      if (targetPath.startsWith(root)) return false;
    }

    return true;
  }

  /**
   * Checks if a domain is allowed for network access.
   */
  static isDomainAllowed(domain: string, policy?: SandboxPolicyConfig): boolean {
    const p = policy || SandboxPolicy.getPolicy();
    if (!p.networkEnabled) return false;
    if (p.allowedDomains.length === 0) return true; // Empty = allow all
    return p.allowedDomains.some(
      allowed => domain === allowed || domain.endsWith(`.${allowed}`)
    );
  }

  /**
   * Returns Docker run flags for container isolation.
   */
  static getDockerFlags(policy?: SandboxPolicyConfig): string[] {
    const p = policy || SandboxPolicy.getPolicy();
    const flags: string[] = [
      `--memory=${p.containerLimits.memory}`,
      `--cpus=${p.containerLimits.cpus}`,
      `--pids-limit=${p.containerLimits.pidsLimit}`,
      "--no-new-privileges",
      "--security-opt=no-new-privileges:true",
    ];

    if (!p.networkEnabled) {
      flags.push("--network=none");
    }

    return flags;
  }
}
