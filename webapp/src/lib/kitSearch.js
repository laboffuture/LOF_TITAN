/**
 * Search and filtering for the kit grid.
 *
 * Pure functions on purpose - no React, no DOM - so the matching rules can be
 * tested directly and the component stays presentational.
 *
 * Facet options are DERIVED FROM THE DATA rather than hardcoded, so adding a kit
 * with a new difficulty or duration makes that option appear on its own. With
 * 30+ kits coming, a hardcoded list would drift immediately.
 */

/** Fields worth matching a free-text query against, in rough order of relevance. */
function searchableText(kit) {
  return [
    kit.name,
    kit.tagline,
    kit.category,
    kit.badge,
    kit.description,
    ...(kit.components || []).map((c) => `${c.name} ${c.shortName || ''}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/** "45 Mins" -> 45. Returns null when there is no parsable number. */
export function parseDuration(duration) {
  const m = String(duration || '').match(/\d+/);
  return m ? Number(m[0]) : null;
}

/**
 * Difficulty ordering.
 *
 * The kits use four words that do not form an obvious ladder on their own
 * (Beginner, Intermediate, Builder, Innovator). This fixes the display order so
 * the filter reads easiest-first instead of alphabetically or by insertion.
 * Anything unrecognised sorts last rather than being dropped.
 */
const DIFFICULTY_ORDER = ['Beginner', 'Easy', 'Intermediate', 'Builder', 'Innovator', 'Engineer', 'Advanced'];

export function difficultyRank(level) {
  const i = DIFFICULTY_ORDER.indexOf(level);
  return i === -1 ? DIFFICULTY_ORDER.length : i;
}

/** Every facet value actually present in the given kits, ready for the UI. */
export function buildFacets(kits) {
  const levels = [...new Set(kits.map((k) => k.difficulty).filter(Boolean))].sort(
    (a, b) => difficultyRank(a) - difficultyRank(b)
  );

  const durations = [...new Set(kits.map((k) => k.duration).filter(Boolean))].sort(
    (a, b) => (parseDuration(a) ?? 0) - (parseDuration(b) ?? 0)
  );

  const ages = [...new Set(kits.map((k) => k.age).filter(Boolean))].sort(
    (a, b) => (parseDuration(a) ?? 0) - (parseDuration(b) ?? 0)
  );

  return { levels, durations, ages };
}

export const EMPTY_FILTERS = {
  q: '',
  level: '',
  duration: '',
  age: '',
  ownership: 'all', // 'all' | 'owned' | 'locked'
};

export function hasActiveFilters(filters) {
  return (
    Boolean(filters.q?.trim()) ||
    Boolean(filters.level) ||
    Boolean(filters.duration) ||
    Boolean(filters.age) ||
    (filters.ownership && filters.ownership !== 'all')
  );
}

/**
 * Apply a query and facet selections to the kit list.
 *
 * `entitlements` drives the ownership facet. Every clause is AND-ed; an empty
 * facet means "no constraint" rather than "match nothing".
 */
export function filterKits(kits, filters = EMPTY_FILTERS, entitlements = []) {
  const q = String(filters.q || '').trim().toLowerCase();
  const owned = new Set(entitlements);

  return kits.filter((kit) => {
    if (q && !searchableText(kit).includes(q)) return false;
    if (filters.level && kit.difficulty !== filters.level) return false;
    if (filters.duration && kit.duration !== filters.duration) return false;
    if (filters.age && kit.age !== filters.age) return false;

    if (filters.ownership === 'owned' && !owned.has(kit.id)) return false;
    if (filters.ownership === 'locked' && owned.has(kit.id)) return false;

    return true;
  });
}
