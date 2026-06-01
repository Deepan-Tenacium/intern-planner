import ProjectsClient from "./ProjectsClient";
import type { Project, Allocation, Intern } from "../types";
import { INTERNAL_API_URL, serverFetchHeaders } from "../lib/api";

export default async function ProjectsPage() {
  const headers = await serverFetchHeaders();

  const [projects, allocations, interns] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Project[]> : []),
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Allocation[]> : []),
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.ok ? r.json() as Promise<Intern[]> : []),
  ]);

  return (
    <ProjectsClient
      initialProjects={projects}
      initialAllocations={allocations}
      initialInterns={interns}
    />
  );
}
