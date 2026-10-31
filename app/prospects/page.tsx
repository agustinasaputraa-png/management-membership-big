"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  Clock,
  Trash2,
  Pencil,
  X,
  CalendarDays,
  MessageCircle,
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WhatsAppButton from "@/components/prospects/WhatsAppButton";

type ProspectStatus =
  | "NEW"
  | "FOLLOW_UP"
  | "INTERESTED"
  | "CONVERTED"
  | "LOST";

type Prospect = {
  id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  notes: string;
  status: ProspectStatus;
  nextFollowUp: string;
  createdAt: string;
};

const STORAGE_KEY = "membership_prospects";

const statusOptions: {
  value: ProspectStatus;
  label: string;
}[] = [
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "INTERESTED", label: "Interested" },
  { value: "CONVERTED", label: "Converted" },
  { value: "LOST", label: "Lost" },
];

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  interest: "",
  notes: "",
  status: "NEW" as ProspectStatus,
  nextFollowUp: "",
};

const initialProspects: Prospect[] = [
  {
    id: "demo-1",
    name: "Andi Pratama",
    phone: "081234567890",
    email: "andi@example.com",
    interest: "Membership Gold",
    notes: "Tertarik dengan paket Gold.",
    status: "FOLLOW_UP",
    nextFollowUp: "2026-10-31",
    createdAt: "2026-10-28",
  },
  {
    id: "demo-2",
    name: "Sarah Wijaya",
    phone: "081398765432",
    email: "sarah@example.com",
    interest: "Membership Silver",
    notes: "Meminta informasi harga.",
    status: "INTERESTED",
    nextFollowUp: "2026-11-02",
    createdAt: "2026-10-29",
  },
  {
    id: "demo-3",
    name: "Budi Santoso",
    phone: "085712345678",
    email: "budi@example.com",
    interest: "Membership Gold",
    notes: "Belum berhasil dihubungi.",
    status: "NEW",
    nextFollowUp: "2026-11-03",
    createdAt: "2026-10-30",
  },
];

function getStatusStyle(status: ProspectStatus) {
  switch (status) {
    case "NEW":
      return "bg-blue-400/10 text-blue-400";
    case "FOLLOW_UP":
      return "bg-yellow-400/10 text-yellow-400";
    case "INTERESTED":
      return "bg-[#14E1E6]/10 text-[#14E1E6]";
    case "CONVERTED":
      return "bg-green-400/10 text-green-400";
    case "LOST":
      return "bg-red-400/10 text-red-400";
  }
}

function getStatusLabel(status: ProspectStatus) {
  return statusOptions.find((item) => item.value === status)?.label ?? status;
}

