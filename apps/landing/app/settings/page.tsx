"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { User, Shield, Key, AlertTriangle, CheckCircle } from "lucide-react";

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:3002/api/auth/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setName(data.name || "");
        setEmail(data.email || "");
      })
      .catch((err) => console.error(err));
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3002/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:3002/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update password");
      setMessage("Password updated successfully!");
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "680px" }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0", fontFamily: "'Outfit', sans-serif" }}>
            Account Settings
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>
            Manage your personal profile information, preferences, and account security.
          </p>
        </div>

        {/* Notifications */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            color: "#34d399"
          }}>
            <CheckCircle size={16} />
            <span>{message}</span>
          </div>
        )}

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
            color: "#f87171"
          }}>
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={18} style={{ color: "#06b6d4" }} />
            Profile Details
          </h2>

          <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Email Address (Non-changeable)</label>
              <input
                type="text"
                disabled
                value={email}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.04)",
                  color: "#6b7280",
                  fontSize: "0.9rem",
                  cursor: "not-allowed",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="name" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Display Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
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

            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{
                alignSelf: "flex-start",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                backgroundColor: "#06b6d4",
                color: "#07080d",
                border: "none",
                cursor: "pointer"
              }}
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Security Password Card */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield size={18} style={{ color: "#06b6d4" }} />
            Update Password
          </h2>

          <form onSubmit={handleUpdatePassword} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="curr-pass" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Current Password</label>
              <input
                id="curr-pass"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="new-pass" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>New Password</label>
              <input
                id="new-pass"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label htmlFor="conf-pass" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>Confirm New Password</label>
              <input
                id="conf-pass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  backgroundColor: "#0d0e12",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  outline: "none"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glow-btn"
              style={{
                alignSelf: "flex-start",
                padding: "0.6rem 1.5rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                backgroundColor: "#06b6d4",
                color: "#07080d",
                border: "none",
                cursor: "pointer"
              }}
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
