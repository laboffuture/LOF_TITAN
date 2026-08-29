import { useAuth, useEntitlement } from './authContext';
import { LockedState } from './LockedState';

/**
 * Per-kit gate used inside the kit detail page.
 *
 * Renders inline rather than redirecting, so a locked section sits in place and
 * shows the customer exactly what they'd unlock.
 */
export function RequireKit({ kitId, kitName, sectionName = 'This section', theme = 'light', children }) {
  const { user } = useAuth();
  const owned = useEntitlement(kitId);

  if (owned) return children;

  const message = user
    ? `${sectionName} is part of the ${kitName || 'kit'}. Unlock it by adding this kit to your account.`
    : `${sectionName} is part of the ${kitName || 'kit'}. Sign in with an account that owns it, or get the kit.`;

  return (
    <LockedState
      title={`${sectionName} is locked`}
      message={message}
      kitName={kitName}
      theme={theme}
      compact
      showSignIn={!user}
    />
  );
}
