import { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from './authContext';
import { api, ApiError } from '../lib/api';
import { PREVIEW_MODE } from '../lib/backend';
import { AVAILABLE_KIT_IDS } from './kits';

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

    // No API in a static preview - skip the request rather than firing one that
    // returns the host's 404 page and logs a misleading warning.
    if (PREVIEW_MODE) {
      setLoading(false);
      return;
    }

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

  /**
   * Redeem a printed kit serial.
   *
   * The server returns the updated user, so entitlements refresh from the
   * authoritative copy rather than being patched optimistically here - if the
   * grant partly failed the UI must not claim the kit is unlocked.
   */
  const redeem = useCallback(async (serial) => {
    const data = await api('/kits/redeem', {
      method: 'POST',
      body: { serial },
    });
    if (data.user) setUser(data.user);
    return data;
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
      // A static preview has no server to check a purchase against, and no
      // sign-in either - so every visitor is signed out and owns nothing,
      // which would render the whole catalogue as locked panels. There is
      // nothing to protect here: the kit content ships inside this bundle
      // already, so a lock would hide it from readers without hiding it from
      // anyone who opens devtools. Grant everything and let the preview be a
      // preview. Builds with an API are untouched.
      entitlements: PREVIEW_MODE ? AVAILABLE_KIT_IDS : (user?.entitlements ?? []),
      loading,
      signIn,
      register,
      redeem,
      signOut,
    }),
    [user, loading, signIn, register, redeem, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
