import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { TrendingUp } from "lucide-react";

export default function TrendsAgentPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ComingSoon
            title="Trends Agent"
            description="X/Twitter trends with context and analysis. Coming in Phase 7."
            icon={TrendingUp}
          />
        </main>
      </div>
    </div>
  );
}
