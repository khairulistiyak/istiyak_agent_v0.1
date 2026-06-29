/**
 * Centralized limits configuration for the agent system.
 * These values control resource usage across all components.
 */
export const LIMITS = {
  /** Maximum tokens in compressed conversation history */
  MAX_HISTORY_TOKENS: 6000,

  /** Maximum agent execution steps before forced stop */
  MAX_STEPS: 40,

  /** Docker sandbox memory limit */
  MAX_SANDBOX_MEMORY: "512m",

  /** Docker sandbox CPU limit */
  MAX_SANDBOX_CPUS: "0.5",

  /** Maximum context window tokens for LLM calls */
  MAX_CONTEXT_TOKENS: 100000,

  /** Maximum file size (bytes) the agent can read/write */
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  /** Maximum command output size in bytes */
  MAX_COMMAND_OUTPUT: 5 * 1024 * 1024, // 5MB

  /** Maximum command execution timeout in milliseconds */
  MAX_COMMAND_TIMEOUT: 120000, // 2 minutes

  /** Maximum number of files the agent can scan in a project */
  MAX_SCAN_FILES: 5000,

  /** Maximum concurrent tool executions */
  MAX_CONCURRENT_TOOLS: 3,

  /** Maximum session messages before auto-compression */
  MAX_SESSION_MESSAGES: 100,

  /** Maximum crash logs to retain */
  MAX_CRASH_LOGS: 50,

  /** Maximum usage records to keep in memory */
  MAX_USAGE_RECORDS: 10000,

  /** Reflection interval (steps between automatic reflections) */
  REFLECTION_INTERVAL: 5,
} as const;

export type LimitKey = keyof typeof LIMITS;
