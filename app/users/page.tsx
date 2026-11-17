"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  UserPlus,
  Users,
  RefreshCw,
  ShieldCheck,
  Pencil,
  Power,
  X,
} from "lucide-react";

type PicUser = {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at?: string;
};

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#151515] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#14E1E6]";

export default function UsersPage() {
  const [users, setUsers] = useState<PicUser[]>([]);
  const [maxPic, setMaxPic] = useState(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PicUser | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil data PIC.");
      }

      setUsers(result.users ?? []);
      setMaxPic(result.maxPic ?? 5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function resetForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setEditing(null);
    setShowForm(false);
  }

  function openEdit(user: PicUser) {
    setEditing(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setPassword("");
    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editing ? `/api/users/${editing.user_id}` : "/api/users";

      const body = editing
        ? {
            full_name: fullName,
            email,
          }
        : {
            full_name: fullName,
            email,
            password,
          };

      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal menyimpan PIC.");
      }

      setMessage(result.message);
      resetForm();
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(user: PicUser) {
    const action = user.is_active ? "menonaktifkan" : "mengaktifkan";

    if (!window.confirm(`Yakin ingin ${action} akun ${user.full_name}?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/users/${user.user_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengubah status.");
      }

      setMessage(result.message);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  }

  return (
    <DashboardShell>
      <div className="min-w-0 space-y-7 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#14E1E6]">
              <ShieldCheck size={19} />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Administration
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold text-white">
              User Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Kelola akun Admin PIC Membership.
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setFullName("");
              setEmail("");
              setPassword("");
              setShowForm(true);
              setError("");
              setMessage("");
            }}
            disabled={users.length >= maxPic}
            className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <UserPlus size={17} />
            Add PIC
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-[#14E1E6]/20 bg-[#14E1E6]/10 p-4 text-sm text-[#14E1E6]">
            {message}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <Users className="text-[#14E1E6]" size={22} />
            <p className="mt-4 text-sm text-gray-500">Total PIC</p>
            <p className="mt-1 text-3xl font-bold">
              {users.length}
              <span className="text-base font-normal text-gray-500">
                {" "}
                / {maxPic}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <ShieldCheck className="text-green-400" size={22} />
            <p className="mt-4 text-sm text-gray-500">Active PIC</p>
            <p className="mt-1 text-3xl font-bold">
              {users.filter((user) => user.is_active).length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <Power className="text-red-400" size={22} />
            <p className="mt-4 text-sm text-gray-500">Inactive PIC</p>
            <p className="mt-1 text-3xl font-bold">
              {users.filter((user) => !user.is_active).length}
            </p>
          </div>
        </section>

        {showForm && (
          <section className="rounded-2xl border border-[#14E1E6]/20 bg-[#1D1D1D] p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-semibold">
                {editing ? "Edit PIC Account" : "Create New PIC"}
              </h2>
              <button onClick={resetForm} aria-label="Close form">
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Full Name
                </label>
                <input
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama PIC"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Email
                </label>
                <input
                  className={inputClass}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pic@example.com"
                  required
                />
              </div>

              {!editing && (
                <div className="md:col-span-2">
                  <label className="mb-2 block text-xs text-gray-400">
                    Password
                  </label>
                  <input
                    className={inputClass}
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    required
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Akun dibuat langsung dengan email dan password.
                  </p>
                </div>
              )}

              <div className="flex gap-3 md:col-span-2">
                <button
                  disabled={saving}
                  className="rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save Changes"
                      : "Create PIC"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <div>
              <h2 className="font-semibold">PIC Accounts</h2>
              <p className="mt-1 text-xs text-gray-500">
                Daftar seluruh akun PIC yang terdaftar.
              </p>
            </div>
            <button
              onClick={() => void loadUsers()}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-gray-300 hover:border-[#14E1E6]"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="p-8 text-center text-sm text-gray-500">
              Loading PIC accounts...
            </p>
          ) : users.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">
              Belum ada akun PIC. Buat akun pertama melalui Add PIC.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-[#252525] text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">PIC</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.user_id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {user.full_name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {user.email}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-gray-400">Admin PIC</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            user.is_active
                              ? "bg-green-400/10 text-green-400"
                              : "bg-red-400/10 text-red-400"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(user)}
                            title="Edit PIC"
                            className="rounded-lg border border-white/10 p-2 text-gray-300 hover:border-[#14E1E6] hover:text-[#14E1E6]"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => void toggleStatus(user)}
                            title={
                              user.is_active ? "Disable PIC" : "Enable PIC"
                            }
                            className="rounded-lg border border-white/10 p-2 text-gray-300 hover:border-red-400 hover:text-red-400"
                          >
                            <Power size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
