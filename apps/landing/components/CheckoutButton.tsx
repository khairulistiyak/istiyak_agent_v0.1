"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2 } from "lucide-react";

export const CheckoutButton = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    if (!token) {
      // If not logged in, redirect to login page
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3002/api/billing/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId: "price_pro_subscription_test", // Dummy test Price ID, backend mocks it or real Stripe handles it
          successUrl: "http://localhost:3000/success",
          cancelUrl: "http://localhost:3000/cancel",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate Stripe Checkout.");
      }

      if (data.url) {
        // Redirect directly to Stripe payment portal
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error("Checkout redirect error:", err);
      alert(err.message || "Failed to trigger checkout session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
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
        gap: "0.5rem"
      }}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Zap size={16} />
      )}
      {loading ? "Redirecting..." : "Upgrade to Pro Plan"}
    </button>
  );
};

export default CheckoutButton;
