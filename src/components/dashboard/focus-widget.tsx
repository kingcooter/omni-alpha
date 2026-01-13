"use server";

import { getOverdueThoughts, getThoughtsDueToday, getThoughtsWithProjects } from "@/actions/thoughts";
import { FocusWidgetClient } from "./focus-widget-client";

export async function FocusWidget() {
  const [overdue, dueToday, recentPinned] = await Promise.all([
    getOverdueThoughts(),
    getThoughtsDueToday(),
    getThoughtsWithProjects(20),
  ]);

  // Get pinned thoughts that aren't already in overdue or due today
  const overdueIds = new Set(overdue.map(t => t.id));
  const dueTodayIds = new Set(dueToday.map(t => t.id));
  const pinned = recentPinned
    .filter(t => t.isPinned && !overdueIds.has(t.id) && !dueTodayIds.has(t.id))
    .slice(0, 3);

  return (
    <FocusWidgetClient
      overdue={overdue}
      dueToday={dueToday}
      pinned={pinned}
    />
  );
}
