"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Allocation, Intern, Project, Skill } from "../../types";
import { useToast } from "../../components/Toast";

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

type LoadStatus = "green" | "amber" | "red";
function loadStatus(load: number, capacity: number): LoadStatus {
  const pct = capacity > 0 ? load / capacity : 0;
  if (pct >= 1) return "red";
  if (pct >= 0.75) return "amber";
  return "green";
}
const loadColors: Record<LoadStatus, string> = {
  green: "#22c55e",
  amber: "#fbbf24",
  red:   "#ef4444",
};
const loadBg: Record<LoadStatus, string> = {
  green: "rgba(34,197,94,0.15)",
  amber: "rgba(251,191,36,0.15)",
  red:   "rgba(239,68,68,0.15)",
};

const skillCategoryColors: Record<string, string> = {
  backend:  "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30",
  frontend: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30",
  data:     "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  design:   "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/30",
};
const skillFallback = "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";

const STATUS_OPTIONS = ["active", "on leave", "finished"] as const;
type InternStatus = (typeof STATUS_OPTIONS)[number];

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "active";
  if (s === "on leave") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-amber-950 text-amber-400 border-amber-800 capitalize">
        On Leave
      </span>
    );
  }
  if (s === "finished") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700 capitalize">
        Finished
      </span>
    );
  }
  return (
    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full border bg-green-950 text-green-400 border-green-800 capitalize">
      Active
    </span>
  );
}

