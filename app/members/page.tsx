"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Users,
  CalendarDays,
  Eye,
  Pencil,
  Filter,
  X,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

type Status = "Active" | "Expiring Soon" | "Expired";

type Member = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  validFrom: string;
  validUntil: string;
};

const members: Member[] = [
  {
    id: "MBR-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+62 812 3456 7890",
    dateOfBirth: "1995-04-12",
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
  },
  {
    id: "MBR-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+62 813 4567 8901",
    dateOfBirth: "1998-08-20",
    validFrom: "2025-11-01",
    validUntil: "2026-11-10",
  },
  {
    id: "MBR-003",
    name: "Michael Lee",
    email: "michael@example.com",
    phone: "+62 812 1111 2222",
    dateOfBirth: "1990-02-15",
    validFrom: "2025-01-01",
    validUntil: "2026-10-20",
  },
  {
    id: "MBR-004",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+62 878 1234 5678",
    dateOfBirth: "1997-06-09",
    validFrom: "2026-03-01",
    validUntil: "2027-02-28",
  },
  {
    id: "MBR-005",
    name: "David Wilson",
    email: "david@example.com",
    phone: "+62 822 3333 4444",
    dateOfBirth: "1992-12-01",
    validFrom: "2025-06-01",
    validUntil: "2026-11-05",
  },
];

function getMemberStatus(validUntil: string, today: Date): Status {
  const expiry = new Date(`${validUntil}T00:00:00`);

  const remainingDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / 86400000,
  );

  if (remainingDays < 0) return "Expired";
  if (remainingDays <= 30) return "Expiring Soon";

  return "Active";
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Active: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    "Expiring Soon": "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
    Expired: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  icon,
  iconColor,
}: {
  title: string;
  value: number;
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

export default function AllMembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [today, setToday] = useState<Date | null>(null);

  // Current date is read only after the component mounts.
  // This prevents Next.js prerender from evaluating the current time.
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    setToday(currentDate);
  }, []);

  const filteredMembers = useMemo(() => {
    if (!today) return [];

    return members.filter((member) => {
      const keyword = search.toLowerCase().trim();

      const matchesSearch = [
        member.id,
        member.name,
        member.email,
        member.phone,
      ].some((value) => value.toLowerCase().includes(keyword));

      const memberStatus = getMemberStatus(member.validUntil, today);

      const matchesStatus =
        statusFilter === "All" || memberStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, today]);

  const activeCount = today
    ? members.filter(
        (member) => getMemberStatus(member.validUntil, today) === "Active",
      ).length
    : 0;

  const expiringCount = today
    ? members.filter(
        (member) =>
          getMemberStatus(member.validUntil, today) === "Expiring Soon",
      ).length
    : 0;

  const expiredCount = today
    ? members.filter(
        (member) => getMemberStatus(member.validUntil, today) === "Expired",
      ).length
    : 0;

  return (
    <main className="min-h-screen bg-[#151515] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
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
              <h1 className="text-2xl font-bold sm:text-3xl">All Members</h1>

              <p className="mt-2 text-sm text-gray-400">
                Manage and monitor all registered members.
              </p>
            </div>

            <Link
              href="/members/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
            >
              <Plus size={18} />
              Add New Member
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Members"
            value={members.length}
            icon={<Users size={21} />}
            iconColor="text-[#14E1E6]"
          />

          <StatCard
            title="Active Members"
            value={activeCount}
            icon={<Users size={21} />}
            iconColor="text-emerald-400"
          />

          <StatCard
            title="Expiring Soon"
            value={expiringCount}
            icon={<Clock size={21} />}
            iconColor="text-yellow-400"
          />

          <StatCard
            title="Expired Members"
            value={expiredCount}
            icon={<CalendarDays size={21} />}
            iconColor="text-red-400"
          />
        </div>

        {/* Member Directory */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#1c1c1c]">
          <div className="flex flex-col gap-4 border-b border-white/10 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Member Directory</h2>

              <p className="mt-1 text-sm text-gray-500">
                View and manage registered members.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#151515] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#14E1E6] sm:w-64"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/10 bg-[#151515] py-3 pl-9 pr-8 text-sm text-white outline-none focus:border-[#14E1E6] sm:w-48"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Expiring Soon">Expiring Soon</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#222222] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Date of Birth</th>
                  <th className="px-5 py-4">Valid From</th>
                  <th className="px-5 py-4">Valid Until</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {!today ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No members found.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const status = getMemberStatus(member.validUntil, today);

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
                            {member.id} · {member.email}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-gray-400">
                          {member.phone}
                        </td>

                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(member.dateOfBirth)}
                        </td>

                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(member.validFrom)}
                        </td>

                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(member.validUntil)}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={status} />
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

                            <button
                              type="button"
                              title="Edit member"
                              onClick={() =>
                                alert(
                                  "Edit member will be available after backend integration.",
                                )
                              }
                              className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-[#14E1E6]/40 hover:text-[#14E1E6]"
                            >
                              <Pencil size={17} />
                            </button>
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
              Showing {filteredMembers.length} of {members.length} members
            </span>

            <span>Membership Management</span>
          </div>
        </section>
      </div>

      {/* Member Detail Modal */}
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
                  {selectedMember.id}
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#14E1E6]/10 text-xl font-bold text-[#14E1E6]">
                {selectedMember.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <h3 className="truncate font-semibold">
                  {selectedMember.name}
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  {selectedMember.id}
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={getMemberStatus(selectedMember.validUntil, today)}
                  />
                </div>
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
            </div>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="mt-7 w-full rounded-xl bg-[#14E1E6] py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
