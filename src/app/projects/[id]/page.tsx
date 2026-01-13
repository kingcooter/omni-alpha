import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProjectDetail } from "@/components/projects/project-detail";
import { ProjectDetailSkeleton } from "@/components/projects/project-detail-skeleton";
import { getProject } from "@/actions/projects";

interface ProjectPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-6 md:p-8">
            <Suspense fallback={<ProjectDetailSkeleton />}>
              <ProjectDetail project={project} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
