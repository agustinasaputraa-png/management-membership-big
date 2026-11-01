"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  UserPlus,
  ArrowUpRight,
  UserRoundPlus,
  CalendarClock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  LoaderCircle,
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentMembers from "@/components/dashboard/RecentMembers";
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

type MemberRow = {
  id: string;
  valid_until: string;
};

const WARNING_DAYS = 30;

const statusStyles: Record<ProspectStatus, string> = {
  NEW: "text-blue-400 bg-blue-400/10",
  FOLLOW_UP: "text-yellow-400 bg-yellow-400/10",
  INTERESTED: "text-[#14E1E6] bg-[#14E1E6]/10",
  CONVERTED: "text-green-400 bg-green-400/10",
  LOST: "text-red-400 bg-red-400/10",
};

const statusLabels: Record<ProspectStatus, string> = {
  NEW: "New",
  FOLLOW_UP: "Follow-up",
  INTERESTED: "Interested",
  CONVERTED: "Converted",
  LOST: "Lost",
};

function getLocalDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDaysRemaining(validUntil: string, today: string) {
  const expiry = new Date(`${validUntil}T00:00:00`);
  const current = new Date(`${today}T00:00:00`);
  return Math.ceil((expiry.getTime() - current.getTime()) / 86400000);
}

function formatFollowUpDate(date: string) {
  if (!date) return "Belum dijadwalkan";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "Tanggal tidak valid";

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoaded(false);

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

      const [membersResult, prospectsResult] = await Promise.all([
        supabase
          .from("members")
          .select("id, valid_until")
          .order("created_at", { ascending: false }),
        supabase
          .from("prospects")
          .select(
            "id, name, phone, email, interest, notes, status, next_follow_up, created_at",
          )
          .order("created_at", { ascending: false }),
      ]);

      if (membersResult.error) {
        console.error("DASHBOARD MEMBERS ERROR:", membersResult.error);
        throw new Error(`Members: ${membersResult.error.message}`);
      }

      if (prospectsResult.error) {
        console.error("DASHBOARD PROSPECTS ERROR:", prospectsResult.error);
        throw new Error(`Prospects: ${prospectsResult.error.message}`);
      }

      setMembers((membersResult.data ?? []) as MemberRow[]);

      const mappedProspects: Prospect[] = (
        (prospectsResult.data ?? []) as ProspectRow[]
      ).map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email ?? "",
        interest: row.interest ?? "",
        notes: row.notes ?? "",
        status: row.status,
        nextFollowUp: row.next_follow_up ?? "",
        createdAt: row.created_at,
      }));

      setProspects(mappedProspects);
    } catch (err) {
      console.error("DASHBOARD FETCH ERROR:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data dashboard dari Supabase.",
      );
    } finally {
      setIsLoaded(true);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setToday(getLocalDateString());
    void fetchDashboardData();

    const handleFocus = () => {
      void fetchDashboardData(true);
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchDashboardData]);

  const totalMembers = members.length;

  const activeMembers = useMemo(
    () =>
      members.filter((member) => {
        const days = getDaysRemaining(member.valid_until, today);
        return days > WARNING_DAYS;
      }).length,
    [members, today],
  );

  const expiringMembers = useMemo(
    () =>
      members.filter((member) => {
        const days = getDaysRemaining(member.valid_until, today);
        return days >= 0 && days <= WARNING_DAYS;
      }).length,
    [members, today],
  );

  const expiredMembers = useMemo(
    () =>
      members.filter((member) => {
        const days = getDaysRemaining(member.valid_until, today);
        return days < 0;
      }).length,
    [members, today],
  );

  const totalProspects = prospects.length;
  const needFollowUp = prospects.filter(
    (item) => item.status === "FOLLOW_UP",
  ).length;
  const interested = prospects.filter(
    (item) => item.status === "INTERESTED",
  ).length;

  const upcomingProspects = useMemo(() => {
    return [...prospects]
      .filter((item) => item.status !== "CONVERTED" && item.status !== "LOST")
      .sort((a, b) => {
        if (!a.nextFollowUp) return 1;
        if (!b.nextFollowUp) return -1;
        return a.nextFollowUp.localeCompare(b.nextFollowUp);
      })
      .slice(0, 3);
  }, [prospects]);

  const membershipPercentages = useMemo(() => {
    if (totalMembers === 0) {
      return [
        { label: "Active", value: 0, color: "#14E1E6" },
        { label: "Expiring Soon", value: 0, color: "#FBBF24" },
        { label: "Expired", value: 0, color: "#F87171" },
      ];
    }

    return [
      {
        label: "Active",
        value: Math.round((activeMembers / totalMembers) * 100),
        color: "#14E1E6",
      },
      {
        label: "Expiring Soon",
        value: Math.round((expiringMembers / totalMembers) * 100),
        color: "#FBBF24",
      },
      {
        label: "Expired",
        value: Math.max(
          0,
          100 -
            Math.round((activeMembers / totalMembers) * 100) -
            Math.round((expiringMembers / totalMembers) * 100),
        ),
        color: "#F87171",
      },
    ];
  }, [activeMembers, expiringMembers, totalMembers]);

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <Sidebar />

      <main className="min-h-screen pl-64">
        <Header />

        <div className="space-y-8 p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Overview</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your membership data.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => void fetchDashboardData(true)}
                disabled={!isLoaded || refreshing}
                className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-gray-300 transition hover:border-[#14E1E6] hover:text-[#14E1E6] disabled:opacity-50"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                href="/members/new"
                className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
              >
                <UserPlus size={18} />
                Add New Member
              </Link>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Members"
              value={isLoaded ? totalMembers.toLocaleString("id-ID") : "..."}
              description="All registered members"
              icon={Users}
              color="#FFFFFF"
            />
            <StatsCard
              title="Active Members"
              value={isLoaded ? activeMembers.toLocaleString("id-ID") : "..."}
              description="More than 30 days remaining"
              icon={UserCheck}
              color="#14E1E6"
            />
            <StatsCard
              title="Expiring Soon"
              value={isLoaded ? expiringMembers.toLocaleString("id-ID") : "..."}
              description="Memberships nearing expiry"
              icon={Clock}
              color="#FBBF24"
            />
            <StatsCard
              title="Expired Members"
              value={isLoaded ? expiredMembers.toLocaleString("id-ID") : "..."}
              description="Memberships already expired"
              icon={UserX}
              color="#F87171"
            />
          </section>

          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Membership Summary</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Current membership distribution
                  </p>
                </div>
                <ArrowUpRight className="text-gray-500" />
              </div>

              <div className="mt-8 space-y-5">
                {membershipPercentages.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="font-semibold text-white">
                        {isLoaded ? `${item.value}%` : "..."}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${isLoaded ? item.value : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs text-gray-500">
                Warning period: {WARNING_DAYS} days before expiration.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
              <h3 className="font-semibold">Expiry Settings</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Configure how many days before expiration a member is marked as
                expiring soon.
              </p>
              <div className="mt-6 rounded-xl bg-[#252525] p-4">
                <p className="text-xs text-gray-500">Warning period</p>
                <p className="mt-1 text-3xl font-bold text-[#14E1E6]">
                  {WARNING_DAYS} Days
                </p>
              </div>
              <Link
                href="/settings"
                className="mt-4 block w-full rounded-xl border border-white/10 py-3 text-center text-sm text-white transition hover:bg-white/5"
              >
                Manage Settings
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14E1E6]/10">
                  <UserRoundPlus size={22} className="text-[#14E1E6]" />
                </div>
                <div>
                  <h3 className="font-semibold">Prospect Follow-up</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Manage potential members and follow-up activities.
                  </p>
                </div>
              </div>
              <Link
                href="/prospects"
                className="rounded-lg border border-white/10 px-3 py-2 text-xs text-[#14E1E6] transition hover:bg-white/5"
              >
                Manage Prospects →
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Total Prospects</p>
                  <Users size={18} className="text-gray-400" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {isLoaded ? totalProspects : "..."}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  All potential members
                </p>
              </div>

              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Need Follow-up</p>
                  <CalendarClock size={18} className="text-yellow-400" />
                </div>
                <p className="mt-3 text-2xl font-bold text-yellow-400">
                  {isLoaded ? needFollowUp : "..."}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Waiting for follow-up
                </p>
              </div>

              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">Interested</p>
                  <UserCheck size={18} className="text-[#14E1E6]" />
                </div>
                <p className="mt-3 text-2xl font-bold text-[#14E1E6]">
                  {isLoaded ? interested : "..."}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Potential membership
                </p>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold">Upcoming Follow-ups</h4>
                <span className="text-xs text-gray-500">Latest prospects</span>
              </div>

              <div className="space-y-3">
                {!isLoaded ? (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Loading prospects...
                  </p>
                ) : upcomingProspects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                    <Users className="mx-auto mb-3 text-gray-500" size={28} />
                    <p className="text-sm text-gray-400">Belum ada prospek.</p>
                    <Link
                      href="/prospects"
                      className="mt-3 inline-block text-sm text-[#14E1E6] hover:underline"
                    >
                      Tambahkan prospek
                    </Link>
                  </div>
                ) : (
                  upcomingProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="flex flex-col justify-between gap-4 rounded-xl border border-white/5 bg-[#252525] p-4 transition hover:border-white/10 sm:flex-row sm:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5">
                          <Users size={18} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">
                            {prospect.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {prospect.phone} ·{" "}
                            {prospect.interest || "Belum memilih paket"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <div className="text-xs text-gray-500">
                          <p>Follow-up</p>
                          <p className="mt-1 text-white">
                            {formatFollowUpDate(prospect.nextFollowUp)}
                          </p>
                        </div>
                        <span
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${statusStyles[prospect.status]}`}
                        >
                          {statusLabels[prospect.status]}
                        </span>
                        <WhatsAppButton
                          phone={prospect.phone}
                          name={prospect.name}
                          interest={prospect.interest}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex justify-end">
                <Link
                  href="/prospects"
                  className="flex items-center gap-2 text-sm text-[#14E1E6] transition hover:underline"
                >
                  View All Prospects
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>

          <RecentMembers />
        </div>
      </main>
    </div>
  );
}
