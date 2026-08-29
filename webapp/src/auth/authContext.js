import { createContext, useContext } from 'react';

/**
 * The auth seam.
 *
 * Every guard and every piece of locked UI reads from these hooks and nothing
 * else. Today AuthProvider fills the context from a mock table; when the CRM
 * lands it fills the same context from an API, and none of the consumers change.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

/** Does the current user own this specific kit? */
export function useEntitlement(kitId) {
  const { entitlements } = useAuth();
  return Boolean(kitId) && entitlements.includes(kitId);
}

/**
 * Does the current user own at least one kit?
 *
 * This is the tool-gating rule (model B): buying any kit unlocks the Blockly IDE,
 * AI Studio, Serial Monitor and Firmware Flasher.
 */
export function useHasAnyKit() {
  const { entitlements } = useAuth();
  return entitlements.length > 0;
}
