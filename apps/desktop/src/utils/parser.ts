import { AgentStep, PermissionRequest } from "../types/chat.js";

export function parseAgentMessage(rawText: string) {
  const steps: AgentStep[] = [];
  const permissionRequests: PermissionRequest[] = [];
  
  const stepMatches = [...rawText.matchAll(/<agent_step\s+([^>]*?)>(.*?)<\/agent_step>/gi)];
  for (const m of stepMatches) {
    const attrsStr = m[1];
    const content = m[2];
    
    const stepAttr = attrsStr.match(/step="(\d+)"/i)?.[1];
    const statusAttr = attrsStr.match(/status="([^"]+)"/i)?.[1];
    const nameAttr = attrsStr.match(/name="([^"]+)"/i)?.[1];
    
    const stepNum = stepAttr ? parseInt(stepAttr, 10) : 1;
    
    const params: any = {};
    const attrPairs = attrsStr.matchAll(/([a-zA-Z0-9_-]+)="([^"]*?)"/gi);
    for (const ap of attrPairs) {
      const k = ap[1];
      const v = ap[2];
      if (k !== "step" && k !== "status" && k !== "name") {
        params[k] = v.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      }
    }

    steps.push({
      step: stepNum,
      status: (statusAttr || "thought") as any,
      content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      actionName: nameAttr,
      params
    });
  }

  const permMatches = [...rawText.matchAll(/<permission_request\s+([^>]*?)><\/permission_request>/gi)];
  for (const pm of permMatches) {
    const attrsStr = pm[1];
    const id = attrsStr.match(/id="([^"]+)"/i)?.[1];
    const type = attrsStr.match(/type="([^"]+)"/i)?.[1];
    const command = attrsStr.match(/command="([^"]+)"/i)?.[1];
    
    if (id && type && command) {
      const decodedCommand = command.replace(/&quot;/g, '"');
      permissionRequests.push({ id, type: type as any, command: decodedCommand });
    }
  }

  let cleanText = rawText.replace(/<agent_step[^>]*?>.*?<\/agent_step>/gi, "");
  cleanText = cleanText.replace(/<permission_request[^>]*?><\/permission_request>/gi, "");
  
  return {
    steps,
    permissionRequests,
    cleanText: cleanText.trim()
  };
}
