import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

/**
 * Gate for "must be signed in".
 *
 * Redirects to /login and remembers where the user was heading, so Login can
 * send them back after signing in.
 */
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Session restore is synchronous-ish, but rendering the redirect before it
  // finishes would bounce an already-signed-in user to /login on every reload.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
