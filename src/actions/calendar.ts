"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { events } from "@/lib/db/schema";
import type { Event, NewEvent } from "@/lib/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { getGoogleAccessToken } from "@/lib/google/tokens";
import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  parseGoogleEvent,
} from "@/lib/google/calendar";

/**
 * Sync events FROM Google Calendar to local database
 */
export async function syncFromGoogleCalendar(
  startDate: Date,
  endDate: Date
): Promise<{ synced: number; errors: string[] }> {
  const userId = await getCurrentUserId();
  const accessToken = await getGoogleAccessToken();

  if (!accessToken) {
    throw new Error("Google Calendar not connected. Please sign in with Google.");
  }

  const errors: string[] = [];
  let synced = 0;

  try {
    const googleEvents = await fetchCalendarEvents(accessToken, startDate, endDate);

    for (const gEvent of googleEvents) {
      if (!gEvent.id) continue;

      try {
        const parsed = parseGoogleEvent(gEvent);

        // Check if event already exists
        const [existing] = await db
          .select()
          .from(events)
          .where(
            and(eq(events.userId, userId), eq(events.externalId, gEvent.id))
          )
          .limit(1);

        const eventData: Omit<NewEvent, "id"> = {
          userId,
          title: parsed.title,
          description: parsed.description,
          startAt: parsed.startAt,
          endAt: parsed.endAt,
          allDay: parsed.allDay,
          location: parsed.location,
          externalId: parsed.externalId,
          externalSource: "google_calendar",
          syncStatus: "synced",
          lastSyncAt: new Date(),
        };

        if (existing) {
          // Update existing event
          await db
            .update(events)
            .set({ ...eventData, updatedAt: new Date() })
            .where(eq(events.id, existing.id));
        } else {
          // Insert new event
          await db.insert(events).values(eventData);
        }
        synced++;
      } catch (error) {
        errors.push(`Failed to sync: ${gEvent.summary ?? "Unknown event"}`);
      }
    }

    revalidatePath("/calendar");
    return { synced, errors };
  } catch (error) {
    console.error("Failed to sync from Google Calendar:", error);
    throw new Error("Failed to sync with Google Calendar");
  }
}

/**
 * Create event and push TO Google Calendar
 */
export async function createEventWithGoogleSync(data: {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
  allDay?: boolean;
  location?: string;
  projectId?: string;
}): Promise<Event> {
  const userId = await getCurrentUserId();
  const accessToken = await getGoogleAccessToken();

  let externalId: string | null = null;

  // If Google is connected, create event there first
  if (accessToken) {
    try {
      const gEvent = await createCalendarEvent(accessToken, data);
      externalId = gEvent.id ?? null;
    } catch (error) {
      console.error("Failed to create Google Calendar event:", error);
      // Continue anyway - will create local event
    }
  }

  const [newEvent] = await db
    .insert(events)
    .values({
      userId,
      title: data.title,
      description: data.description,
      startAt: data.startAt,
      endAt: data.endAt,
      allDay: data.allDay ?? false,
      location: data.location,
      projectId: data.projectId,
      externalId,
      externalSource: externalId ? "google_calendar" : null,
      syncStatus: externalId ? "synced" : "pending",
      lastSyncAt: externalId ? new Date() : null,
    })
    .returning();

  revalidatePath("/calendar");
  revalidatePath("/");
  return newEvent;
}

/**
 * Update event and sync TO Google
 */
export async function updateEventWithGoogleSync(
  id: string,
  updates: Partial<{
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    location: string;
    allDay: boolean;
  }>
): Promise<void> {
  const userId = await getCurrentUserId();

  const [existing] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error("Event not found");
  }

  // Update Google Calendar if connected
  if (existing.externalId && existing.externalSource === "google_calendar") {
    const accessToken = await getGoogleAccessToken();
    if (accessToken) {
      try {
        await updateCalendarEvent(accessToken, existing.externalId, updates);
      } catch (error) {
        console.error("Failed to update Google Calendar event:", error);
        // Mark as pending sync
        await db
          .update(events)
          .set({ syncStatus: "pending" })
          .where(eq(events.id, id));
      }
    }
  }

  await db
    .update(events)
    .set({
      ...updates,
      updatedAt: new Date(),
      lastSyncAt: new Date(),
    })
    .where(eq(events.id, id));

  revalidatePath("/calendar");
}

/**
 * Delete event and remove from Google
 */
export async function deleteEventWithGoogleSync(id: string): Promise<void> {
  const userId = await getCurrentUserId();

  const [existing] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .limit(1);

  if (!existing) {
    throw new Error("Event not found");
  }

  // Delete from Google Calendar if connected
  if (existing.externalId && existing.externalSource === "google_calendar") {
    const accessToken = await getGoogleAccessToken();
    if (accessToken) {
      try {
        await deleteCalendarEvent(accessToken, existing.externalId);
      } catch (error) {
        console.error("Failed to delete Google Calendar event:", error);
      }
    }
  }

  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/calendar");
}

/**
 * Get local events in a date range
 */
export async function getEvents(
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  const userId = await getCurrentUserId();

  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        gte(events.startAt, startDate),
        lte(events.startAt, endDate)
      )
    )
    .orderBy(events.startAt);
}

/**
 * Get all events for a specific day
 */
export async function getEventsForDay(date: Date): Promise<Event[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return getEvents(startOfDay, endOfDay);
}

/**
 * Get today's events
 */
export async function getTodaysEvents(): Promise<Event[]> {
  return getEventsForDay(new Date());
}

/**
 * Get upcoming events (next 7 days)
 */
export async function getUpcomingEvents(days = 7): Promise<Event[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  return getEvents(today, endDate);
}

/**
 * Get a single event
 */
export async function getEvent(id: string): Promise<Event | null> {
  const userId = await getCurrentUserId();

  const [event] = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.userId, userId)))
    .limit(1);

  return event ?? null;
}

/**
 * Get recent events (last 30 days + next 30 days)
 */
export async function getRecentEvents(): Promise<Event[]> {
  const userId = await getCurrentUserId();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, userId),
        gte(events.startAt, thirtyDaysAgo),
        lte(events.startAt, thirtyDaysFromNow)
      )
    )
    .orderBy(desc(events.startAt));
}
