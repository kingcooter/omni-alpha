import { getThoughtsWithProjects } from "@/actions/thoughts";
import { getProjects } from "@/actions/projects";
import { RecentsClient } from "./recents-client";

export async function RecentsContent() {
  const [thoughtsWithProjects, projects] = await Promise.all([
    getThoughtsWithProjects(100),
    getProjects(),
  ]);

  return <RecentsClient thoughtsWithProjects={thoughtsWithProjects} projects={projects} />;
}
