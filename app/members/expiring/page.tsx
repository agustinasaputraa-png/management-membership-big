"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Clock,
  CalendarDays,
  Eye,
  X,
  MessageCircle,
  AlertTriangle,
  Users,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Member = {
  id: string;
  membershipNumber: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  validFrom: string;
  validUntil: string;
};

type MemberRow = {
  id: string;
  membership_number: string;
  name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  valid_from: string;
  valid_until: string;
};

function mapMember(row: MemberRow): Member {
  return {
    id: row.id,
    membershipNumber: row.membership_number,
    name: row.name,
    email: row.email,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
  };
}

function getDaysRemaining(validUntil: string, today: Date) {
  const expiry = new Date(`${validUntil}T00:00:00`);
  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

function formatDate(date: string) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWhatsAppLink(phone: string, name: string) {
  let number = phone.replace(/\D/g, "");
  if (number.startsWith("0")) number = `62${number.slice(1)}`;
  if (!number.startsWith("62") && number.length > 0) number = `62${number}`;

  const message = `Halo ${name}, kami ingin mengingatkan bahwa masa membership Anda akan segera berakhir. Silakan hubungi kami untuk informasi perpanjangan.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function ExpiringMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(30);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [today, setToday] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

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
        .from("members")
        .select(
          "id, membership_number, name, email, phone, date_of_birth, valid_from, valid_until",
        )
        .order("valid_until", { ascending: true });

      if (fetchError) {
        console.error("FETCH EXPIRING MEMBERS ERROR:", fetchError);
        setError(fetchError.message);
        return;
      }

      setMembers(((data ?? []) as MemberRow[]).map(mapMember));
    } catch (err) {
      console.error("FETCH EXPIRING MEMBERS ERROR:", err);
      setError("Gagal mengambil data membership dari database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    setToday(currentDate);
    void fetchMembers();
  }, [fetchMembers]);

  const expiringMembers = useMemo(() => {
    if (!today) return [];

    return members
      .filter((member) => {
        const days = getDaysRemaining(member.validUntil, today);
        return days >= 0 && days <= period;
      })
      .filter((member) => {
        const keyword = search.toLowerCase().trim();
        if (!keyword) return true;

        return [
          member.membershipNumber,
          member.name,
          member.email,
          member.phone,
        ].some((value) => value.toLowerCase().includes(keyword));
      })
      .sort(
        (a, b) =>
          getDaysRemaining(a.validUntil, today) -
          getDaysRemaining(b.validUntil, today),
      );
  }, [members, search, period, today]);

  const allExpiringCount = today
    ? members.filter((member) => {
        const days = getDaysRemaining(member.validUntil, today);
        return days >= 0 && days <= 30;
      }).length
    : 0;

  const urgentCount = today
    ? members.filter((member) => {
        const days = getDaysRemaining(member.validUntil, today);
        return days >= 0 && days <= 7;
      }).length
    : 0;

  return (
    <div className="min-h-screen bg-[#151515] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
              <Clock size={24} />
            </div>
            <h1 className="text-2xl font-bold">Expiring Members</h1>
            <p className="mt-2 text-sm text-gray-500">
              Monitor members whose memberships are approaching expiration.
            </p>
          </div>

          <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
            <p className="text-xs text-gray-500">Selected warning period</p>
            <p className="mt-1 text-lg font-bold text-yellow-400">
              {period} Days
            </p>
          </div>
        </div>

        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Expiring Within 30 Days</p>
              <CalendarDays className="text-yellow-400" size={21} />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-yellow-400">
              {today && !loading ? allExpiringCount : "-"}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              Members approaching expiration
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Urgent — Within 7 Days</p>
              <AlertTriangle className="text-red-400" size={21} />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-red-400">
              {today && !loading ? urgentCount : "-"}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              Members requiring immediate follow-up
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1D1D1D] p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search member name, email, phone or ID..."
              className="w-full rounded-xl border border-white/10 bg-[#252525] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#14E1E6]"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={period}
              onChange={(event) => setPeriod(Number(event.target.value))}
              className="flex-1 rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6]"
            >
              <option value={7}>Next 7 Days</option>
              <option value={14}>Next 14 Days</option>
              <option value={30}>Next 30 Days</option>
            </select>
            <button
              onClick={() => void fetchMembers(true)}
              disabled={loading || refreshing}
              title="Refresh members"
              className="rounded-xl border border-white/10 px-4 py-3 text-gray-300 transition hover:border-[#14E1E6] hover:text-[#14E1E6] disabled:opacity-50"
            >
              <RefreshCw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">Upcoming Expirations</h2>
            <p className="mt-1 text-xs text-gray-500">
              Showing {expiringMembers.length} members from Supabase
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Valid Until</th>
                  <th className="px-5 py-4">Remaining</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <LoaderCircle
                        size={24}
                        className="mx-auto mb-3 animate-spin text-[#14E1E6]"
                      />
                      <p className="text-sm text-gray-400">
                        Loading membership data...
                      </p>
                    </td>
                  </tr>
                ) : expiringMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Users size={32} className="mx-auto mb-3 text-gray-600" />
                      <p className="font-medium text-gray-300">
                        No expiring members found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        No members match this period or search keyword.
                      </p>
                    </td>
                  </tr>
                ) : (
                  expiringMembers.map((member) => {
                    const days = getDaysRemaining(member.validUntil, today!);
                    const urgent = days <= 7;

                    return (
                      <tr
                        key={member.id}
                        className="border-t border-white/5 transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14E1E6]/10 font-semibold text-[#14E1E6]">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-white">
                                {member.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {member.email}
                              </p>
                              <p className="mt-1 text-xs text-gray-600">
                                {member.membershipNumber}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-400">
                          {member.phone}
                        </td>
                        <td className="px-5 py-4 text-gray-300">
                          {formatDate(member.validUntil)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`font-semibold ${
                              urgent ? "text-red-400" : "text-yellow-400"
                            }`}
                          >
                            {days === 0 ? "Today" : `${days} days`}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="whitespace-nowrap rounded-full bg-yellow-400/10 px-3 py-1.5 text-xs font-medium text-yellow-400">
                            Expiring Soon
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              title="View member"
                              onClick={() => setSelectedMember(member)}
                              className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:text-[#14E1E6]"
                            >
                              <Eye size={16} />
                            </button>
                            <a
                              href={getWhatsAppLink(member.phone, member.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contact via WhatsApp"
                              className="rounded-lg border border-green-500/20 p-2 text-green-400 transition hover:bg-green-500/10"
                            >
                              <MessageCircle size={16} />
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedMember && today && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#202020] p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Member Details</h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  ["Membership Number", selectedMember.membershipNumber || "-"],
                  ["Name", selectedMember.name],
                  ["Email", selectedMember.email],
                  ["Phone", selectedMember.phone],
                  ["Date of Birth", formatDate(selectedMember.dateOfBirth)],
                  ["Valid From", formatDate(selectedMember.validFrom)],
                  ["Valid Until", formatDate(selectedMember.validUntil)],
                  [
                    "Remaining",
                    `${getDaysRemaining(selectedMember.validUntil, today)} days`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex justify-between gap-4 border-b border-white/5 pb-3 text-sm"
                  >
                    <span className="text-gray-500">{label}</span>
                    <span className="text-right font-medium text-white">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href={getWhatsAppLink(
                  selectedMember.phone,
                  selectedMember.name,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                <MessageCircle size={18} />
                Contact via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
