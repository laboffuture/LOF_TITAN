import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from './authContext';
import { api, ApiError } from '../lib/api';

/**
 * Auth backed by the LOF TITAN API.
 *
 * This is the ONLY module that knows where users come from. Guards, locked
 * states and routes read the context and are unaffected by what happens here -
 * which is exactly why swapping the mock table for real HTTP touched no other
 * file.
 *
 * The session lives in an httpOnly cookie set by the server, so it is never
 * readable from JavaScript and nothing sensitive is kept in localStorage.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Ask the server who we are. A 401 just means signed out.
  useEffect(() => {
    let cancelled = false;

    api('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch((err) => {
        if (!cancelled && err instanceof ApiError && err.status === 0) {
          console.warn('[auth] API unreachable - continuing signed out.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (email, password, name) => {
    const data = await api('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    });
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Clear locally even if the request failed.
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      entitlements: user?.entitlements ?? [],
      loading,
      signIn,
      register,
      signOut,
    }),
    [user, loading, signIn, register, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
