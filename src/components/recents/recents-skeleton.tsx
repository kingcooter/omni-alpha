import { Card, CardContent } from "@/components/ui/card";

export function RecentsContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-24 rounded bg-secondary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Search and filters skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1 h-10 rounded-lg bg-secondary animate-pulse" />
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-secondary animate-pulse" />
          <div className="h-9 w-20 rounded-lg bg-secondary animate-pulse" />
        </div>
      </div>

      {/* Thoughts skeleton */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="border-0 bg-card/40">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-secondary animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-secondary animate-pulse" />
                <div className="flex gap-3">
                  <div className="h-3 w-16 rounded bg-secondary animate-pulse" />
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
