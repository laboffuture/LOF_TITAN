import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';
import { PREVIEW_MODE } from '../lib/backend';

/**
 * Gate for "must be signed in", and for "this is a customer surface".
 *
 * Redirects to /login and remembers where the user was heading, so Login can
 * send them back after signing in.
 *
 * Staff are bounced to /admin instead. An admin account is a back-office login,
 * not a customer one: it has no entitlements, so the dashboard, kit pages and
 * tools would all render as locked panels anyway. Every customer route goes
 * through this guard, so putting the rule here means a new route cannot forget
 * it.
 */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // A static preview has no API to sign in against, so the catalogue is public
  // there. Bouncing visitors to a form that cannot succeed would make the whole
  // site look broken.
  if (PREVIEW_MODE) return children;

  // Session restore is synchronous-ish, but rendering the redirect before it
  // finishes would bounce an already-signed-in user to /login on every reload.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
