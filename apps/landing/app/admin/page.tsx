"use client";

import { useEffect, useState } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
  Ban,
  CheckCircle,
} from "lucide-react";
import { API_BASE_URL } from "../../lib/config";

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
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Access denied. Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.status === 401 || res.status === 403) {
        setError("Access denied. Central Admin role required.");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (err: unknown) {
      console.error(err);
      setError(
        "Cannot connect to the backend server. Please make sure the SaaS Backend is running."
      );
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
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/user/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
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
    } catch (err: unknown) {
      alert(`Error: ${err instanceof Error ? err.message : "Failed to update user status."}`);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Compute stats
  const totalUsers = users.length;
  const activePremium = users.filter((u) => u.isActive).length;
  const blockedUsers = users.filter((u) => u.isBlocked).length;

  return (
    <div className="min-h-screen bg-[#030712] text-[#f3f4f6] px-6 py-8 font-sans">
      <div className="max-w-[1100px] mx-auto">
        {/* Navigation & Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-3 transition-colors duration-200"
            >
              <ArrowLeft size={16} /> Back to Landing Page
            </a>
            <h1 className="text-3xl font-extrabold tracking-tight text-white m-0 flex items-center gap-3">
              <ShieldAlert className="text-[#06b6d4]" /> CENTRAL ADMIN PANEL
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage user registrations, license activations, and system bans.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Data
          </button>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
          {/* Card 1 */}
          <div className="card-glass p-6 rounded-xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
            <div className="flex justify-between items-center text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Total Registrations
              </span>
              <Users size={18} className="text-[#06b6d4]" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {loading ? "..." : totalUsers}
            </div>
          </div>

          {/* Card 2 */}
          <div className="card-glass p-6 rounded-xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
            <div className="flex justify-between items-center text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pro License Activations
              </span>
              <ShieldCheck size={18} className="text-[#10b981]" />
            </div>
            <div className="text-3xl font-extrabold text-[#10b981]">
              {loading ? "..." : activePremium}
            </div>
          </div>

          {/* Card 3 */}
          <div className="card-glass p-6 rounded-xl border border-white/[0.06] bg-white/[0.01] backdrop-blur-xl">
            <div className="flex justify-between items-center text-gray-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Banned Accounts
              </span>
              <Ban size={18} className="text-[#ef4444]" />
            </div>
            <div className="text-3xl font-extrabold text-[#ef4444]">
              {loading ? "..." : blockedUsers}
            </div>
          </div>
        </section>

        {/* Users Table Card */}
        <main className="card-glass rounded-2xl p-6 border border-white/[0.08] bg-white/[0.01] backdrop-blur-xl shadow-2xl">
          <h2 className="text-lg font-bold mb-5 text-white">
            Registered Accounts List
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl text-sm mb-6 leading-relaxed">
              ⚠️ {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center h-[200px] text-gray-400 gap-2">
              <RefreshCw className="animate-spin" size={18} /> Loading database records...
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center h-[200px] text-gray-400 italic">
              No registered user accounts found in the database.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="px-4 py-3 font-semibold">Email Address</th>
                    <th className="px-4 py-3 font-semibold">Registration IP</th>
                    <th className="px-4 py-3 font-semibold">Signup Date</th>
                    <th className="px-4 py-3 font-semibold">Tier Plan</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const signupDate = new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors duration-200"
                      >
                        <td className="px-4 py-4 font-semibold text-white font-mono">
                          {user.email}
                        </td>
                        <td className="px-4 py-4 text-gray-400 font-mono">
                          {user.registeredIp || "Unknown"}
                        </td>
                        <td className="px-4 py-4 text-gray-400">{signupDate}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                              user.isActive
                                ? "bg-[#10b981]/15 text-[#34d399] border-[#10b981]/30"
                                : "bg-white/5 text-gray-400 border-white/10"
                            }`}
                          >
                            {user.isActive ? "PRO" : "FREE"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-semibold ${
                              user.isBlocked ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
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
                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                            disabled={actionLoadingId === user._id}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition-all duration-200 ${
                              user.isBlocked
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                            }`}
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
