import { generateUUID } from "@istiyak/shared-utils";

export class ApprovalManager {
  private pendingResolvers: Map<string, (approved: boolean) => void> = new Map();

  public requestPermission(command: string): Promise<boolean> {
    return new Promise((resolve) => {
      const requestId = generateUUID();
      this.pendingResolvers.set(requestId, resolve);
      
      // Fire event to listener bus for UI notifications
      console.log(`[Permission Request] ID: ${requestId} Command: ${command}`);
    });
  }

  public resolvePermission(requestId: string, approved: boolean): boolean {
    const resolver = this.pendingResolvers.get(requestId);
    if (resolver) {
      resolver(approved);
      this.pendingResolvers.delete(requestId);
      return true;
    }
    return false;
  }
}
