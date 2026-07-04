"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Mail, Lock, User, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Glow effects */}
      <div style={{
        position: "absolute",
        top: "20%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "400px",
        height: "400px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.06)",
        filter: "blur(100px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{
        width: "100%",
        maxWidth: "420px",
        background: "rgba(18, 20, 28, 0.75)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        padding: "2.5rem",
        borderRadius: "18px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        position: "relative",
        zIndex: 1
      }}>
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            backgroundColor: "rgba(6, 182, 212, 0.1)",
            border: "1px solid rgba(6, 182, 212, 0.2)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <Bot size={28} style={{ color: "#06b6d4" }} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", marginTop: "0.5rem", marginBottom: 0 }}>
            Create Account
          </h1>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
            Start coding autonomously today
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            fontSize: "0.85rem",
            color: "#f87171"
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Full Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="name" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Full Name</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Developer Istiyak"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="email" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="password" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s"
                }}
                onFocus={(e) => (e.target.style.borderColor = "#06b6d4")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.08)")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              marginTop: "0.5rem"
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.8rem", color: "#9ca3af" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "#06b6d4", textDecoration: "none", fontWeight: 600 }}>
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
