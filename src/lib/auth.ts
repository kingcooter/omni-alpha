/**
 * Simple single-user auth for personal Life OS.
 * No login required - it's just for you.
 */

const DEFAULT_USER_ID = "owner";

/**
 * Get the current user's ID.
 * For single-user mode, always returns the default user.
 */
export async function getCurrentUserId(): Promise<string> {
  return DEFAULT_USER_ID;
}

/**
 * Get the current user ID or null.
 * For single-user mode, always returns the default user.
 */
export async function getCurrentUserIdOrNull(): Promise<string | null> {
  return DEFAULT_USER_ID;
}

/**
 * Check if a user is authenticated.
 * For single-user mode, always returns true.
 */
export async function isAuthenticated(): Promise<boolean> {
  return true;
}
