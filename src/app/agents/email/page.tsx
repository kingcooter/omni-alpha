import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Mail } from "lucide-react";

export default function EmailAgentPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ComingSoon
            title="Email Agent"
            description="Daily email digest with AI summaries. Coming in Phase 7."
            icon={Mail}
          />
        </main>
      </div>
    </div>
  );
}
