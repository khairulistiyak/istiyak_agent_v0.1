"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { BarChart2, DollarSign, Activity, Cpu, ArrowUpRight } from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchSummary = fetch(`${API_BASE_URL}/api/usage/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    const fetchDaily = fetch(`${API_BASE_URL}/api/usage/daily`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => res.json());

    Promise.all([fetchSummary, fetchDaily])
      .then(([summaryRes, dailyRes]) => {
        if (summaryRes.status === "success") {
          setSummary(summaryRes.summary);
        }
        if (dailyRes.status === "success") {
          setDailyData(dailyRes.daily);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load usage summary stats.");
        setLoading(false);
      });
  }, []);

  // Compute maximum token count for sizing the bar chart
  const maxTokens = Math.max(...dailyData.map((d) => d.tokens), 1000);

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Welcome Section */}
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0", fontFamily: "'Outfit', sans-serif" }}>
            Workspace Dashboard
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>
            Monitor your autonomous companion agent executions, costs, and token usage in real-time.
          </p>
        </div>

        {/* Stats Cards Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "1.5rem"
        }}>
          {/* Card 1: Total Cost */}
          <div style={{
            background: "rgba(18, 20, 28, 0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9ca3af" }}>Estimated Cost</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <DollarSign size={16} style={{ color: "#10b981" }} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
                ${summary ? summary.totalCost.toFixed(4) : "0.0000"}
              </span>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>Cumulative session expenses</p>
            </div>
          </div>

          {/* Card 2: Total Tokens */}
          <div style={{
            background: "rgba(18, 20, 28, 0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9ca3af" }}>Tokens Consumed</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(6, 182, 212, 0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Cpu size={16} style={{ color: "#06b6d4" }} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
                {summary ? summary.totalTokens.toLocaleString() : "0"}
              </span>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>
                In: {summary ? summary.totalInputTokens.toLocaleString() : "0"} | Out: {summary ? summary.totalOutputTokens.toLocaleString() : "0"}
              </p>
            </div>
          </div>

          {/* Card 3: Total Requests */}
          <div style={{
            background: "rgba(18, 20, 28, 0.5)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "16px",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#9ca3af" }}>Agent Executions</span>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "rgba(59, 130, 246, 0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Activity size={16} style={{ color: "#3b82f6" }} />
              </div>
            </div>
            <div>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
                {summary ? summary.totalRequests : "0"}
              </span>
              <p style={{ fontSize: "0.75rem", color: "#6b7280", margin: "0.25rem 0 0 0" }}>Total completed agent loops</p>
            </div>
          </div>
        </div>

        {/* Usage Chart Section */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 2rem 0", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <BarChart2 size={18} style={{ color: "#06b6d4" }} />
            Daily Token Consumption (Last 7 Days)
          </h2>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            height: "220px",
            paddingTop: "1rem",
            position: "relative",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            {/* Custom chart bars */}
            {dailyData.map((day, idx) => {
              const heightPercent = `${(day.tokens / maxTokens) * 100}%`;
              return (
                <div
                  key={day.date}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                    gap: "0.5rem",
                    height: "100%",
                    justifyContent: "flex-end"
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="chart-bar-container" style={{
                    position: "relative",
                    width: "36px",
                    height: heightPercent,
                    backgroundColor: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderTopLeftRadius: "6px",
                    borderTopRightRadius: "6px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.4)";
                    e.currentTarget.style.boxShadow = "0 0 15px rgba(6, 182, 212, 0.4)";
                    setHoveredIndex(idx);
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(6, 182, 212, 0.15)";
                    e.currentTarget.style.boxShadow = "none";
                    setHoveredIndex(null);
                  }}
                  >
                    <div className="chart-tooltip" style={{
                      position: "absolute",
                      bottom: "105%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "#12141c",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "6px",
                      padding: "0.4rem 0.6rem",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#fff",
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
                      display: hoveredIndex === idx ? "block" : "none",
                      opacity: hoveredIndex === idx ? 1 : 0,
                      transition: "opacity 0.2s ease"
                    }}>
                      {day.tokens.toLocaleString()} tokens
                    </div>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "-1.75rem" }}>
                    {day.date.substring(5)}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ height: "1.75rem" }}></div> {/* spacing for dates */}
        </div>

        {/* Session Log / Recent Runs Table */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              Recent Agent Runs
            </h2>
            <button style={{
              background: "none",
              border: "none",
              color: "#06b6d4",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.25rem"
            }}>
              View Full Logs <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Provider</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Model</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Tokens</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Cost</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.length > 0 && dailyData.some((d) => d.requests > 0) ? (
                  dailyData.filter((d) => d.requests > 0).map((day, idx) => (
                    <tr key={day.date + idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "1rem", color: "#fff", fontWeight: 500 }}>{day.date}</td>
                      <td style={{ padding: "1rem", color: "#a1a1aa" }}>Gemini</td>
                      <td style={{ padding: "1rem", color: "#a1a1aa" }}>gemini-2.5-flash</td>
                      <td style={{ padding: "1rem", color: "#fff" }}>{day.tokens.toLocaleString()}</td>
                      <td style={{ padding: "1rem", color: "#10b981", fontWeight: 600 }}>${day.cost.toFixed(4)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>
                      No recent agent runs found in the last 7 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
