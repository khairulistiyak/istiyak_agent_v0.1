export function validateParams(schema: Record<string, any>, params: Record<string, any>): boolean {
  if (!schema || !schema.properties) return true;
  
  const required = schema.required || [];
  for (const key of required) {
    if (params[key] === undefined || params[key] === null) {
      throw new Error(`Missing required parameter: ${key}`);
    }
  }

  // Basic type check helper
  for (const [key, value] of Object.entries(params)) {
    const propSchema = schema.properties[key];
    if (propSchema) {
      const type = propSchema.type;
      if (type === "string" && typeof value !== "string") {
        throw new Error(`Parameter '${key}' must be a string. Got '${typeof value}'.`);
      }
      if (type === "number" && typeof value !== "number") {
        throw new Error(`Parameter '${key}' must be a number. Got '${typeof value}'.`);
      }
      if (type === "boolean" && typeof value !== "boolean") {
        throw new Error(`Parameter '${key}' must be a boolean. Got '${typeof value}'.`);
      }
    }
  }

  return true;
}
