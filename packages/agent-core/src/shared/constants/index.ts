/** Default timeout for tool operations in milliseconds */
export const DEFAULT_TIMEOUT_MS = 30000;

/** Maximum number of automatic retries for transient errors */
export const MAX_RETRY_COUNT = 3;

/** Base delay between retries in milliseconds (exponential backoff) */
export const RETRY_BASE_DELAY_MS = 1000;

/** Maximum delay between retries in milliseconds */
export const RETRY_MAX_DELAY_MS = 30000;

/** File size limit for reading (10MB) */
export const MAX_READ_FILE_SIZE = 10 * 1024 * 1024;

/** Maximum output length for tool results returned to agent (chars) */
export const MAX_TOOL_OUTPUT_CHARS = 20000;

/** Maximum number of lines to show in directory scan */
export const MAX_SCAN_DEPTH = 6;

/** Agent step event prefix for streaming output */
export const AGENT_STEP_TAG = "agent_step";

/** Permission request event tag */
export const PERMISSION_REQUEST_TAG = "permission_request";

/** Workspace plan filename */
export const WORKSPACE_PLAN_FILE = "workspace_plan.md";

/** Walkthrough filename */
export const WALKTHROUGH_FILE = "walkthrough.md";
