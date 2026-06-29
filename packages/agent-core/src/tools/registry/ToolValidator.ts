import { validateToolParams } from "@istiyak/agent-tools";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates tool parameters against JSON schemas.
 * Checks required fields, type correctness, enum values,
 * and provides detailed error messages.
 */
export class ToolValidator {
  /**
   * Quick boolean check — delegates to agent-tools.
   */
  static validate(schema: Record<string, any>, params: Record<string, any>): boolean {
    return validateToolParams(schema, params);
  }

  /**
   * Detailed validation with error messages.
   */
  static validateDetailed(schema: Record<string, any>, params: Record<string, any>): ValidationResult {
    const errors: string[] = [];

    if (!schema || typeof schema !== "object") {
      return { valid: true, errors: [] }; // No schema = accept anything
    }

    // Check required fields
    const required = schema.required as string[] || [];
    for (const field of required) {
      if (params[field] === undefined || params[field] === null) {
        errors.push(`Missing required parameter: "${field}"`);
      }
    }

    // Check property types
    const properties = schema.properties as Record<string, any> || {};
    for (const [key, propSchema] of Object.entries(properties)) {
      const value = params[key];
      if (value === undefined || value === null) continue;

      // Type check
      if (propSchema.type) {
        const expectedType = propSchema.type;
        const actualType = Array.isArray(value) ? "array" : typeof value;

        if (expectedType === "integer") {
          if (typeof value !== "number" || !Number.isInteger(value)) {
            errors.push(`Parameter "${key}" should be an integer, got ${typeof value}: ${value}`);
          }
        } else if (expectedType !== actualType) {
          errors.push(`Parameter "${key}" should be type "${expectedType}", got "${actualType}"`);
        }
      }

      // Enum check
      if (propSchema.enum && Array.isArray(propSchema.enum)) {
        if (!propSchema.enum.includes(value)) {
          errors.push(
            `Parameter "${key}" must be one of [${propSchema.enum.join(", ")}], got "${value}"`
          );
        }
      }

      // Min/max for numbers
      if (typeof value === "number") {
        if (propSchema.minimum !== undefined && value < propSchema.minimum) {
          errors.push(`Parameter "${key}" must be >= ${propSchema.minimum}, got ${value}`);
        }
        if (propSchema.maximum !== undefined && value > propSchema.maximum) {
          errors.push(`Parameter "${key}" must be <= ${propSchema.maximum}, got ${value}`);
        }
      }

      // MinLength/maxLength for strings
      if (typeof value === "string") {
        if (propSchema.minLength !== undefined && value.length < propSchema.minLength) {
          errors.push(`Parameter "${key}" must be at least ${propSchema.minLength} characters`);
        }
        if (propSchema.maxLength !== undefined && value.length > propSchema.maxLength) {
          errors.push(`Parameter "${key}" must be at most ${propSchema.maxLength} characters`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Returns a formatted error string for validation failures.
   */
  static formatErrors(result: ValidationResult): string {
    if (result.valid) return "";
    return `Parameter validation failed:\n${result.errors.map(e => `  - ${e}`).join("\n")}`;
  }
}

/**
 * Legacy export for backward compatibility.
 */
export function validateParams(schema: Record<string, any>, params: Record<string, any>): boolean {
  return ToolValidator.validate(schema, params);
}
