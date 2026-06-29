import { maskSecrets } from "@istiyak/shared-utils";

/**
 * Auto-detects and masks sensitive data in text.
 * Supports:
 *   - API keys (OpenAI sk-*, Google AIza*, Anthropic sk-ant-*)
 *   - Bearer tokens
 *   - Environment variable values
 *   - Custom secrets provided by the user
 */
export class SecretMasker {
  /** Well-known API key patterns */
  private static readonly SECRET_PATTERNS = [
    // OpenAI API keys
    /\bsk-[a-zA-Z0-9]{20,}\b/g,
    // Google API keys
    /\bAIza[a-zA-Z0-9_-]{35}\b/g,
    // Anthropic API keys
    /\bsk-ant-[a-zA-Z0-9_-]{20,}\b/g,
    // Deepseek API keys
    /\bsk-[a-f0-9]{32,}\b/g,
    // Bearer tokens
    /Bearer\s+[a-zA-Z0-9._\-\/+=]{20,}/g,
    // Generic long hex/base64 tokens (40+ chars, likely secrets)
    /\b[a-f0-9]{40,}\b/gi,
    // GitHub tokens
    /\bghp_[a-zA-Z0-9]{36}\b/g,
    /\bgho_[a-zA-Z0-9]{36}\b/g,
    // npm tokens
    /\bnpm_[a-zA-Z0-9]{36}\b/g,
    // AWS access keys
    /\bAKIA[A-Z0-9]{16}\b/g,
    // Basic auth in URLs
    /https?:\/\/[^:]+:[^@]+@/g,
  ];

  /**
   * Masks known secret patterns in text, plus any additional custom secrets.
   * Uses the shared-utils maskSecrets for custom secrets and regex for auto-detection.
   */
  static mask(text: string, customSecrets?: string[]): string {
    if (!text) return text;

    let masked = text;

    // Auto-detect and mask well-known patterns
    for (const pattern of SecretMasker.SECRET_PATTERNS) {
      // Reset lastIndex for global regex
      pattern.lastIndex = 0;
      masked = masked.replace(pattern, (match) => {
        // Keep first 4 and last 4 chars for identifiability
        if (match.length > 12) {
          return match.substring(0, 4) + "****" + match.substring(match.length - 4);
        }
        return "********";
      });
    }

    // Mask environment variable assignments with sensitive names
    masked = masked.replace(
      /\b(API_KEY|SECRET|TOKEN|PASSWORD|PRIVATE_KEY|AUTH|CREDENTIALS?)\s*[=:]\s*['"]?([^\s'"]+)/gi,
      (match, name, value) => `${name}=********`
    );

    // Mask custom user-provided secrets
    if (customSecrets && customSecrets.length > 0) {
      masked = maskSecrets(masked, customSecrets);
    }

    return masked;
  }

  /**
   * Checks whether a text likely contains unmasked secrets.
   */
  static containsSecrets(text: string): boolean {
    if (!text) return false;
    for (const pattern of SecretMasker.SECRET_PATTERNS) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) return true;
    }
    return false;
  }

  /**
   * Extracts detected secret locations (for UI highlighting).
   */
  static findSecrets(text: string): Array<{ start: number; end: number; type: string }> {
    const results: Array<{ start: number; end: number; type: string }> = [];

    const patternNames = [
      "OpenAI Key", "Google Key", "Anthropic Key", "Deepseek Key",
      "Bearer Token", "Hex Token", "GitHub Token", "GitHub OAuth Token",
      "npm Token", "AWS Key", "Basic Auth"
    ];

    SecretMasker.SECRET_PATTERNS.forEach((pattern, idx) => {
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(text)) !== null) {
        results.push({
          start: match.index,
          end: match.index + match[0].length,
          type: patternNames[idx] || "Secret",
        });
      }
    });

    return results;
  }
}
