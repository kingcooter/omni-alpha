"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Clock,
  Calendar,
  FolderKanban,
  Bot,
  Mail,
  Newspaper,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inbox", href: "/", icon: Inbox },
  { name: "Recents", href: "/recents", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Projects", href: "/projects", icon: FolderKanban },
];

const agents = [
  { name: "Email", href: "/agents/email", icon: Mail },
  { name: "News", href: "/agents/news", icon: Newspaper },
  { name: "Trends", href: "/agents/trends", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-primary">OMNI</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Agents Section */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Agents
          </h3>
        </div>
        {agents.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings at bottom */}
      <div className="border-t border-sidebar-border p-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/settings"
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
