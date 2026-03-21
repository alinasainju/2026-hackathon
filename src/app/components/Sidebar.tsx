"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, List, BarChart2, FileText, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",                label: "Log Today",      icon: Mic,       exact: true  },
  { href: "/dashboard/all-logs",       label: "All Logs",       icon: List,      exact: false },
  { href: "/dashboard/weekly-summary", label: "Weekly Summary", icon: BarChart2, exact: false },
  { href: "/dashboard/resume-ready",   label: "Resume-Ready",   icon: FileText,  exact: false },
  { href: "/dashboard/star-stories",   label: "STAR Stories",   icon: Star,      exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-stone-200 min-h-screen flex flex-col">
      {/* Wordmark */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-brand-black" />
          <span className="font-semibold text-brand-black text-sm tracking-tight">InternLog</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-brand-indigo/10 text-brand-indigo font-medium"
                  : "text-brand-grey hover:bg-stone-50 hover:text-brand-black font-normal"
              )}
            >
              <Icon className={cn(
                "w-3.5 h-3.5 shrink-0",
                isActive ? "text-brand-indigo" : "text-stone-400"
              )} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4">
        <p className="text-[11px] text-stone-400">Powered by Claude AI</p>
      </div>
    </aside>
  );
}
