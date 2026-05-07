import type { Allocation, Intern, Project } from "../types";
import AllocationsClient from "./AllocationsClient";

async function fetchAll() {
  const [allocations, interns, projects] = await Promise.all([
    fetch("http://api:8000/allocations/", { cache: "no-store" }).then((r) => r.json() as Promise<Allocation[]>),
    fetch("http://api:8000/interns/", { cache: "no-store" }).then((r) => r.json() as Promise<Intern[]>),
    fetch("http://api:8000/projects/", { cache: "no-store" }).then((r) => r.json() as Promise<Project[]>),
  ]);
  return { allocations, interns, projects };
}

export default async function AllocationsPage() {
  let rows: { allocation: Allocation; internName: string; projectName: string }[] = [];
  let count = 0;
  let error: string | null = null;

  try {
    const { allocations, interns, projects } = await fetchAll();
    const internMap = new Map(interns.map((i) => [i.id, i.name]));
    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    count = allocations.length;
    rows = allocations.map((a) => ({
      allocation: a,
      internName: internMap.get(a.intern_id) ?? `Intern #${a.intern_id}`,
      projectName: projectMap.get(a.project_id) ?? `Project #${a.project_id}`,
    }));
  } catch {
    error = "Could not connect to the API. Make sure the backend is running.";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Allocations</h1>
        <p className="text-sm text-slate-500 mt-1">{count} allocations</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <AllocationsClient rows={rows} />
      )}
    </div>
  );
}
