import { ParsedAgentMessage, AgentStep, PermissionRequest } from "../types/chat.js";

export function parseAgentMessage(rawText: string): ParsedAgentMessage {
  const steps: AgentStep[] = [];
  const permissionRequests: PermissionRequest[] = [];
  
  // 1. Parse all fully closed step tags
  const stepMatches = [...rawText.matchAll(/<agent_step\s+([^>]*?)>(.*?)<\/agent_step>/gi)];
  let lastClosedIndex = -1;
  for (const m of stepMatches) {
    const attrsStr = m[1];
    const content = m[2];
    
    // Track index to find the end of the last closed step
    const matchIndex = m.index ?? -1;
    if (matchIndex !== -1) {
      lastClosedIndex = Math.max(lastClosedIndex, matchIndex + m[0].length);
    }
    
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
      status: (statusAttr || 'thought') as any,
      content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      actionName: nameAttr,
      params
    });
  }

  // 2. Check for an unclosed tag at the end (for streaming)
  const lastStepOpenIndex = rawText.toLowerCase().lastIndexOf("<agent_step");
  let unclosedTagText = "";
  if (lastStepOpenIndex > -1 && lastStepOpenIndex >= lastClosedIndex) {
    // There is an unclosed tag at the end of the string
    unclosedTagText = rawText.substring(lastStepOpenIndex);
    const tagCloseIndex = unclosedTagText.indexOf(">");
    
    let attrsStr = "";
    let content = "";
    if (tagCloseIndex > -1) {
      attrsStr = unclosedTagText.substring(11, tagCloseIndex);
      content = unclosedTagText.substring(tagCloseIndex + 1);
    } else {
      attrsStr = unclosedTagText.substring(11);
    }

    const stepAttr = attrsStr.match(/step="(\d+)"/i)?.[1];
    const statusAttr = attrsStr.match(/status="([^"]+)"/i)?.[1];
    const nameAttr = attrsStr.match(/name="([^"]+)"/i)?.[1];
    
    const stepNum = stepAttr ? parseInt(stepAttr, 10) : (steps.length + 1);
    
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
      status: (statusAttr || 'thought') as any,
      content: content.replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      actionName: nameAttr,
      params
    });
  }

  // 3. Parse permission requests
  const permMatches = [...rawText.matchAll(/<permission_request\s+([^>]*?)><\/permission_request>/gi)];
  for (const pm of permMatches) {
    const attrsStr = pm[1];
    const id = attrsStr.match(/id="([^"]+)"/i)?.[1];
    const type = attrsStr.match(/type="([^"]+)"/i)?.[1];
    const command = attrsStr.match(/command="([^"]+)"/i)?.[1];
    const reason = attrsStr.match(/reason="([^"]+)"/i)?.[1];

    if (id && type && command) {
      const decodedCommand = command.replace(/&quot;/g, '"');
      const decodedReason = reason?.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      permissionRequests.push({ id, type: type as any, command: decodedCommand, reason: decodedReason });
    }
  }

  // Parse unclosed permission request if it's currently streaming
  const lastPermOpenIndex = rawText.toLowerCase().lastIndexOf("<permission_request");
  const lastPermCloseIndex = rawText.toLowerCase().lastIndexOf("</permission_request>");
  if (lastPermOpenIndex > -1 && lastPermOpenIndex > lastPermCloseIndex) {
    const unclosedPermText = rawText.substring(lastPermOpenIndex);
    const tagCloseIndex = unclosedPermText.indexOf(">");
    let attrsStr = "";
    if (tagCloseIndex > -1) {
      attrsStr = unclosedPermText.substring(20, tagCloseIndex);
    } else {
      attrsStr = unclosedPermText.substring(20);
    }
    const id = attrsStr.match(/id="([^"]+)"/i)?.[1];
    const type = attrsStr.match(/type="([^"]+)"/i)?.[1];
    const command = attrsStr.match(/command="([^"]+)"/i)?.[1];
    const reason = attrsStr.match(/reason="([^"]+)"/i)?.[1];

    if (id && type && command) {
      const decodedCommand = command.replace(/&quot;/g, '"');
      const decodedReason = reason?.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      if (!permissionRequests.some(r => r.id === id)) {
        permissionRequests.push({ id, type: type as any, command: decodedCommand, reason: decodedReason });
      }
    }
  }

  // 4. Parse real cost metadata appended by daemon at end of stream
  let costMeta: { cost: string; tokens: string; tokensIn: string; tokensOut: string } | null = null;
  const costMatch = rawText.match(/\*Session Cost: \$([0-9.]+) \| Tokens: (\d+) \((\d+) in \/ (\d+) out\)\*/);
  if (costMatch) {
    costMeta = {
      cost: costMatch[1],
      tokens: costMatch[2],
      tokensIn: costMatch[3],
      tokensOut: costMatch[4],
    };
  }

  // 5. Build cleanText by stripping steps and permissions
  let cleanText = rawText;
  
  // Replace fully closed tags first
  cleanText = cleanText.replace(/<agent_step[^>]*?>.*?<\/agent_step>/gi, "");
  cleanText = cleanText.replace(/<permission_request[^>]*?><\/permission_request>/gi, "");
  
  // Replace any unclosed tags at the end of streaming text
  if (unclosedTagText) {
    cleanText = cleanText.replace(unclosedTagText, "");
  }
  
  // Clean up cost metadata patterns
  cleanText = cleanText.replace(/\n\n---\n\*Session Cost:[^*]+\*/g, "");
  
  // Clean up Task Summary headings
  cleanText = cleanText.replace(/^(#+\s+)?Task Summary\s*\n?/gi, "").trim();

  return {
    steps,
    permissionRequests,
    cleanText,
    costMeta,
  };
}
