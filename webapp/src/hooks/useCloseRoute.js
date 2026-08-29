import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Closing a routed screen should feel like closing a modal: go back where you
 * came from. But if this route was the entry point (a deep link or a fresh
 * reload), going back would leave the site entirely - so fall back to a route
 * inside the app.
 *
 * react-router sets location.key to 'default' only on the initial entry.
 */
export function useCloseRoute(fallback = '/') {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(fallback, { replace: true });
    }
  }, [navigate, location.key, fallback]);
}
