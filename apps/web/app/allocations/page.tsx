"use client";

import { useEffect, useState, Fragment } from "react";
import type { Allocation, Intern, Project } from "../types";
import { useToast } from "../components/Toast";

// ── Helpers ────────────────────────────────────────────────────────────────────

type LoadStatus = "green" | "amber" | "red";

function getStatus(hrs: number): LoadStatus {
  if (hrs >= 40) return "red";
  if (hrs >= 30) return "amber";
  return "green";
}

const statusColors: Record<LoadStatus, string> = {
  green: "#22c55e",
  amber: "#fbbf24",
  red: "#ef4444",
};

const statusBg: Record<LoadStatus, string> = {
  green: "rgba(34,197,94,0.18)",
  amber: "rgba(251,191,36,0.18)",
  red: "rgba(239,68,68,0.18)",
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M5 2h5M2 4h11M4 4l.5 8.5C4.5 13.3 5.1 14 6 14h3c.9 0 1.5-.7 1.5-1.5L11 4"
      stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// ── Stat Tile ──────────────────────────────────────────────────────────────────

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ backgroundColor: "rgba(99,102,241,0.06)", borderColor: "#2a2d3a" }}>
      <p className="text-2xl font-bold text-slate-100 tabular-nums">{value}</p>
      <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Mini Progress Bar ──────────────────────────────────────────────────────────

function MiniBar({ hours, max = 40 }: { hours: number; max?: number }) {
  const pct = Math.min(Math.round((hours / max) * 100), 100);
  const status = getStatus(hours);
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium tabular-nums" style={{ color: statusColors[status], minWidth: 32 }}>
        {hours}h
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(42,45,58,0.8)", minWidth: 60 }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: statusColors[status],
            borderRadius: 9999,
          }}
        />
      </div>
    </div>
  );
}

// ── Add Allocation Modal ───────────────────────────────────────────────────────

interface ModalProps {
  interns: Intern[];
  projects: Project[];
  internLoadMap: Map<number, number>;
  onClose: () => void;
  onCreated: (a: Allocation) => void;
  showToast: (msg: string, variant: "success" | "error") => void;
}

