"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (status === "loading") {
    return null;
  }

  return (
    <>
      <Sidebar
        open={isDesktop || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={!isDesktop}
      />

      {/* Mobile overlay backdrop */}
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main
        className={`min-h-screen px-4 py-6 sm:px-6 sm:py-8 overflow-x-hidden transition-[margin] duration-200 ${
          isDesktop ? "ml-60" : "ml-0"
        }`}
      >
        {/* Mobile hamburger */}
        {!isDesktop && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mb-4 p-2 rounded-lg bg-card border border-card-border text-slate-400 hover:text-slate-100 transition-colors"
            aria-label="Open navigation"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {children}
      </main>
    </>
  );
}
