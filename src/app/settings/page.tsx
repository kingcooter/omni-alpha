import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ComingSoon } from "@/components/ui/coming-soon";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <ComingSoon
            title="Settings"
            description="Configure your Omni experience. Coming in Phase 8."
            icon={Settings}
          />
        </main>
      </div>
    </div>
  );
}
