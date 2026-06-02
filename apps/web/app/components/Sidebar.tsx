"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10.5" y="1" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="1" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10.5" y="10.5" width="6.5" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/interns",
    label: "Interns",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 15c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13.5" cy="5.5" r="2.25" stroke="currentColor" strokeWidth="1.25" />
        <path d="M13.5 11c1.5 0 3.5 0.9 3.5 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/projects",
    label: "Projects",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path d="M1 4.5C1 3.672 1.672 3 2.5 3H7l2 2.5h6.5C16.328 5.5 17 6.172 17 7v7.5C17 15.328 16.328 16 15.5 16h-13C1.672 16 1 15.328 1 14.5V4.5z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/allocations",
    label: "Allocations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="3" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 7h16" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6 1v4M12 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="4" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="7.75" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
        <rect x="11.5" y="10" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/workload",
    label: "Workload",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="1" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5.5" y="6" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14.5" y="7" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export default function Sidebar({ open, onClose, isMobile }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      className={`fixed top-0 left-0 h-screen w-60 bg-nav border-r border-card-border flex flex-col z-50 transition-transform duration-200 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo area */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-card-border shrink-0">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
          <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="none" stroke="#6366f1" strokeWidth="1.5" />
          <polygon points="13,6 20,10 20,16 13,20 6,16 6,10" fill="#6366f1" opacity="0.25" />
          <circle cx="13" cy="13" r="3" fill="#6366f1" />
        </svg>
        <span className="text-white text-[15px] font-semibold tracking-tight">
          Intern Planner
        </span>

        {/* Close button — mobile only */}
        {isMobile && (
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded text-slate-500 hover:text-slate-200 transition-colors"
            aria-label="Close navigation"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                active
                  ? "bg-indigo-500 text-white font-medium"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#1e2130]"
              }`}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      {session?.user && (
        <div className="px-5 py-3.5 border-t border-card-border shrink-0">
          <p className="text-[13px] font-medium text-slate-100 mb-1">
            {session.user.name ?? session.user.email}
          </p>
          <div className="mb-2.5">
            {(session.user as any).role === "manager" ? (
              <span className="inline-block bg-indigo-900/60 text-indigo-300 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Manager
              </span>
            ) : (
              <span className="inline-block bg-[#1e2130] text-slate-400 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                Intern
              </span>
            )}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-500 text-xs hover:text-red-400 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Bottom branding */}
      <div className="px-5 py-3 border-t border-card-border shrink-0">
        <p className="text-slate-500 text-xs font-medium">Tenacium</p>
        <p className="text-slate-500 text-[11px] mt-0.5">v1.0</p>
      </div>
    </aside>
  );
}
