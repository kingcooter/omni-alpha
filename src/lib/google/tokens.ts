/**
 * Google OAuth tokens - stubbed out for single-user mode.
 * Google Calendar integration can be re-added later with
 * environment-based OAuth or service account credentials.
 */

/**
 * Get the Google OAuth access token for the current user
 * Returns null - Google integration is disabled in single-user mode
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  // TODO: Implement with environment variables or service account
  return null;
}

/**
 * Check if the current user has connected their Google account
 */
export async function hasGoogleConnection(): Promise<boolean> {
  return false;
}

/**
 * Get Google user info (for displaying which account is connected)
 */
export async function getGoogleUserInfo(): Promise<{
  email: string;
  name: string;
} | null> {
  return null;
}
