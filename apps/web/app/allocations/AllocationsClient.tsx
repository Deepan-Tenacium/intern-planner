"use client";

import { useState } from "react";
import type { Allocation } from "../types";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface Row {
  allocation: Allocation;
  internName: string;
  projectName: string;
}

export default function AllocationsClient({ rows }: { rows: Row[] }) {
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? rows.filter((r) => r.internName.toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <>
      <div className="mb-5">
        <input
          type="text"
          placeholder="Filter by intern name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 bg-card border border-card-border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
      </div>

      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-card-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Intern</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hrs / wk</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">End</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={row.allocation.id}
                className={`border-b border-card-border last:border-0 hover:bg-indigo-500/5 transition-colors ${
                  i % 2 === 1 ? "bg-white/[0.015]" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30">
                    {row.internName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30">
                    {row.projectName}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300 font-medium tabular-nums">{row.allocation.hours_per_week}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(row.allocation.start_date)}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(row.allocation.end_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        </div>
        {filtered.length === 0 && (
          <p className="text-center text-slate-600 py-10 text-sm">
            {search ? "No interns match your search." : "No allocations yet."}
          </p>
        )}
      </div>
    </>
  );
}
