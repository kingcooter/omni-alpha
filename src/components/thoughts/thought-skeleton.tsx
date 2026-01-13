import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ThoughtSkeleton() {
  return (
    <Card className="bg-card">
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-20 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ThoughtListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-32" />
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <ThoughtSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
