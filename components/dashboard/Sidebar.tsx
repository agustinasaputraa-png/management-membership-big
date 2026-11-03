"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Clock,
  UserX,
  Settings,
  Crown,
  UserRoundPlus,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const menus = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "All Members", icon: Users, href: "/members" },
  { label: "Prospects", icon: UserRoundPlus, href: "/prospects" },
  { label: "Expiring Members", icon: Clock, href: "/members/expiring" },
  { label: "Expired Members", icon: UserX, href: "/members/expired" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

type SidebarProps = {
  collapsed: boolean;
  onCollapseChange: (value: boolean) => void;
};

export default function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#292929] bg-[#111111] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      {/* LOGO */}
      <div
        className={`flex h-[72px] shrink-0 items-center ${
          collapsed ? "justify-center" : "px-5"
        }`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#14E1E6] text-black">
          <Crown size={21} strokeWidth={2.5} />
        </div>

        {!collapsed && (
          <span className="ml-3 whitespace-nowrap text-lg font-bold tracking-wide text-white">
            MEMBERSHIP
          </span>
        )}
      </div>

      {/* TOGGLE */}
      <div
        className={`flex px-2 pb-3 ${
          collapsed ? "justify-center" : "justify-end"
        }`}
      >
        <button
          type="button"
          onClick={() => onCollapseChange(!collapsed)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-9 w-12 items-center justify-center rounded-xl border border-[#333333] text-[#14E1E6] transition hover:border-[#14E1E6] hover:bg-[#1c2929]"
        >
          {collapsed ? (
            <PanelLeftOpen size={18} />
          ) : (
            <PanelLeftClose size={18} />
          )}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 space-y-2 overflow-y-auto px-2">
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
              title={collapsed ? menu.label : undefined}
              className={`group relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                collapsed ? "justify-center" : "gap-3 px-4"
              } ${
                active
                  ? "bg-[#14E1E6]/15 text-[#14E1E6]"
                  : "text-[#9299A5] hover:bg-[#202020] hover:text-white"
              }`}
            >
              <Icon
                size={19}
                strokeWidth={active ? 2.3 : 1.8}
                className="shrink-0"
              />

              {!collapsed && (
                <span className="whitespace-nowrap text-sm font-medium">
                  {menu.label}
                </span>
              )}

              {collapsed && (
                <span className="pointer-events-none absolute left-[58px] z-[60] hidden whitespace-nowrap rounded-md border border-[#333333] bg-[#202020] px-3 py-2 text-xs text-white shadow-xl group-hover:block">
                  {menu.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* BOTTOM */}
      <div className="flex h-[65px] shrink-0 items-center justify-center border-t border-[#292929]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#333333] bg-black text-xs font-bold text-white">
          N
        </div>
      </div>
    </aside>
  );
}
