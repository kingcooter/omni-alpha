import { ThoughtList } from "./thought-list";
import { getThoughtsWithProjects } from "@/actions/thoughts";
import { getProjects } from "@/actions/projects";

export async function ThoughtListAsync() {
  const [thoughtsWithProjects, projects] = await Promise.all([
    getThoughtsWithProjects(20),
    getProjects(),
  ]);

  return <ThoughtList thoughtsWithProjects={thoughtsWithProjects} projects={projects} />;
}
