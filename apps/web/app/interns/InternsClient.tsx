"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Allocation, Intern, Project, Skill } from "../types";
import { getLoadStatus, loadColors } from "../lib/workload";
import { useToast } from "../components/Toast";
import { useIsManager } from "../hooks/useRole";
import { formatDate, skillCategoryColors, skillCategoryFallback } from "../lib/utils";
import { inputCls, inputStyle, inputErrorStyle, colors } from "../lib/forms";

interface Props {
  initialInterns: Intern[];
  initialAllocations: Allocation[];
  initialProjects: Project[];
}

const dotColors: Record<string, string> = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  red:   "bg-red-500",
};

// ── sub-components ────────────────────────────────────────────────────────────

function StatTile({
  label, value, highlight, delay,
}: {
  label: string; value: number; highlight?: boolean; delay: number;
}) {
  return (
    <div
      className={`rounded-xl border p-5 animate-pop-in ${
        highlight && value > 0
          ? "bg-red-500/10 border-red-500/30"
          : "bg-card border-card-border"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className={`text-3xl font-bold tabular-nums ${highlight && value > 0 ? "gradient-text-red" : "text-slate-100"}`}>
        {value}
      </p>
      <p className="text-sm text-slate-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() ?? "active";
  if (s === "on leave") {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-amber-950 text-amber-400 border-amber-800">
        On Leave
      </span>
    );
  }
  if (s === "finished") {
    return (
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
        Finished
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-green-950 text-green-400 border-green-800">
      Active
    </span>
  );
}

function InternCard({ intern, allocatedHours, index }: { intern: Intern; allocatedHours: number; index: number }) {
  const status = getLoadStatus(allocatedHours);
  const dot = dotColors[status];

  return (
    <Link
      href={`/interns/${intern.id}`}
      className="block animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3 card-glow h-full">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-semibold text-slate-100">{intern.name}</h2>
              <StatusBadge status={intern.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{intern.email}</p>
            <p className={`text-xs mt-1 font-medium ${loadColors[status].text}`}>
              {allocatedHours} / {intern.weekly_capacity_hours} hrs
            </p>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${dot}`} title={`${allocatedHours} hrs allocated`} />
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <span className="text-slate-600">Cohort</span>{" "}
            <span className="text-slate-400">{formatDate(intern.cohort_start)} – {formatDate(intern.cohort_end)}</span>
          </p>
          <p>
            <span className="text-slate-600">Capacity</span>{" "}
            <span className="text-slate-400">{intern.weekly_capacity_hours} hrs / week</span>
          </p>
        </div>

        {intern.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {intern.skills.map(({ skill, proficiency }) => {
              const cls = skillCategoryColors[skill.category.toLowerCase()] ?? skillCategoryFallback;
              return (
                <span key={skill.id} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
                  {skill.name}
                  <span className="opacity-60">·{proficiency}</span>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── new intern panel ──────────────────────────────────────────────────────────

interface InternFormState {
  name: string;
  email: string;
  cohort_start: string;
  cohort_end: string;
  weekly_capacity_hours: number;
}

const emptyInternForm = (): InternFormState => ({
  name: "",
  email: "",
  cohort_start: "",
  cohort_end: "",
  weekly_capacity_hours: 40,
});

function ProficiencyDots({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1.5 mt-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: n <= value ? colors.indigo : colors.border,
            border: "none",
            cursor: "pointer",
            padding: 0,
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
}

function NewInternPanel({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (intern: Intern) => void;
}) {
  const [form, setForm] = useState<InternFormState>(emptyInternForm());
  const [errors, setErrors] = useState<Partial<Record<keyof InternFormState, string>>>({});
  const [skills, setSkills] = useState<Skill[]>([]);
  const [checkedSkills, setCheckedSkills] = useState<Record<number, boolean>>({});
  const [proficiencies, setProficiencies] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    if (!open) return;
    fetch("/api/proxy/skills/")
      .then((r) => r.json())
      .then((data: Skill[]) => setSkills(data))
      .catch(() => {});
  }, [open]);

  function set(field: keyof InternFormState, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.cohort_start) e.cohort_start = "Start date is required";
    if (!form.cohort_end) e.cohort_end = "End date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function reset() {
    setForm(emptyInternForm());
    setErrors({});
    setCheckedSkills({});
    setProficiencies({});
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/interns/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const newIntern: Intern = await res.json();

      for (const skill of skills) {
        if (!checkedSkills[skill.id]) continue;
        const proficiency = proficiencies[skill.id] ?? 1;
        const sr = await fetch(`/api/proxy/interns/${newIntern.id}/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skill_id: skill.id, proficiency }),
        });
        if (!sr.ok) throw new Error();
      }

      onCreated(newIntern);
      reset();
      onClose();
    } catch {
      showToast("Failed to add intern", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    reset();
    onClose();
  }

  return (
    <>
      {ToastComponent}
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 99, background: "rgba(0,0,0,0.5)" }}
          onClick={handleCancel}
        />
      )}

      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: "min(440px, 100vw)",
          background: "#1a1d27",
          borderLeft: `1px solid ${colors.border}`,
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${colors.border}` }}
        >
          <h2 className="text-sm font-semibold text-slate-100">Add New Intern</h2>
          <button
            onClick={handleCancel}
            className="text-slate-500 hover:text-slate-200 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* name */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
            <input
              className={inputCls}
              style={errors.name ? inputErrorStyle : inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* email */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email *</label>
            <input
              type="email"
              className={inputCls}
              style={errors.email ? inputErrorStyle : inputStyle}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="jane@example.com"
            />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
          </div>

          {/* cohort dates */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Cohort Start Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.cohort_start ? inputErrorStyle : inputStyle}
              value={form.cohort_start}
              onChange={(e) => set("cohort_start", e.target.value)}
            />
            {errors.cohort_start && <p className="text-xs text-red-400 mt-1">{errors.cohort_start}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Cohort End Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.cohort_end ? inputErrorStyle : inputStyle}
              value={form.cohort_end}
              onChange={(e) => set("cohort_end", e.target.value)}
            />
            {errors.cohort_end && <p className="text-xs text-red-400 mt-1">{errors.cohort_end}</p>}
          </div>

          {/* weekly capacity */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Weekly Capacity (hrs) *</label>
            <input
              type="number"
              min={1}
              max={40}
              className={inputCls}
              style={inputStyle}
              value={form.weekly_capacity_hours}
              onChange={(e) => set("weekly_capacity_hours", Math.min(40, Number(e.target.value)))}
            />
          </div>

          {/* skills divider */}
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 16 }}>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4">Skills</p>

            {skills.length === 0 ? (
              <p className="text-xs text-slate-500">Loading skills…</p>
            ) : (
              <div className="flex flex-col gap-4">
                {skills.map((skill) => {
                  const checked = !!checkedSkills[skill.id];
                  return (
                    <div key={skill.id}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setCheckedSkills((prev) => ({ ...prev, [skill.id]: e.target.checked }));
                            if (e.target.checked && !proficiencies[skill.id]) {
                              setProficiencies((prev) => ({ ...prev, [skill.id]: 1 }));
                            }
                          }}
                          className="accent-indigo-500"
                        />
                        <span className="text-sm text-slate-300">{skill.name}</span>
                      </label>
                      {checked && (
                        <div className="ml-6">
                          <p className="text-xs text-slate-500 mt-1">Proficiency:</p>
                          <ProficiencyDots
                            value={proficiencies[skill.id] ?? 1}
                            onChange={(v) =>
                              setProficiencies((prev) => ({ ...prev, [skill.id]: v }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <button
            onClick={handleCancel}
            className="flex-1 py-2 rounded-lg text-sm text-slate-300 hover:text-slate-100 transition-all"
            style={{ border: `1px solid ${colors.border}` }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm text-white font-medium transition-all"
          >
            {submitting ? "Adding…" : "Add Intern"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function InternsClient({ initialInterns, initialAllocations, initialProjects }: Props) {
  const [interns, setInterns] = useState<Intern[]>(initialInterns);
  const [allocations] = useState<Allocation[]>(initialAllocations);
  const [projects] = useState<Project[]>(initialProjects);
  const [panelOpen, setPanelOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isManager = useIsManager();
  const { showToast, ToastComponent } = useToast();

  const allocatedMap = new Map<number, number>();
  for (const a of allocations) {
    allocatedMap.set(a.intern_id, (allocatedMap.get(a.intern_id) ?? 0) + a.hours_per_week);
  }

  const overloaded = interns.filter((i) => getLoadStatus(allocatedMap.get(i.id) ?? 0) === "red").length;

  const filteredInterns = statusFilter === "all"
    ? interns
    : interns.filter((i) => (i.status ?? "active").toLowerCase() === statusFilter);

  return (
    <div>
      {ToastComponent}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Interns</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your intern cohort</p>
        </div>
        {isManager && (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shrink-0"
          >
            <span className="text-base leading-none">+</span>
            New Intern
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatTile label="Total interns"      value={interns.length}     delay={0}   />
        <StatTile label="Total projects"     value={projects.length}    delay={60}  />
        <StatTile label="Total allocations"  value={allocations.length} delay={120} />
        <StatTile label="Overloaded"         value={overloaded}         delay={180} highlight />
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Interns</h2>
        <div className="flex items-center gap-1.5">
          {(["all", "active", "on leave", "finished"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              style={statusFilter !== s ? { border: `1px solid ${colors.border}` } : {}}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInterns.map((intern, i) => (
          <InternCard
            key={intern.id}
            intern={intern}
            allocatedHours={allocatedMap.get(intern.id) ?? 0}
            index={i}
          />
        ))}
      </div>

      {isManager && (
        <NewInternPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onCreated={(newIntern) => {
            setInterns((prev) => [newIntern, ...prev]);
            showToast("Intern added successfully", "success");
          }}
        />
      )}
    </div>
  );
}
