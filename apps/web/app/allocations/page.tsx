import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import AllocationsPageClient from "./AllocationsPageClient";
import type { Allocation, Intern, Project } from "../types";
import { INTERNAL_API_URL } from "../lib/api";

export default async function AllocationsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [allocations, interns, projects] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Allocation[]>),
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Intern[]>),
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Project[]>),
  ]);

  return (
    <AllocationsPageClient
      initialAllocations={allocations}
      initialInterns={interns}
      initialProjects={projects}
    />
  );
}
