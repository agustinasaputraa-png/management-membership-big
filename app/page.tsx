"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentMembers from "@/components/dashboard/RecentMembers";
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

function formatFollowUpDate(date: string) {
  if (!date) return "Belum dijadwalkan";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Tanggal tidak valid";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    function loadProspects() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
          setProspects([]);
          return;
        }

        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setProspects(parsed);
        } else {
          setProspects([]);
        }
      } catch (error) {
        console.error("Gagal membaca data prospek:", error);
        setProspects([]);
      } finally {
        setIsLoaded(true);
      }
    }

    loadProspects();

    // Update ketika localStorage berubah dari tab browser lain.
    window.addEventListener("storage", loadProspects);

    // Update ketika ada perubahan dari halaman Prospects
    // pada tab yang sama.
    window.addEventListener("prospects-updated", loadProspects);

    // Update kembali ketika pengguna kembali ke tab ini.
    window.addEventListener("focus", loadProspects);

    return () => {
      window.removeEventListener("storage", loadProspects);
      window.removeEventListener("prospects-updated", loadProspects);
      window.removeEventListener("focus", loadProspects);
    };
  }, []);

  const totalProspects = prospects.length;

  const needFollowUp = prospects.filter(
    (item) => item.status === "FOLLOW_UP",
  ).length;

  const interested = prospects.filter(
    (item) => item.status === "INTERESTED",
  ).length;

  const upcomingProspects = useMemo(() => {
    return [...prospects]
      .filter(
        (item) =>
          item.status !== "CONVERTED" &&
          item.status !== "LOST",
      )
      .sort((a, b) => {
        if (!a.nextFollowUp) return 1;
        if (!b.nextFollowUp) return -1;

        return a.nextFollowUp.localeCompare(b.nextFollowUp);
      })
      .slice(0, 3);
  }, [prospects]);

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <Sidebar />

      <main className="min-h-screen pl-64">
        <Header />

        <div className="space-y-8 p-8">

          {/* PAGE HEADER */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Overview</h1>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage your membership data.
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

          {/* MEMBERSHIP STATISTICS */}
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              title="Total Members"
              value="1,250"
              description="All registered members"
              icon={Users}
              color="#FFFFFF"
            />

            <StatsCard
              title="Active Members"
              value="980"
              description="Currently active memberships"
              icon={UserCheck}
              color="#14E1E6"
            />

            <StatsCard
              title="Expiring Soon"
              value="45"
              description="Memberships nearing expiry"
              icon={Clock}
              color="#FBBF24"
            />

            <StatsCard
              title="Expired Members"
              value="225"
              description="Memberships already expired"
              icon={UserX}
              color="#F87171"
            />
          </section>

          {/* MEMBERSHIP SUMMARY */}
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6 xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">
                    Membership Summary
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Current membership distribution
                  </p>
                </div>

                <ArrowUpRight className="text-gray-500" />
              </div>

              <div className="mt-8 space-y-5">
                {[
                  {
                    label: "Active",
                    value: 78,
                    color: "#14E1E6",
                  },
                  {
                    label: "Expiring Soon",
                    value: 18,
                    color: "#FBBF24",
                  },
                  {
                    label: "Expired",
                    value: 4,
                    color: "#F87171",
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-400">
                        {item.label}
                      </span>

                      <span className="font-semibold text-white">
                        {item.value}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPIRY SETTINGS */}
            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
              <h3 className="font-semibold">
                Expiry Settings
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Configure how many days before expiration a member
                is marked as expiring soon.
              </p>

              <div className="mt-6 rounded-xl bg-[#252525] p-4">
                <p className="text-xs text-gray-500">
                  Warning period
                </p>

                <p className="mt-1 text-3xl font-bold text-[#14E1E6]">
                  30 Days
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

          {/* PROSPECT FOLLOW-UP */}
          <section className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">

            {/* SECTION HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14E1E6]/10">
                  <UserRoundPlus
                    size={22}
                    className="text-[#14E1E6]"
                  />
                </div>

                <div>
                  <h3 className="font-semibold">
                    Prospect Follow-up
                  </h3>

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

            {/* PROSPECT STATISTICS */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

              {/* TOTAL PROSPECTS */}
              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Total Prospects
                  </p>

                  <Users size={18} className="text-gray-400" />
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {isLoaded ? totalProspects : "..."}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  All potential members
                </p>
              </div>

              {/* NEED FOLLOW-UP */}
              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Need Follow-up
                  </p>

                  <CalendarClock
                    size={18}
                    className="text-yellow-400"
                  />
                </div>

                <p className="mt-3 text-2xl font-bold text-yellow-400">
                  {isLoaded ? needFollowUp : "..."}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Waiting for follow-up
                </p>
              </div>

              {/* INTERESTED */}
              <div className="rounded-xl bg-[#252525] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Interested
                  </p>

                  <UserCheck
                    size={18}
                    className="text-[#14E1E6]"
                  />
                </div>

                <p className="mt-3 text-2xl font-bold text-[#14E1E6]">
                  {isLoaded ? interested : "..."}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Potential membership
                </p>
              </div>
            </div>

            {/* UPCOMING FOLLOW-UPS */}
            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-semibold">
                  Upcoming Follow-ups
                </h4>

                <span className="text-xs text-gray-500">
                  Latest prospects
                </span>
              </div>

              <div className="space-y-3">

                {!isLoaded ? (
                  <p className="py-6 text-center text-sm text-gray-500">
                    Loading prospects...
                  </p>
                ) : upcomingProspects.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
                    <Users
                      className="mx-auto mb-3 text-gray-500"
                      size={28}
                    />

                    <p className="text-sm text-gray-400">
                      Belum ada prospek.
                    </p>

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
                          <Users
                            size={18}
                            className="text-gray-400"
                          />
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
                            {formatFollowUpDate(
                              prospect.nextFollowUp,
                            )}
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

              {/* VIEW ALL */}
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

          {/* RECENT MEMBERS */}
          <RecentMembers />

        </div>
      </main>
    </div>
  );
}
