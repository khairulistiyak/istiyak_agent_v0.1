"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Mail, Send, CheckCircle, ArrowLeft } from "lucide-react";

export default function SupportPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("bug");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      alert("Please fill in all required fields.");
      return;
    }
    // Simulate submission
    setSubmitted(true);
  };

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
        top: "20%",
        left: "10%",
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
          padding: "3rem"
        }}>
          {submitted ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "1.5rem",
              padding: "2rem 0"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <CheckCircle size={36} style={{ color: "#10b981" }} />
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif" }}>
                  Message Submitted Successfully!
                </h2>
                <p style={{ fontSize: "0.9rem", color: "#9ca3af", lineHeight: 1.5 }}>
                  Thank you for reaching out, {name}. Our priority engineering support team will review your message and respond within 24 hours.
                </p>
              </div>
              <button
                onClick={() => setSubmitted(false)}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <Mail size={28} style={{ color: "#06b6d4" }} />
                <h1 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                  Contact Support
                </h1>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#9ca3af", lineHeight: 1.5, margin: 0 }}>
                Have a billing question, discovered a bug, or want to request a new tool integration? Fill out the form below.
              </p>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", marginBottom: "0.5rem" }}>Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "#0d0e15",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", marginBottom: "0.5rem" }}>Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "#0d0e15",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", marginBottom: "0.5rem" }}>Query Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "#0d0e15",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                >
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Request a Feature</option>
                  <option value="billing">Billing or Upgrade Query</option>
                  <option value="other">General Question</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af", marginBottom: "0.5rem" }}>Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    backgroundColor: "#0d0e15",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                className="glow-btn"
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: "#06b6d4",
                  color: "#07080d"
                }}
              >
                <Send size={14} /> Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
