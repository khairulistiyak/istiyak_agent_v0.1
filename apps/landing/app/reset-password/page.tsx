"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle, AlertTriangle, Bot, Loader2 } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token || !email) {
      setError("Invalid or missing token parameters from reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:3002/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "420px",
      background: "rgba(18, 20, 28, 0.75)",
      backdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.05)",
      padding: "2.5rem",
      borderRadius: "18px",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
      position: "relative"
    }}>
      {/* Header */}
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
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0.5rem 0 0 0" }}>Reset Password</h1>
        <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0 }}>
          Enter a secure new password for your account
        </p>
      </div>

      {/* Error notification */}
      {error && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          padding: "0.75rem 1rem",
          borderRadius: "8px",
          fontSize: "0.85rem",
          color: "#f87171",
          marginBottom: "1.5rem"
        }}>
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <CheckCircle size={28} style={{ color: "#10b981" }} />
          </div>
          <p style={{ fontSize: "0.9rem", color: "#34d399", fontWeight: 600 }}>
            Password reset successful!
          </p>
          <button
            onClick={() => router.push("/login")}
            className="glow-btn"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer"
            }}
          >
            Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* New Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="new-pass" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>New Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                id="new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label htmlFor="conf-pass" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }} />
              <input
                id="conf-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.25rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
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
            {loading ? "Resetting..." : "Save Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "2rem",
      fontFamily: "'Inter', sans-serif"
    }}>
      <Suspense fallback={
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "#06b6d4" }} />
          <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading reset screen...</span>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
