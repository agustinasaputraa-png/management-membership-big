"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Search,
  Users,
  CalendarDays,
  Eye,
  X,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  MessageCircle,
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

function formatDate(date: string): string {
  if (!date) return "-";

  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysExpired(validUntil: string, today: Date): number {
  const expiry = new Date(`${validUntil}T00:00:00`);
  return Math.max(
    0,
    Math.floor((today.getTime() - expiry.getTime()) / 86400000),
  );
}

function getWhatsAppLink(phone: string, name: string) {
  let number = phone.replace(/\D/g, "");

  if (number.startsWith("0")) number = `62${number.slice(1)}`;
  else if (!number.startsWith("62") && number.length > 0) {
    number = `62${number}`;
  }

  const message = `Halo ${name}, kami ingin menginformasikan bahwa masa membership Anda telah berakhir. Silakan hubungi kami jika ingin melakukan perpanjangan membership.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function StatCard({
  title,
  value,
  icon,
  iconColor,
}: {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconColor: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#1c1c1c] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-500">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 break-words text-sm text-white">{value}</p>
      </div>
    </div>
  );
}

export default function ExpiredMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
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
        console.error("FETCH EXPIRED MEMBERS ERROR:", fetchError);
        setError(fetchError.message);
        return;
      }

      setMembers(((data ?? []) as MemberRow[]).map(mapMember));
    } catch (err) {
      console.error("FETCH EXPIRED MEMBERS ERROR:", err);
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

  const expiredMembers = useMemo(() => {
    if (!today) return [];

    return members.filter((member) => {
      const expiry = new Date(`${member.validUntil}T00:00:00`);
      return expiry.getTime() < today.getTime();
    });
  }, [members, today]);

  const filteredMembers = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return expiredMembers.filter((member) => {
      if (!keyword) return true;

      return [
        member.membershipNumber,
        member.name,
        member.email,
        member.phone,
      ].some((value) => value.toLowerCase().includes(keyword));
    });
  }, [expiredMembers, search]);

  const totalDaysExpired = today
    ? expiredMembers.reduce(
        (total, member) => total + getDaysExpired(member.validUntil, today),
        0,
      )
    : 0;

  return (
    <main className="min-h-screen bg-[#151515] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/"
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-[#14E1E6]"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle size={24} />
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Expired Members
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Monitor members whose membership has expired.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void fetchMembers(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-4 py-3 text-sm font-medium text-white transition hover:border-[#14E1E6]/40 hover:text-[#14E1E6] disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/members"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#202020] px-5 py-3 text-sm font-medium text-white transition hover:border-[#14E1E6]/40 hover:text-[#14E1E6]"
              >
                <Users size={18} />
                All Members
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Expired Members"
            value={loading ? "..." : expiredMembers.length}
            icon={<Users size={21} />}
            iconColor="text-red-400"
          />
          <StatCard
            title="Total Days Expired"
            value={loading ? "..." : totalDaysExpired.toLocaleString("id-ID")}
            icon={<Clock size={21} />}
            iconColor="text-yellow-400"
          />
          <StatCard
            title="Members Requiring Renewal"
            value={loading ? "..." : expiredMembers.length}
            icon={<RefreshCw size={21} />}
            iconColor="text-[#14E1E6]"
          />
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Expired Member Directory
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredMembers.length} of {expiredMembers.length}{" "}
                expired members
                {loading ? " · Loading..." : " · Supabase"}
              </p>
            </div>

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search expired members..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#151515] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] sm:w-72"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#222222] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Valid From</th>
                  <th className="px-5 py-4">Expired Date</th>
                  <th className="px-5 py-4">Days Expired</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      <LoaderCircle
                        size={24}
                        className="mx-auto mb-3 animate-spin text-[#14E1E6]"
                      />
                      Loading members from Supabase...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                        <Users size={22} />
                      </div>
                      <p className="font-medium text-white">
                        No expired members found
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        {search
                          ? "Try another search keyword."
                          : "No memberships have expired."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const daysExpired = getDaysExpired(
                      member.validUntil,
                      today!,
                    );

                    return (
                      <tr
                        key={member.id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">
                            {member.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {member.membershipNumber} · {member.email}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-gray-400">
                          {member.phone}
                        </td>
                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(member.validFrom)}
                        </td>
                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(member.validUntil)}
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-red-400">
                            {daysExpired} days
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                            Expired
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              title="View member"
                              onClick={() => setSelectedMember(member)}
                              className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-[#14E1E6]/40 hover:text-[#14E1E6]"
                            >
                              <Eye size={17} />
                            </button>
                            <a
                              href={getWhatsAppLink(member.phone, member.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Contact via WhatsApp"
                              className="rounded-lg border border-green-500/20 p-2 text-green-400 transition hover:bg-green-500/10"
                            >
                              <MessageCircle size={17} />
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

          <div className="flex flex-col justify-between gap-2 border-t border-white/10 px-5 py-4 text-xs text-gray-500 sm:flex-row sm:items-center">
            <span>
              Showing {filteredMembers.length} of {expiredMembers.length}{" "}
              expired members
            </span>
            <span>Membership Management</span>
          </div>
        </section>
      </div>

      {selectedMember && today && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#202020] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">Member Details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedMember.membershipNumber}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-xl bg-[#151515] p-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-xl font-bold text-red-400">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold">
                  {selectedMember.name}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedMember.membershipNumber}
                </p>
                <span className="mt-2 inline-flex rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                  Expired
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <DetailRow
                icon={<Mail size={17} />}
                label="Email"
                value={selectedMember.email}
              />
              <DetailRow
                icon={<Phone size={17} />}
                label="Phone"
                value={selectedMember.phone}
              />
              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Date of Birth"
                value={formatDate(selectedMember.dateOfBirth)}
              />
              <div className="my-4 border-t border-white/10" />
              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Membership Start"
                value={formatDate(selectedMember.validFrom)}
              />
              <DetailRow
                icon={<CalendarDays size={17} />}
                label="Membership Expiry"
                value={formatDate(selectedMember.validUntil)}
              />
              <DetailRow
                icon={<Clock size={17} />}
                label="Days Since Expiry"
                value={`${getDaysExpired(
                  selectedMember.validUntil,
                  today,
                )} days`}
              />
            </div>

            <a
              href={getWhatsAppLink(selectedMember.phone, selectedMember.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              <MessageCircle size={18} />
              Contact via WhatsApp
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
