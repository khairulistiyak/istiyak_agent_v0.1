"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, CheckCircle, AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function StatusPage() {
  const router = useRouter();
  const [backendStatus, setBackendStatus] = useState("checking");
  const [daemonStatus, setDaemonStatus] = useState("checking");
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3002/health");
      const data = await res.json();
      if (data.status === "ok") {
        setBackendStatus("operational");
      } else {
        setBackendStatus("degraded");
      }
    } catch (e) {
      setBackendStatus("offline");
    }

    try {
      const res = await fetch("http://localhost:3001/health");
      const data = await res.json();
      if (data.status === "ok") {
        setDaemonStatus("operational");
      } else {
        setDaemonStatus("degraded");
      }
    } catch (e) {
      setDaemonStatus("offline");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      fontFamily: "'Inter', sans-serif",
      padding: "3rem 1.5rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Blur */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.03)",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ maxWidth: "600px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Navigation Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bot size={24} style={{ color: "#06b6d4" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
              ISTIYAK COMPANION
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </header>

        {/* Content Box */}
        <div style={{
          background: "rgba(18, 20, 28, 0.6)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "20px",
          padding: "3rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                Service Status
              </h1>
            </div>
            <button
              onClick={checkHealth}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: "#9ca3af",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontSize: "0.8rem",
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.5, margin: 0 }}>
            Real-time status monitoring for our core SaaS web gateway services and local daemon systems.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)", margin: 0 }} />

          {/* Status Indicators */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* SaaS Gateway */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem",
              borderRadius: "12px",
              backgroundColor: "rgba(13, 14, 21, 0.5)",
              border: "1px solid rgba(255,255,255,0.03)"
            }}>
              <div>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>SaaS Gateway API</span>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.2rem 0 0 0" }}>Billing checkouts, auth, usage logs</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: backendStatus === "operational" ? "#10b981" : backendStatus === "checking" ? "#9ca3af" : "#ef4444",
                  boxShadow: backendStatus === "operational" ? "0 0 10px #10b981" : "none"
                }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize", color: backendStatus === "operational" ? "#34d399" : backendStatus === "checking" ? "#9ca3af" : "#f87171" }}>
                  {backendStatus}
                </span>
              </div>
            </div>

            {/* Local Daemon */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.25rem",
              borderRadius: "12px",
              backgroundColor: "rgba(13, 14, 21, 0.5)",
              border: "1px solid rgba(255,255,255,0.03)"
            }}>
              <div>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>Local Agent Daemon</span>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.2rem 0 0 0" }}>Local file edits, execution, CLI portal</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: daemonStatus === "operational" ? "#10b981" : daemonStatus === "checking" ? "#9ca3af" : "#ef4444",
                  boxShadow: daemonStatus === "operational" ? "0 0 10px #10b981" : "none"
                }} />
                <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "capitalize", color: daemonStatus === "operational" ? "#34d399" : daemonStatus === "checking" ? "#9ca3af" : "#f87171" }}>
                  {daemonStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
