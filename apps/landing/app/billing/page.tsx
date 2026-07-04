"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { CreditCard, Check, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSubscription(data.subscription);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to retrieve subscription plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const handleMockUpgrade = async (targetPlan: "free" | "pro") => {
    setError("");
    setSuccess("");
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/upgrade-mock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Subscription toggle failed.");
      }

      setSubscription(data.subscription);
      setSuccess(`Successfully switched plan to ${targetPlan}!`);
    } catch (err: any) {
      setError(err.message || "An error occurred during billing operation.");
    } finally {
      setLoading(false);
    }
  };

  const isPro = subscription?.plan === "pro";

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "800px" }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0", fontFamily: "'Outfit', sans-serif" }}>
            Plan & Billing
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>
            Manage your subscription plan, pricing options, and mock developer payments.
          </p>
        </div>

        {/* Notifications */}
        {success && (
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
            <ShieldCheck size={16} />
            <span>{success}</span>
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

        {/* Subscription Current Status */}
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
            <CreditCard size={18} style={{ color: "#06b6d4" }} />
            Active Subscription Plan
          </h2>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem",
            borderRadius: "12px",
            backgroundColor: isPro ? "rgba(6, 182, 212, 0.08)" : "rgba(255,255,255,0.02)",
            border: isPro ? "1px solid rgba(6, 182, 212, 0.2)" : "1px solid rgba(255,255,255,0.05)"
          }}>
            <div>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: isPro ? "#06b6d4" : "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}>
                Current Tier
              </span>
              <h3 style={{ fontSize: "1.4rem", fontWeight: 800, margin: "0.25rem 0", color: "#fff" }}>
                {isPro ? "★ PRO DEVELOPER" : "FREE ACCOUNT"}
              </h3>
              {isPro && subscription?.currentPeriodEnd && (
                <p style={{ fontSize: "0.8rem", color: "#9ca3af", margin: 0 }}>
                  Renews/Expires on: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <div style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "20px",
              backgroundColor: isPro ? "rgba(16, 185, 129, 0.15)" : "rgba(107, 114, 128, 0.15)",
              color: isPro ? "#34d399" : "#9ca3af",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>
              {subscription?.status ? subscription.status.toUpperCase() : "ACTIVE"}
            </div>
          </div>
        </div>

        {/* Pricing Selection Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          alignItems: "stretch"
        }}>
          {/* Free Tier Card */}
          <div style={{
            padding: "2.5rem 2rem",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backgroundColor: isPro ? "rgba(18, 20, 28, 0.3)" : "#12141c"
          }}>
            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>Free Tier</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", margin: "1rem 0" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff" }}>$0</span>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>/ forever</span>
              </div>
              <ul style={{ padding: 0, margin: "1.5rem 0", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Basic Chat Interface</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Local Model Integrations</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Bring Your Own Keys (BYOK)</li>
              </ul>
            </div>
            {isPro ? (
              <button
                onClick={() => handleMockUpgrade("free")}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  backgroundColor: "rgba(239, 68, 68, 0.05)",
                  color: "#f87171",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                Downgrade to Free
              </button>
            ) : (
              <button
                disabled
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  color: "#6b7280",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "not-allowed"
                }}
              >
                Current Active Plan
              </button>
            )}
          </div>

          {/* Pro Tier Card */}
          <div style={{
            padding: "2.5rem 2rem",
            borderRadius: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: isPro ? "2px solid #06b6d4" : "1px solid rgba(255, 255, 255, 0.05)",
            backgroundColor: isPro ? "#12141c" : "rgba(18, 20, 28, 0.3)",
            position: "relative",
            boxShadow: isPro ? "0 0 25px rgba(6, 182, 212, 0.25)" : "none"
          }}>
            {/* Pop tag */}
            <div style={{
              position: "absolute",
              top: "-12px",
              right: "20px",
              padding: "0.25rem 0.75rem",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
              color: "#030712",
              fontSize: "0.7rem",
              fontWeight: 800,
              textTransform: "uppercase"
            }}>
              Most Popular
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: "0.05em" }}>Pro Developer</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.2rem", margin: "1rem 0" }}>
                <span style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff" }}>$19</span>
                <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>/ month</span>
              </div>
              <ul style={{ padding: 0, margin: "1.5rem 0", listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Unlimited Premium Model Runs</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Fully Managed Isolated Sandboxes</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Fast RAG Workspace indexing</li>
                <li style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}><Check size={14} style={{ color: "#10b981" }} /> Dedicated Premium Support channel</li>
              </ul>
            </div>

            {isPro ? (
              <button
                disabled
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  color: "#6b7280",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "not-allowed"
                }}
              >
                Current Active Plan
              </button>
            ) : (
              <button
                onClick={() => handleMockUpgrade("pro")}
                disabled={loading}
                className="glow-btn"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  fontWeight: "bold",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Zap size={14} />
                Upgrade to Pro Plan
              </button>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
