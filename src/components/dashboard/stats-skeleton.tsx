import { Card, CardContent } from "@/components/ui/card";

export function StatsWidgetsSkeleton() {
  return (
    <Card className="border-0 bg-card/80 h-full">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center rounded-xl bg-secondary/30 p-3"
            >
              <div className="mb-2 h-8 w-8 rounded-lg bg-secondary animate-pulse" />
              <div className="h-7 w-10 rounded bg-secondary animate-pulse mb-1" />
              <div className="h-3 w-12 rounded bg-secondary animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
