"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#151515] text-white">
      <Sidebar collapsed={collapsed} onCollapseChange={setCollapsed} />

      <main
        className={`min-h-screen min-w-0 transition-[margin] duration-300 ease-in-out ${
          collapsed ? "ml-[72px]" : "ml-64"
        }`}
      >
        <Header />

        <div className="min-w-0 w-full">{children}</div>
      </main>
    </div>
  );
}
