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
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      className={className}
      {...rest}
    />
  );
}
