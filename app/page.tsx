import {
  Users,
  UserCheck,
  Clock,
  UserX,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentMembers from "@/components/dashboard/RecentMembers";
import Link from "next/link";

export default function DashboardPage() {
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

            <Link
              href="/members/new"
              className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
            >
              <UserPlus size={18} />
              Add New Member
            </Link>
          </div>

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
                {[
                  { label: "Active", value: 78, color: "#14E1E6" },
                  { label: "Expiring Soon", value: 18, color: "#FBBF24" },
                  { label: "Expired", value: 4, color: "#F87171" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-gray-400">{item.label}</span>
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

            <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-6">
              <h3 className="font-semibold">Expiry Settings</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Configure how many days before expiration a member is marked as
                expiring soon.
              </p>

              <div className="mt-6 rounded-xl bg-[#252525] p-4">
                <p className="text-xs text-gray-500">Warning period</p>
                <p className="mt-1 text-3xl font-bold text-[#14E1E6]">
                  30 Days
                </p>
              </div>

              <button className="mt-4 w-full rounded-xl border border-white/10 py-3 text-sm text-white transition hover:bg-white/5">
                Manage Settings
              </button>
            </div>
          </section>

          <RecentMembers />
        </div>
      </main>
    </div>
  );
}
