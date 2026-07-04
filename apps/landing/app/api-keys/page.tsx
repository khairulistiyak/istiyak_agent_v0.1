"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { Key, Plus, Trash2, Eye, Copy, Check, AlertTriangle } from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/keys`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setKeys(data.keys);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreatedKey(null);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newKeyName }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to generate key.");

      setCreatedKey(data.key);
      setKeys([data.key, ...keys]);
      setNewKeyName("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    const confirmRevoke = confirm("Are you sure you want to revoke this API key? This action is permanent and any clients using this key will immediately fail.");
    if (!confirmRevoke) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/keys/${keyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to revoke key.");

      setKeys(keys.filter((k) => k._id !== keyId && k.id !== keyId));
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        
        {/* Header */}
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", margin: "0 0 0.5rem 0", fontFamily: "'Outfit', sans-serif" }}>
            API Keys Management
          </h1>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", margin: 0 }}>
            Generate, list, and revoke secret API keys to securely integrate the companion daemon from your local CLI tools.
          </p>
        </div>

        {/* Error Notification */}
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

        {/* Generate Key Section */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.5rem 0", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} style={{ color: "#06b6d4" }} />
            Create New API Key
          </h2>

          <form onSubmit={handleGenerateKey} style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1, minWidth: "260px" }}>
              <label htmlFor="key-name" style={{ fontSize: "0.8rem", fontWeight: 600, color: "#9ca3af" }}>API Key Name / Label</label>
              <input
                id="key-name"
                type="text"
                required
                placeholder="e.g. My Mac Terminal Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
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
              className="glow-btn"
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "bold",
                border: "none",
                cursor: "pointer"
              }}
            >
              Generate Key
            </button>
          </form>
        </div>

        {/* Display Generated Key Warning */}
        {createdKey && (
          <div style={{
            background: "rgba(6, 182, 212, 0.05)",
            border: "1px dashed rgba(6, 182, 212, 0.4)",
            borderRadius: "16px",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Eye size={18} style={{ color: "#06b6d4" }} />
              <h3 style={{ fontSize: "1.05rem", fontWeight: 700, margin: 0, color: "#06b6d4" }}>
                Secret Key Generated (Copy it now!)
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#a1a1aa", margin: 0, lineHeight: 1.5 }}>
              For security reasons, this key will <strong>not be displayed again</strong>. Copy it immediately to a safe password manager.
            </p>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              backgroundColor: "#0d0e12",
              border: "1px solid rgba(6, 182, 212, 0.2)"
            }}>
              <code style={{ fontSize: "0.9rem", color: "#22d3ee", wordBreak: "break-all", fontFamily: "monospace" }}>
                {createdKey.rawKey}
              </code>
              <button
                onClick={() => copyToClipboard(createdKey.rawKey)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "6px",
                  padding: "0.4rem",
                  color: "#fff",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {copied ? <Check size={16} style={{ color: "#10b981" }} /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* List API Keys */}
        <div style={{
          background: "rgba(18, 20, 28, 0.5)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          padding: "2rem"
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff", margin: "0 0 1.5rem 0", fontFamily: "'Outfit', sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Key size={18} style={{ color: "#06b6d4" }} />
            Active Keys
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Name / Label</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Prefix</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Created</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600 }}>Last Used</th>
                  <th style={{ padding: "0.75rem 1rem", color: "#9ca3af", fontWeight: 600, textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {keys.length > 0 ? (
                  keys.map((key) => (
                    <tr key={key._id || key.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <td style={{ padding: "1rem", color: "#fff", fontWeight: 600 }}>{key.name}</td>
                      <td style={{ padding: "1rem", color: "#a1a1aa", fontFamily: "monospace" }}>{key.prefix}...</td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>{new Date(key.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: "1rem", color: "#6b7280" }}>
                        {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : "Never"}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <button
                          onClick={() => handleRevokeKey(key._id || key.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "0.25rem",
                            borderRadius: "4px"
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem 1rem", textAlign: "center", color: "#6b7280" }}>
                      No active API keys found. Click "Generate Key" to create one.
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
