import { WorkspaceMemoryStore } from "@istiyak/agent-memory";

/**
 * Manages workspace-specific memory: rules, preferences, and file change history.
 * Wraps WorkspaceMemoryStore with additional utility methods.
 */
export class WorkspaceMemory {
  private store: WorkspaceMemoryStore;
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.store = new WorkspaceMemoryStore(workspacePath);
    this.workspacePath = workspacePath;
  }

  /**
   * Gets a specific rule by key.
   */
  async getRule(key: string): Promise<any> {
    return this.store.getRule(key);
  }

  /**
   * Sets a workspace rule.
   */
  async setRule(key: string, value: any): Promise<void> {
    await this.store.setRule(key, value);
  }

  /**
   * Deletes a workspace rule by key.
   */
  async deleteRule(key: string): Promise<void> {
    await this.store.deleteRule(key);
  }

  /**
   * Retrieves all workspace rules by scanning known rule keys.
   */
  async getAllRules(): Promise<Record<string, any>> {
    const rules: Record<string, any> = {};
    const knownKeys = [
      "coding_style",
      "language_preference",
      "framework_preference",
      "test_framework",
      "lint_config",
      "build_tool",
      "deployment_target",
      "naming_convention",
      "custom_instructions",
    ];

    for (const key of knownKeys) {
      try {
        const value = await this.store.getRule(key);
        if (value !== undefined && value !== null) {
          rules[key] = value;
        }
      } catch {
        // Key doesn't exist — skip
      }
    }

    return rules;
  }

  /**
   * Formats all workspace rules as a system prompt section.
   * Used to inject user preferences into the agent's context.
   */
  async getRulesAsPrompt(): Promise<string> {
    const rules = await this.getAllRules();
    const entries = Object.entries(rules);

    if (entries.length === 0) {
      return "";
    }

    const lines = entries.map(([key, value]) => {
      const formattedKey = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      const formattedValue = typeof value === "string" ? value : JSON.stringify(value);
      return `- **${formattedKey}**: ${formattedValue}`;
    });

    return `\n\n### Workspace Preferences\nThe user has set the following preferences for this workspace:\n${lines.join("\n")}\n`;
  }

  /**
   * Returns the workspace path this memory is associated with.
   */
  getWorkspacePath(): string {
    return this.workspacePath;
  }
}
