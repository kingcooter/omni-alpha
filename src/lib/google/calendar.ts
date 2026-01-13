import { google, calendar_v3 } from "googleapis";

/**
 * Create a Google Calendar client with an access token
 */
export function createCalendarClient(accessToken: string): calendar_v3.Calendar {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth: oauth2Client });
}

/**
 * Fetch events from Google Calendar
 */
export async function fetchCalendarEvents(
  accessToken: string,
  timeMin: Date,
  timeMax: Date,
  calendarId = "primary"
): Promise<calendar_v3.Schema$Event[]> {
  const calendar = createCalendarClient(accessToken);

  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return response.data.items ?? [];
}

/**
 * Create a new event on Google Calendar
 */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    allDay?: boolean;
    location?: string;
  },
  calendarId = "primary"
): Promise<calendar_v3.Schema$Event> {
  const calendar = createCalendarClient(accessToken);

  const requestBody: calendar_v3.Schema$Event = {
    summary: event.title,
    description: event.description,
    location: event.location,
    start: event.allDay
      ? { date: event.startAt.toISOString().split("T")[0] }
      : { dateTime: event.startAt.toISOString() },
    end: event.allDay
      ? { date: event.endAt.toISOString().split("T")[0] }
      : { dateTime: event.endAt.toISOString() },
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody,
  });

  return response.data;
}

/**
 * Update an existing event on Google Calendar
 */
export async function updateCalendarEvent(
  accessToken: string,
  eventId: string,
  updates: Partial<{
    title: string;
    description: string;
    startAt: Date;
    endAt: Date;
    location: string;
    allDay: boolean;
  }>,
  calendarId = "primary"
): Promise<calendar_v3.Schema$Event> {
  const calendar = createCalendarClient(accessToken);

  const requestBody: calendar_v3.Schema$Event = {};

  if (updates.title) requestBody.summary = updates.title;
  if (updates.description) requestBody.description = updates.description;
  if (updates.location) requestBody.location = updates.location;

  if (updates.startAt) {
    requestBody.start = updates.allDay
      ? { date: updates.startAt.toISOString().split("T")[0] }
      : { dateTime: updates.startAt.toISOString() };
  }

  if (updates.endAt) {
    requestBody.end = updates.allDay
      ? { date: updates.endAt.toISOString().split("T")[0] }
      : { dateTime: updates.endAt.toISOString() };
  }

  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody,
  });

  return response.data;
}

/**
 * Delete an event from Google Calendar
 */
export async function deleteCalendarEvent(
  accessToken: string,
  eventId: string,
  calendarId = "primary"
): Promise<void> {
  const calendar = createCalendarClient(accessToken);

  await calendar.events.delete({
    calendarId,
    eventId,
  });
}

/**
 * Get list of user's calendars
 */
export async function getCalendarList(
  accessToken: string
): Promise<calendar_v3.Schema$CalendarListEntry[]> {
  const calendar = createCalendarClient(accessToken);

  const response = await calendar.calendarList.list();
  return response.data.items ?? [];
}

/**
 * Convert Google Calendar event to our Event format
 */
export function parseGoogleEvent(gEvent: calendar_v3.Schema$Event): {
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  allDay: boolean;
  location: string | null;
  externalId: string;
} {
  const startAt = gEvent.start?.dateTime
    ? new Date(gEvent.start.dateTime)
    : gEvent.start?.date
    ? new Date(gEvent.start.date)
    : new Date();

  const endAt = gEvent.end?.dateTime
    ? new Date(gEvent.end.dateTime)
    : gEvent.end?.date
    ? new Date(gEvent.end.date)
    : null;

  return {
    title: gEvent.summary ?? "Untitled Event",
    description: gEvent.description ?? null,
    startAt,
    endAt,
    allDay: !!gEvent.start?.date,
    location: gEvent.location ?? null,
    externalId: gEvent.id ?? "",
  };
}