function formatDate(date: string) {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setProspects(JSON.parse(saved));
      } else {
        setProspects(initialProspects);
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(initialProspects),
        );
      }
    } catch (error) {
      console.error("Gagal membaca data prospek:", error);
      setProspects(initialProspects);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
  }, [prospects, isLoaded]);

  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        prospect.name.toLowerCase().includes(keyword) ||
        prospect.phone.includes(search) ||
        prospect.email.toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "ALL" || prospect.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [prospects, search, filterStatus]);

  const totalProspects = prospects.length;
  const needFollowUp = prospects.filter(
    (item) => item.status === "FOLLOW_UP",
  ).length;
  const interested = prospects.filter(
    (item) => item.status === "INTERESTED",
  ).length;

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(prospect: Prospect) {
    setEditingId(prospect.id);
    setForm({
      name: prospect.name,
      phone: prospect.phone,
      email: prospect.email,
      interest: prospect.interest,
      notes: prospect.notes,
      status: prospect.status,
      nextFollowUp: prospect.nextFollowUp,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanPhone = form.phone.replace(/\D/g, "");

    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      alert("Masukkan nomor telepon yang valid.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);

    if (editingId) {
      setProspects((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                phone: form.phone.trim(),
              }
            : item,
        ),
      );
    } else {
      const newProspect: Prospect = {
        id: crypto.randomUUID(),
        ...form,
        phone: form.phone.trim(),
        createdAt: now,
      };

      setProspects((previous) => [newProspect, ...previous]);
    }

    closeModal();
  }

  function deleteProspect(id: string) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus prospek ini?",
    );

    if (!confirmed) return;

    setProspects((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }

  function updateStatus(id: string, status: ProspectStatus) {
    setProspects((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <Sidebar />

      <main className="min-h-screen pl-64">
        <Header />

        <div className="space-y-8 p-8">
          {/* HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Prospects</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage potential members and follow-up activities.
              </p>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
            >
              <Plus size={18} />
              Add Prospect
            </button>
          </div>

          {/* STATISTICS */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Total Prospects</p>
                <Users className="text-gray-400" />
              </div>
              <p className="mt-4 text-3xl font-bold">{totalProspects}</p>
              <p className="mt-1 text-xs text-gray-500">
                All potential members
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Need Follow-up</p>
                <Clock className="text-yellow-400" />
              </div>
              <p className="mt-4 text-3xl font-bold text-yellow-400">
                {needFollowUp}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Waiting for follow-up
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Interested</p>
                <UserCheck className="text-[#14E1E6]" />
              </div>
              <p className="mt-4 text-3xl font-bold text-[#14E1E6]">
                {interested}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Potential membership
              </p>
            </div>
          </section>

          {/* TABLE */}
          <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold">All Prospects</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Manage your potential members.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#252525] px-3">
                  <Search size={17} className="text-gray-500" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search prospect..."
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-600 sm:w-52"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="ALL">All Status</option>
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase text-gray-500">
                    <th className="pb-4 font-medium">Prospect</th>
                    <th className="pb-4 font-medium">Interest</th>
                    <th className="pb-4 font-medium">Follow-up</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium">WhatsApp</th>
                    <th className="pb-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProspects.map((prospect) => (
                    <tr
                      key={prospect.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="py-5">
                        <p className="text-sm font-semibold">
                          {prospect.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {prospect.phone}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                          {prospect.email || "-"}
                        </p>
                      </td>

                      <td className="py-5 text-sm text-gray-300">
                        {prospect.interest || "-"}
                      </td>

                      <td className="py-5">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <CalendarDays size={15} />
                          {formatDate(prospect.nextFollowUp)}
                        </div>
                      </td>

                      <td className="py-5">
                        <select
                          value={prospect.status}
                          onChange={(event) =>
                            updateStatus(
                              prospect.id,
                              event.target.value as ProspectStatus,
                            )
                          }
                          className={`rounded-lg border-0 px-3 py-2 text-xs font-medium outline-none ${getStatusStyle(prospect.status)} bg-[#252525]`}
                        >
                          {statusOptions.map((status) => (
                            <option
                              key={status.value}
                              value={status.value}
                              className="bg-[#252525] text-white"
                            >
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-5">
                        <WhatsAppButton
                          phone={prospect.phone}
                          name={prospect.name}
                          interest={prospect.interest}
                        />
                      </td>

                      <td className="py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(prospect)}
                            title="Edit prospect"
                            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-white/5 hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => deleteProspect(prospect.id)}
                            title="Delete prospect"
                            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredProspects.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-sm text-gray-500"
                      >
                        No prospects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 text-xs text-gray-600">
              Showing {filteredProspects.length} of {totalProspects} prospects
            </div>
          </section>
        </div>
      </main>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#1D1D1D] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  {editingId ? "Edit Prospect" : "Add New Prospect"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter prospect information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Full Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter prospect name"
                  className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    WhatsApp Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    placeholder="081234567890"
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Membership Interest
                </label>
                <input
                  value={form.interest}
                  onChange={(event) =>
                    setForm({ ...form, interest: event.target.value })
                  }
                  placeholder="Example: Membership Gold"
                  className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as ProspectStatus,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-400">
                    Next Follow-up
                  </label>
                  <input
                    type="date"
                    value={form.nextFollowUp}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        nextFollowUp: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(event) =>
                    setForm({ ...form, notes: event.target.value })
                  }
                  placeholder="Add notes about this prospect..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm outline-none focus:border-[#14E1E6]"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#14E1E6] py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
                >
                  {editingId ? "Save Changes" : "Save Prospect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
