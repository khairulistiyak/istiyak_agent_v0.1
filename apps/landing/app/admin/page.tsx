"use client";

import React, { useEffect, useState } from "react";
import { Users, ShieldAlert, ShieldCheck, RefreshCw, ArrowLeft, Ban, CheckCircle } from "lucide-react";

interface UserType {
  _id: string;
  email: string;
  isActive: boolean;
  isBlocked: boolean;
  registeredIp?: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:3002/api/admin/users");
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError("Cannot connect to the backend server. Please make sure the SaaS Backend is running on port 3002.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    setActionLoadingId(userId);
    const endpoint = currentlyBlocked ? "unblock" : "block";
    try {
      const res = await fetch(`http://localhost:3002/api/admin/user/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error(`Failed to ${endpoint} user`);
      }

      // Update state locally
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u._id === userId ? { ...u, isBlocked: !currentlyBlocked } : u))
      );
    } catch (err: any) {
      alert(`Error: ${err.message || "Failed to update user status."}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute stats
  const totalUsers = users.length;
  const activePremium = users.filter((u) => u.isActive).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#030712", color: "#f3f4f6", padding: "2rem 1.5rem", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Navigation & Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#9ca3af", textDecoration: "none", fontSize: "0.85rem", marginBottom: "0.75rem", transition: "color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.color = "#fff")} onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}>
              <ArrowLeft size={16} /> Back to Landing Page
            </a>
            <h1 style={{ fontSize: "2rem", fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "#fff", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <ShieldAlert style={{ color: "#06b6d4" }} /> CENTRAL ADMIN PANEL
            </h1>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>Manage user registrations, license activations, and system bans.</p>
          </div>

          <button 
            onClick={fetchUsers} 
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.85rem",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.08)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)")}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </header>

        {/* Stats Grid */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2.5rem" }}>
          
          <div className="card-glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9ca3af", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Registrations</span>
              <Users size={18} style={{ color: "#06b6d4" }} />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fff" }}>{loading ? "..." : totalUsers}</div>
          </div>

          <div className="card-glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9ca3af", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Pro License Activations</span>
              <ShieldCheck size={18} style={{ color: "#10b981" }} />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#10b981" }}>{loading ? "..." : activePremium}</div>
          </div>

          <div className="card-glass" style={{ padding: "1.5rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#9ca3af", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Banned Accounts</span>
              <Ban size={18} style={{ color: "#ef4444" }} />
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "#ef4444" }}>{loading ? "..." : blockedUsers}</div>
          </div>

        </section>

        {/* Users Table Card */}
        <main className="card-glass" style={{ borderRadius: "16px", padding: "1.5rem", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 1.25rem 0", color: "#fff" }}>Registered Accounts List</h2>

          {error && (
            <div style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "#fca5a5", padding: "1rem", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "#9ca3af", gap: "0.5rem" }}>
              <RefreshCw className="animate-spin" size={18} /> Loading database records...
            </div>
          ) : users.length === 0 ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px", color: "#9ca3af", fontStyle: "italic" }}>
              No registered user accounts found in the database.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Email Address</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Registration IP</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Signup Date</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Tier Plan</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "0.75rem 1rem", fontWeight: 600, textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const signupDate = new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    
                    return (
                      <tr key={user._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background-color 0.2s" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.01)")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td style={{ padding: "1rem", fontWeight: 500, color: "#fff", fontFamily: "monospace" }}>{user.email}</td>
                        <td style={{ padding: "1rem", color: "#9ca3af", fontFamily: "monospace" }}>{user.registeredIp || "Unknown"}</td>
                        <td style={{ padding: "1rem", color: "#9ca3af" }}>{signupDate}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            padding: "0.2rem 0.5rem",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            backgroundColor: user.isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            color: user.isActive ? "#34d399" : "#9ca3af",
                            border: user.isActive ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(255,255,255,0.08)"
                          }}>
                            {user.isActive ? "PRO" : "FREE"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            color: user.isBlocked ? "#f87171" : "#34d399"
                          }}>
                            {user.isBlocked ? (
                              <>
                                <Ban size={12} /> Banned
                              </>
                            ) : (
                              <>
                                <CheckCircle size={12} /> Active
                              </>
                            )}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          <button
                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                            disabled={actionLoadingId === user._id}
                            style={{
                              padding: "0.4rem 0.8rem",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              backgroundColor: user.isBlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              color: user.isBlocked ? "#34d399" : "#f87171",
                              border: user.isBlocked ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = user.isBlocked ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)";
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = user.isBlocked ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)";
                            }}
                          >
                            {actionLoadingId === user._id ? (
                              <RefreshCw size={12} className="animate-spin" />
                            ) : user.isBlocked ? (
                              "Unban User"
                            ) : (
                              "Ban User"
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
