"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
} from "lucide-react";

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

type Status = "Active" | "Expiring Soon" | "Expired";

function getMemberStatus(validUntil: string): Status {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${validUntil}T00:00:00`);
  const remainingDays = Math.ceil(
    (expiry.getTime() - today.getTime()) / 86400000,
  );

  if (remainingDays < 0) return "Expired";
  if (remainingDays <= 30) return "Expiring Soon";

  return "Active";
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AllMembersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const keyword = search.toLowerCase();

      const matchesSearch = [
        member.id,
        member.name,
        member.email,
        member.phone,
      ].some((value) => value.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "All" ||
        getMemberStatus(member.validUntil) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const activeCount = members.filter(
    (member) => getMemberStatus(member.validUntil) === "Active",
  ).length;

  const expiringCount = members.filter(
    (member) => getMemberStatus(member.validUntil) === "Expiring Soon",
  ).length;

  const expiredCount = members.filter(
    (member) => getMemberStatus(member.validUntil) === "Expired",
  ).length;

  return (
    <div className="min-h-screen bg-[#151515] p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-[#14E1E6]"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#14E1E6]/10 text-[#14E1E6]">
              <Users size={24} />
            </div>

            <h1 className="text-2xl font-bold">All Members</h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage and monitor all registered members.
            </p>
          </div>

          <Link
            href="/members/new"
            className="flex items-center gap-2 rounded-xl bg-[#14E1E6] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#0fcbd0]"
          >
            <Plus size={18} />
            Add New Member
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Members",
              value: members.length,
              color: "text-white",
            },
            { label: "Active", value: activeCount, color: "text-[#14E1E6]" },
            {
              label: "Expiring Soon",
              value: expiringCount,
              color: "text-yellow-400",
            },
            { label: "Expired", value: expiredCount, color: "text-red-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5"
            >
              <p className="text-sm text-gray-500">{item.label}</p>
              <h2 className={`mt-3 text-3xl font-bold ${item.color}`}>
                {item.value}
              </h2>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1D1D1D] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone or member ID..."
              className="w-full rounded-xl border border-white/10 bg-[#252525] py-3 pl-11 pr-10 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#14E1E6]"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Filter size={18} className="text-gray-500" />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6] sm:w-48"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
          <div className="flex items-center justify-between border-b border-white/10 p-5">
            <div>
              <h2 className="font-semibold">Member Directory</h2>
              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredMembers.length} of {members.length} members
              </p>
            </div>

            <CalendarDays size={20} className="text-gray-500" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left text-sm">
              <thead className="bg-white/[0.02] text-xs uppercase text-gray-500">
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

              <tbody>
                {filteredMembers.map((member) => {
                  const status = getMemberStatus(member.validUntil);

                  return (
                    <tr
                      key={member.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#14E1E6]/10 font-semibold text-[#14E1E6]">
                            {member.name.charAt(0)}
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {member.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {member.email}
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                              {member.id}
                            </p>
                          </div>
                        </div>
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
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
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

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            title="View member"
                            onClick={() => setSelectedMember(member)}
                            className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-[#14E1E6]/30 hover:text-[#14E1E6]"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            title="Edit member"
                            onClick={() =>
                              alert("Edit Member akan kita buat berikutnya.")
                            }
                            className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-yellow-400/30 hover:text-yellow-400"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <Users size={32} className="mx-auto mb-3 text-gray-600" />
                      <p className="font-medium text-gray-300">
                        No members found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try another search keyword or status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Member Detail Modal */}
        {selectedMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setSelectedMember(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#202020] p-6"
              onClick={(e) => e.stopPropagation()}
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
                  ["Member ID", selectedMember.id],
                  ["Full Name", selectedMember.name],
                  ["Email", selectedMember.email],
                  ["Phone", selectedMember.phone],
                  ["Date of Birth", formatDate(selectedMember.dateOfBirth)],
                  ["Valid From", formatDate(selectedMember.validFrom)],
                  ["Valid Until", formatDate(selectedMember.validUntil)],
                  ["Status", getMemberStatus(selectedMember.validUntil)],
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

              <button
                onClick={() => setSelectedMember(null)}
                className="mt-7 w-full rounded-xl bg-[#14E1E6] py-3 text-sm font-semibold text-black"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
