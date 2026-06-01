"use client";

import { useState, useEffect, useCallback } from "react";
import type { Project, Allocation, Intern } from "../types";
import { useToast } from "../components/Toast";
import { useIsManager } from "../hooks/useRole";
import { CAPACITY_THRESHOLD } from "../lib/workload";
import { colors, inputCls, inputStyle, inputErrorStyle } from "../lib/forms";

interface Props {
  initialProjects: Project[];
  initialAllocations: Allocation[];
  initialInterns: Intern[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timelinePercent(start: string, end: string): number {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const now = Date.now();
  if (now <= s) return 0;
  if (now >= e) return 100;
  return Math.round(((now - s) / (e - s)) * 100);
}

const statusBadge: Record<string, string> = {
  planning: "bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30",
  active: "bg-green-500/15 text-green-300 ring-1 ring-green-500/30",
  completed: "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30",
};
const fallbackBadge = "bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30";

// ── filter bar ────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Active", "Planning", "Completed"] as const;
type Filter = (typeof FILTERS)[number];

function FilterBar({
  filter,
  counts,
  onChange,
}: {
  filter: Filter;
  counts: Record<string, number>;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      {FILTERS.map((f) => {
        const count = f === "All" ? counts.__total__ : (counts[f.toLowerCase()] ?? 0);
        const active = filter === f;
        return (
          <button
            key={f}
            onClick={() => onChange(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              active
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-indigo-500/20 hover:text-indigo-300"
            }`}
          >
            {f} ({count})
          </button>
        );
      })}
    </div>
  );
}

// ── project card ──────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  allocations,
  interns,
  index,
  onAllocate,
  onEdit,
  isManager,
}: {
  project: Project;
  allocations: Allocation[];
  interns: Intern[];
  index: number;
  onAllocate: (project: Project) => void;
  onEdit: (project: Project) => void;
  isManager: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const badge = statusBadge[project.status] ?? fallbackBadge;
  const pct = timelinePercent(project.start_date, project.end_date);
  const projectAllocs = allocations.filter((a) => a.project_id === project.id);
  const totalHours = projectAllocs.reduce((sum, a) => sum + a.hours_per_week, 0);

  return (
    <div
      className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3 card-glow animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-100">{project.name}</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}
          >
            {project.status === "active" && (
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-dot" />
            )}
            {project.status}
          </span>
          {isManager && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              className="text-slate-600 hover:text-indigo-400 transition-colors p-1 rounded hover:bg-indigo-500/10"
              title="Edit project"
            >
              <svg width="13" height="13" viewBox="0 0 15 15" fill="none">
                <path d="M10.5 1.5l3 3-8.5 8.5H2v-3L10.5 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* owner + dates */}
      <div className="text-xs text-slate-500 space-y-1">
        <p>
          <span className="text-slate-600">Owner</span>{" "}
          <span className="text-slate-400">{project.owner}</span>
        </p>
        <p>
          <span className="text-slate-600">Timeline</span>{" "}
          <span className="text-slate-400">
            {formatDate(project.start_date)} – {formatDate(project.end_date)}
          </span>
        </p>
      </div>

      {/* progress bar */}
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

      {/* expandable section */}
      <div
        style={{
          maxHeight: expanded ? 600 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="pt-1 flex flex-col gap-3">
          {project.description && (
            <p className="text-xs text-slate-400 leading-relaxed">{project.description}</p>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-300 mb-2">Allocated Interns</p>
            {projectAllocs.length === 0 ? (
              <p className="text-xs text-slate-500">No interns allocated yet</p>
            ) : (
              <ul className="space-y-1.5">
                {projectAllocs.map((a) => {
                  const intern = interns.find((i) => i.id === a.intern_id);
                  return (
                    <li key={a.id} className="text-xs text-slate-400 flex justify-between">
                      <span>{intern?.name ?? `Intern #${a.intern_id}`}</span>
                      <span className="text-slate-500">
                        {a.hours_per_week}h/wk · {formatDate(a.start_date)} – {formatDate(a.end_date)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            {projectAllocs.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                Total: {totalHours} hrs/week allocated
              </p>
            )}
          </div>
        </div>
      </div>

      {/* action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-all"
        >
          {expanded ? "Collapse" : "View Details"}
        </button>
        {isManager && (
          <button
            onClick={() => onAllocate(project)}
            className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
          >
            Allocate Intern
          </button>
        )}
      </div>
    </div>
  );
}

// ── allocate modal ────────────────────────────────────────────────────────────

function AllocateModal({
  project,
  interns,
  allocations,
  onClose,
  onSuccess,
}: {
  project: Project;
  interns: Intern[];
  allocations: Allocation[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [internId, setInternId] = useState<number>(interns[0]?.id ?? 0);
  const [hours, setHours] = useState(10);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function internLoad(id: number) {
    return allocations
      .filter((a) => a.intern_id === id)
      .reduce((sum, a) => sum + a.hours_per_week, 0);
  }

  const selectedLoad = internLoad(internId);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/allocations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intern_id: internId,
          project_id: project.id,
          hours_per_week: hours,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      if (!res.ok) throw new Error();
      onSuccess();
    } catch {
      throw new Error("allocation_failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-[480px] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 text-lg leading-none"
        >
          ✕
        </button>

        <h2 className="text-sm font-semibold text-slate-100 mb-5">
          Allocate Intern to {project.name}
        </h2>

        <div className="flex flex-col gap-4">
          {/* intern select */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Select Intern</label>
            <select
              value={internId}
              onChange={(e) => setInternId(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {interns.map((intern) => {
                const load = internLoad(intern.id);
                return (
                  <option key={intern.id} value={intern.id}>
                    {intern.name} ({load}h/wk)
                  </option>
                );
              })}
            </select>
            {selectedLoad > CAPACITY_THRESHOLD && (
              <p className="text-xs text-amber-400 mt-1.5">
                ⚠ This intern is already at {selectedLoad}h/week
              </p>
            )}
          </div>

          {/* hours */}
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Hours per week</label>
            <input
              type="number"
              min={1}
              max={40}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !startDate || !endDate}
              className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm text-white font-medium transition-all"
            >
              {submitting ? "Allocating…" : "Allocate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── new project panel ─────────────────────────────────────────────────────────

interface ProjectFormState {
  name: string;
  description: string;
  owner: string;
  status: string;
  start_date: string;
  end_date: string;
}

const emptyForm = (): ProjectFormState => ({
  name: "",
  description: "",
  owner: "",
  status: "planning",
  start_date: "",
  end_date: "",
});

function NewProjectPanel({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Project) => void;
}) {
  const [form, setForm] = useState<ProjectFormState>(emptyForm());
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent } = useToast();

  function set(field: keyof ProjectFormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.owner.trim()) e.owner = "Owner is required";
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.end_date) e.end_date = "End date is required";
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      e.end_date = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/proxy/projects/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const created: Project = await res.json();
      onCreated(created);
      setForm(emptyForm());
      setErrors({});
      onClose();
    } catch {
      showToast("Failed to create project", "error");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setForm(emptyForm());
    setErrors({});
    onClose();
  }

  return (
    <>
      {ToastComponent}
      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0"
          style={{ zIndex: 99, background: "rgba(0,0,0,0.5)" }}
          onClick={handleCancel}
        />
      )}

      {/* panel */}
      <div
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          height: "100vh",
          width: 440,
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
          <h2 className="text-sm font-semibold text-slate-100">New Project</h2>
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
            <label className="block text-xs text-slate-400 mb-1">Name *</label>
            <input
              className={inputCls}
              style={errors.name ? inputErrorStyle : inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Project name"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* description */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              className={inputCls}
              style={inputStyle}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description"
            />
          </div>

          {/* owner */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Owner *</label>
            <input
              className={inputCls}
              style={errors.owner ? inputErrorStyle : inputStyle}
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="Owner name"
            />
            {errors.owner && <p className="text-xs text-red-400 mt-1">{errors.owner}</p>}
          </div>

          {/* status */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              className={inputCls}
              style={inputStyle}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="planning">planning</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
            </select>
          </div>

          {/* start date */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Start Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.start_date ? inputErrorStyle : inputStyle}
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
            />
            {errors.start_date && <p className="text-xs text-red-400 mt-1">{errors.start_date}</p>}
          </div>

          {/* end date */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">End Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.end_date ? inputErrorStyle : inputStyle}
              value={form.end_date}
              onChange={(e) => set("end_date", e.target.value)}
            />
            {errors.end_date && <p className="text-xs text-red-400 mt-1">{errors.end_date}</p>}
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
            {submitting ? "Creating…" : "Create Project"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── edit project panel ────────────────────────────────────────────────────────

function EditProjectPanel({
  project,
  open,
  onClose,
  onUpdated,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  onUpdated: (p: Project) => void;
}) {
  const [form, setForm] = useState<ProjectFormState>({
    name: project.name,
    description: project.description ?? "",
    owner: project.owner,
    status: project.status,
    start_date: project.start_date,
    end_date: project.end_date,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const { showToast, ToastComponent: EditToast } = useToast();

  useEffect(() => {
    if (open) {
      setForm({
        name: project.name,
        description: project.description ?? "",
        owner: project.owner,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
      });
      setErrors({});
    }
  }, [open, project]);

  function set(field: keyof ProjectFormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.owner.trim()) e.owner = "Owner is required";
    if (!form.start_date) e.start_date = "Start date is required";
    if (!form.end_date) e.end_date = "End date is required";
    if (form.start_date && form.end_date && form.end_date <= form.start_date)
      e.end_date = "End date must be after start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/proxy/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const updated: Project = await res.json();
      onUpdated(updated);
      onClose();
    } catch {
      showToast("Failed to update project", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {EditToast}
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
          borderLeft: `1px solid ${colors.border}`,
          zIndex: 100,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <h2 className="text-sm font-semibold text-slate-100">Edit Project</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 text-lg leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Name *</label>
            <input
              className={inputCls}
              style={errors.name ? inputErrorStyle : inputStyle}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Project name"
            />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Description</label>
            <textarea
              rows={3}
              className={inputCls}
              style={inputStyle}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Owner *</label>
            <input
              className={inputCls}
              style={errors.owner ? inputErrorStyle : inputStyle}
              value={form.owner}
              onChange={(e) => set("owner", e.target.value)}
              placeholder="Owner name"
            />
            {errors.owner && <p className="text-xs text-red-400 mt-1">{errors.owner}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              className={inputCls}
              style={inputStyle}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="planning">planning</option>
              <option value="active">active</option>
              <option value="completed">completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Start Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.start_date ? inputErrorStyle : inputStyle}
              value={form.start_date}
              onChange={(e) => set("start_date", e.target.value)}
            />
            {errors.start_date && <p className="text-xs text-red-400 mt-1">{errors.start_date}</p>}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">End Date *</label>
            <input
              type="date"
              className={inputCls}
              style={errors.end_date ? inputErrorStyle : inputStyle}
              value={form.end_date}
              onChange={(e) => set("end_date", e.target.value)}
            />
            {errors.end_date && <p className="text-xs text-red-400 mt-1">{errors.end_date}</p>}
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button
            onClick={onClose}
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
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function ProjectsClient({ initialProjects, initialAllocations, initialInterns }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations);
  const [interns] = useState<Intern[]>(initialInterns);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [modalProject, setModalProject] = useState<Project | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isManager = useIsManager();
  const { showToast, ToastComponent } = useToast();

  const fetchAllocations = useCallback(async () => {
    const res = await fetch("/api/proxy/allocations/");
    if (!res.ok) throw new Error();
    setAllocations(await res.json());
  }, []);

  const counts = {
    __total__: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    planning: projects.filter((p) => p.status === "planning").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  const filtered =
    filter === "All"
      ? projects
      : projects.filter((p) => p.status.toLowerCase() === filter.toLowerCase());

  return (
    <div>
      {ToastComponent}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">{projects.length} projects</p>
        </div>
        {isManager && (
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shrink-0"
          >
            <span className="text-base leading-none">+</span>
            New Project
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error === "SESSION_EXPIRED"
            ? <>Session expired. Please <a href="/login" className="underline">log in again</a>.</>
            : error}
        </div>
      ) : (
        <>
          <FilterBar filter={filter} counts={counts} onChange={setFilter} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                allocations={allocations}
                interns={interns}
                index={i}
                onAllocate={setModalProject}
                onEdit={setEditingProject}
                isManager={isManager}
              />
            ))}
            {filtered.length === 0 && (
              <p className="text-slate-500 text-sm col-span-3 py-10 text-center">
                No projects match this filter.
              </p>
            )}
          </div>
        </>
      )}

      {isManager && (
        <NewProjectPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          onCreated={(p) => {
            setProjects((prev) => [p, ...prev]);
            showToast("Project created successfully", "success");
          }}
        />
      )}

      {isManager && modalProject && (
        <AllocateModal
          project={modalProject}
          interns={interns}
          allocations={allocations}
          onClose={() => setModalProject(null)}
          onSuccess={async () => {
            setModalProject(null);
            try {
              await fetchAllocations();
              showToast("Intern allocated successfully", "success");
            } catch {
              showToast("Failed to allocate intern", "error");
            }
          }}
        />
      )}

      {isManager && editingProject && (
        <EditProjectPanel
          project={editingProject}
          open={!!editingProject}
          onClose={() => setEditingProject(null)}
          onUpdated={(updated) => {
            setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
            setEditingProject(null);
            showToast("Project updated", "success");
          }}
        />
      )}
    </div>
  );
}
