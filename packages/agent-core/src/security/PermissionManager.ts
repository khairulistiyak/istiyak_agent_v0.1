import { TOOLS_CONFIG } from "../config/Tools.js";
import { ApprovalManager } from "../agent/ApprovalManager.js";

export class PermissionManager {
  private approvalManager: ApprovalManager;

  constructor(approvalManager: ApprovalManager) {
    this.approvalManager = approvalManager;
  }

  public async checkPermission(toolName: string, detail: string): Promise<boolean> {
    const config = TOOLS_CONFIG[toolName];
    
    // Check if configuration requires explicit user approval
    if (config && config.approveRequired) {
      console.log(`[PermissionManager] Tool '${toolName}' requires approval. Prompting user.`);
      return this.approvalManager.requestPermission(detail);
    }

    return true;
  }
}
