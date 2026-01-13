import { getDashboardStats } from "@/actions/stats";
import { StatsWidgetsClient } from "./stats-widgets-client";

export async function StatsWidgets() {
  const stats = await getDashboardStats();
  return <StatsWidgetsClient stats={stats} />;
}