// ── icons ─────────────────────────────────────────────────────────────────────

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 7h14M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 4.5V8l2.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconActivity = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M1 8h2.5l2-5 3 9 2-6 1.5 2H15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M1 5l7 5 7-5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconPencil = () => (
  <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
    <path d="M10.5 1.5l3 3-8.5 8.5H2v-3L10.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── visual components ─────────────────────────────────────────────────────────

function SectionHeader({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-1 h-4 rounded-full bg-indigo-500" />
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</h2>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  delay = 0,
  valueStyle,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  delay?: number;
  valueStyle?: React.CSSProperties;
}) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-2 animate-fade-in"
      style={{
        background: "#1a1d27",
        border: "1px solid #2a2d3a",
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
        <span className="text-slate-600">{icon}</span>
      </div>
      <p className="text-base font-semibold text-slate-100" style={valueStyle}>{value}</p>
    </div>
  );
}

function ProficiencyDots({ level }: { level: number }) {
  return (
    <span className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < level ? "bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.6)]" : "bg-slate-700"
          }`}
        />
      ))}
    </span>
  );
}

function ClickableProficiencyDots({ level, onChange }: { level: number; onChange: (v: number) => void }) {
  return (
    <span className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: i < level ? "#6366f1" : "#2a2d3a",
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
            transition: "background 0.15s",
          }}
        />
      ))}
    </span>
  );
}

function LoadRing({
  load,
  capacity,
  status,
}: {
  load: number;
  capacity: number;
  status: LoadStatus;
}) {
  const [animPct, setAnimPct] = useState(0);
  const rawPct = capacity > 0 ? Math.min((load / capacity) * 100, 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(rawPct), 80);
    return () => clearTimeout(t);
  }, [rawPct]);

  const color = loadColors[status];
  const track = "#2a2d3a";
  const size = 120;
  const thickness = 14;
  const inner = size - thickness * 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ position: "relative", width: size, height: size }}>
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: `conic-gradient(${color} 0% ${animPct}%, ${track} ${animPct}% 100%)`,
            transition: "background 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: thickness,
            left: thickness,
            width: inner,
            height: inner,
            borderRadius: "50%",
            background: "#1a1d27",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="text-xl font-bold text-slate-100" style={{ color }}>{load}h</span>
          <span className="text-[10px] text-slate-500">of {capacity}h/wk</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: loadBg[status], color }}
        >
          {status === "green" ? "Available" : status === "amber" ? "Near capacity" : "Overloaded"}
        </span>
        <span className="text-xs text-slate-500">{Math.round(rawPct)}% allocated</span>
      </div>
    </div>
  );
}

// ── edit intern panel ─────────────────────────────────────────────────────────

const inputCls = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500";
const inputStyle = { background: "#0f1117", border: "1px solid #2a2d3a", color: "#f1f5f9" };

interface EditInternForm {
  name: string;
  email: string;
  cohort_start: string;
  cohort_end: string;
  weekly_capacity_hours: string;
  status: string;
}

function EditInternPanel({
  intern,
  open,
  onClose,
  onUpdated,
  showToast,
}: {
  intern: Intern;
  open: boolean;
  onClose: () => void;
  onUpdated: (i: Intern) => void;
  showToast: (msg: string, variant: "success" | "error") => void;
}) {
  const [form, setForm] = useState<EditInternForm>({
    name: intern.name,
    email: intern.email,
    cohort_start: intern.cohort_start,
    cohort_end: intern.cohort_end,
    weekly_capacity_hours: String(intern.weekly_capacity_hours),
    status: intern.status ?? "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        name: intern.name,
        email: intern.email,
        cohort_start: intern.cohort_start,
        cohort_end: intern.cohort_end,
        weekly_capacity_hours: String(intern.weekly_capacity_hours),
        status: intern.status ?? "active",
      });
    }
  }, [open, intern]);

  function set(field: keyof EditInternForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`http://localhost:8000/interns/${intern.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          cohort_start: form.cohort_start,
          cohort_end: form.cohort_end,
          weekly_capacity_hours: Number(form.weekly_capacity_hours),
          status: form.status,
        }),
      });
      if (!res.ok) throw new Error();
      const updated: Intern = await res.json();
      onUpdated(updated);
      showToast("Intern updated", "success");
      onClose();
    } catch {
      showToast("Failed to update intern", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 99, background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: 440,
          background: "#1a1d27",
          borderLeft: "1px solid #2a2d3a",
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #2a2d3a" }}>
          <h2 className="text-sm font-semibold text-slate-100">Edit Intern</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
                className={inputCls}
                style={inputStyle}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
                className={inputCls}
                style={inputStyle}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cohort start date *</label>
              <input
                type="date"
                value={form.cohort_start}
                onChange={(e) => set("cohort_start", e.target.value)}
                required
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Cohort end date *</label>
              <input
                type="date"
                value={form.cohort_end}
                onChange={(e) => set("cohort_end", e.target.value)}
                required
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Weekly capacity hours *</label>
              <input
                type="number"
                min={1}
                max={40}
                value={form.weekly_capacity_hours}
                onChange={(e) => set("weekly_capacity_hours", e.target.value)}
                required
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className={inputCls}
                style={inputStyle}
              >
                <option value="active">Active</option>
                <option value="on leave">On Leave</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2" style={{ borderTop: "1px solid #2a2d3a", paddingTop: 16 }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 transition-all"
                style={{ border: "1px solid #2a2d3a" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm text-white font-medium transition-all"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

// ── edit skills panel ─────────────────────────────────────────────────────────

interface SkillState {
  checked: boolean;
  proficiency: number;
  original: { checked: boolean; proficiency: number };
}

function EditSkillsPanel({
  intern,
  open,
  onClose,
  onUpdated,
  showToast,
}: {
  intern: Intern;
  open: boolean;
  onClose: () => void;
  onUpdated: (i: Intern) => void;
  showToast: (msg: string, variant: "success" | "error") => void;
}) {
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [skillState, setSkillState] = useState<Record<number, SkillState>>({});
  const [saving, setSaving] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingSkills(true);
    fetch("http://localhost:8000/skills/")
      .then((r) => r.json())
      .then((data: Skill[]) => {
        setAllSkills(data);
        const internSkillMap = new Map(intern.skills.map((s) => [s.skill.id, s.proficiency]));
        const initial: Record<number, SkillState> = {};
        for (const skill of data) {
          const has = internSkillMap.has(skill.id);
          const prof = internSkillMap.get(skill.id) ?? 1;
          initial[skill.id] = { checked: has, proficiency: prof, original: { checked: has, proficiency: prof } };
        }
        setSkillState(initial);
      })
      .catch(() => {})
      .finally(() => setLoadingSkills(false));
  }, [open, intern]);

  function toggleSkill(id: number, checked: boolean) {
    setSkillState((prev) => ({
      ...prev,
      [id]: { ...prev[id], checked, proficiency: checked ? (prev[id]?.proficiency || 1) : prev[id]?.proficiency },
    }));
  }

  function setProficiency(id: number, prof: number) {
    setSkillState((prev) => ({ ...prev, [id]: { ...prev[id], proficiency: prof } }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      for (const [idStr, state] of Object.entries(skillState)) {
        const id = Number(idStr);
        const { checked, proficiency, original } = state;

        if (!original.checked && checked) {
          const r = await fetch(`http://localhost:8000/interns/${intern.id}/skills`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ skill_id: id, proficiency }),
          });
          if (!r.ok) throw new Error();
        } else if (original.checked && !checked) {
          const r = await fetch(`http://localhost:8000/interns/${intern.id}/skills/${id}`, { method: "DELETE" });
          if (!r.ok) throw new Error();
        } else if (original.checked && checked && proficiency !== original.proficiency) {
          const r = await fetch(`http://localhost:8000/interns/${intern.id}/skills/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ proficiency }),
          });
          if (!r.ok) throw new Error();
        }
      }

      const refreshed = await fetch(`http://localhost:8000/interns/${intern.id}`);
      if (!refreshed.ok) throw new Error();
      const updated: Intern = await refreshed.json();
      onUpdated(updated);
      showToast("Skills updated successfully", "success");
      onClose();
    } catch {
      showToast("Failed to update skills", "error");
    } finally {
      setSaving(false);
    }
  }

  const currentSkills = allSkills.filter((s) => skillState[s.id]?.original.checked);
  const newSkills = allSkills.filter((s) => !skillState[s.id]?.original.checked);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 99, background: "rgba(0,0,0,0.5)" }}
          onClick={onClose}
        />
      )}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: 440,
          background: "#1a1d27",
          borderLeft: "1px solid #2a2d3a",
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid #2a2d3a" }}>
          <h2 className="text-sm font-semibold text-slate-100">Edit Skills</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loadingSkills ? (
            <p className="text-sm text-slate-500">Loading skills…</p>
          ) : (
            <div className="flex flex-col gap-1">
              {currentSkills.length > 0 && (
                <>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Current Skills</p>
                  {currentSkills.map((skill) => {
                    const state = skillState[skill.id];
                    if (!state) return null;
                    const cls = skillCategoryColors[skill.category.toLowerCase()] ?? skillFallback;
                    return (
                      <div key={skill.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-indigo-500/5">
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={state.checked}
                            onChange={(e) => toggleSkill(skill.id, e.target.checked)}
                            className="accent-indigo-500 shrink-0"
                          />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{skill.name}</span>
                          <span className="text-xs text-slate-600 capitalize">{skill.category}</span>
                        </label>
                        {state.checked && (
                          <ClickableProficiencyDots
                            level={state.proficiency}
                            onChange={(v) => setProficiency(skill.id, v)}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {newSkills.length > 0 && (
                <>
                  <div style={{ borderTop: "1px solid #2a2d3a", margin: "12px 0" }} />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">Add New Skills</p>
                  {newSkills.map((skill) => {
                    const state = skillState[skill.id];
                    if (!state) return null;
                    const cls = skillCategoryColors[skill.category.toLowerCase()] ?? skillFallback;
                    return (
                      <div key={skill.id} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-indigo-500/5">
                        <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={state.checked}
                            onChange={(e) => toggleSkill(skill.id, e.target.checked)}
                            className="accent-indigo-500 shrink-0"
                          />
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>{skill.name}</span>
                          <span className="text-xs text-slate-600 capitalize">{skill.category}</span>
                        </label>
                        {state.checked && (
                          <ClickableProficiencyDots
                            level={state.proficiency}
                            onChange={(v) => setProficiency(skill.id, v)}
                          />
                        )}
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: "1px solid #2a2d3a" }}>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 transition-all"
            style={{ border: "1px solid #2a2d3a" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm text-white font-medium transition-all"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── availability calendar ─────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

interface WeekInfo {
  weekStart: Date;
  weekEnd: Date;
  label: string;
  dateRange: string;
}

function buildWeeks(today: Date, count: number): WeekInfo[] {
  const base = startOfWeek(today);
  return Array.from({ length: count }, (_, i) => {
    const weekStart = addDays(base, i * 7);
    const weekEnd = addDays(weekStart, 6);
    return {
      weekStart,
      weekEnd,
      label: `Wk ${i + 1}`,
      dateRange: `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`,
    };
  });
}

function AvailabilityCalendar({
  allocations,
  projectMap,
}: {
  allocations: Allocation[];
  projectMap: Map<number, Project>;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weeks = buildWeeks(today, 8);

  return (
    <div
      className="rounded-xl p-5 animate-fade-in"
      style={{ background: "#1a1d27", border: "1px solid #2a2d3a", animationDelay: "400ms", animationFillMode: "both" }}
    >
      <SectionHeader label="Availability — Next 8 Weeks" />

      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 640 }}>
          {/* header row */}
          <div style={{ display: "grid", gridTemplateColumns: "120px repeat(8, 1fr)", gap: 6, marginBottom: 6 }}>
            <div />
            {weeks.map((w) => (
              <div key={w.label} className="text-center">
                <p className="text-xs font-semibold text-slate-400">{w.label}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{w.dateRange}</p>
              </div>
            ))}
          </div>

          {/* data row */}
          <div style={{ display: "grid", gridTemplateColumns: "120px repeat(8, 1fr)", gap: 6 }}>
            <div
              className="flex items-center"
              style={{ minHeight: 60, paddingRight: 8 }}
            >
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Allocation Status</span>
            </div>

            {weeks.map((w) => {
              const overlapping = allocations.filter((a) => {
                const aStart = new Date(a.start_date);
                const aEnd = new Date(a.end_date);
                aStart.setHours(0, 0, 0, 0);
                aEnd.setHours(0, 0, 0, 0);
                return aStart <= w.weekEnd && aEnd >= w.weekStart;
              });

              if (overlapping.length === 0) {
                return (
                  <div
                    key={w.label}
                    style={{
                      minHeight: 60,
                      padding: 8,
                      borderRadius: 8,
                      background: "rgba(34,197,94,0.07)",
                      border: "1px solid rgba(34,197,94,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="text-[11px] font-medium text-green-500">Available</span>
                  </div>
                );
              }

              const primary = overlapping[0];
              const project = projectMap.get(primary.project_id);
              const projectName = (project?.name ?? `Project #${primary.project_id}`).slice(0, 12);
              const extraCount = overlapping.length - 1;

              return (
                <div
                  key={w.label}
                  style={{
                    minHeight: 60,
                    padding: 8,
                    borderRadius: 8,
                    background: "rgba(99,102,241,0.1)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <span
                    className="text-[11px] font-medium text-indigo-300 truncate block"
                    title={project?.name}
                  >
                    {projectName}
                    {projectName.length < (project?.name ?? "").length ? "…" : ""}
                  </span>
                  <span className="text-[10px] text-indigo-400 mt-0.5">{primary.hours_per_week}h/wk</span>
                  {extraCount > 0 && (
                    <span className="text-[10px] text-indigo-500 mt-0.5">+{extraCount} more</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function InternProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [intern, setIntern] = useState<Intern | null>(null);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSkillsOpen, setEditSkillsOpen] = useState(false);

  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    Promise.all([
      fetch(`http://localhost:8000/interns/${id}`),
      fetch("http://localhost:8000/allocations/").then((r) => r.json() as Promise<Allocation[]>),
      fetch("http://localhost:8000/projects/").then((r) => r.json() as Promise<Project[]>),
    ])
      .then(async ([internRes, allocs, projs]) => {
        if (internRes.status === 404) { setNotFound(true); return; }
        if (!internRes.ok) throw new Error();
        const internData: Intern = await internRes.json();
        setIntern(internData);
        setAllocations(allocs);
        setProjects(projs);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-slate-500 text-sm pt-8">
        <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        Loading…
      </div>
    );
  }

  if (notFound || !intern) {
    return (
      <div className="text-slate-400 text-sm pt-8">
        Intern not found.{" "}
        <Link href="/interns" className="text-indigo-400 hover:underline">Back to Interns</Link>
      </div>
    );
  }

  const myAllocations = allocations.filter((a) => a.intern_id === intern.id);
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const currentLoad = myAllocations.reduce((s, a) => s + a.hours_per_week, 0);
  const status = loadStatus(currentLoad, intern.weekly_capacity_hours);
  const statusColor = loadColors[status];

  return (
    <>
      {ToastComponent}

      {/* Radial bg accent */}
      <div
        className="pointer-events-none fixed top-0 left-0 w-full h-64 z-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 30% 0%, rgba(99,102,241,0.07) 0%, transparent 100%)" }}
      />

      <div className="relative z-10 max-w-[1100px] space-y-6">

        {/* ── Top nav ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/interns"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-400 transition-colors"
          >
            ← Interns
          </Link>
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:border-indigo-500 transition-all"
            style={{ border: "1px solid #2a2d3a" }}
          >
            <IconPencil />
            Edit
          </button>
        </div>

        {/* ── Hero header ── */}
        <div
          className="rounded-2xl p-6 animate-fade-in"
          style={{ background: "#1a1d27", border: "1px solid #2a2d3a" }}
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
              style={{
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                boxShadow: "0 0 0 3px rgba(99,102,241,0.25), 0 8px 24px rgba(99,102,241,0.2)",
              }}
            >
              {initials(intern.name).toUpperCase()}
            </div>

            {/* Name + email */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-slate-100 leading-tight">{intern.name}</h1>
                <StatusBadge status={intern.status} />
              </div>
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-500 text-sm">
                <IconMail />
                <span>{intern.email}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-[#2a2d3a]" />
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Cohort start"
            value={formatDate(intern.cohort_start)}
            icon={<IconCalendar />}
            delay={0}
          />
          <StatCard
            label="Cohort end"
            value={formatDate(intern.cohort_end)}
            icon={<IconCalendar />}
            delay={80}
          />
          <StatCard
            label="Weekly capacity"
            value={`${intern.weekly_capacity_hours} hrs / wk`}
            icon={<IconClock />}
            delay={160}
          />
          <StatCard
            label="Current load"
            value={`${currentLoad}h / ${intern.weekly_capacity_hours}h`}
            icon={<IconActivity />}
            delay={240}
            valueStyle={{ color: statusColor }}
          />
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-6 items-start">

          {/* ── Left column: Skills ── */}
          <div className="flex-[3] min-w-0">
            <div
              className="rounded-xl p-5 animate-fade-in"
              style={{ background: "#1a1d27", border: "1px solid #2a2d3a", animationDelay: "200ms", animationFillMode: "both" }}
            >
              <SectionHeader
                label="Skills"
                action={
                  <button
                    onClick={() => setEditSkillsOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:border-indigo-500 transition-all"
                    style={{ border: "1px solid #2a2d3a" }}
                  >
                    <IconPencil />
                    Edit Skills
                  </button>
                }
              />

              {intern.skills.length === 0 ? (
                <p className="text-sm text-slate-600 py-4 text-center">No skills added yet.</p>
              ) : (
                <div className="divide-y divide-[#2a2d3a]">
                  {intern.skills.map(({ skill, proficiency }, i) => {
                    const cls = skillCategoryColors[skill.category.toLowerCase()] ?? skillFallback;
                    return (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-indigo-500/5 animate-fade-in"
                        style={{ animationDelay: `${300 + i * 60}ms`, animationFillMode: "both" }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${cls}`}>
                            {skill.name}
                          </span>
                          <span className="text-xs text-slate-600 capitalize">{skill.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <ProficiencyDots level={proficiency} />
                          <span className="text-xs text-slate-600 tabular-nums w-6 text-right">{proficiency}/5</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Right column: Load + Allocations ── */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4">

            {/* Load ring card */}
            <div
              className="rounded-xl p-5 animate-fade-in"
              style={{ background: "#1a1d27", border: "1px solid #2a2d3a", animationDelay: "250ms", animationFillMode: "both" }}
            >
              <SectionHeader label="Current Workload" />
              <div className="flex justify-center py-2">
                <LoadRing load={currentLoad} capacity={intern.weekly_capacity_hours} status={status} />
              </div>

              {myAllocations.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  {myAllocations.map((a) => {
                    const project = projectMap.get(a.project_id);
                    return (
                      <div key={a.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 truncate">{project?.name ?? `Project #${a.project_id}`}</span>
                        <span className="text-slate-500 shrink-0 ml-2 tabular-nums">{a.hours_per_week}h/wk</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Allocations card */}
            <div
              className="rounded-xl p-5 animate-fade-in"
              style={{ background: "#1a1d27", border: "1px solid #2a2d3a", animationDelay: "330ms", animationFillMode: "both" }}
            >
              <SectionHeader label="Allocations" />

              {myAllocations.length === 0 ? (
                <p className="text-sm text-slate-600 py-2 text-center">No active allocations.</p>
              ) : (
                <div className="space-y-3">
                  {myAllocations.map((a, i) => {
                    const project = projectMap.get(a.project_id);
                    const contrib = intern.weekly_capacity_hours > 0
                      ? a.hours_per_week / intern.weekly_capacity_hours
                      : 0;
                    const contribStatus: LoadStatus = contrib >= 0.5 ? "red" : contrib >= 0.3 ? "amber" : "green";
                    return (
                      <div
                        key={a.id}
                        className="rounded-lg p-3 flex items-start justify-between gap-3 animate-fade-in"
                        style={{
                          background: "#0f1117",
                          borderLeft: `3px solid ${loadColors[contribStatus]}`,
                          animationDelay: `${400 + i * 80}ms`,
                          animationFillMode: "both",
                        }}
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-100 truncate">
                            {project?.name ?? `Project #${a.project_id}`}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDate(a.start_date)} – {formatDate(a.end_date)}
                          </p>
                        </div>
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                          style={{ background: "rgba(99,102,241,0.15)", color: "#818cf8" }}
                        >
                          {a.hours_per_week}h/wk
                        </span>
                      </div>
                    );
                  })}

                  <p className="text-xs text-slate-600 pt-1">
                    {currentLoad}h/wk total across {myAllocations.length} project{myAllocations.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Availability calendar ── */}
        <AvailabilityCalendar allocations={myAllocations} projectMap={projectMap} />

      </div>

      {/* Edit Intern Panel */}
      <EditInternPanel
        intern={intern}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={(updated) => setIntern(updated)}
        showToast={showToast}
      />

      {/* Edit Skills Panel */}
      <EditSkillsPanel
        intern={intern}
        open={editSkillsOpen}
        onClose={() => setEditSkillsOpen(false)}
        onUpdated={(updated) => setIntern(updated)}
        showToast={showToast}
      />
    </>
  );
}
