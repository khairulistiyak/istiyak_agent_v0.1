"use client";

import { Check, X } from "lucide-react";

/**
 * ComparisonTable Component
 * Compares Istiyak Companion with major AI coding assistant competitors
 */

interface Feature {
  name: string;
  istiyak: boolean | string;
  copilot: boolean | string;
  cursor: boolean | string;
  tabnine: boolean | string;
}

export default function ComparisonTable() {
  const features: Feature[] = [
    {
      name: "Local-First Architecture",
      istiyak: true,
      copilot: false,
      cursor: false,
      tabnine: "Hybrid",
    },
    {
      name: "Code Never Leaves Your Machine",
      istiyak: true,
      copilot: false,
      cursor: false,
      tabnine: "Partial",
    },
    {
      name: "Multi-LLM Support",
      istiyak: "7+ Providers",
      copilot: "GPT-4 Only",
      cursor: "GPT-4 + Claude",
      tabnine: "Custom Model",
    },
    {
      name: "Pricing (Monthly)",
      istiyak: "$19",
      copilot: "$10-$39",
      cursor: "$20",
      tabnine: "$12-$39",
    },
    {
      name: "RAG / Memory System",
      istiyak: true,
      copilot: false,
      cursor: "Limited",
      tabnine: false,
    },
    {
      name: "Sandbox Security",
      istiyak: true,
      copilot: false,
      cursor: false,
      tabnine: false,
    },
    {
      name: "CLI + Desktop + Web",
      istiyak: true,
      copilot: "IDE Only",
      cursor: "IDE Only",
      tabnine: "IDE Only",
    },
    {
      name: "Terminal Command Execution",
      istiyak: true,
      copilot: false,
      cursor: false,
      tabnine: false,
    },
    {
      name: "Secrets Masking Built-in",
      istiyak: true,
      copilot: false,
      cursor: false,
      tabnine: false,
    },
    {
      name: "Open Source Core",
      istiyak: "Coming Soon",
      copilot: false,
      cursor: false,
      tabnine: "Partial",
    },
  ];

  const renderCell = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check size={20} style={{ color: "#10b981" }} />
      ) : (
        <X size={20} style={{ color: "#ef4444" }} />
      );
    }
    return (
      <span style={{ fontSize: "0.85rem", color: "#a1a1aa" }}>{value}</span>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "4rem 1.5rem",
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "0.75rem",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          How We Compare
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: "#9ca3af",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          See how Istiyak Companion stacks up against other AI coding assistants
          on privacy, features, and pricing.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="desktop-table">
        <div
          style={{
            background: "rgba(18, 20, 28, 0.6)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  backgroundColor: "rgba(13, 14, 21, 0.5)",
                }}
              >
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#9ca3af",
                    fontSize: "0.8rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Feature
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#06b6d4",
                    fontSize: "0.85rem",
                  }}
                >
                  Istiyak Companion
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  GitHub Copilot
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  Cursor
                </th>
                <th
                  style={{
                    padding: "1.25rem 1.5rem",
                    textAlign: "center",
                    fontWeight: 600,
                    color: "#9ca3af",
                    fontSize: "0.85rem",
                  }}
                >
                  Tabnine
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom:
                      idx !== features.length - 1
                        ? "1px solid rgba(255, 255, 255, 0.04)"
                        : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "1.25rem 1.5rem",
                      color: "#d1d5db",
                      fontWeight: 500,
                    }}
                  >
                    {feature.name}
                  </td>
                  <td
                    style={{
                      padding: "1.25rem 1.5rem",
                      textAlign: "center",
                      backgroundColor: "rgba(6, 182, 212, 0.05)",
                    }}
                  >
                    {renderCell(feature.istiyak)}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                    {renderCell(feature.copilot)}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                    {renderCell(feature.cursor)}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "center" }}>
                    {renderCell(feature.tabnine)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div
        style={{ display: "block" }}
        className="mobile-cards"
      >
        <style>{`
          @media (min-width: 768px) {
            .mobile-cards { display: none !important; }
            .desktop-table { display: block !important; }
          }
        `}</style>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                background: "rgba(18, 20, 28, 0.6)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                padding: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "1rem",
                }}
              >
                {feature.name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#06b6d4", fontWeight: 600 }}>
                    Istiyak
                  </span>
                  {renderCell(feature.istiyak)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Copilot</span>
                  {renderCell(feature.copilot)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Cursor</span>
                  {renderCell(feature.cursor)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Tabnine</span>
                  {renderCell(feature.tabnine)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <p
          style={{
            fontSize: "0.9rem",
            color: "#a1a1aa",
            marginBottom: "1.5rem",
          }}
        >
          Privacy-first, locally-run AI coding companion with enterprise-grade security.
        </p>
        <button
          style={{
            padding: "0.85rem 2rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#06b6d4",
            color: "#07080d",
          }}
          onClick={() => (window.location.href = "/register")}
        >
          Get Started Free
        </button>
      </div>
    </div>
  );
}
