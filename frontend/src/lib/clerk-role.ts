/** Resolve app role from Clerk session JWT / claims (backend uses publicMetadata.role). */
export function roleFromClaims(claims: Record<string, unknown> | null | undefined): string | undefined {
  if (!claims) return undefined;
  if (typeof claims.role === 'string') return claims.role;
  const md = claims.metadata as { role?: string } | undefined;
  if (md?.role) return md.role;
  const pm = claims.public_metadata as { role?: string } | undefined;
  if (pm?.role) return pm.role;
  return undefined;
}
