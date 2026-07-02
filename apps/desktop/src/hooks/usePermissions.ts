import { useState, useRef, useCallback, useEffect } from "react";
import { API_BASE } from "../utils/config.js";

export function usePermissions() {
  const resolvedPermissions = useRef<Set<string>>(new Set());
  const timeoutIds = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const [permissionStates, setPermissionStates] = useState<{ [reqId: string]: "pending" | "approved" | "rejected" | "timed_out" }>({});

  // Cleanup all pending timeouts on unmount
  useEffect(() => {
    return () => {
      for (const tid of timeoutIds.current.values()) {
        clearTimeout(tid);
      }
      timeoutIds.current.clear();
    };
  }, []);

  const handlePermissionResponse = useCallback(async (reqId: string, approved: boolean) => {
    resolvedPermissions.current.add(reqId);
    setPermissionStates(prev => ({ ...prev, [reqId]: approved ? "approved" : "rejected" }));

    // Clear pending timeout if still active
    const tid = timeoutIds.current.get(reqId);
    if (tid) {
      clearTimeout(tid);
      timeoutIds.current.delete(reqId);
    }

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
    // Cancel any existing timeout for this reqId
    const existing = timeoutIds.current.get(reqId);
    if (existing) clearTimeout(existing);

    const tid = setTimeout(() => {
      timeoutIds.current.delete(reqId);
      if (!resolvedPermissions.current.has(reqId)) {
        resolvedPermissions.current.add(reqId);
        setPermissionStates(prev => ({ ...prev, [reqId]: "timed_out" }));
      }
    }, 5 * 60 * 1000);

    timeoutIds.current.set(reqId, tid);
  }, []);

  return {
    permissionStates,
    resolvedPermissionIds: resolvedPermissions.current,
    handlePermissionResponse,
    addPermissionTimeout
  };
}
export type UsePermissionsReturn = ReturnType<typeof usePermissions>;
