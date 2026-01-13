"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  Clock,
  Calendar,
  FolderKanban,
  Users,
  Mail,
  Newspaper,
  TrendingUp,
  Settings,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  CheckSquare,
  Gamepad2,
  Swords,
  BookOpen,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Inbox", href: "/", icon: Inbox },
  { name: "Daily", href: "/daily", icon: CheckSquare },
  { name: "Recents", href: "/recents", icon: Clock },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "People", href: "/people", icon: Users },
];

const playerMenu = [
  { name: "Player Menu", href: "/player", icon: Gamepad2 },
  { name: "Contacts", href: "/player/contacts", icon: Users },
  { name: "Quests", href: "/player/quests", icon: Swords },
  { name: "Journal", href: "/player/journal", icon: BookOpen },
  { name: "Character", href: "/player/character", icon: User },
];

const agents = [
  { name: "Email Digest", href: "/agents/email", icon: Mail },
  { name: "News Feed", href: "/agents/news", icon: Newspaper },
  { name: "Trends", href: "/agents/trends", icon: TrendingUp },
];

interface NavLinkProps {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isActive: boolean;
  showChevron?: boolean;
  iconClassName?: string;
}

function NavLink({ href, icon: Icon, children, isActive, showChevron, iconClassName }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-gradient-to-r from-primary/15 to-primary/5 text-primary"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-full bg-primary" />
      )}
      <div className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
        isActive ? "bg-primary/20" : "bg-transparent group-hover:bg-muted/50"
      )}>
        <Icon
          className={cn(
            "h-4 w-4 transition-transform duration-200 group-hover:scale-110",
            isActive ? "text-primary" : "",
            iconClassName
          )}
        />
      </div>
      <span className="flex-1">{children}</span>
      {showChevron && (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5" />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-40 flex h-screen w-60 flex-col border-r border-sidebar-border bg-sidebar/95 md:bg-sidebar/50 backdrop-blur-xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center px-5">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent ring-1 ring-primary/20" />
              <Sparkles className="relative h-4 w-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-gradient-gold">
                OMNI
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
                Command Center
              </span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Navigate
            </span>
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
            >
              {item.name}
            </NavLink>
          ))}

          {/* Separator */}
          <div className="my-5 mx-3 border-t border-sidebar-border/50" />

          {/* Player Menu Section */}
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              Life OS
            </span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            </div>
          </div>
          {playerMenu.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href || (item.href !== "/player" && pathname.startsWith(item.href))}
              showChevron
            >
              {item.name}
            </NavLink>
          ))}

          {/* Separator */}
          <div className="my-5 mx-3 border-t border-sidebar-border/50" />

          {/* Agents Section */}
          <div className="mb-3 flex items-center justify-between px-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
              AI Agents
            </span>
            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
          </div>
          {agents.map((item) => (
            <NavLink
              key={item.name}
              href={item.href}
              icon={item.icon}
              isActive={pathname === item.href}
              showChevron
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Settings at bottom */}
        <div className="border-t border-sidebar-border/50 p-3">
          <NavLink
            href="/settings"
            icon={Settings}
            isActive={pathname === "/settings"}
            iconClassName="group-hover:rotate-90 duration-500"
          >
            Settings
          </NavLink>
        </div>
      </aside>
    </>
  );
}
