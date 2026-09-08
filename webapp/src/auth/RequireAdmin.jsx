import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, useIsAdmin } from './authContext';

/**
 * Staff-only route guard.
 *
 * Cosmetic only. It hides the page from people who should not see it, but the
 * data behind it is protected server-side: every /api/admin route re-reads the
 * role from the database and answers 404 to anyone else. Editing `role` in
 * devtools gets you an empty shell.
 */
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  // Wait for /auth/me. Redirecting during the initial load would bounce a
  // signed-in admin to the login page on every refresh.
  if (loading) {
    return (
      <div className="col-span-12 flex items-center justify-center py-24 text-slate-400 text-sm">
        Checking access…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Send non-staff home rather than showing "forbidden": a customer has no
  // reason to learn that an admin area exists.
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
