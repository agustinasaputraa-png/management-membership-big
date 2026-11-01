"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import WhatsAppButton from "@/components/prospects/WhatsAppButton";
import { supabase } from "@/lib/supabase";

type ProspectStatus = "NEW" | "FOLLOW_UP" | "INTERESTED" | "CONVERTED" | "LOST";

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

type ProspectRow = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  interest: string | null;
  notes: string | null;
  status: ProspectStatus;
  next_follow_up: string | null;
  created_at: string;
};

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

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6]";

function mapProspect(row: ProspectRow): Prospect {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? "",
    interest: row.interest ?? "",
    notes: row.notes ?? "",
    status: row.status,
    nextFollowUp: row.next_follow_up ?? "",
    createdAt: row.created_at,
  };
}

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
    default:
      return "bg-gray-400/10 text-gray-400";
  }
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // GET DATA DARI SUPABASE
  const fetchProspects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("prospects")
        .select(
          "id, name, phone, email, interest, notes, status, next_follow_up, created_at",
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("FETCH PROSPECTS ERROR:", fetchError);
        setError(fetchError.message);
        return;
      }

      setProspects(((data ?? []) as ProspectRow[]).map(mapProspect));
    } catch (err) {
      console.error("FETCH PROSPECTS ERROR:", err);
      setError("Gagal mengambil data prospek dari database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProspects();
  }, [fetchProspects]);

  // SEARCH DAN FILTER
  const filteredProspects = useMemo(() => {
    return prospects.filter((prospect) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch =
        prospect.name.toLowerCase().includes(keyword) ||
        prospect.phone.includes(search) ||
        prospect.email.toLowerCase().includes(keyword) ||
        prospect.interest.toLowerCase().includes(keyword);

      const matchesStatus =
        filterStatus === "ALL" || prospect.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [prospects, search, filterStatus]);

  // STATISTIK
  const totalProspects = prospects.length;

  const needFollowUp = prospects.filter(
    (item) => item.status === "FOLLOW_UP",
  ).length;

  const interested = prospects.filter(
    (item) => item.status === "INTERESTED",
  ).length;

  const converted = prospects.filter(
    (item) => item.status === "CONVERTED",
  ).length;

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
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

    setError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  // CREATE DAN UPDATE
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError("");
    setMessage("");

    const cleanPhone = form.phone.replace(/\D/g, "");

    if (!form.name.trim()) {
      setError("Nama prospek wajib diisi.");
      return;
    }

    if (cleanPhone.length < 9 || cleanPhone.length > 15) {
      setError("Masukkan nomor telepon yang valid.");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/login");
        return;
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim().toLowerCase() || null,
        interest: form.interest.trim() || null,
        notes: form.notes.trim() || null,
        status: form.status,
        next_follow_up: form.nextFollowUp || null,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { data: updatedProspect, error: updateError } = await supabase
          .from("prospects")
          .update(payload)
          .eq("id", editingId)
          .select("id")
          .maybeSingle();

        if (updateError) {
          console.error("UPDATE PROSPECT ERROR:", updateError);
          setError(updateError.message);
          return;
        }

        if (!updatedProspect) {
          setError(
            "Prospek tidak ditemukan atau kamu tidak memiliki izin untuk mengubah data ini.",
          );
          return;
        }

        setMessage("Data prospek berhasil diperbarui.");
      } else {
        const { error: insertError } = await supabase
          .from("prospects")
          .insert([payload]);

        if (insertError) {
          console.error("INSERT PROSPECT ERROR:", insertError);
          setError(insertError.message);
          return;
        }

        setMessage("Prospek berhasil ditambahkan.");
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);

      await fetchProspects();
    } catch (err) {
      console.error("SAVE PROSPECT ERROR:", err);
      setError("Terjadi kesalahan saat menyimpan prospek.");
    } finally {
      setSaving(false);
    }
  }

  // DELETE
  async function deleteProspect(id: string) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus prospek ini?",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        window.location.replace("/login");
        return;
      }

      const { error: deleteError } = await supabase
        .from("prospects")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error("DELETE PROSPECT ERROR:", deleteError);
        setError(deleteError.message);
        return;
      }

      setMessage("Prospek berhasil dihapus.");
      await fetchProspects();
    } catch (err) {
      console.error("DELETE PROSPECT ERROR:", err);
      setError("Gagal menghapus prospek.");
    }
  }

  // UPDATE STATUS LANGSUNG DARI TABEL
  async function updateStatus(id: string, status: ProspectStatus) {
    setError("");
    setMessage("");

    const { error: updateError } = await supabase
      .from("prospects")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("UPDATE STATUS ERROR:", updateError);
      setError(updateError.message);
      return;
    }

    setProspects((previous) =>
      previous.map((item) => (item.id === id ? { ...item, status } : item)),
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
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Total Prospects",
                value: totalProspects,
                icon: Users,
                color: "text-white",
              },
              {
                label: "Need Follow-up",
                value: needFollowUp,
                icon: Clock,
                color: "text-yellow-400",
              },
              {
                label: "Interested",
                value: interested,
                icon: UserCheck,
                color: "text-[#14E1E6]",
              },
              {
                label: "Converted",
                value: converted,
                icon: UserCheck,
                color: "text-green-400",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">{item.label}</p>
                    <Icon className={item.color} />
                  </div>

                  <p className={`mt-4 text-3xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              );
            })}
          </section>

          {/* FEEDBACK */}
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError("")} className="ml-auto">
                <X size={17} />
              </button>
            </div>
          )}

          {message && (
            <div className="flex items-center justify-between rounded-xl border border-[#14E1E6]/20 bg-[#14E1E6]/5 p-4 text-sm text-[#14E1E6]">
              {message}
              <button onClick={() => setMessage("")}>
                <X size={17} />
              </button>
            </div>
          )}

          {/* TABLE */}
          <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <h2 className="font-semibold">All Prospects</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Showing {filteredProspects.length} of {totalProspects}{" "}
                  prospects
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

                <button
                  onClick={() => void fetchProspects()}
                  disabled={loading}
                  title="Refresh data"
                  className="flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-gray-400 hover:border-[#14E1E6] hover:text-[#14E1E6] disabled:opacity-50"
                >
                  <RefreshCw
                    size={17}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-sm text-gray-500"
                      >
                        <LoaderCircle
                          size={24}
                          className="mx-auto mb-3 animate-spin"
                        />
                        Loading prospects from Supabase...
                      </td>
                    </tr>
                  ) : filteredProspects.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-sm text-gray-500"
                      >
                        {prospects.length === 0
                          ? "Belum ada data prospek. Klik Add Prospect untuk menambahkan data."
                          : "No prospects found."}
                      </td>
                    </tr>
                  ) : (
                    filteredProspects.map((prospect) => (
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
                              void updateStatus(
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
                              onClick={() => void deleteProspect(prospect.id)}
                              title="Delete prospect"
                              className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
                type="button"
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
                  className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">
                  Interest (Optional)
                </label>
                <input
                  value={form.interest}
                  onChange={(event) =>
                    setForm({ ...form, interest: event.target.value })
                  }
                  placeholder="Masukkan minat calon member (opsional)"
                  className={inputClass}
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
                    className={inputClass}
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
                    className={inputClass}
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
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-white/10 py-3 text-sm text-gray-300 transition hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#14E1E6] py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0] disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Save Prospect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
