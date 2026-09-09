import geoip from 'geoip-lite';

/**
 * IP -> approximate location, resolved locally.
 *
 * geoip-lite ships the database in the package and does the lookup in-process:
 * no third-party API, no per-request network call, and no student IP addresses
 * leaving the server. That matters here because the people being located are
 * mostly minors.
 *
 * Accuracy is city-level and approximate - it reflects where the ISP routes the
 * address, not where the person is. Good enough for "which cities should we run
 * a hackathon in", not for anything about an individual.
 */

/** Addresses that can never resolve, so we skip the lookup and label them. */
function isLocal(ip) {
  if (!ip) return true;
  const s = String(ip).replace(/^::ffff:/, '');
  return (
    s === '::1' ||
    s === '127.0.0.1' ||
    s.startsWith('10.') ||
    s.startsWith('192.168.') ||
    s.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(s) ||
    s === 'localhost'
  );
}

/**
 * Returns { city, region, country, ll: [lat, lon] } or null.
 *
 * IPv4-mapped IPv6 (::ffff:1.2.3.4) is unwrapped first - Node reports client
 * addresses in that form on a dual-stack socket, and geoip-lite does not
 * understand it, so without this every real visitor would look unresolvable.
 */
export function lookupGeo(ip) {
  if (isLocal(ip)) return null;

  const clean = String(ip).replace(/^::ffff:/, '').split(',')[0].trim();
  let hit = null;
  try {
    hit = geoip.lookup(clean);
  } catch {
    return null;
  }
  if (!hit || !Array.isArray(hit.ll) || hit.ll.length !== 2) return null;

  return {
    city: hit.city || null,
    region: hit.region || null,
    country: hit.country || null,
    ll: [Number(hit.ll[0]), Number(hit.ll[1])],
  };
}

/**
 * Stable grouping key for the map.
 *
 * City names repeat across countries (Hyderabad IN vs Hyderabad PK), so the key
 * carries the country. Rows with a country but no city still group - as
 * "Unknown, IN" - rather than being dropped, because losing them would
 * under-count a region.
 */
export function geoKey(geo) {
  if (!geo || !geo.country) return null;
  return `${geo.city || 'Unknown'}|${geo.region || '-'}|${geo.country}`;
}
