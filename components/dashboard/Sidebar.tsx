"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
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
  ShieldCheck,
  History,
  LogOut,
  Loader2,
} from "lucide-react";

type SidebarProps = {
  collapsed: boolean;
  onCollapseChange: (value: boolean) => void;
};

type Profile = {
  full_name: string;
  role: "SUPER_ADMIN" | "ADMIN_PIC";
};

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const baseMenus = [
  { label: "Overview", icon: LayoutDashboard, href: "/" },
  { label: "All Members", icon: Users, href: "/members" },
  { label: "Prospects", icon: UserRoundPlus, href: "/prospects" },
  { label: "Expiring Members", icon: Clock, href: "/members/expiring" },
  { label: "Expired Members", icon: UserX, href: "/members/expired" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

const adminMenus = [
  { label: "User Management", icon: ShieldCheck, href: "/users" },
  { label: "Activity Logs", icon: History, href: "/activity-logs" },
];

export default function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/me")
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((result) => {
        if (active && result?.user) {
          setProfile(result.user);
        }
      })
      .catch(() => {
        if (active) setProfile(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    const confirmed = window.confirm("Apakah kamu yakin ingin logout?");

    if (!confirmed) return;

    setLoggingOut(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setProfile(null);
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout gagal. Silakan coba kembali.");
      setLoggingOut(false);
    }
  };

  const menus =
    profile?.role === "SUPER_ADMIN" ? [...baseMenus, ...adminMenus] : baseMenus;

  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#292929] bg-[#111111] transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
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

      <div className="shrink-0 border-t border-[#292929] p-3">
        <div
          className={`mb-3 flex items-center ${
            collapsed ? "justify-center" : "gap-3 px-2"
          }`}
        >
          <div
            title={profile?.full_name ?? "Administrator"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#333333] bg-black text-xs font-bold text-white"
          >
            {(profile?.full_name?.[0] ?? "A").toUpperCase()}
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white">
                {profile?.full_name ?? "Administrator"}
              </p>
              <p className="text-[10px] text-[#737B88]">
                {profile?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : "Admin Account"}
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Logout"
          className={`flex h-10 w-full items-center rounded-xl text-red-400 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 ${
            collapsed ? "justify-center" : "gap-3 px-3"
          }`}
        >
          {loggingOut ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <LogOut size={19} />
          )}

          {!collapsed && (
            <span className="text-sm font-medium">
              {loggingOut ? "Logging out..." : "Logout"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
