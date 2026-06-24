import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import * as Sentry from "@sentry/react";
import { invoke } from "@tauri-apps/api/core";

// Initialize Sentry client-side if DSN environment variable is found
invoke("get_env_var", { name: "SENTRY_DSN" })
  .then((dsn: any) => {
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
