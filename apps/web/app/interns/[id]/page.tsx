import { notFound } from "next/navigation";
import Link from "next/link";
import type { Allocation, Intern, Project } from "../../types";

async function fetchProfile(id: string) {
  const [internRes, allocations, projects] = await Promise.all([
    fetch(`http://api:8000/interns/${id}`, { cache: "no-store" }),
    fetch("http://api:8000/allocations/", { cache: "no-store" }).then((r) => r.json() as Promise<Allocation[]>),
    fetch("http://api:8000/projects/", { cache: "no-store" }).then((r) => r.json() as Promise<Project[]>),
  ]);

  if (internRes.status === 404) notFound();
  if (!internRes.ok) throw new Error("Failed to fetch intern");

  const intern: Intern = await internRes.json();
  return { intern, allocations, projects };
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
const skillFallback = "bg-slate-500/15 text-slate-300 ring-1 ring-slate-500/30";

function ProficiencyDots({ level }: { level: number }) {
  return (
    <span className="flex gap-1.5 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all ${
            i < level ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" : "bg-slate-700"
          }`}
        />
      ))}
    </span>
  );
}

export default async function InternProfilePage({ params }: { params: { id: string } }) {
  const { intern, allocations, projects } = await fetchProfile(params.id);

  const myAllocations = allocations.filter((a) => a.intern_id === intern.id);
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
        ← Back to Dashboard
      </Link>

      {/* Bio */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-100">{intern.name}</h1>
        <p className="text-slate-500 mt-0.5 text-sm">{intern.email}</p>
      </div>

      {/* Details */}
      <div
        className="bg-card border border-card-border rounded-xl p-5 grid grid-cols-3 gap-4 text-sm animate-fade-in"
        style={{ animationDelay: "60ms" }}
      >
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Cohort start</p>
          <p className="font-medium text-slate-200">{formatDate(intern.cohort_start)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Cohort end</p>
          <p className="font-medium text-slate-200">{formatDate(intern.cohort_end)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-wider mb-1">Capacity</p>
          <p className="font-medium text-slate-200">{intern.weekly_capacity_hours} hrs / wk</p>
        </div>
      </div>

      {/* Skills */}
      {intern.skills.length > 0 && (
        <section className="animate-fade-in" style={{ animationDelay: "120ms" }}>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Skills</h2>
          <div className="bg-card border border-card-border rounded-xl divide-y divide-card-border">
            {intern.skills.map(({ skill, proficiency }) => {
              const cls = skillCategoryColors[skill.category.toLowerCase()] ?? skillFallback;
              return (
                <div key={skill.id} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cls}`}>
                      {skill.name}
                    </span>
                    <span className="text-xs text-slate-600 capitalize">{skill.category}</span>
                  </div>
                  <ProficiencyDots level={proficiency} />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Allocations */}
      <section className="animate-fade-in" style={{ animationDelay: "180ms" }}>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Allocations</h2>
        {myAllocations.length === 0 ? (
          <p className="text-sm text-slate-600">No active allocations.</p>
        ) : (
          <div className="bg-card border border-card-border rounded-xl divide-y divide-card-border">
            {myAllocations.map((a) => {
              const project = projectMap.get(a.project_id);
              return (
                <div key={a.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {project?.name ?? `Project #${a.project_id}`}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(a.start_date)} – {formatDate(a.end_date)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-400 tabular-nums">
                    {a.hours_per_week} hrs / wk
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
