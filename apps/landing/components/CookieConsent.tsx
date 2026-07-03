"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, Check } from "lucide-react";

export const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_consent_accepted");
    const declined = localStorage.getItem("cookie_consent_declined");
    if (!accepted && !declined) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent_accepted", "true");
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent_declined", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      width: "calc(100% - 2rem)",
      maxWidth: "520px",
      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(20px)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      borderRadius: "16px",
      padding: "1rem 1.25rem",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
      animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0
        }}>
          <ShieldAlert size={16} style={{ color: "#06b6d4" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>Cookie Consent & Privacy</span>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", margin: 0, lineHeight: 1.4 }}>
            We use cookie records to verify active authentication logs, preserve session configurations, and record anonymous telemetry metrics.
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
        <button
          onClick={handleDecline}
          style={{
            padding: "0.4rem 0.8rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#9ca3af",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
        >
          Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            padding: "0.4rem 1rem",
            borderRadius: "6px",
            fontSize: "0.75rem",
            fontWeight: 700,
            backgroundColor: "#06b6d4",
            color: "#07080d",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}
        >
          <Check size={12} /> Accept All
        </button>
      </div>
    </div>
  );
};

export default CookieConsent;
