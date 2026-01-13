import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Newspaper } from "lucide-react";

export default function NewsAgentPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ComingSoon
            title="News Agent"
            description="Daily news digest from your favorite sources. Coming in Phase 6."
            icon={Newspaper}
          />
        </main>
      </div>
    </div>
  );
}
