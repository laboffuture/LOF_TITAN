import { AVAILABLE_KIT_IDS } from '../auth/kits';
import { PREVIEW_MODE } from './backend';

/**
 * LMS embed mode.
 *
 * Opening /embed/kit/<id> - as an iframe inside a Moodle page - shows that one
 * kit, header and tools included, without the LOF TITAN sign-in. The LMS is
 * what knows who the student is and what they bought, so the app does not ask
 * a second time. The student cannot wander off to the store or to other kits:
 * every route outside the kit and its tools leads back to the kit.
 *
 * TRIAL ONLY. Nothing here checks who is looking - anyone with the URL gets the
 * kit. That is no worse than today while kit content still ships inside the JS
 * bundle (it is readable in devtools regardless), and it is why the mode stays
 * off in builds that have a real API unless VITE_EMBED_TRIAL=true is set. The
 * production version replaces this with an LTI 1.3 launch or a signed LMS
 * token that the server verifies.
 */

const STORAGE_KEY = 'titan_embed_kit';

export const EMBED_ALLOWED =
  import.meta.env.DEV || PREVIEW_MODE || import.meta.env.VITE_EMBED_TRIAL === 'true';

/** Where an embedded kit may go besides its own page: its four tools. */
const TOOL_PATHS = ['/code', '/monitor', '/ai', '/flash'];

/** The router path, without the /LOF_TITAN/ base the Pages build is served under. */
function routerPath() {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = window.location.pathname;
  return base && path.startsWith(base) ? path.slice(base.length) || '/' : path;
}

function detectEmbedKit() {
  if (!EMBED_ALLOWED || typeof window === 'undefined') return null;

  const match = routerPath().match(/^\/embed\/kit\/([^/]+)\/?$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    if (!AVAILABLE_KIT_IDS.includes(id)) return null;
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Storage blocked in this frame. The URL alone is enough for this load.
    }
    return id;
  }

  // Reloaded while on one of the kit's tools, e.g. /code: the URL no longer
  // names the kit, so recover it. Only inside a frame - a normal tab that once
  // opened an embed link must not stay locked to a single kit.
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved && AVAILABLE_KIT_IDS.includes(saved) && window.self !== window.top) return saved;
  } catch {
    // Storage blocked; fall through to normal mode.
  }
  return null;
}

/** The kit this page is embedded for, or null when the app is running normally. */
export const EMBED_KIT = detectEmbedKit();

/** The embedded kit's own page - where every out-of-scope route is sent. */
export const EMBED_HOME = EMBED_KIT ? `/embed/kit/${EMBED_KIT}` : null;

/** A stable array, so it can be handed to context without re-rendering consumers. */
export const EMBED_ENTITLEMENTS = EMBED_KIT ? [EMBED_KIT] : null;

export function isEmbedPath(pathname) {
  return pathname === EMBED_HOME || TOOL_PATHS.includes(pathname);
}
