import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { InboxCard } from "@/components/inbox/inbox-card";
import { ThoughtList } from "@/components/thoughts/thought-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Mail, Newspaper } from "lucide-react";
import { getRecentThoughts } from "@/actions/thoughts";

export default async function Dashboard() {
  const thoughts = await getRecentThoughts(20);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Inbox Card - Primary */}
            <InboxCard />

            {/* Dashboard Panes Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Today Widget */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-primary" />
                    Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">0 events</div>
                  <p className="text-xs text-muted-foreground">
                    No events scheduled
                  </p>
                </CardContent>
              </Card>

              {/* Email Digest Widget */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4 text-primary" />
                    Email Digest
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Not configured
                  </p>
                </CardContent>
              </Card>

              {/* News Widget */}
              <Card className="bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Newspaper className="h-4 w-4 text-primary" />
                    News
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">--</div>
                  <p className="text-xs text-muted-foreground">
                    Not configured
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Thoughts */}
            <ThoughtList thoughts={thoughts} />
          </div>
        </main>
      </div>
    </div>
  );
}
