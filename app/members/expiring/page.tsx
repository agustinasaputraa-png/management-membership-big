"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Clock,
  CalendarDays,
  Phone,
  Mail,
  Eye,
  X,
  MessageCircle,
  AlertTriangle,
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

function getDaysRemaining(validUntil: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(`${validUntil}T00:00:00`);

  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getWhatsAppLink(phone: string, name: string) {
  const number = phone.replace(/\D/g, "");
  const message = `Halo ${name}, kami ingin mengingatkan bahwa masa membership Anda akan segera berakhir. Silakan hubungi kami untuk informasi perpanjangan.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function ExpiringMembersPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState(30);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const expiringMembers = useMemo(() => {
    return members
      .filter((member) => {
        const days = getDaysRemaining(member.validUntil);
        return days >= 0 && days <= period;
      })
      .filter((member) => {
        const keyword = search.toLowerCase();

        return [member.id, member.name, member.email, member.phone].some(
          (value) => value.toLowerCase().includes(keyword),
        );
      })
      .sort(
        (a, b) =>
          getDaysRemaining(a.validUntil) - getDaysRemaining(b.validUntil),
      );
  }, [search, period]);

  const allExpiringCount = members.filter((member) => {
    const days = getDaysRemaining(member.validUntil);
    return days >= 0 && days <= 30;
  }).length;

  const urgentCount = members.filter((member) => {
    const days = getDaysRemaining(member.validUntil);
    return days >= 0 && days <= 7;
  }).length;

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

        {/* Page Header */}
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
            <p className="text-xs text-gray-500">Current warning period</p>
            <p className="mt-1 text-lg font-bold text-yellow-400">30 Days</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#1D1D1D] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Expiring Within 30 Days</p>
              <CalendarDays className="text-yellow-400" size={21} />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-yellow-400">
              {allExpiringCount}
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
              {urgentCount}
            </h2>
            <p className="mt-2 text-xs text-gray-500">
              Members requiring immediate follow-up
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1D1D1D] p-5 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member name, email or phone..."
              className="w-full rounded-xl border border-white/10 bg-[#252525] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#14E1E6]"
            />
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="rounded-xl border border-white/10 bg-[#252525] px-4 py-3 text-sm text-white outline-none focus:border-[#14E1E6]"
          >
            <option value={7}>Next 7 Days</option>
            <option value={14}>Next 14 Days</option>
            <option value={30}>Next 30 Days</option>
          </select>
        </div>

        {/* Member Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">Upcoming Expirations</h2>
            <p className="mt-1 text-xs text-gray-500">
              Showing {expiringMembers.length} members
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
                {expiringMembers.map((member) => {
                  const days = getDaysRemaining(member.validUntil);
                  const urgent = days <= 7;

                  return (
                    <tr
                      key={member.id}
                      className="border-t border-white/5 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14E1E6]/10 font-semibold text-[#14E1E6]">
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
                        <span className="rounded-full bg-yellow-400/10 px-3 py-1.5 text-xs font-medium text-yellow-400">
                          Expiring Soon
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            title="View member"
                            onClick={() => setSelectedMember(member)}
                            className="rounded-lg border border-white/10 p-2 text-gray-400 hover:text-[#14E1E6]"
                          >
                            <Eye size={16} />
                          </button>

                          <a
                            href={getWhatsAppLink(member.phone, member.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Contact via WhatsApp"
                            className="rounded-lg border border-green-500/20 p-2 text-green-400 hover:bg-green-500/10"
                          >
                            <MessageCircle size={16} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {expiringMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Clock size={32} className="mx-auto mb-3 text-gray-600" />
                      <p className="font-medium text-gray-300">
                        No expiring members found
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Try changing the period or search keyword.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
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
                  ["Name", selectedMember.name],
                  ["Email", selectedMember.email],
                  ["Phone", selectedMember.phone],
                  ["Date of Birth", formatDate(selectedMember.dateOfBirth)],
                  ["Valid From", formatDate(selectedMember.validFrom)],
                  ["Valid Until", formatDate(selectedMember.validUntil)],
                  [
                    "Remaining",
                    `${getDaysRemaining(selectedMember.validUntil)} days`,
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
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600"
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
