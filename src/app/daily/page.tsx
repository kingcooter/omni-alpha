import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DailyView } from "@/components/daily/daily-view";
import { DailySkeleton } from "@/components/daily/daily-skeleton";

export default function DailyPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl p-6 md:p-8">
            <Suspense fallback={<DailySkeleton />}>
              <DailyView />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
