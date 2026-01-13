import { getProjectsWithCounts } from "@/actions/projects";
import { ProjectListClient } from "./project-list-client";

export async function ProjectList() {
  const projects = await getProjectsWithCounts();

  return <ProjectListClient projects={projects} />;
}
