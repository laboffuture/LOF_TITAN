/**
 * Canonical registry of LOF TITAN kits.
 *
 * This is the single source of truth for "which kits exist and can be owned".
 * Entitlements reference these ids, so anything not listed here cannot be sold
 * or unlocked.
 *
 * `status`:
 *   'available'   - has full content in projects.js, purchasable, openable
 *   'coming-soon' - advertised on the dashboard but has no content yet
 */
export const KITS = [
  { id: 'invisible-line', name: 'Invisible Line Patrol', status: 'available' },
  { id: 'heat-seek-rover', name: 'Heat Seek Rover', status: 'available' },
  { id: 'heartbeat', name: 'Heart Beat DJ Bot', status: 'available' },
  { id: 'anemometer', name: 'Anemometer', status: 'available' },
  { id: 'darrieus-turbine', name: 'Darrieus Turbine', status: 'available' },
  { id: 'anti-icing-systems', name: 'Anti-Icing Systems', status: 'available' },
  { id: 'hydraulic-landing-gear', name: 'Hydraulic Landing Gear', status: 'available' },
  { id: 'rc-plane', name: 'RC Plane', status: 'available' },
  { id: 'axes3', name: 'Axes 3', status: 'coming-soon' },
  { id: 'aquanova', name: 'Aqua Nova', status: 'coming-soon' },
];

/** Ids of every kit a customer can actually buy and open. */
export const AVAILABLE_KIT_IDS = KITS.filter(k => k.status === 'available').map(k => k.id);

export function getKit(kitId) {
  return KITS.find(k => k.id === kitId) || null;
}

export function isAvailable(kitId) {
  return getKit(kitId)?.status === 'available';
}
