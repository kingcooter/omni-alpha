import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CalendarView } from "@/components/calendar/calendar-view";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOverdueThoughts,
  getThoughtsDueToday,
  getUpcomingThoughts,
  getThoughtsWithDueDates,
} from "@/actions/thoughts";

async function CalendarContent() {
  const [overdue, today, upcoming, allDated] = await Promise.all([
    getOverdueThoughts(),
    getThoughtsDueToday(),
    getUpcomingThoughts(),
    getThoughtsWithDueDates(),
  ]);

  // "Later" is anything with a due date that's not in the other categories
  const overdueIds = new Set(overdue.map((t) => t.id));
  const todayIds = new Set(today.map((t) => t.id));
  const upcomingIds = new Set(upcoming.map((t) => t.id));

  const later = allDated.filter(
    (t) => !overdueIds.has(t.id) && !todayIds.has(t.id) && !upcomingIds.has(t.id)
  );

  return (
    <CalendarView
      overdue={overdue}
      today={today}
      upcoming={upcoming}
      later={later}
      allThoughts={allDated}
    />
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-32 rounded-xl" />
      </div>

      {/* Grid skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 bg-card/80 p-6">
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </Card>
        <Card className="border-0 bg-card/80 h-[500px] p-4">
          <Skeleton className="h-12 w-full rounded-xl mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-6 md:p-8">
            <Suspense fallback={<CalendarSkeleton />}>
              <CalendarContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
