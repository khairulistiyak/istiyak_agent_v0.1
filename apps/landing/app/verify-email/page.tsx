"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, AlertTriangle, Bot, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("Invalid verification link parameters. Missing token or email.");
      return;
    }

    fetch(`http://localhost:3002/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.error || "Email verification failed.");
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
        setMessage("Could not connect to backend server.");
      });
  }, [token, email]);

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
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1.5rem"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Bot size={28} style={{ color: "#06b6d4" }} />
        <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
          ISTIYAK COMPANION
        </span>
      </div>

      {status === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "#06b6d4" }} />
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>{message}</p>
        </div>
      )}

      {status === "success" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <ShieldCheck size={28} style={{ color: "#10b981" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Email Verified!</h1>
          <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: "0 0 1rem 0" }}>{message}</p>
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
            Go to Login
          </button>
        </div>
      )}

      {status === "error" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <AlertTriangle size={28} style={{ color: "#ef4444" }} />
          </div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>Verification Failed</h1>
          <p style={{ fontSize: "0.85rem", color: "#f87171", margin: "0 0 1rem 0" }}>{message}</p>
          <button
            onClick={() => router.push("/login")}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              backgroundColor: "transparent",
              color: "#fff",
              fontSize: "0.9rem",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
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
          <span style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Loading verification screen...</span>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
