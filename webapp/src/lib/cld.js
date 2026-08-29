/**
 * Cloudinary delivery URLs.
 *
 * Images are uploaded once as masters by scripts/upload-images.mjs; every size
 * and format is derived on the fly from the URL. Nothing is pre-resized at
 * build time and no image bytes live in the repo.
 *
 * Replaces asset() for kit imagery. asset() is still correct for anything
 * genuinely served from public/ (the nav logo, the firmware .bin files).
 */

// The cloud name is NOT a secret - it appears in every URL the browser
// requests. The literal fallback matters: webapp/.env is gitignored, so the
// GitHub Actions build has no VITE_ value and would otherwise emit
// res.cloudinary.com/undefined/... and 404 every image on the live site.
const CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ggibudzr';

/**
 * Fixed ladder. Cloudinary bills a transformation the first time each unique
 * URL is requested, so widths must come from a short fixed list rather than
 * being computed per render.
 */
export const WIDTHS = [480, 960, 1440];

/**
 * c_lfill, not c_fill: fills the requested box but never upscales past the
 * master. Several banners are only 1200px wide, and c_fill at w_1440 would
 * return a blurry 207KB upscale instead of the sharp 1200px original.
 *
 * f_auto negotiates AVIF/WebP from the Accept header; q_auto picks quality
 * per image.
 */
export function cld(publicId, width = 960) {
  if (!publicId) return '';
  if (/^https?:\/\//.test(publicId)) return publicId;
  return `https://res.cloudinary.com/${CLOUD}/image/upload/f_auto,q_auto,c_lfill,w_${width}/${publicId}`;
}

export function cldSrcSet(publicId, widths = WIDTHS) {
  if (!publicId) return undefined;
  return widths.map((w) => `${cld(publicId, w)} ${w}w`).join(', ');
}
