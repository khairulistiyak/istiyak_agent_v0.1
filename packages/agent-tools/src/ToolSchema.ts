export function validateToolParams(schema: Record<string, any>, params: Record<string, any>): boolean {
  if (schema.required && Array.isArray(schema.required)) {
    for (const reqProp of schema.required) {
      if (!(reqProp in params)) {
        throw new Error(`Validation Error: Missing required parameter: ${reqProp}`);
      }
    }
  }
  return true;
}
