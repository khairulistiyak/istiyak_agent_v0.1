"use client";

import React, { useState } from "react";
import { Bot, Download, ArrowRight, Check } from "lucide-react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CheckoutButton from "../components/CheckoutButton";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ position: "relative", minHeight: "100vh", overflowX: "hidden", backgroundColor: "#07080d", color: "#f3f4f6" }}>
      
      {/* Background Decorative Glows */}
      <div style={{
        position: "absolute",
        top: "10%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.08)",
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
        maxWidth: "1200px",
        margin: "0 auto",
        position: "relative",
        zIndex: 10
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Bot size={24} style={{ color: "#06b6d4" }} />
          <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
            ISTIYAK COMPANION
          </span>
        </div>
        <div style={{ display: "flex", gap: "2rem", fontSize: "0.85rem", fontWeight: 500 }}>
          <a href="#features" style={{ color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}>Features</a>
          <a href="#pricing" style={{ color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}>Pricing</a>
          <a href="#download" style={{ color: "#9ca3af", textDecoration: "none", transition: "color 0.2s" }}>Download</a>
        </div>
        <button onClick={() => setModalOpen(true)} className="glow-btn" style={{ padding: "0.45rem 1rem", borderRadius: "8px", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer", backgroundColor: "#06b6d4", color: "#07080d", fontWeight: "bold" }}>
          Launch App
        </button>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Pricing Cards */}
      <section id="pricing" style={{ maxWidth: "800px", margin: "0 auto 6rem auto", padding: "0 1.5rem", position: "relative", zIndex: 10 }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.01em", textAlign: "center", marginBottom: "0.5rem", color: "#fff" }}>
          Simple, Value-Driven Plans
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", textAlign: "center", marginBottom: "3rem" }}>
          Choose the plan that fits your engineering needs. Start for free.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem", alignItems: "stretch" }}>
          
          {/* Free Tier */}
          <div style={{ padding: "2.5rem 2rem", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "#12141c" }}>
            <div>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Tier</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", margin: "1rem 0" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff" }}>$0</span>
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>/ forever</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                Perfect for hobbyists and developers wanting to test autonomous coding locally.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#34d399" }} /> Basic Chat Interface</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#34d399" }} /> standard open-source models</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#34d399" }} /> Local API Keys support (BYOK)</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#34d399" }} /> Strict daily request limits</li>
              </ul>
            </div>
            <button onClick={() => setModalOpen(true)} style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              backgroundColor: "transparent",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.85rem",
              marginTop: "2rem",
              cursor: "pointer"
            }}>
              GET STARTED
            </button>
          </div>

          {/* Pro Tier */}
          <div style={{ padding: "2.5rem 2rem", borderRadius: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid #06b6d4/30", backgroundColor: "#12141c" }}>
            <div>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>PRO DEVELOPER</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", margin: "1rem 0" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff" }}>$19</span>
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>/ month</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#9ca3af", lineHeight: 1.5, marginBottom: "1.5rem" }}>
                For professional engineers needing speed, sandbox execution, and raw agent intelligence.
              </p>
              <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.8rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#06b6d4" }} /> Premium Models (Gemini 2.5 Pro / Sonnet)</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#06b6d4" }} /> 40-Step Autonomous Loops</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#06b6d4" }} /> Multi-file codebase refactoring</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#06b6d4" }} /> Unlimited local model support</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#06b6d4" }} /> Custom Docker sandbox executions</li>
              </ul>
            </div>
            <div style={{ marginTop: "2rem" }}>
              <CheckoutButton />
            </div>
          </div>

        </div>
      </section>

      {/* Download Section */}
      <section id="download" style={{
        maxWidth: "600px",
        margin: "0 auto 6rem auto",
        padding: "3rem 2rem",
        borderRadius: "20px",
        backgroundColor: "rgba(17, 24, 39, 0.4)",
        border: "1px solid rgba(255,255,255,0.05)",
        textAlign: "center",
        position: "relative",
        zIndex: 10
      }}>
        <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: "0 0 1rem 0" }}>
          Get Istiyak Companion Now
        </h2>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "2rem", lineHeight: 1.5 }}>
          Available for macOS (Apple Silicon & Intel), Windows 10/11, and Linux. Builds are securely compiled on GitHub release pipelines.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
          <button className="glow-btn" style={{ padding: "0.65rem 1.25rem", borderRadius: "8px", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", backgroundColor: "#06b6d4", color: "#07080d", fontWeight: "bold", border: "none" }}>
            <Download size={14} /> macOS (.DMG)
          </button>
          <button style={{
            padding: "0.65rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.8rem",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <Download size={14} /> Windows (.EXE)
          </button>
          <button style={{
            padding: "0.65rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.8rem",
            backgroundColor: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            <Download size={14} /> Linux (.AppImage)
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "2rem",
        textAlign: "center",
        fontSize: "0.75rem",
        color: "#9ca3af",
        position: "relative",
        zIndex: 10
      }}>
        © 2026 ISTIYAK AI Companion. All rights reserved. Built with Tauri, React & Node.js.
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(3, 7, 18, 0.85)",
          backdropFilter: "blur(12px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "420px",
            background: "rgba(17, 24, 39, 0.85)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "2.5rem 2rem",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.5rem"
          }} onClick={(e) => e.stopPropagation()}>
            <button style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "transparent",
              border: "none",
              color: "#9ca3af",
              cursor: "pointer",
              fontSize: "1.25rem",
              outline: "none"
            }} onClick={() => setModalOpen(false)}>×</button>

            <Bot size={48} style={{ color: "#06b6d4" }} />
            
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif" }}>
                How to Upgrade to Pro
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.6 }}>
                To purchase or manage your Pro license subscription securely, please complete these steps:
              </p>
            </div>

            <ol style={{
              textAlign: "left",
              fontSize: "0.8rem",
              color: "#d1d5db",
              paddingLeft: "1.25rem",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              lineHeight: 1.5
            }}>
              <li>Download the <strong>Istiyak Companion</strong> desktop application.</li>
              <li>Install and launch the app on your developer machine.</li>
              <li>Log in or register your account via the client.</li>
              <li>Open your Profile Card (user icon in top right) and click <strong>Upgrade to Pro</strong> to complete checkout securely.</li>
            </ol>

            <a href="#download" onClick={() => setModalOpen(false)} style={{ width: "100%", textDecoration: "none" }}>
              <button className="glow-btn" style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "10px",
                fontWeight: 700,
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
                backgroundColor: "#06b6d4",
                color: "#07080d",
                border: "none"
              }}>
                <Download size={14} /> Download Companion App
              </button>
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
