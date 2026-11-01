"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  name: string;
  email: string | null;
  membership_number: string;
  valid_until: string;
};

type MemberStatus = "Active" | "Expiring Soon" | "Expired";

function getMemberStatus(validUntil: string): MemberStatus {
  const today = new Date();
  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const todayDate = new Date(`${todayString}T00:00:00`);
  const expiryDate = new Date(`${validUntil}T00:00:00`);

  const daysRemaining = Math.floor(
    (expiryDate.getTime() - todayDate.getTime()) / 86400000,
  );

  if (daysRemaining < 0) return "Expired";
  if (daysRemaining <= 30) return "Expiring Soon";
  return "Active";
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecentMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("Session login tidak ditemukan. Silakan login kembali.");
        setMembers([]);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("members")
        .select("id, name, email, membership_number, valid_until")
        .order("created_at", { ascending: false })
        .limit(5);

      if (queryError) throw queryError;

      setMembers((data ?? []) as Member[]);
    } catch (err) {
      console.error("Recent members error:", err);
      setError(
        err instanceof Error ? err.message : "Gagal mengambil data anggota.",
      );
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h3 className="font-semibold text-white">Recent Members</h3>
          <p className="mt-1 text-xs text-gray-500">
            Latest membership records
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={fetchMembers}
            disabled={loading}
            aria-label="Refresh members"
            className="text-gray-400 transition hover:text-[#14E1E6] disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>

          <Link
            href="/members"
            className="text-sm font-medium text-[#14E1E6] hover:underline"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/[0.02] text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-4">Member</th>
              <th className="px-5 py-4">Member ID</th>
              <th className="px-5 py-4">Expiry Date</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <LoaderCircle size={18} className="animate-spin" />
                    Loading members...
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center">
                  <div className="flex flex-col items-center gap-2 text-red-400">
                    <AlertCircle size={20} />
                    <p>{error}</p>
                    <button
                      type="button"
                      onClick={fetchMembers}
                      className="text-sm text-[#14E1E6] hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-gray-500"
                >
                  Belum ada data membership.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const status = getMemberStatus(member.valid_until);

                return (
                  <tr
                    key={member.id}
                    className="border-t border-white/5 text-gray-300 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {member.email || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-400">
                      {member.membership_number}
                    </td>

                    <td className="px-5 py-4">
                      {formatDate(member.valid_until)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          status === "Active"
                            ? "bg-green-500/10 text-green-400"
                            : status === "Expired"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-yellow-500/10 text-yellow-400"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
