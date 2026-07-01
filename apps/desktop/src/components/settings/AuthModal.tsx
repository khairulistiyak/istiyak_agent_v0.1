import React, { useState, useEffect } from "react";
import { Bot, X } from "lucide-react";
import { Button, Input } from "../ui/index.js";
import { SAAS_BASE } from "../../utils/config.js";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  userEmail: string;
  updateSettings: (settings: any) => Promise<void>;
}

export const AuthModal = React.memo(({
  isOpen,
  onClose,
  token,
  userEmail,
  updateSettings
}: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Profile states
  const [isActiveLicense, setIsActiveLicense] = useState(false);
  const [isProfileFetching, setIsProfileFetching] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const fetchUserProfile = async () => {
    if (!token) return;
    setIsProfileFetching(true);
    try {
      const res = await fetch(`${SAAS_BASE}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setIsActiveLicense(!!data.isActive);
      }
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    } finally {
      setIsProfileFetching(false);
    }
  };

  const handleUpgradeToPro = async () => {
    if (!token) return;
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const res = await fetch(`${SAAS_BASE}/api/billing/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No checkout URL returned from server.");
      }
    } catch (err: any) {
      setCheckoutError(err.message || "An unexpected error occurred during upgrade.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all fields.");
      return;
    }
    setAuthError(null);
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "login" : "register";
      const response = await fetch(`${SAAS_BASE}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: authEmail,
          password: authPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      await updateSettings({
        token: data.token,
        userEmail: data.email,
      });
      onClose();
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setIsActiveLicense(false);
    }
  }, [token]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 bg-cyber-dark/85 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[320px] bg-cyber-card/90 border border-cyber-cardBorder/60 p-6 rounded-2xl shadow-2xl backdrop-blur-md relative z-10 flex flex-col space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button on modal card */}
        <button
          onClick={() => {
            onClose();
            setAuthError(null);
          }}
          className="absolute top-3 right-3 p-1 rounded-lg text-cyber-textSecondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X size={15} />
        </button>

        {!token ? (
          // Login / Sign Up Form
          <>
            <div className="flex flex-col items-center text-center space-y-1">
              <Bot size={36} className="text-cyber-primary animate-pulse" />
              <h2 className="text-base font-bold text-white tracking-wide uppercase">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-[11px] text-cyber-textSecondary">
                {authMode === "login" ? "Enter details to access your companion" : "Get started with 3 accounts per IP limitation"}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="flex flex-col space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-cyber-textSecondary">Email Address</label>
                <Input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@domain.com"
                  className="w-full bg-[#121318] border border-[#1f232b] focus:border-cyber-primary/60 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-cyber-textSecondary">Password</label>
                <Input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121318] border border-[#1f232b] focus:border-cyber-primary/60 text-xs font-mono"
                />
              </div>

              {authError && (
                <div className="p-2 border border-red-500/20 bg-red-500/10 text-red-400 rounded-lg text-[10.5px] leading-relaxed text-center">
                  {authError}
                </div>
              )}

              <Button
                type="submit"
                disabled={authLoading}
                variant="primary"
                className="w-full py-2 text-xs font-bold active:scale-[0.98] flex justify-center items-center"
              >
                {authLoading ? (
                  <span className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  authMode === "login" ? "LOGIN" : "REGISTER"
                )}
              </Button>
            </form>

            {/* OAuth Brand Login Buttons */}
            <div className="flex flex-col space-y-2 border-t border-cyber-cardBorder/30 pt-3">
              <div className="text-center text-[9px] text-cyber-textSecondary font-semibold uppercase tracking-wider mb-1">
                Or Sign In With
              </div>
              
              <button
                type="button"
                onClick={() => {
                  window.open(`${SAAS_BASE}/api/auth/google`, "_blank");
                }}
                className="w-full py-1.5 bg-[#ea4335]/15 hover:bg-[#ea4335]/25 border border-[#ea4335]/30 hover:border-[#ea4335]/50 text-white rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer flex justify-center items-center"
              >
                Google Account
              </button>

              <button
                type="button"
                onClick={() => {
                  window.open(`${SAAS_BASE}/api/auth/github`, "_blank");
                }}
                className="w-full py-1.5 bg-[#24292e]/40 hover:bg-[#24292e]/60 border border-[#24292e]/60 hover:border-white/30 text-white rounded-lg text-[10.5px] font-semibold transition-all cursor-pointer flex justify-center items-center"
              >
                GitHub Account
              </button>
            </div>

            {/* Toggle Tab */}
            <div className="text-center pt-2 text-[11px] border-t border-cyber-cardBorder/30">
              <span className="text-cyber-textSecondary">
                {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError(null);
                }}
                className="text-cyber-primary hover:underline font-semibold cursor-pointer"
              >
                {authMode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </>
        ) : (
          // Logged In Profile Card
          <div className="flex flex-col space-y-4 pt-2">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-cyber-primary/20 border border-cyber-primary/45 flex items-center justify-center text-cyber-primary text-lg font-bold select-none mb-1">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-sm font-bold text-white truncate max-w-[240px]" title={userEmail}>
                {userEmail}
              </h2>
              {isActiveLicense ? (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  Pro License Active
                </div>
              ) : (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse">
                  Free Tier User
                </div>
              )}
            </div>

            <div className="space-y-1.5 border-t border-cyber-cardBorder/30 pt-3 text-xs">
              <div className="flex justify-between">
                <span className="text-cyber-textSecondary">Status</span>
                <span className="text-white font-medium">Verified</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cyber-textSecondary">Plan</span>
                <span className="text-white font-medium">{isActiveLicense ? "SaaS Pro Developer" : "SaaS Free Tier"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-cyber-textSecondary">Sync License</span>
                <button
                  type="button"
                  onClick={fetchUserProfile}
                  disabled={isProfileFetching}
                  className="text-[10px] text-cyber-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isProfileFetching ? "Syncing..." : "Sync Status"}
                </button>
              </div>
            </div>

            {!isActiveLicense && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-cyber-cardBorder/30">
                {checkoutError && (
                  <div className="p-2 border border-red-500/20 bg-red-500/10 text-red-400 rounded-lg text-[10px] text-center leading-relaxed">
                    {checkoutError}
                  </div>
                )}
                <button
                  onClick={handleUpgradeToPro}
                  disabled={checkoutLoading}
                  className="w-full py-2 bg-cyber-primary text-cyber-dark rounded-lg text-xs font-bold transition-all duration-300 hover:shadow-[0_0_12px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 cursor-pointer flex justify-center items-center"
                >
                  {checkoutLoading ? (
                    <span className="w-4 h-4 border-2 border-cyber-dark border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "UPGRADE TO PRO ($19/mo)"
                  )}
                </button>
              </div>
            )}

            <button
              onClick={async () => {
                await updateSettings({ token: "", userEmail: "" });
                onClose();
              }}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg text-xs font-bold transition-all cursor-pointer"
            >
              LOGOUT
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

AuthModal.displayName = "AuthModal";
