import { auth, currentUser } from '@clerk/nextjs/server';
import { roleFromClaims } from '@/lib/clerk-role';

/**
 * App role for routing: prefers Clerk user publicMetadata (what seed:admin sets),
 * then JWT/session claims. Fixes admins being treated as patients when the JWT
 * template does not mirror publicMetadata.role.
 */
export async function getAppRole(): Promise<string | undefined> {
  const user = await currentUser();
  const fromMeta = user?.publicMetadata?.role;
  if (typeof fromMeta === 'string' && fromMeta.length > 0) {
    return fromMeta;
  }
  const { sessionClaims } = await auth();
  return roleFromClaims(sessionClaims as Record<string, unknown> | undefined);
}
