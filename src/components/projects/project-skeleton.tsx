import { Card, CardContent } from "@/components/ui/card";

export function ProjectListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-24 rounded bg-secondary animate-pulse" />
            <div className="h-4 w-16 rounded bg-secondary animate-pulse" />
          </div>
        </div>
        <div className="h-9 w-28 rounded-lg bg-secondary animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 bg-card/40">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-secondary animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 rounded bg-secondary animate-pulse" />
                  <div className="h-4 w-full rounded bg-secondary animate-pulse" />
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
