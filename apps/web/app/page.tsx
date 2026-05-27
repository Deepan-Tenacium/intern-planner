import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import DashboardClient from "./DashboardClient";
import type { Intern, Project, Allocation } from "./types";
import { INTERNAL_API_URL } from "./lib/api";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [interns, projects, allocations] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Intern[]>),
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Project[]>),
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Allocation[]>),
  ]);

  return (
    <DashboardClient
      initialInterns={interns}
      initialProjects={projects}
      initialAllocations={allocations}
    />
  );
}