function AddAllocationModal({ interns, projects, internLoadMap, onClose, onCreated, showToast }: ModalProps) {
  const [internId, setInternId] = useState<number | "">("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [hours, setHours] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const selectedLoad = internId !== "" ? (internLoadMap.get(internId as number) ?? 0) : 0;
  const overload = internId !== "" && selectedLoad > 30;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!internId || !projectId || !hours || !startDate || !endDate) return;
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/allocations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intern_id: internId,
          project_id: projectId,
          hours_per_week: Number(hours),
          start_date: startDate,
          end_date: endDate,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const created: Allocation = await res.json();
      onCreated(created);
      showToast("Allocation created", "success");
      onClose();
    } catch {
      showToast("Failed to create allocation", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-2xl border w-full max-w-md p-6"
        style={{ backgroundColor: "#1a1d27", borderColor: "#2a2d3a" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-100">Add Allocation</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <IconX />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Intern</label>
            <select
              value={internId}
              onChange={(e) => setInternId(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select intern…</option>
              {interns.map((i) => {
                const load = internLoadMap.get(i.id) ?? 0;
                return (
                  <option key={i.id} value={i.id}>
                    {i.name} ({load}h/wk)
                  </option>
                );
              })}
            </select>
            {overload && (
              <p className="mt-1 text-xs text-amber-400">⚠ This intern is already over 30h/wk</p>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : "")}
              required
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">Select project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1.5">Hours per week</label>
            <input
              type="number"
              min={1}
              max={40}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
              placeholder="e.g. 10"
              className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-[#2a2d3a] py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
              style={{ backgroundColor: "#6366f1" }}
            >
              {saving ? "Saving…" : "Add Allocation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Load filter options ────────────────────────────────────────────────────────

type LoadFilter = "all" | "under20" | "20to35" | "over35";

const LOAD_FILTER_LABELS: Record<LoadFilter, string> = {
  all: "All",
  under20: "Under 20h",
  "20to35": "20–35h",
  over35: "Over 35h",
};

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [interns, setInterns] = useState<Intern[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<number | "">("");
  const [loadFilter, setLoadFilter] = useState<LoadFilter>("all");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    Promise.all([
      fetch("http://localhost:8000/allocations/").then((r) => r.json() as Promise<Allocation[]>),
      fetch("http://localhost:8000/interns/").then((r) => r.json() as Promise<Intern[]>),
      fetch("http://localhost:8000/projects/").then((r) => r.json() as Promise<Project[]>),
    ])
      .then(([a, i, p]) => { setAllocations(a); setInterns(i); setProjects(p); })
      .catch(() => setError("Could not connect to the API. Make sure the backend is running."))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const internMap = new Map(interns.map((i) => [i.id, i]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const internLoadMap = new Map<number, number>();
  for (const a of allocations) {
    internLoadMap.set(a.intern_id, (internLoadMap.get(a.intern_id) ?? 0) + a.hours_per_week);
  }

  const totalHours = [...internLoadMap.values()].reduce((s, v) => s + v, 0);
  const avgHours = interns.length > 0 ? (totalHours / interns.length).toFixed(1) : "0";
  const atCapacity = interns.filter((i) => (internLoadMap.get(i.id) ?? 0) >= 40).length;

  const hasFilter = search.trim() !== "" || projectFilter !== "" || loadFilter !== "all";

  const filtered = allocations.filter((a) => {
    const internName = internMap.get(a.intern_id)?.name ?? "";
    const projectName = projectMap.get(a.project_id)?.name ?? "";
    const load = internLoadMap.get(a.intern_id) ?? 0;

    if (search.trim()) {
      const q = search.toLowerCase();
      if (!internName.toLowerCase().includes(q) && !projectName.toLowerCase().includes(q)) return false;
    }
    if (projectFilter !== "" && a.project_id !== projectFilter) return false;
    if (loadFilter === "under20" && load >= 20) return false;
    if (loadFilter === "20to35" && (load < 20 || load > 35)) return false;
    if (loadFilter === "over35" && load <= 35) return false;

    return true;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`http://localhost:8000/allocations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setAllocations((prev) => prev.filter((a) => a.id !== id));
      showToast("Allocation removed", "success");
    } catch {
      showToast("Failed to remove allocation", "error");
    } finally {
      setConfirmDeleteId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 text-sm pt-8">
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading allocations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
        {error}
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Allocations</h1>
          <p className="text-sm text-slate-500 mt-1">{allocations.length} allocations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#6366f1" }}
        >
          <IconPlus />
          Add Allocation
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatTile label="Total hours allocated / wk" value={`${totalHours}h`} />
        <StatTile label="Average hours per intern" value={`${avgHours}h`} />
        <StatTile label="Interns at full capacity" value={atCapacity} sub="≥ 40h / wk" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Search intern or project…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
          style={{ minWidth: 200 }}
        />

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value ? Number(e.target.value) : "")}
          className="bg-card border border-card-border rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <div className="flex rounded-lg border border-card-border overflow-hidden text-sm">
          {(["all", "under20", "20to35", "over35"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setLoadFilter(v)}
              className="px-3 py-2 transition-colors"
              style={{
                backgroundColor: loadFilter === v ? "#6366f1" : "transparent",
                color: loadFilter === v ? "#fff" : "#94a3b8",
              }}
            >
              {LOAD_FILTER_LABELS[v]}
            </button>
          ))}
        </div>

        {hasFilter && (
          <button
            onClick={() => { setSearch(""); setProjectFilter(""); setLoadFilter("all"); }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-2"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-card-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left">
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Intern</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Hrs / wk</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Start</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">End</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a, i) => {
              const intern = internMap.get(a.intern_id);
              const project = projectMap.get(a.project_id);
              const name = intern?.name ?? `Intern #${a.intern_id}`;
              const projectName = project?.name ?? `Project #${a.project_id}`;
              const isActive = project?.status === "active";
              const internLoad = internLoadMap.get(a.intern_id) ?? 0;
              const loadStatus = getStatus(internLoad);
              const isExpanded = expandedId === a.id;
              const isConfirming = confirmDeleteId === a.id;
              const rowBg = i % 2 === 0 ? "#1a1d27" : "#1e2130";
              const otherAllocs = allocations.filter((x) => x.intern_id === a.intern_id);

              return (
                <Fragment key={a.id}>
                  <tr
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("[data-no-expand]")) return;
                      setExpandedId(isExpanded ? null : a.id);
                    }}
                    className="border-b border-card-border cursor-pointer transition-colors"
                    style={{ backgroundColor: isExpanded ? "rgba(99,102,241,0.08)" : rowBg }}
                    onMouseEnter={(e) => {
                      if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(99,102,241,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isExpanded) (e.currentTarget as HTMLElement).style.backgroundColor = rowBg;
                    }}
                  >
                    {/* Avatar + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                          style={{ backgroundColor: statusBg[loadStatus], color: statusColors[loadStatus] }}
                        >
                          {initials(name)}
                        </div>
                        <span className="text-slate-100 font-medium">{name}</span>
                      </div>
                    </td>

                    {/* Project badge */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                        style={
                          isActive
                            ? { background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)" }
                            : { background: "rgba(100,116,139,0.15)", color: "#94a3b8", border: "1px solid rgba(100,116,139,0.3)" }
                        }
                      >
                        {projectName}
                      </span>
                    </td>

                    {/* Hours with mini progress bar */}
                    <td className="px-4 py-3" style={{ minWidth: 130 }}>
                      <MiniBar hours={a.hours_per_week} />
                    </td>

                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.start_date)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(a.end_date)}</td>

                    {/* Remove */}
                    <td className="px-4 py-3" data-no-expand="true">
                      {isConfirming ? (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-slate-400">Sure?</span>
                          <button
                            onClick={() => handleDelete(a.id)}
                            className="px-2 py-0.5 rounded text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 rounded text-slate-400 hover:bg-white/5 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(a.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/10"
                          title="Remove allocation"
                        >
                          <IconTrash />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Expanded row: intern total load */}
                  {isExpanded && (
                    <tr style={{ backgroundColor: "rgba(99,102,241,0.04)" }}>
                      <td colSpan={6} className="px-6 py-4 border-b border-card-border">
                        <div className="flex items-start gap-8">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                              All projects — {name}
                            </p>
                            <div className="space-y-1.5">
                              {otherAllocs.map((x) => {
                                const proj = projectMap.get(x.project_id);
                                return (
                                  <div key={x.id} className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-300">{proj?.name ?? `Project #${x.project_id}`}</span>
                                    <span className="text-slate-500 tabular-nums">{x.hours_per_week}h/wk</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="border-l border-card-border pl-8">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-semibold">
                              Total load
                            </p>
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold" style={{ color: statusColors[loadStatus] }}>
                                {internLoad}h
                              </span>
                              <span
                                className="text-xs px-2 py-1 rounded-full font-medium"
                                style={{ backgroundColor: statusBg[loadStatus], color: statusColors[loadStatus] }}
                              >
                                {loadStatus === "green" ? "Available" : loadStatus === "amber" ? "At capacity" : "Overloaded"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-slate-600 py-10 text-sm">
            {hasFilter ? "No allocations match your filters." : "No allocations yet."}
          </p>
        )}
      </div>

      {/* Add Allocation Modal */}
      {showModal && (
        <AddAllocationModal
          interns={interns}
          projects={projects}
          internLoadMap={internLoadMap}
          onClose={() => setShowModal(false)}
          onCreated={(a) => setAllocations((prev) => [...prev, a])}
          showToast={showToast}
        />
      )}

      {ToastComponent}
    </>
  );
}
