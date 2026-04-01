import { clerkClient } from '@clerk/express';

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('Missing CLERK_SECRET_KEY environment variable. Please check your .env file.');
}

export { clerkClient };

/**
 * Update user role in Clerk public metadata
 * @param clerkUserId - The Clerk user ID
 * @param role - The role to set (patient, doctor, pending_doctor, rejected_doctor, admin)
 */
export async function updateUserRole(
  clerkUserId: string,
  role: string
): Promise<void> {
  try {
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: { role },
    });
    console.log(`✓ Updated role for user ${clerkUserId} to: ${role}`);
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

/**
 * Get user metadata from Clerk
 * @param clerkUserId - The Clerk user ID
 * @returns User metadata including role
 */
export async function getUserMetadata(clerkUserId: string): Promise<{ role?: string }> {
  try {
    const user = await clerkClient.users.getUser(clerkUserId);
    return user.publicMetadata as { role?: string };
  } catch (error) {
    console.error('Error getting user metadata:', error);
    throw error;
  }
}

/**
 * Get user by email
 * @param email - User email address
 * @returns User object or null
 */
export async function getUserByEmail(email: string) {
  try {
    const users = await clerkClient.users.getUserList({
      emailAddress: [email],
    });
    return users.data.length > 0 ? users.data[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    throw error;
  }
}
