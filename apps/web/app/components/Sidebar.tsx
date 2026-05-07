"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 4.5C1 3.672 1.672 3 2.5 3H7l2 2.5h6.5C16.328 5.5 17 6.172 17 7v7.5C17 15.328 16.328 16 15.5 16h-13C1.672 16 1 15.328 1 14.5V4.5z" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/allocations",
    label: "Allocations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="10" width="3" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5.5" y="6" width="3" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="10" y="3" width="3" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14.5" y="7" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <aside
      style={{
        width: 240,
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        backgroundColor: "#13151f",
        borderRight: "1px solid #2a2d3a",
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 20px",
          borderBottom: "1px solid #2a2d3a",
          flexShrink: 0,
        }}
      >
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="13,1 25,7 25,19 13,25 1,19 1,7" fill="none" stroke="#6366f1" strokeWidth="1.5" />
          <polygon points="13,6 20,10 20,16 13,20 6,16 6,10" fill="#6366f1" opacity="0.25" />
          <circle cx="13" cy="13" r="3" fill="#6366f1" />
        </svg>
        <span style={{ color: "#ffffff", fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>
          Intern Planner
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "12px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, label, icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "#ffffff" : "#94a3b8",
                backgroundColor: active ? "#6366f1" : "transparent",
                transition: "color 0.15s, background-color 0.15s",
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "#1e2130";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
                }
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #2a2d3a",
          flexShrink: 0,
        }}
      >
        <div style={{ color: "#64748b", fontSize: 12, fontWeight: 500 }}>Tenacium</div>
        <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>v1.0</div>
      </div>
    </aside>
  );
}
