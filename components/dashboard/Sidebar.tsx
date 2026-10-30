"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Clock,
  UserX,
  Settings,
  LogOut,
  Crown,
} from "lucide-react";

import { usePathname } from "next/navigation";

const menus = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "All Members", icon: Users, href: "/members" },
  { label: "Expiring Members", icon: Clock, href: "/members/expiring" },
  { label: "Expired Members", icon: UserX, href: "/members/expired" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-white/10 bg-[#151515] px-5 py-6">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14E1E6] text-black">
          <Crown size={22} />
        </div>

        <div>
          <h1 className="text-lg font-bold tracking-wide text-white">
            MEMBERSHIP
          </h1>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>

      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-gray-600">
        Main Menu
      </p>

      <nav className="flex flex-1 flex-col gap-2">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active =
            menu.href === "/"
              ? pathname === "/"
              : pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                active
                  ? "bg-[#14E1E6]/10 font-semibold text-[#14E1E6]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={19} />
              {menu.label}
            </Link>
          );
        })}
      </nav>

      <button className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-gray-400 transition hover:bg-red-500/10 hover:text-red-400">
        <LogOut size={19} />
        Logout
      </button>
    </aside>
  );
}
