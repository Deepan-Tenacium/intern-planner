"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Allocation, Intern, Project } from "./types";
import { useToast } from "./components/Toast";
import { getLoadStatus, statusHex, statusBgHex } from "./lib/workload";
import type { LoadStatus } from "./lib/workload";
import { initials, formatDateShort } from "./lib/utils";
import { IconTrash } from "./components/Icons";

interface Props {
  initialInterns: Intern[];
  initialProjects: Project[];
  initialAllocations: Allocation[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const avatarPalette = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#3b82f6", "#10b981", "#f43f5e",
];

function avatarColor(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return avatarPalette[h % avatarPalette.length];
}

function timelineProgress(start: string, end: string): number {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVal(Math.round(p * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

// ── Icons (inline SVG) ────────────────────────────────────────────────────────

const IconPerson = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 18c0-4.418 3.582-7 8-7s8 2.582 8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconFolder = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2 5.5C2 4.672 2.672 4 3.5 4H8l2 2.5h6.5C17.328 6.5 18 7.172 18 8v8.5C18 17.328 17.328 18 16.5 18h-13C2.672 18 2 17.328 2 16.5V5.5z" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 8h16" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="5" y="11" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
    <rect x="8.75" y="11" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
    <rect x="12.5" y="11" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
  </svg>
);
const IconWarning = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M9.134 3.527c.39-.703 1.342-.703 1.732 0l6.598 11.878C17.847 16.1 17.376 17 16.598 17H3.402c-.778 0-1.249-.9-.866-1.595L9.134 3.527z" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 8v4M10 13.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
// ── Stat Tile ─────────────────────────────────────────────────────────────────

function StatTile({
  label, value, icon, red, delay, suffix = "", onClick, sub,
}: {
  label: string; value: number; icon: React.ReactNode;
  red?: boolean; delay: number; suffix?: string;
  onClick?: () => void; sub?: string;
}) {
  const counted = useCountUp(value);
  const isRed = red && value > 0;
  return (
    <div
      onClick={onClick}
      className={`animate-pop-in rounded-xl border p-5 relative overflow-hidden card-glow${onClick ? " cursor-pointer hover:opacity-90 transition-opacity" : ""}`}
      style={{
        animationDelay: `${delay}ms`,
        backgroundColor: isRed ? "rgba(239,68,68,0.08)" : "rgba(99,102,241,0.06)",
        borderColor: isRed ? "rgba(239,68,68,0.3)" : "#2a2d3a",
      }}
    >
      <div
        className="absolute top-4 right-4 opacity-20"
        style={{ color: isRed ? "#ef4444" : "#6366f1" }}
      >
        {icon}
      </div>
      <p
        className="text-3xl font-bold tabular-nums"
        style={{ color: isRed ? "#ef4444" : "#f1f5f9" }}
      >
        {counted}{suffix}
      </p>
      <p className="text-xs text-slate-400 mt-1.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-indigo-400 mt-1">{sub}</p>}
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div style={{ width: 3, height: 16, backgroundColor: "#6366f1", borderRadius: 2, flexShrink: 0 }} />
      <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{children}</h2>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ pct, color, animate }: { pct: number; color: string; animate: boolean }) {
  return (
    <div className="bar-track h-1.5 w-full" style={{ background: "rgba(42,45,58,0.8)" }}>
      <div
        style={{
          height: "100%",
          width: animate ? `${pct}%` : "0%",
          backgroundColor: color,
          borderRadius: 9999,
          transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardClient({ initialInterns, initialProjects, initialAllocations }: Props) {
  const router = useRouter();
  const [interns] = useState<Intern[]>(initialInterns);
  const [projects] = useState<Project[]>(initialProjects);
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [barsReady, setBarsReady] = useState(false);
  const [removedAllocIds, setRemovedAllocIds] = useState<Set<number>>(new Set());
  const [confirmRecentDeleteId, setConfirmRecentDeleteId] = useState<number | null>(null);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const t = setTimeout(() => setBarsReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  async function handleRemoveAlloc(id: number) {
    try {
      const res = await fetch(`/api/proxy/allocations/${id}`, { method: "DELETE" });
      if (res.status === 401 || res.status === 403) {
        showToast("Session expired. Please log in again.", "error");
        return;
      }
      if (!res.ok) throw new Error();
      setRemovedAllocIds((prev) => new Set([...prev, id]));
      showToast("Allocation removed", "success");
    } catch {
      showToast("Failed to remove allocation", "error");
    } finally {
      setConfirmRecentDeleteId(null);
    }
  }

  // Derived maps
  const allocatedMap = new Map<number, number>();
  for (const a of allocations) {
    allocatedMap.set(a.intern_id, (allocatedMap.get(a.intern_id) ?? 0) + a.hours_per_week);
  }

  const internMap = new Map(interns.map((i) => [i.id, i]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  // Stats
  const overloaded = interns.filter((i) => getLoadStatus(allocatedMap.get(i.id) ?? 0) === "red").length;
  const totalAllocHrs = [...allocatedMap.values()].reduce((s, v) => s + v, 0);
  const avgHrs = interns.length > 0 ? Math.round(totalAllocHrs / interns.length) : 0;

  // Active projects
  const activeProjects = projects.filter((p) => p.status === "active");
  const allocCountByProject = new Map<number, number>();
  for (const a of allocations) {
    allocCountByProject.set(a.project_id, (allocCountByProject.get(a.project_id) ?? 0) + 1);
  }

  // Recent allocations (last 5, excluding locally removed)
  const recentAllocs = [...allocations]
    .filter((a) => !removedAllocIds.has(a.id))
    .slice(-5)
    .reverse();

  // Cohort grouping — keyed by month+year so same-month interns merge
  const cohortMap = new Map<string, Intern[]>();
  for (const intern of interns) {
    const key = new Date(intern.cohort_start).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
    if (!cohortMap.has(key)) cohortMap.set(key, []);
    cohortMap.get(key)!.push(intern);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your intern cohort</p>
      </div>

      {/* ── ROW 1: Stat Tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatTile label="Total Interns"      value={interns.length}     icon={<IconPerson />}   delay={0}   />
        <StatTile label="Total Projects"     value={projects.length}    icon={<IconFolder />}   delay={60}  />
        <StatTile label="Total Allocations"  value={allocations.length} icon={<IconCalendar />} delay={120} />
        <StatTile label="Overloaded"         value={overloaded}         icon={<IconWarning />}  delay={180} red onClick={() => router.push("/workload")} sub="→ View workload" />
        <StatTile label="Avg hrs / week"     value={avgHrs}             icon={<IconClock />}    delay={240} suffix=" hrs" />
      </div>

      {/* ── ROW 2: Active Projects + Workload Snapshot ── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Active Projects — 2/3 */}
        <div className="col-span-2 bg-card border border-card-border rounded-xl p-5">
          <SectionHeader>Active Projects</SectionHeader>
          <div className="space-y-1">
            {activeProjects.length === 0 ? (
              <p className="text-sm text-slate-500">No active projects.</p>
            ) : (
              activeProjects.map((p, i) => {
                const pct = timelineProgress(p.start_date, p.end_date);
                const count = allocCountByProject.get(p.id) ?? 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => router.push("/projects")}
                    className="animate-fade-in flex items-center gap-4 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-100 truncate">{p.name}</span>
                        <span className="text-xs text-slate-500 shrink-0 ml-3">{p.owner}</span>
                      </div>
                      <ProgressBar pct={pct} color="#6366f1" animate={barsReady} />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-600">{formatDateShort(p.start_date)}</span>
                        <span className="text-xs text-slate-600">{formatDateShort(p.end_date)}</span>
                      </div>
                    </div>
                    <div
                      className="shrink-0 text-xs font-medium px-2 py-1 rounded-md"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                    >
                      {count} intern{count !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => router.push("/projects")}
            className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View all projects →
          </button>
        </div>

        {/* Workload Snapshot — 1/3 */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader>Workload Snapshot</SectionHeader>
          <div className="space-y-3">
            {interns.length === 0 ? (
              <p className="text-sm text-slate-500">No interns yet.</p>
            ) : (
              interns.map((intern, i) => {
                const hrs = allocatedMap.get(intern.id) ?? 0;
                const status = getLoadStatus(hrs);
                const pct = Math.min(Math.round((hrs / intern.weekly_capacity_hours) * 100), 100);
                return (
                  <div
                    key={intern.id}
                    onClick={() => router.push(`/interns/${intern.id}`)}
                    className="animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-slate-300 truncate max-w-[120px]">{intern.name}</span>
                      <span className="text-xs font-medium" style={{ color: statusHex[status] }}>
                        {hrs}/{intern.weekly_capacity_hours}h
                      </span>
                    </div>
                    <ProgressBar pct={pct} color={statusHex[status]} animate={barsReady} />
                  </div>
                );
              })
            )}
          </div>
          <button
            onClick={() => router.push("/workload")}
            className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View full workload →
          </button>
        </div>
      </div>

      {/* ── ROW 3: Recent Allocations + Cohort Overview ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent Allocations */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader>Recent Allocations</SectionHeader>
          <div className="space-y-2">
            {recentAllocs.length === 0 ? (
              <p className="text-sm text-slate-500">No allocations yet.</p>
            ) : (
              recentAllocs.map((a, i) => {
                const intern = internMap.get(a.intern_id);
                const project = projectMap.get(a.project_id);
                const name = intern?.name ?? `Intern #${a.intern_id}`;
                const color = avatarColor(name);
                const isConfirming = confirmRecentDeleteId === a.id;
                return (
                  <div
                    key={a.id}
                    className="animate-fade-in flex items-center gap-3 py-2 rounded-lg px-2 -mx-2 cursor-pointer hover:bg-white/5 transition-colors group"
                    style={{ animationDelay: `${i * 60}ms` }}
                    onClick={() => router.push(`/interns/${a.intern_id}`)}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                      style={{ backgroundColor: `${color}22`, color }}
                    >
                      {initials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">
                        <span className="font-medium">{name}</span>
                        <span className="text-slate-500 mx-1.5">→</span>
                        <span className="text-slate-300">{project?.name ?? `Project #${a.project_id}`}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDateShort(a.start_date)} – {formatDateShort(a.end_date)}
                      </p>
                    </div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded shrink-0"
                      style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}
                    >
                      {a.hours_per_week}h/wk
                    </span>
                    {/* Remove */}
                    {isConfirming ? (
                      <div
                        className="flex items-center gap-1 text-xs shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-slate-400">Sure?</span>
                        <button
                          onClick={() => handleRemoveAlloc(a.id)}
                          className="px-1.5 py-0.5 rounded text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmRecentDeleteId(null)}
                          className="px-1.5 py-0.5 rounded text-slate-400 hover:bg-white/5 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmRecentDeleteId(a.id); }}
                        className="text-slate-700 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 shrink-0"
                        title="Remove allocation"
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cohort Overview */}
        <div className="bg-card border border-card-border rounded-xl p-5">
          <SectionHeader>Cohort Overview</SectionHeader>
          <div className="space-y-6">
            {cohortMap.size === 0 ? (
              <p className="text-sm text-slate-500">No interns yet.</p>
            ) : (
              [...cohortMap.entries()].map(([cohortLabel, members]) => {
                const available = members.filter((m) => getLoadStatus(allocatedMap.get(m.id) ?? 0) === "green").length;
                const atCap     = members.filter((m) => getLoadStatus(allocatedMap.get(m.id) ?? 0) === "amber").length;
                const over      = members.filter((m) => getLoadStatus(allocatedMap.get(m.id) ?? 0) === "red").length;
                const total = members.length;

                const greenDeg      = (available / total) * 360;
                const greenAmberDeg = ((available + atCap) / total) * 360;

                // Build segments, skipping any that are zero to avoid rendering gaps
                const segments: string[] = [];
                if (available > 0) segments.push(`#22c55e 0deg ${greenDeg}deg`);
                if (atCap > 0)     segments.push(`#f59e0b ${greenDeg}deg ${greenAmberDeg}deg`);
                if (over > 0)      segments.push(`#ef4444 ${greenAmberDeg}deg 360deg`);
                if (segments.length === 0) segments.push("#2a2d3a 0deg 360deg");

                const conicGrad = barsReady
                  ? `conic-gradient(${segments.join(", ")})`
                  : "conic-gradient(#2a2d3a 0deg 360deg)";

                // Donut hole = 65% of 56px outer diameter
                const outerSize = 56;
                const holeSize  = Math.round(outerSize * 0.65);
                const holeInset = (outerSize - holeSize) / 2;

                return (
                  <div key={cohortLabel} className="flex items-center gap-5">
                    {/* Donut */}
                    <div
                      style={{
                        width: outerSize,
                        height: outerSize,
                        borderRadius: "50%",
                        background: conicGrad,
                        transition: "background 0.8s ease",
                        flexShrink: 0,
                        position: "relative",
                      }}
                    >
                      {/* Hole */}
                      <div
                        style={{
                          position: "absolute",
                          inset: holeInset,
                          borderRadius: "50%",
                          backgroundColor: "#1a1d27",
                          border: "1.5px solid rgba(15,17,23,0.8)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="text-xs font-bold text-white">{total}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-100 mb-2">
                        Cohort {cohortLabel}
                      </p>
                      <div className="space-y-1">
                        {[
                          { label: "Available",   count: available, color: "#22c55e" },
                          { label: "At capacity", count: atCap,     color: "#f59e0b" },
                          { label: "Overloaded",  count: over,      color: "#ef4444" },
                        ].map(({ label, count, color }) => (
                          <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            {count} {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {ToastComponent}
    </div>
  );
}
