export class ApprovalManager {
  static requiresApproval(action: string, params: any): boolean {
    if (action === "run_command") {
      const cmd = (params?.command || "").toLowerCase();
      if (cmd.includes("rm") || cmd.includes("delete") || cmd.includes("sudo") || cmd.includes("kill")) {
        return true;
      }
    }
    return false;
  }
}
