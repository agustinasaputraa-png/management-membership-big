const members = [
  {
    name: "John Doe",
    email: "john@example.com",
    number: "MBR-001",
    expiry: "15 Nov 2026",
    status: "Active",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    number: "MBR-002",
    expiry: "02 Nov 2026",
    status: "Expiring Soon",
  },
  {
    name: "Michael Lee",
    email: "michael@example.com",
    number: "MBR-003",
    expiry: "20 Oct 2026",
    status: "Expired",
  },
];

export default function RecentMembers() {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#1D1D1D]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h3 className="font-semibold text-white">Recent Members</h3>
          <p className="mt-1 text-xs text-gray-500">
            Latest membership records
          </p>
        </div>

        <button className="text-sm font-medium text-[#14E1E6] hover:underline">
          View All
        </button>
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
            {members.map((member) => (
              <tr
                key={member.number}
                className="border-t border-white/5 text-gray-300 hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4">
                  <p className="font-medium text-white">{member.name}</p>
                  <p className="mt-1 text-xs text-gray-500">{member.email}</p>
                </td>

                <td className="px-5 py-4 text-gray-400">{member.number}</td>

                <td className="px-5 py-4">{member.expiry}</td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      member.status === "Active"
                        ? "bg-green-500/10 text-green-400"
                        : member.status === "Expired"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {member.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
