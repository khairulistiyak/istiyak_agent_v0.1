export * from "./mask.js";
export * from "./crypto.js";
export * from "./logger.js";
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
