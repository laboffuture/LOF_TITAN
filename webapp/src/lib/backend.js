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
