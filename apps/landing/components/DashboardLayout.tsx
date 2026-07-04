"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bot, User, Settings, Key, CreditCard, BarChart2, LogOut, Home } from "lucide-react";
import { API_BASE_URL } from "../lib/config";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Session invalid");
        }
        return res.json();
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      });
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#07080d",
        color: "#06b6d4",
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <Bot size={48} className="animate-pulse" style={{ color: "#06b6d4" }} />
          <span style={{ fontWeight: 600, letterSpacing: "0.05em" }}>Loading companion space...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: "Overview", icon: Home, path: "/dashboard" },
    { name: "Usage Stats", icon: BarChart2, path: "/dashboard" }, // merged view or scroll anchor
    { name: "API Keys", icon: Key, path: "/api-keys" },
    { name: "Billing", icon: CreditCard, path: "/billing" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: "260px",
        background: "rgba(18, 20, 28, 0.6)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1.5rem",
        position: "sticky",
        top: 0,
        height: "100vh",
      }}>
        <div>
          {/* Header logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2.5rem", paddingLeft: "0.5rem" }}>
            <Bot size={24} style={{ color: "#06b6d4" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
              COMPANION APP
            </span>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.path}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    textDecoration: "none",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    color: isActive ? "#fff" : "#9ca3af",
                    backgroundColor: isActive ? "rgba(6, 182, 212, 0.15)" : "transparent",
                    border: isActive ? "1px solid rgba(6, 182, 212, 0.2)" : "1px solid transparent",
                    transition: "all 0.2s ease"
                  }}
                >
                  <Icon size={18} style={{ color: isActive ? "#06b6d4" : "#9ca3af" }} />
                  {item.name}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer profile & logout */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", paddingLeft: "0.5rem" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "rgba(6, 182, 212, 0.2)",
              border: "1px solid rgba(6, 182, 212, 0.4)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              color: "#06b6d4"
            }}>
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile?.name || "Developer"}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {profile?.email}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.6rem",
              borderRadius: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)")}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main dashboard content area */}
      <main style={{
        flex: 1,
        padding: "2.5rem",
        overflowY: "auto",
        position: "relative",
        zIndex: 1
      }}>
        {children}
      </main>
    </div>
  );
}
