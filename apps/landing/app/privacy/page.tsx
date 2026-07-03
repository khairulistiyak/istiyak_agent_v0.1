"use client";

import { useRouter } from "next/navigation";
import { Bot, Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  const router = useRouter();

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
        backgroundColor: "rgba(6, 182, 212, 0.04)",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Navigation Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
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

        {/* Content Card */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Shield size={28} style={{ color: "#06b6d4" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Privacy Policy
            </h1>
          </div>

          <p style={{ fontSize: "0.95rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
            Last updated: July 3, 2026. This Privacy Policy describes how Istiyak AI Companion collects, uses, and shares your personal information when you use our local desktop applications, daemon tools, and SaaS web portals.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }} />

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              1. Information We Collect
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              We collect user account credentials (email addresses, display names) when you register on our SaaS web platform. Additionally, to improve our companion services, we collect anonymous usage telemetry such as token volumes, requests, and cost aggregations.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              2. Code Isolation & Workspace Guard
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              Our floating autonomous engineering agent runs entirely within your configured workspace paths. We implement strict workspace guard constraints to prevent path traversal and unauthorized reads. We do not store, copy, or index your proprietary source files outside your local machine.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              3. Payment Security & Stripe
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              Payments are handled securely via Stripe. We do not process, store, or transmit your credit card details or financial information directly. All transactions are securely routed through Stripe's hosted checkout portals.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              4. Contact Support
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              If you have any questions or security concerns regarding this privacy policy or your local codebase safety controls, please reach out to our dedicated support team at <a href="mailto:support@istiyak-companion.com" style={{ color: "#06b6d4", textDecoration: "none" }}>support@istiyak-companion.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
