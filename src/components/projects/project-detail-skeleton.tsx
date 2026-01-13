import { Card, CardContent } from "@/components/ui/card";

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-secondary animate-pulse" />
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-secondary animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-secondary animate-pulse" />
              <div className="h-4 w-32 rounded bg-secondary animate-pulse" />
            </div>
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="h-6 w-8 rounded bg-secondary animate-pulse ml-auto" />
          <div className="h-3 w-12 rounded bg-secondary animate-pulse" />
        </div>
      </div>

      {/* Thoughts List Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 bg-card/60">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-full rounded bg-secondary animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
                  <div className="h-3 w-20 rounded bg-secondary animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
