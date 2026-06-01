import AllocationsPageClient from "./AllocationsPageClient";
import type { Allocation, Intern, Project } from "../types";
import { INTERNAL_API_URL, serverFetchHeaders } from "../lib/api";

export default async function AllocationsPage() {
  const headers = await serverFetchHeaders();

  const [allocations, interns, projects] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Allocation[]> : []),
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Intern[]> : []),
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Project[]> : []),
  ]);

  return (
    <AllocationsPageClient
      initialAllocations={allocations}
      initialInterns={interns}
      initialProjects={projects}
    />
  );
}
