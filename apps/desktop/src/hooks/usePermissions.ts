import { useState, useRef, useCallback } from "react";
import { API_BASE } from "../utils/config.js";

export function usePermissions() {
  const resolvedPermissions = useRef<Set<string>>(new Set());
  const [permissionStates, setPermissionStates] = useState<{ [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" }>({});

  const handlePermissionResponse = useCallback(async (reqId: string, approved: boolean) => {
    resolvedPermissions.current.add(reqId);
    setPermissionStates(prev => ({ ...prev, [reqId]: approved ? "approved" : "rejected" }));
    
    try {
      const res = await fetch(`${API_BASE}/api/agent/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: reqId, approved })
      });
      if (!res.ok && res.status !== 404) {
        console.error("Failed to submit approval response:", res.status);
      }
    } catch (err) {
      console.error("Error submitting approval response:", err);
    }
  }, []);

  const addPermissionTimeout = useCallback((reqId: string) => {
    // If user doesn't respond in 5 minutes (300000 ms), mark as timed out
    setTimeout(() => {
      if (!resolvedPermissions.current.has(reqId)) {
        resolvedPermissions.current.add(reqId);
        setPermissionStates(prev => ({ ...prev, [reqId]: "timed_out" }));
      }
    }, 5 * 60 * 1000);
  }, []);

  return {
    permissionStates,
    resolvedPermissionIds: resolvedPermissions.current,
    handlePermissionResponse,
    addPermissionTimeout
  };
}
export type UsePermissionsReturn = ReturnType<typeof usePermissions>;
