import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * Get the Google OAuth access token for the current user
 * Returns null if user hasn't connected Google
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const clerk = await clerkClient();
    const tokens = await clerk.users.getUserOauthAccessToken(userId, "oauth_google");

    if (!tokens || tokens.data.length === 0) {
      return null;
    }

    return tokens.data[0].token;
  } catch (error) {
    console.error("Failed to get Google access token:", error);
    return null;
  }
}

/**
 * Check if the current user has connected their Google account
 */
export async function hasGoogleConnection(): Promise<boolean> {
  const token = await getGoogleAccessToken();
  return token !== null;
}

/**
 * Get Google user info (for displaying which account is connected)
 */
export async function getGoogleUserInfo(): Promise<{
  email: string;
  name: string;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);

    // Find Google OAuth account
    const googleAccount = user.externalAccounts.find(
      (account) => account.provider === "oauth_google"
    );

    if (!googleAccount) return null;

    return {
      email: googleAccount.emailAddress ?? "",
      name: `${googleAccount.firstName ?? ""} ${googleAccount.lastName ?? ""}`.trim(),
    };
  } catch (error) {
    console.error("Failed to get Google user info:", error);
    return null;
  }
}
