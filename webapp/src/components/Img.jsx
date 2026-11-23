import { cld, cldSrcSet } from '../lib/cld';

/**
 * A Cloudinary-backed <img>.
 *
 * `sizes` must describe the CSS width the image occupies at each breakpoint.
 * Without it the browser assumes 100vw and pulls the 1440w variant for a
 * 460px-wide dashboard card.
 *
 * `priority` is for the LCP image only - the first carousel slide. Everything
 * else stays lazy.
 */
export function Img({
  id,
  alt,
  sizes = '100vw',
  width,
  height,
  priority = false,
  className = '',
  ...rest
}) {
  return (
    <img
      src={cld(id, 960)}
      srcSet={cldSrcSet(id)}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      // Lowercase on purpose. React 18 has no fetchPriority prop - the
      // camelCase form trips "React does not recognize the `fetchPriority`
      // prop" on every image. All-lowercase passes straight through as a plain
      // attribute, which is what the browser reads. React 19 adds camelCase.
      fetchpriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
