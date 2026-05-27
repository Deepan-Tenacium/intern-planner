import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import ProjectsClient from "./ProjectsClient";
import type { Project, Allocation, Intern } from "../types";
import { INTERNAL_API_URL } from "../lib/api";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [projects, allocations, interns] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Project[]>),
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Allocation[]>),
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Intern[]>),
  ]);

  return (
    <ProjectsClient
      initialProjects={projects}
      initialAllocations={allocations}
      initialInterns={interns}
    />
  );
}
