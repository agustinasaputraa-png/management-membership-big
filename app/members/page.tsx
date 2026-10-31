"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Mail,
  Phone,
  Filter,
  RefreshCw,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

type Member = {
  id: string;
  membershipNumber: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  validFrom: string;
  validUntil: string;
  createdAt?: string;
};

type Status = "ACTIVE" | "EXPIRING_SOON" | "EXPIRED";

const STORAGE_KEY = "membership_members";
const WARNING_DAYS = 30;

function getMemberStatus(validUntil: string, today: string): Status {
  if (!today || !validUntil) return "ACTIVE";

  const expiry = new Date(`${validUntil}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);

  const diff = Math.ceil(
    (expiry.getTime() - current.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return "EXPIRED";
  if (diff <= WARNING_DAYS) return "EXPIRING_SOON";

  return "ACTIVE";
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const styles = {
    ACTIVE: "bg-[#14E1E6]/10 text-[#14E1E6]",
    EXPIRING_SOON: "bg-yellow-400/10 text-yellow-400",
    EXPIRED: "bg-red-400/10 text-red-400",
  };

  const labels = {
    ACTIVE: "Active",
    EXPIRING_SOON: "Expiring Soon",
    EXPIRED: "Expired",
  };

  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [today, setToday] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10));

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMembers(parsed);
      }
    } catch {
      setMessage("Data member gagal dibaca dari browser.");
    }

    setLoaded(true);
  }, []);

  function saveMembers(data: Member[]) {
    setMembers(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  const membersWithStatus = useMemo(() => {
    return members.map((member) => ({
      ...member,
      status: getMemberStatus(member.validUntil, today),
    }));
  }, [members, today]);

  const filteredMembers = useMemo(() => {
    return membersWithStatus.filter((member) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        member.name.toLowerCase().includes(keyword) ||
        member.email.toLowerCase().includes(keyword) ||
        member.phone.toLowerCase().includes(keyword) ||
        member.membershipNumber.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [membersWithStatus, search, statusFilter]);

  const activeCount = membersWithStatus.filter(
    (m) => m.status === "ACTIVE",
  ).length;

  const expiringCount = membersWithStatus.filter(
    (m) => m.status === "EXPIRING_SOON",
  ).length;

  const expiredCount = membersWithStatus.filter(
    (m) => m.status === "EXPIRED",
  ).length;

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMember) return;

    if (editingMember.validUntil < editingMember.validFrom) {
      setMessage("Tanggal berakhir harus setelah tanggal mulai.");
      return;
    }

    const updated = members.map((member) =>
      member.id === editingMember.id ? editingMember : member,
    );

    saveMembers(updated);
    setEditingMember(null);
    setMessage("Data member berhasil diperbarui.");
  }

  function handleDelete() {
    if (!deleteTarget) return;

    const updated = members.filter((member) => member.id !== deleteTarget.id);

    saveMembers(updated);
    setDeleteTarget(null);
    setMessage("Member berhasil dihapus.");
  }

  function updateEditing(field: keyof Member, value: string) {
    if (!editingMember) return;

    setEditingMember({
      ...editingMember,
      [field]: value,
    });
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6]";

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <Sidebar />

      <main className="min-h-screen pl-64">
        <Header />

        <div className="space-y-7 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">All Members</h1>
              <p className="mt-2 text-sm text-gray-500">
                View and manage all registered membership accounts.
              </p>
            </div>

            <Link
              href="/members/new"
              className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
            >
              <UserPlus size={18} />
              Add New Member
            </Link>
          </div>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Members",
                value: members.length,
                color: "text-white",
              },
              {
                label: "Active Members",
                value: activeCount,
                color: "text-[#14E1E6]",
              },
              {
                label: "Expiring Soon",
                value: expiringCount,
                color: "text-yellow-400",
              },
              {
                label: "Expired Members",
                value: expiredCount,
                color: "text-red-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5"
              >
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className={`mt-3 text-3xl font-bold ${item.color}`}>
                  {loaded ? item.value.toLocaleString("id-ID") : "..."}
                </p>
              </div>
            ))}
          </section>

          {/* SEARCH AND FILTER */}
          <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, phone, or membership number..."
                  className="w-full rounded-xl border border-white/10 bg-[#202020] py-3 pl-12 pr-4 text-sm outline-none focus:border-[#14E1E6]"
                />
              </div>

              <div className="flex items-center gap-3">
                <Filter size={18} className="text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6]"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRING_SOON">Expiring Soon</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  className="rounded-xl border border-white/10 p-3 text-gray-400 hover:bg-white/5"
                  title="Reset filter"
                >
                  <RefreshCw size={17} />
                </button>
              </div>
            </div>
          </section>

          {message && (
            <div className="flex items-center justify-between rounded-xl border border-[#14E1E6]/20 bg-[#14E1E6]/5 p-4 text-sm text-[#14E1E6]">
              {message}
              <button onClick={() => setMessage("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {/* MEMBER TABLE */}
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="font-semibold">Member Directory</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Showing {filteredMembers.length} of {members.length} members
                </p>
              </div>
              <Users size={20} className="text-[#14E1E6]" />
            </div>

            {!loaded ? (
              <div className="p-12 text-center text-sm text-gray-500">
                Loading members...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={35} className="mx-auto text-gray-600" />
                <h3 className="mt-4 font-semibold">No members found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {members.length === 0
                    ? "You have not registered any members yet."
                    : "Try changing your search or filter."}
                </p>
                {members.length === 0 && (
                  <Link
                    href="/members/new"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black"
                  >
                    <UserPlus size={17} />
                    Add First Member
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-[#252525] text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-5 py-4">Member</th>
                      <th className="px-5 py-4">Membership ID</th>
                      <th className="px-5 py-4">Phone</th>
                      <th className="px-5 py-4">Valid Period</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {filteredMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14E1E6]/10 font-semibold text-[#14E1E6]">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {member.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-300">
                          {member.membershipNumber || "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-400">
                          {member.phone}
                        </td>

                        <td className="px-5 py-4 text-xs text-gray-400">
                          <p>{formatDate(member.validFrom)}</p>
                          <p className="mt-1 text-gray-600">
                            Until {formatDate(member.validUntil)}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={member.status} />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedMember(member)}
                              title="View details"
                              className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-[#14E1E6] hover:text-[#14E1E6]"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => setEditingMember({ ...member })}
                              title="Edit member"
                              className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-yellow-400 hover:text-yellow-400"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(member)}
                              title="Delete member"
                              className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-red-400 hover:text-red-400"
                            >
                              <Trash2 size={16} />
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
      </main>

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Member Details</h2>
              <button onClick={() => setSelectedMember(null)}>
                <X className="text-gray-400" />
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#14E1E6]/10 text-xl font-bold text-[#14E1E6]">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold">{selectedMember.name}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedMember.membershipNumber || "No membership ID"}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <p className="flex items-center gap-3 text-gray-300">
                <Mail size={17} className="text-gray-500" />
                {selectedMember.email}
              </p>
              <p className="flex items-center gap-3 text-gray-300">
                <Phone size={17} className="text-gray-500" />
                {selectedMember.phone}
              </p>
              <p className="flex items-center gap-3 text-gray-300">
                <CalendarDays size={17} className="text-gray-500" />
                Birth: {formatDate(selectedMember.dateOfBirth)}
              </p>
              <div className="rounded-xl bg-[#252525] p-4">
                <p className="mb-3 text-xs text-gray-500">Membership Period</p>
                <p>
                  {formatDate(selectedMember.validFrom)} –{" "}
                  {formatDate(selectedMember.validUntil)}
                </p>
                <div className="mt-3">
                  <StatusBadge
                    status={getMemberStatus(selectedMember.validUntil, today)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <form
            onSubmit={handleEdit}
            className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#1D1D1D] p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Member</h2>
              <button type="button" onClick={() => setEditingMember(null)}>
                <X className="text-gray-400" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-gray-400">
                Full Name
                <input
                  required
                  value={editingMember.name}
                  onChange={(e) => updateEditing("name", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm text-gray-400">
                Email
                <input
                  required
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => updateEditing("email", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm text-gray-400">
                Phone
                <input
                  required
                  value={editingMember.phone}
                  onChange={(e) => updateEditing("phone", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm text-gray-400">
                Date of Birth
                <input
                  required
                  type="date"
                  value={editingMember.dateOfBirth}
                  onChange={(e) => updateEditing("dateOfBirth", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm text-gray-400">
                Valid From
                <input
                  required
                  type="date"
                  value={editingMember.validFrom}
                  onChange={(e) => updateEditing("validFrom", e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className="text-sm text-gray-400">
                Valid Until
                <input
                  required
                  type="date"
                  min={editingMember.validFrom}
                  value={editingMember.validUntil}
                  onChange={(e) => updateEditing("validUntil", e.target.value)}
                  className={inputClass}
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={22} />
            </div>
            <h2 className="mt-4 text-lg font-bold">Delete Member?</h2>
            <p className="mt-2 text-sm text-gray-400">
              Are you sure you want to delete {deleteTarget.name}? This action
              cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
