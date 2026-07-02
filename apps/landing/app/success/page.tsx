"use client";

import { Bot, CheckCircle } from "lucide-react";

export default function SuccessPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#030712",
      color: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      fontFamily: "system-ui, -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Background Decorative Glow */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        backgroundColor: "rgba(16, 185, 129, 0.06)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "400px",
        background: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: "24px",
        padding: "3rem 2rem",
        textAlign: "center",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          color: "#10b981",
          marginBottom: "1.5rem"
        }}>
          <CheckCircle size={32} />
        </div>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "0.75rem",
          letterSpacing: "-0.02em"
        }}>
          Payment Successful!
        </h1>

        <p style={{
          fontSize: "0.875rem",
          color: "#9ca3af",
          lineHeight: 1.6,
          marginBottom: "2rem"
        }}>
          Thank you for subscribing! Your <strong>Istiyak Companion Pro</strong> license has been successfully activated.
        </p>

        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "1rem",
          fontSize: "0.8rem",
          color: "#d1d5db",
          lineHeight: 1.5,
          marginBottom: "2rem",
          textAlign: "left"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#10b981", marginBottom: "0.5rem" }}>
            <Bot size={14} /> Next Steps:
          </div>
          1. Return to your floating desktop app window.<br />
          2. Click <strong>Sync Status</strong> under your profile settings.<br />
          3. Enjoy your newly unlocked premium features!
        </div>

        <button
          onClick={() => window.close()}
          style={{
            width: "100%",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            border: "none",
            backgroundColor: "#10b981",
            color: "#030712",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
          onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
        >
          Close Window
        </button>
      </div>
    </div>
  );
}
