import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import InternProfileClient from "./InternProfileClient";
import type { Intern, Allocation, Project } from "../../types";
import { INTERNAL_API_URL } from "../../lib/api";

export default async function InternProfilePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const token = session?.user?.backendToken ?? "";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [internRes, allocations, projects] = await Promise.all([
    fetch(`${INTERNAL_API_URL}/interns/${params.id}`, { headers, next: { revalidate: 30 } }),
    fetch(`${INTERNAL_API_URL}/allocations/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Allocation[]>),
    fetch(`${INTERNAL_API_URL}/projects/`, { headers, next: { revalidate: 30 } }).then((r) => r.json() as Promise<Project[]>),
  ]);

  if (internRes.status === 404) notFound();
  if (!internRes.ok) throw new Error("Failed to load intern");

  const intern = await internRes.json() as Intern;

  return (
    <InternProfileClient
      initialIntern={intern}
      initialAllocations={allocations}
      initialProjects={projects}
    />
  );
}
