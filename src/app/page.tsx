export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { InboxCard } from "@/components/inbox/inbox-card";
import { ThoughtListAsync } from "@/components/thoughts/thought-list-async";
import { ThoughtListSkeleton } from "@/components/thoughts/thought-skeleton";
import { StatsWidgets } from "@/components/dashboard/stats-widgets";
import { StatsWidgetsSkeleton } from "@/components/dashboard/stats-skeleton";
import { FocusWidget } from "@/components/dashboard/focus-widget";
import { FocusWidgetSkeleton } from "@/components/dashboard/focus-skeleton";

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-8">
            {/* Inbox Card - Hero */}
            <section className="fade-in">
              <InboxCard />
            </section>

            {/* Two-column layout: Focus + Stats */}
            <section className="grid gap-6 lg:grid-cols-5">
              {/* Focus Widget - takes more space */}
              <div className="lg:col-span-3 slide-up">
                <Suspense fallback={<FocusWidgetSkeleton />}>
                  <FocusWidget />
                </Suspense>
              </div>

              {/* Stats - compact sidebar */}
              <div className="lg:col-span-2 slide-up">
                <Suspense fallback={<StatsWidgetsSkeleton />}>
                  <StatsWidgets />
                </Suspense>
              </div>
            </section>

            {/* Recent Thoughts */}
            <section>
              <Suspense fallback={<ThoughtListSkeleton count={5} />}>
                <ThoughtListAsync />
              </Suspense>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
