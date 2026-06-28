import { validateToolParams } from "@istiyak/agent-tools";

export function validateParams(schema: Record<string, any>, params: Record<string, any>): boolean {
  return validateToolParams(schema, params);
}
