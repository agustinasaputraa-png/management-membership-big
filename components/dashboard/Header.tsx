import { Bell, Search } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 px-8">
      <div>
        <p className="text-sm text-gray-500">Pages / Overview</p>
        <h2 className="text-xl font-semibold text-white">Dashboard</h2>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14E1E6]/15 font-semibold text-[#14E1E6]">
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">Administrator</p>
            <p className="text-xs text-gray-500">Admin Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
