import type { Project } from "../types";
import ProjectsClient from "./ProjectsClient";

async function getProjects(): Promise<Project[]> {
  const res = await fetch("http://api:8000/projects/", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

export default async function ProjectsPage() {
  let projects: Project[] = [];
  let error: string | null = null;

  try {
    projects = await getProjects();
  } catch {
    error = "Could not connect to the API. Make sure the backend is running.";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
        <p className="text-sm text-slate-500 mt-1">{projects.length} projects</p>
      </div>

      {error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 text-sm">
          {error}
        </div>
      ) : (
        <ProjectsClient projects={projects} />
      )}
    </div>
  );
}
