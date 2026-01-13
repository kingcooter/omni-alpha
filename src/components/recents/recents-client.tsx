"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThoughtCard } from "@/components/thoughts/thought-card";
import {
  Clock,
  Search,
  Filter,
  X,
  FolderKanban,
  Sparkles,
  Archive,
  ArrowUpDown,
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/db/schema";
import type { ThoughtWithProject } from "@/actions/thoughts";

interface RecentsClientProps {
  thoughtsWithProjects: ThoughtWithProject[];
  projects: Project[];
}

type SortOption = "newest" | "oldest" | "alphabetical";
type DateFilter = "all" | "today" | "week" | "month";

const sortLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  alphabetical: "A-Z",
};

const dateLabels: Record<DateFilter, string> = {
  all: "All time",
  today: "Today",
  week: "This week",
  month: "This month",
};

function isWithinDateRange(date: Date | null, filter: DateFilter): boolean {
  if (!date || filter === "all") return true;

  const now = new Date();
  const thoughtDate = new Date(date);

  switch (filter) {
    case "today":
      return thoughtDate.toDateString() === now.toDateString();
    case "week": {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return thoughtDate >= weekAgo;
    }
    case "month": {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return thoughtDate >= monthAgo;
    }
    default:
      return true;
  }
}

export function RecentsClient({ thoughtsWithProjects, projects }: RecentsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const filteredAndSortedThoughts = useMemo(() => {
    // First filter
    const filtered = thoughtsWithProjects.filter((thought) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (!thought.content.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Project filter
      if (selectedProjectId !== null) {
        if (selectedProjectId === "none") {
          if (thought.projectId !== null) return false;
        } else {
          if (thought.projectId !== selectedProjectId) return false;
        }
      }

      // Pinned filter
      if (showPinnedOnly && !thought.isPinned) {
        return false;
      }

      // Date filter
      if (!isWithinDateRange(thought.createdAt, dateFilter)) {
        return false;
      }

      return true;
    });

    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
        case "alphabetical":
          return a.content.localeCompare(b.content);
        case "newest":
        default:
          return (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0);
      }
    });
  }, [thoughtsWithProjects, searchQuery, selectedProjectId, showPinnedOnly, sortBy, dateFilter]);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const hasFilters = selectedProjectId !== null || showPinnedOnly || dateFilter !== "all";

  const clearFilters = () => {
    setSelectedProjectId(null);
    setShowPinnedOnly(false);
    setDateFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Recent Thoughts</h1>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedThoughts.length} of {thoughtsWithProjects.length} thoughts
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
          <Input
            placeholder="Search thoughts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border/50 bg-secondary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-border/50",
                  selectedProjectId && "border-primary/50 bg-primary/10"
                )}
              >
                <FolderKanban className="h-4 w-4" />
                {selectedProject ? selectedProject.name : "Project"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
              <DropdownMenuItem
                onClick={() => setSelectedProjectId(null)}
                className={cn(!selectedProjectId && "bg-primary/10")}
              >
                All Projects
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSelectedProjectId("none")}
                className={cn(selectedProjectId === "none" && "bg-primary/10")}
              >
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Archive className="h-3 w-3" />
                  No Project
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={cn(
                    "gap-2",
                    selectedProjectId === project.id && "bg-primary/10"
                  )}
                >
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: project.color ?? "#d4a574" }}
                  />
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Pinned filter */}
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 border-border/50",
              showPinnedOnly && "border-primary/50 bg-primary/10"
            )}
            onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          >
            <Sparkles className="h-4 w-4" />
            Pinned
          </Button>

          {/* Date filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-border/50",
                  dateFilter !== "all" && "border-primary/50 bg-primary/10"
                )}
              >
                <CalendarDays className="h-4 w-4" />
                {dateLabels[dateFilter]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
              {(Object.keys(dateLabels) as DateFilter[]).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setDateFilter(option)}
                  className={cn(dateFilter === option && "bg-primary/10")}
                >
                  {dateLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-2 border-border/50",
                  sortBy !== "newest" && "border-primary/50 bg-primary/10"
                )}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortLabels[sortBy]}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-border/50 bg-card/95 backdrop-blur-xl">
              {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                <DropdownMenuItem
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={cn(sortBy === option && "bg-primary/10")}
                >
                  {sortLabels[option]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Clear filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Thoughts list */}
      {filteredAndSortedThoughts.length === 0 ? (
        <Card className="border-0 bg-card/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No thoughts found</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {searchQuery || hasFilters
                ? "Try adjusting your search or filters."
                : "Start capturing thoughts from the inbox."}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredAndSortedThoughts.map((thought) => (
            <ThoughtCard
              key={thought.id}
              thought={thought}
              project={thought.project}
              projects={projects}
            />
          ))}
        </div>
      )}
    </div>
  );
}
