import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Target } from "lucide-react";

export function FocusWidgetSkeleton() {
  return (
    <Card className="border-0 bg-card/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Skeleton items */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border border-border/20 bg-secondary/20 p-3"
          >
            <Skeleton className="h-6 w-6 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
