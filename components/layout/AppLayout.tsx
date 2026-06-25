"use client";

import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import RibbonTrail from "../ui/RibbonTrail";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // If auth is loading, we can show a simple spinner or just the background
  if (status === "loading") {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#04060e] text-[#eef2ff] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const isAuthPage = pathname === "/signin" || pathname === "/register" || pathname === "/forgot-password";

  if (!session || isAuthPage) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#04060e] text-[#eef2ff]">
        <div className="bg-mesh"></div>
        <div className="bg-grid"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="bg-orb bg-orb-3"></div>
        <RibbonTrail />
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#04060e] text-[#eef2ff]">
      {/* Background Mesh */}
      <div className="bg-mesh"></div>
      <div className="bg-grid"></div>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="app-layout active flex">
        <Sidebar />
        <main className="main-content flex-1 min-w-0">
          <Topbar />
          <div className="page-section active pb-12 min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
