import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import InternsClient from "./InternsClient";
import type { Intern, Allocation, Project } from "../types";
import { INTERNAL_API_URL } from "../lib/api";

export default async function InternsPage() {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [interns, allocations, projects] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/interns/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Intern[]>),
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Allocation[]>),
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Project[]>),
  ]);

  return (
    <InternsClient
      initialInterns={interns}
      initialAllocations={allocations}
      initialProjects={projects}
    />
  );
}
