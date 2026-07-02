import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import * as Sentry from "@sentry/react";
import { invoke } from "@tauri-apps/api/core";

// Initialize Sentry client-side if DSN environment variable is found
const isTauri = typeof window !== "undefined" && (window as any).__TAURI_INTERNALS__ !== undefined;
if (isTauri) {
  invoke("get_env_var", { name: "SENTRY_DSN" })
    .then((dsn) => {
      if (dsn) {
        Sentry.init({
          dsn: String(dsn),
          tracesSampleRate: 1.0,
        });
        console.log("🛡️ Sentry Monitoring initialized on desktop client.");
      }
    })
    .catch(() => {
      // Sentry DSN not set or configuration missing, ignore for dev
    });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#08090a] text-white p-6 font-sans">
          <div className="max-w-md w-full bg-[#0d0f11] border border-[#ea4335]/30 rounded-xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-[#ea4335]/15 border border-[#ea4335]/30 rounded-full flex items-center justify-center mx-auto text-[#ea4335] text-xl font-bold">
              ⚠
            </div>
            <h1 className="text-lg font-bold tracking-tight text-white">Something went wrong</h1>
            <p className="text-xs text-zinc-400 bg-black/40 p-3 rounded-lg border border-zinc-800 text-left overflow-auto max-h-40 font-mono">
              {error instanceof Error ? error.message : String(error)}
            </p>
            <button
              onClick={resetError}
              className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
