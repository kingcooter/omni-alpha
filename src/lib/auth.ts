import { auth } from "@clerk/nextjs/server";

/**
 * Get the current authenticated user's ID.
 * Throws an error if not authenticated.
 */
export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized: No user logged in");
  }
  return userId;
}

/**
 * Get the current user ID or null if not authenticated.
 * Use this for optional auth scenarios.
 */
export async function getCurrentUserIdOrNull(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Check if a user is currently authenticated.
 */
export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return userId !== null;
}
