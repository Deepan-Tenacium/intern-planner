"use client";

import { useState } from "react";
import type { Project } from "../types";

const statusStyles: Record<string, { badge: string; dot?: string }> = {
  planning:  { badge: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30" },
  active:    { badge: "bg-green-500/15 text-green-300 ring-1 ring-green-500/30", dot: "bg-green-400" },
  completed: { badge: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30" },
};
const fallbackStyle = { badge: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30" };

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function timelinePercent(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const style = statusStyles[project.status] ?? fallbackStyle;
  const pct = timelinePercent(project.start_date, project.end_date);

  return (
    <div
      className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3 card-glow animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">{project.name}</h2>
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}>
          {style.dot && (
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse-dot ${style.dot}`} />
          )}
          {project.status}
        </span>
      </div>

      {project.description && (
        <p className="text-xs text-slate-500 leading-relaxed">{project.description}</p>
      )}

      <div className="text-xs text-slate-500 space-y-1">
        <p><span className="text-slate-600">Owner</span> <span className="text-slate-400">{project.owner}</span></p>
        <p><span className="text-slate-600">Timeline</span> <span className="text-slate-400">{formatDate(project.start_date)} – {formatDate(project.end_date)}</span></p>
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Timeline progress</span>
          <span>{pct}%</span>
        </div>
        <div className="bar-track h-1.5">
          <div
            className="h-full rounded-full bg-indigo-500 animate-slide-in-bar"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

const FILTERS = ["All", "Active", "Planning", "Completed"] as const;
type Filter = typeof FILTERS[number];

export default function ProjectsClient({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = filter === "All"
    ? projects
    : projects.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

  return (
    <>
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === f
                ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500/40"
                : "text-slate-400 hover:text-slate-200 hover:bg-card"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-500 text-sm col-span-3 py-10 text-center">No projects match this filter.</p>
        )}
      </div>
    </>
  );
}
