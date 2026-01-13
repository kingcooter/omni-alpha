"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FolderKanban,
  Plus,
  Sparkles,
  FileText,
  Palette,
  MoreHorizontal,
  Pencil,
  Trash2,
  Archive,
  ArrowRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createProject, deleteProject, updateProject } from "@/actions/projects";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/db/schema";

interface ProjectListClientProps {
  projects: (Project & { thoughtCount: number })[];
}

const projectColors = [
  { name: "Gold", value: "#d4a574" },
  { name: "Rose", value: "#f472b6" },
  { name: "Violet", value: "#a78bfa" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Emerald", value: "#34d399" },
  { name: "Orange", value: "#fb923c" },
];

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newColor, setNewColor] = useState("#d4a574");
  const [isPending, startTransition] = useTransition();

  const handleCreate = () => {
    if (!newName.trim()) return;

    startTransition(async () => {
      try {
        await createProject({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          color: newColor,
        });
        toast.success("Project created");
        setIsCreateOpen(false);
        setNewName("");
        setNewDescription("");
        setNewColor("#d4a574");
      } catch {
        toast.error("Failed to create project");
      }
    });
  };

  const handleEdit = () => {
    if (!editingProject || !newName.trim()) return;

    startTransition(async () => {
      try {
        await updateProject(editingProject.id, {
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          color: newColor,
        });
        toast.success("Project updated");
        setIsEditOpen(false);
        setEditingProject(null);
      } catch {
        toast.error("Failed to update project");
      }
    });
  };

  const handleDelete = (project: Project) => {
    startTransition(async () => {
      try {
        await deleteProject(project.id);
        toast.success("Project deleted");
      } catch {
        toast.error("Failed to delete project");
      }
    });
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setNewName(project.name);
    setNewDescription(project.description ?? "");
    setNewColor(project.color ?? "#d4a574");
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Projects</h1>
            <p className="text-sm text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Create a new project to organize your thoughts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  placeholder="Project name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border-border/50 bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <Input
                  placeholder="Optional description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="border-border/50 bg-secondary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color
                </label>
                <div className="flex gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setNewColor(color.value)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-all",
                        newColor === color.value && "ring-2 ring-white ring-offset-2 ring-offset-background"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isPending || !newName.trim()}>
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
        <Card className="border-0 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No projects yet</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Create your first project to start organizing your thoughts.
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={cn(
                "group relative overflow-hidden border-0 bg-card/60 backdrop-blur-sm transition-all duration-300",
                "hover:bg-card/80 hover:shadow-lg hover:-translate-y-0.5"
              )}
            >
              {/* Color indicator */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: project.color ?? "#d4a574" }}
              />

              <CardContent className="p-5 pl-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${project.color}20` }}
                      >
                        <FolderKanban
                          className="h-4 w-4"
                          style={{ color: project.color ?? "#d4a574" }}
                        />
                      </div>
                      <h3 className="font-semibold text-foreground">{project.name}</h3>
                    </Link>
                    {project.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground/60">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {project.thoughtCount} thought{project.thoughtCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
                      <DropdownMenuItem onClick={() => openEditDialog(project)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(project)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="border-border/50 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Name</label>
              <Input
                placeholder="Project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border-border/50 bg-secondary/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Input
                placeholder="Optional description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="border-border/50 bg-secondary/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </label>
              <div className="flex gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewColor(color.value)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      newColor === color.value && "ring-2 ring-white ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isPending || !newName.trim()}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
