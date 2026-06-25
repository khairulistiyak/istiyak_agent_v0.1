"use client";

import React from "react";
import { AlertCircle, XCircle } from "lucide-react";

export default function CancelPage() {
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
        backgroundColor: "rgba(239, 68, 68, 0.04)",
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
        border: "1px solid rgba(239, 68, 68, 0.25)",
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
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          color: "#ef4444",
          marginBottom: "1.5rem"
        }}>
          <XCircle size={32} />
        </div>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: "#fff",
          marginBottom: "0.75rem",
          letterSpacing: "-0.02em"
        }}>
          Checkout Cancelled
        </h1>

        <p style={{
          fontSize: "0.875rem",
          color: "#9ca3af",
          lineHeight: 1.6,
          marginBottom: "2rem"
        }}>
          Your transaction was not completed. If you faced any issues, please feel free to retry from the Companion client settings.
        </p>

        <button
          onClick={() => window.close()}
          style={{
            width: "100%",
            padding: "0.75rem 1.5rem",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.875rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)"}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
        >
          Return to App
        </button>
      </div>
    </div>
  );
}
