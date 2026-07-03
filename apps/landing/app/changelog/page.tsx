"use client";

import { useRouter } from "next/navigation";
import { Bot, GitCommit, Calendar, ArrowLeft } from "lucide-react";

export default function ChangelogPage() {
  const router = useRouter();

  const releases = [
    {
      version: "v0.1.0-beta",
      date: "July 3, 2026",
      title: "Initial Monorepo Release & Sandbox",
      changes: [
        "Added floating Tauri client UI panel with transparent background options.",
        "Implemented local Workspace Path Guard checking for unauthorized path traversals.",
        "Created Secrets Masker filter scanning credentials before remote API calls.",
        "Built central SaaS backend supporting auth tokens and daily usage analytics.",
        "Integrated secure Stripe checkout sessions with real webhook synchronization.",
      ],
    },
  ];

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
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "600px",
        height: "600px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.03)",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Navigation Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4.5rem" }}>
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

        {/* Header Intro */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
            Product Changelog
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#9ca3af" }}>
            Stay up to date with the latest features, engine updates, and sandbox releases.
          </p>
        </div>

        {/* Timeline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "3rem", position: "relative" }}>
          {/* Vertical line helper */}
          <div style={{
            position: "absolute",
            top: "1.5rem",
            bottom: "1.5rem",
            left: "1.25rem",
            width: "2px",
            backgroundColor: "rgba(255,255,255,0.06)",
            zIndex: 0
          }} />

          {releases.map((rel) => (
            <div key={rel.version} style={{ display: "flex", gap: "2rem", position: "relative", zIndex: 1 }}>
              {/* Timeline marker */}
              <div style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "50%",
                backgroundColor: "#12141c",
                border: "2px solid rgba(6, 182, 212, 0.4)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0
              }}>
                <GitCommit size={16} style={{ color: "#06b6d4" }} />
              </div>

              {/* Release Card */}
              <div style={{
                flex: 1,
                background: "rgba(18, 20, 28, 0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "16px",
                padding: "2rem"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.5rem" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>Latest Release</span>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#fff", margin: "0.25rem 0 0 0", fontFamily: "'Outfit', sans-serif" }}>
                      {rel.title}
                    </h2>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "#6b7280" }}>
                    <Calendar size={14} />
                    {rel.date}
                  </div>
                </div>

                <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  {rel.changes.map((change, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", fontSize: "0.85rem", color: "#a1a1aa", lineHeight: 1.5 }}>
                      <span style={{ color: "#06b6d4", fontWeight: "bold", fontSize: "1rem", lineHeight: 1 }}>•</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
