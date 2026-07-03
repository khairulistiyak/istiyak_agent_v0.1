"use client";

import { useRouter } from "next/navigation";
import { Bot, FileText, ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <FileText size={28} style={{ color: "#06b6d4" }} />
            <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Terms of Service
            </h1>
          </div>

          <p style={{ fontSize: "0.95rem", color: "#9ca3af", lineHeight: 1.7, margin: 0 }}>
            Last updated: July 3, 2026. By installing or utilizing the Istiyak AI Companion desktop tools, daemon APIs, and SaaS account features, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }} />

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              1. Usage Constraints & Scope
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              The software license grants you permission to use our AI companions locally and execute system commands inside your designated workspace directory. The agent runner includes safety features like the Secret Masker and Workspace Guard. Modifying or bypassing these safety boundaries is strictly prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              2. Bring Your Own Key (BYOK) policy
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              Free tier accounts require providing your own API credentials (e.g. Gemini, OpenAI) to run advanced models. You retain full responsibility for any billing charges, limits, or security leaks originating from key configurations stored locally in your environment files.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              3. Subscription Renewals & Cancellation
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              Pro developer plans are billed monthly. You can upgrade, downgrade, or cancel your active subscription at any time via the SaaS billing portal. Once cancelled, your premium license access will remain active until the end of the current billing cycle.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
              4. Disclaimer of Liability
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              The autonomous companion tools execute terminal commands and code writes directly on your local system with your approval. Istiyak AI Companion is not liable for data loss, service interruptions, or system faults resulting from executed commands.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
