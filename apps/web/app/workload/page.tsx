import type { Allocation, Intern } from "../types";
import { getLoadStatus } from "../lib/workload";

async function fetchData() {
  const [interns, allocations] = await Promise.all([
    fetch("http://api:8000/interns/", { cache: "no-store" }).then((r) => r.json() as Promise<Intern[]>),
    fetch("http://api:8000/allocations/", { cache: "no-store" }).then((r) => r.json() as Promise<Allocation[]>),
  ]);
  return { interns, allocations };
}

const statusOrder = { red: 0, amber: 1, green: 2 };

const barGradient: Record<string, string> = {
  green: "from-emerald-500 to-green-400",
  amber: "from-amber-500 to-yellow-400",
  red:   "from-red-600 to-rose-500",
};

const textColors: Record<string, string> = {
  green: "text-emerald-400",
  amber: "text-amber-400",
  red:   "text-red-400",
};

export default async function WorkloadPage() {
  let interns: Intern[] = [];
  let allocations: Allocation[] = [];
  let error: string | null = null;

  try {
    ({ interns, allocations } = await fetchData());
  } catch {
    error = "Could not connect to the API. Make sure the backend is running.";
  }

  const allocatedMap = new Map<number, number>();
  for (const a of allocations) {
    allocatedMap.set(a.intern_id, (allocatedMap.get(a.intern_id) ?? 0) + a.hours_per_week);
  }

  const rows = interns
    .map((intern) => {
      const allocated = allocatedMap.get(intern.id) ?? 0;
      const status = getLoadStatus(allocated);
      const pct = Math.min(100, Math.round((allocated / intern.weekly_capacity_hours) * 100));
      return { intern, allocated, status, pct };
    })
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  const overloaded = rows.filter((r) => r.status === "red").length;
  const atCapacity = rows.filter((r) => r.status === "amber").length;
  const hasSpace   = rows.filter((r) => r.status === "green").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Workload</h1>
        <p className="text-sm text-slate-500 mt-1">Allocated hours vs weekly capacity per intern</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="rounded-xl bg-card border border-card-border px-5 py-4 mb-6 text-sm text-slate-400">
            <span className="text-red-400 font-semibold">{overloaded} intern{overloaded !== 1 ? "s" : ""}</span> overloaded
            {" · "}
            <span className="text-amber-400 font-semibold">{atCapacity}</span> at capacity
            {" · "}
            <span className="text-emerald-400 font-semibold">{hasSpace}</span> have space
          </div>

          <div className="flex gap-5 mb-5 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Under 30 hrs</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> 30 – 39 hrs</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> 40+ hrs (overloaded)</span>
          </div>

          <div className="bg-card border border-card-border rounded-xl divide-y divide-card-border">
            {rows.map(({ intern, allocated, status, pct }, i) => (
              <div
                key={intern.id}
                className="px-5 py-4 flex items-center gap-6 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-44 shrink-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{intern.name}</p>
                </div>

                <div className="flex-1 bar-track h-2">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${barGradient[status]} animate-slide-in-bar`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className={`w-36 shrink-0 text-xs font-semibold text-right tabular-nums ${textColors[status]}`}>
                  {allocated} / {intern.weekly_capacity_hours} hrs
                  <span className="text-slate-600 font-normal ml-1">({pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
