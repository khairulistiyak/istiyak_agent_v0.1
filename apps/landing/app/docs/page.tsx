"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, BookOpen, ChevronRight, Terminal, ShieldAlert, Cpu, ArrowLeft } from "lucide-react";

export default function DocsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("getting-started");

  const sections = [
    { id: "getting-started", label: "Getting Started", icon: BookOpen },
    { id: "cli-commands", label: "CLI & Daemon Commands", icon: Terminal },
    { id: "safety-guard", label: "Safety & Secrets Masker", icon: ShieldAlert },
    { id: "architecture", label: "Architecture Overview", icon: Cpu },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      fontFamily: "'Inter', sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative"
    }}>
      {/* Decorative Blur */}
      <div style={{
        position: "absolute",
        top: "-10%",
        right: "5%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.03)",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Navigation Header */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem 2rem",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        background: "rgba(18, 20, 28, 0.3)",
        backdropFilter: "blur(12px)",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bot size={24} style={{ color: "#06b6d4" }} />
          <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
            ISTIYAK COMPANION
          </span>
          <span style={{ fontSize: "0.75rem", padding: "0.1rem 0.4rem", borderRadius: "4px", backgroundColor: "rgba(6, 182, 212, 0.15)", color: "#06b6d4", fontWeight: "bold", marginLeft: "0.5rem" }}>
            DOCS
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
      </nav>

      {/* Sidebar + Content Layout */}
      <div style={{
        display: "flex",
        flex: 1,
        maxWidth: "1200px",
        width: "100%",
        margin: "0 auto",
        padding: "2rem",
        gap: "2.5rem",
        position: "relative",
        zIndex: 1
      }}>
        {/* Sidebar Nav */}
        <aside style={{
          width: "260px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          position: "sticky",
          top: "6rem",
          height: "fit-content"
        }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem", paddingLeft: "0.5rem" }}>
            Documentation Sections
          </span>
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: isActive ? "rgba(6, 182, 212, 0.1)" : "transparent",
                  color: isActive ? "#fff" : "#9ca3af",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Icon size={16} style={{ color: isActive ? "#06b6d4" : "#6b7280" }} />
                  {sec.label}
                </div>
                {isActive && <ChevronRight size={14} style={{ color: "#06b6d4" }} />}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main style={{
          flex: 1,
          background: "rgba(18, 20, 28, 0.4)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2.5rem"
        }}>
          {activeSection === "getting-started" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
                Getting Started
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Welcome to the Istiyak Companion developer documentation! Istiyak Companion is an autonomous AI agent engineered to live alongside your editor, monitoring your local workspaces, analyzing changes, and executing terminal commands safely.
              </p>
              
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "2rem 0 1rem 0" }}>Local Daemon Installation</h3>
              <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.5, marginBottom: "1rem" }}>
                First, clone the companion workspace and run the initial setup command:
              </p>
              <pre style={{
                backgroundColor: "#0d0e15",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                padding: "1rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontFamily: "monospace",
                color: "#34d399",
                overflowX: "auto"
              }}>
                npm install && npm run build
              </pre>
            </div>
          )}

          {activeSection === "cli-commands" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
                CLI & Daemon Commands
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                The companion agent runs a local daemon listening on port 3001. You can communicate with the daemon via REST endpoints or using our native companion CLI:
              </p>
              
              <table style={{ width: "100%", borderCollapse: "collapse", color: "#d1d5db", fontSize: "0.85rem", textAlign: "left", marginTop: "1.5rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Endpoint</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Method</th>
                    <th style={{ padding: "0.75rem 0.5rem" }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", color: "#fff" }}>/health</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#34d399" }}>GET</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Check local daemon status</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", color: "#fff" }}>/api/chat</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#60a5fa" }}>POST</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Stream autonomous agent completions</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.75rem 0.5rem", fontFamily: "monospace", color: "#fff" }}>/api/abort</td>
                    <td style={{ padding: "0.75rem 0.5rem", color: "#ef4444" }}>POST</td>
                    <td style={{ padding: "0.75rem 0.5rem" }}>Abort active executing loops</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeSection === "safety-guard" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
                Safety & Secrets Masker
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Because security is our top priority, the companion incorporates double-layer guard boundaries:
              </p>
              
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "2rem 0 1rem 0" }}>1. Workspace Path Guard</h3>
              <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.5 }}>
                The agent is sandbox-restricted to files located under your actively configured project workspace. Any attempt to write or read system files outside the workspace folder is automatically blocked.
              </p>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "2rem 0 1rem 0" }}>2. Secrets Masking Filter</h3>
              <p style={{ fontSize: "0.9rem", color: "#a1a1aa", lineHeight: 1.5 }}>
                Before logs or context are dispatched to remote LLM providers, our local filter scans and masks all database connection URIs, API tokens, Stripe keys, and authorization secrets.
              </p>
            </div>
          )}

          {activeSection === "architecture" && (
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", fontFamily: "'Outfit', sans-serif" }}>
                Architecture Overview
              </h2>
              <p style={{ fontSize: "0.95rem", color: "#a1a1aa", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Istiyak Companion is structured as a monorepo containing multiple packages and applications:
              </p>
              
              <ul style={{ paddingLeft: "1.25rem", color: "#a1a1aa", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li><strong>@istiyak/agent-core:</strong> Core agent loop, planner, reflection engine, and tools controller.</li>
                <li><strong>@istiyak/agent-memory:</strong> Local vector storage indexing code symbols.</li>
                <li><strong>apps/local-daemon:</strong> Express daemon serving agent execution API.</li>
                <li><strong>apps/desktop:</strong> Tauri-based floating interface panel.</li>
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
