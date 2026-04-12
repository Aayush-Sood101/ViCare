'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { registerClerkTokenGetter } from '@/lib/api';

/** Attaches a fresh Clerk JWT to every API request. */
export default function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (!isSignedIn) {
      registerClerkTokenGetter(null);
      return;
    }
    registerClerkTokenGetter(async () => (await getToken()) ?? null);
  }, [isSignedIn, getToken]);

  return <>{children}</>;
}
