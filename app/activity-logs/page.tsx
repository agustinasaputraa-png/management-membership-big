"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import {
  History,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
} from "lucide-react";

type ActivityLog = {
  id: number;
  actor_user_id: string | null;
  actor_name: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
};

const actionStyle: Record<string, string> = {
  INSERT: "bg-green-400/10 text-green-400",
  UPDATE: "bg-yellow-400/10 text-yellow-400",
  DELETE: "bg-red-400/10 text-red-400",
};

function ActionIcon({ action }: { action: string }) {
  if (action === "INSERT") return <Plus size={15} />;
  if (action === "UPDATE") return <Pencil size={15} />;
  if (action === "DELETE") return <Trash2 size={15} />;
  return <History size={15} />;
}

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ActivityLog | null>(null);

  const loadLogs = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/activity-logs?page=${targetPage}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal mengambil activity logs.");
      }

      setLogs(result.logs ?? []);
      setPage(result.page);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLogs(1);
  }, [loadLogs]);

  return (
    <DashboardShell>
      <div className="min-w-0 space-y-7 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#14E1E6]">
              <ShieldCheck size={19} />
              <span className="text-xs font-semibold uppercase tracking-widest">
                Security & Monitoring
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold">Activity Logs</h1>
            <p className="mt-1 text-sm text-gray-500">
              Riwayat perubahan data member dan aktivitas pengguna.
            </p>
          </div>

          <button
            onClick={() => void loadLogs(page)}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 hover:border-[#14E1E6] hover:text-[#14E1E6]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
              <History size={22} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Recorded Activities</p>
              <p className="text-2xl font-bold">
                {total.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">Audit Trail</h2>
            <p className="mt-1 text-xs text-gray-500">
              Menampilkan aktivitas terbaru terlebih dahulu.
            </p>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-gray-500">
              Loading activity logs...
            </p>
          ) : logs.length === 0 ? (
            <p className="p-10 text-center text-sm text-gray-500">
              Belum ada aktivitas yang tercatat.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="bg-[#252525] text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4">Activity</th>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Record</th>
                    <th className="px-5 py-4">Date & Time</th>
                    <th className="px-5 py-4">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                            actionStyle[log.action] ??
                            "bg-white/10 text-gray-300"
                          }`}
                        >
                          <ActionIcon action={log.action} />
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {log.actor_name || "Unknown User"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {log.actor_user_id?.slice(0, 8) ?? "System"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-white">{log.table_name}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          ID: {log.record_id ?? "-"}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(log)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#14E1E6] hover:bg-[#14E1E6]/10"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-white/10 p-4">
            <p className="text-xs text-gray-500">
              Page {page} of {totalPages || 1}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page <= 1 || loading}
                onClick={() => void loadLogs(page - 1)}
                className="rounded-lg border border-white/10 p-2 text-gray-300 disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => void loadLogs(page + 1)}
                className="rounded-lg border border-white/10 p-2 text-gray-300 disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </section>

        {selected && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelected(null)}
          >
            <div
              className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#1D1D1D] p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Activity Detail</h2>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-gray-500">Action</p>
                  <p className="mt-1 text-sm">{selected.action}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User</p>
                  <p className="mt-1 text-sm">
                    {selected.actor_name || "Unknown User"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Table</p>
                  <p className="mt-1 text-sm">{selected.table_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Record ID</p>
                  <p className="mt-1 break-all text-sm">
                    {selected.record_id || "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-red-400">
                    Old Data
                  </h3>
                  <pre className="max-h-80 overflow-auto rounded-xl bg-[#111111] p-4 text-xs text-gray-300">
                    {JSON.stringify(selected.old_data, null, 2) ?? "null"}
                  </pre>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-green-400">
                    New Data
                  </h3>
                  <pre className="max-h-80 overflow-auto rounded-xl bg-[#111111] p-4 text-xs text-gray-300">
                    {JSON.stringify(selected.new_data, null, 2) ?? "null"}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
