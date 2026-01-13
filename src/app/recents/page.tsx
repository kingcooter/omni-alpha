export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RecentsContent } from "@/components/recents/recents-content";
import { RecentsContentSkeleton } from "@/components/recents/recents-skeleton";

export default function RecentsPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-6 md:p-8">
            <Suspense fallback={<RecentsContentSkeleton />}>
              <RecentsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
