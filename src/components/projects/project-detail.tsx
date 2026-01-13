import { getThoughtsByProject } from "@/actions/thoughts";
import { ProjectDetailClient } from "./project-detail-client";
import type { Project } from "@/lib/db/schema";

interface ProjectDetailProps {
  project: Project;
}

export async function ProjectDetail({ project }: ProjectDetailProps) {
  const thoughts = await getThoughtsByProject(project.id);
  return <ProjectDetailClient project={project} thoughts={thoughts} />;
}
