import { getHabitsWithStreaks } from "@/actions/habits";
import { DailyViewClient } from "./daily-view-client";

export async function DailyView() {
  const habits = await getHabitsWithStreaks();

  return <DailyViewClient initialHabits={habits} />;
}
