import Link from "next/link";
import type { Allocation, Intern, Project } from "../types";
import { getLoadStatus, loadColors } from "../lib/workload";

async function fetchData() {
  const [interns, allocations, projects] = await Promise.all([
    fetch("http://api:8000/interns/", { cache: "no-store" }).then((r) => r.json() as Promise<Intern[]>),
    fetch("http://api:8000/allocations/", { cache: "no-store" }).then((r) => r.json() as Promise<Allocation[]>),
    fetch("http://api:8000/projects/", { cache: "no-store" }).then((r) => r.json() as Promise<Project[]>),
  ]);
  return { interns, allocations, projects };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const skillCategoryColors: Record<string, string> = {
  backend:  "bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30",
  frontend: "bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30",
  data:     "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30",
  design:   "bg-pink-500/15 text-pink-300 ring-1 ring-pink-500/30",
};
const skillCategoryFallback = "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";

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

const dotColors: Record<string, string> = {
  green: "bg-green-500",
  amber: "bg-amber-400",
  red:   "bg-red-500",
};

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
            <h2 className="text-sm font-semibold text-slate-100">{intern.name}</h2>
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

export default async function InternsPage() {
  let interns: Intern[] = [];
  let allocations: Allocation[] = [];
  let projects: Project[] = [];
  let allocatedMap = new Map<number, number>();
  let error: string | null = null;

  try {
    ({ interns, allocations, projects } = await fetchData());
    for (const a of allocations) {
      allocatedMap.set(a.intern_id, (allocatedMap.get(a.intern_id) ?? 0) + a.hours_per_week);
    }
  } catch {
    error = "Could not connect to the API. Make sure the backend is running.";
  }

  const overloaded = interns.filter((i) => getLoadStatus(allocatedMap.get(i.id) ?? 0) === "red").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Interns</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your intern cohort</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatTile label="Total interns"      value={interns.length}     delay={0}   />
            <StatTile label="Total projects"     value={projects.length}    delay={60}  />
            <StatTile label="Total allocations"  value={allocations.length} delay={120} />
            <StatTile label="Overloaded"         value={overloaded}         delay={180} highlight />
          </div>

          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Interns</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {interns.map((intern, i) => (
              <InternCard
                key={intern.id}
                intern={intern}
                allocatedHours={allocatedMap.get(intern.id) ?? 0}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
