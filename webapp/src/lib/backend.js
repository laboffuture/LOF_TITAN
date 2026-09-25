/**
 * Is there an API behind this build?
 *
 * A production build with no VITE_API_URL is a static preview - GitHub Pages
 * today. There is no server to check a password, so gating the dashboard behind
 * sign-in would leave visitors staring at a form that can never succeed.
 *
 * In that mode the catalogue is public and the auth guards step aside. Anywhere
 * with a real API - local dev via the Vite proxy, or the company server build
 * with VITE_API_URL set - sign-in is required exactly as before.
 *
 * Vite substitutes both values at build time, so this is a compile-time
 * constant: the branch that is not taken is removed by the minifier rather than
 * evaluated in the browser.
 */
export const PREVIEW_MODE = import.meta.env.PROD && !import.meta.env.VITE_API_URL;

/** The inverse, for code that reads better as a positive. */
export const HAS_BACKEND = !PREVIEW_MODE;

/**
 * Is the catalogue open to whoever opens the app?
 *
 * The LMS owns accounts and purchases now: students arrive from a course page
 * that already signed them in, so a second sign-in here would only be a wall in
 * front of material they have already paid for. The app opens on the dashboard
 * with every kit unlocked.
 *
 * Staff sign-in still exists - /login is reachable by URL and is the way into
 * the admin area - it just is not part of the student's path any more.
 *
 * Set VITE_REQUIRE_LOGIN=true at build time to put the sign-in gate back.
 */
export const OPEN_ACCESS = import.meta.env.VITE_REQUIRE_LOGIN !== 'true';
