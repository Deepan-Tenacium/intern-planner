"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className="relative group py-1">
      <span className={`text-sm font-medium transition-colors ${active ? "text-indigo-400" : "text-slate-400 hover:text-slate-100"}`}>
        {children}
      </span>
      <span
        className={`absolute -bottom-0.5 left-0 h-0.5 bg-indigo-500 rounded-full transition-all duration-250 ${active ? "w-full" : "w-0 group-hover:w-full"}`}
      />
    </Link>
  );
}
