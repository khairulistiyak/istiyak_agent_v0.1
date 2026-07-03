"use client";

import { useRouter } from "next/navigation";
import { Bot, ArrowLeft, ArrowUpRight, Clock, User } from "lucide-react";

export default function BlogPage() {
  const router = useRouter();

  const posts = [
    {
      id: "workspace-guard-isolation",
      title: "How We Sandbox Autonomous Commands Safely",
      summary: "Explore how the companion isolates filesystem edits using path validations and Docker runtimes to prevent system corruption.",
      author: "Istiyak Rahaman",
      date: "June 28, 2026",
      readTime: "5 min read",
    },
    {
      id: "ai-floating-assistant-productivity",
      title: "Why Floating UI Daemons Beat Traditional Plugins",
      summary: "Traditional editor plugins block your view. Discover the productivity gains of floating HUD companion panels.",
      author: "Istiyak Rahaman",
      date: "May 14, 2026",
      readTime: "4 min read",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#07080d",
      color: "#f3f4f6",
      fontFamily: "'Inter', sans-serif",
      padding: "3rem 1.5rem",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Decorative Blur */}
      <div style={{
        position: "absolute",
        top: "10%",
        right: "10%",
        width: "500px",
        height: "500px",
        borderRadius: "50%",
        backgroundColor: "rgba(6, 182, 212, 0.02)",
        filter: "blur(120px)",
        pointerEvents: "none",
        zIndex: 0
      }} />

      <div style={{ maxWidth: "900px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {/* Navigation Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bot size={24} style={{ color: "#06b6d4" }} />
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.05em", color: "#fff", fontFamily: "'Outfit', sans-serif" }}>
              ISTIYAK COMPANION
            </span>
          </div>
          <button
            onClick={() => router.push("/")}
            style={{
              background: "none",
              border: "none",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </header>

        {/* Blog Intro Header */}
        <div style={{ marginBottom: "4rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
            Developer Portal & Blog
          </h1>
          <p style={{ fontSize: "0.95rem", color: "#9ca3af", maxWidth: "600px" }}>
            Tutorials, deep-dives, and best practices for building software with autonomous agent companions.
          </p>
        </div>

        {/* Blog Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              background: "rgba(18, 20, 28, 0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.2s, border-color 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
            }}
            >
              <div>
                {/* Meta details */}
                <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#6b7280", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <User size={12} />
                    {post.author}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Clock size={12} />
                    {post.readTime}
                  </div>
                </div>

                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "#a1a1aa", lineHeight: 1.5, margin: 0 }}>
                  {post.summary}
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
                <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{post.date}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem", fontWeight: 600, color: "#06b6d4" }}>
                  Read Article
                  <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
