'use client';

import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
import { setAuthToken, authApi } from '@/lib/api';
import type { UserRole } from '@/types';

interface AuthStatus {
  role: UserRole;
  profileComplete: boolean;
  rejectionReason?: string;
}

export function useAuth() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshToken = useCallback(async () => {
    if (isSignedIn) {
      const token = await getToken();
      setAuthToken(token);
      return token;
    }
    return null;
  }, [isSignedIn, getToken]);

  useEffect(() => {
    const initAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          const token = await getToken();
          setAuthToken(token);

          const { data } = await authApi.getStatus();
          setStatus({
            role: data.role as UserRole,
            profileComplete: Boolean(data.profileComplete),
            rejectionReason: data.rejectionReason ?? undefined,
          });
        } catch (error) {
          console.error('Auth init error:', error);
        }
      } else {
        setAuthToken(null);
        setStatus(null);
      }

      setIsReady(true);
    };

    initAuth();
  }, [isLoaded, isSignedIn, getToken]);

  const role = (user?.publicMetadata?.role as UserRole) || status?.role || 'patient';

  return {
    isLoaded: isReady,
    isSignedIn,
    user,
    role,
    status,
    getToken,
    refreshToken,
  };
}
