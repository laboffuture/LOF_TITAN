/**
 * Resolve a public/ asset path against the deployed base URL.
 *
 * Asset paths are stored relative ('assets/banners/x.webp') so the data stays
 * host-agnostic. A bare relative path resolves against the CURRENT route, which
 * is correct at '/LOF_TITAN/' but wrong at '/LOF_TITAN/kit/invisible-line' -
 * it would ask for '/LOF_TITAN/kit/assets/banners/x.webp' and 404.
 *
 * Always run public asset paths through this before putting them in a src.
 */
export function asset(path) {
  if (!path) return path;
  const p = String(path);
  // Already absolute (http(s), data:, or already based) - leave alone.
  if (/^(https?:)?\/\//.test(p) || p.startsWith('data:') || p.startsWith(import.meta.env.BASE_URL)) {
    return p;
  }
  return `${import.meta.env.BASE_URL}${p.replace(/^\/+/, '')}`;
}
