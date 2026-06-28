import { useEffect } from "react";

export function useTauriWindow() {
  useEffect(() => {
    console.log("[TauriWindow] Tauri window sizing helper initialized.");
  }, []);
}
