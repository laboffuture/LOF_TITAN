import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { users, accessLog } from './db.js';
import { lookupGeo } from './geo.js';

export const COOKIE_NAME = 'titan_session';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s || s === 'replace-me-with-a-long-random-string') {
    throw new Error('JWT_SECRET is not set to a real value. See server/.env.example.');
  }
  return s;
}

export function issueSession(res, user) {
  const token = jwt.sign({ sub: String(user._id) }, secret(), { expiresIn: '7d' });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true, // not readable from JS, so an XSS can't steal it
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSession(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/** Never send the password hash to a client. */
export function publicUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    email: user.email,
    name: user.name,
    entitlements: user.entitlements || [],
    // Sent so the app can show the Admin link. It is a HINT ONLY - every admin
    // endpoint re-checks the role from the database, so editing this in the
    // browser reveals nothing.
    role: user.role === 'admin' ? 'admin' : 'user',
  };
}

/**
 * Loads the signed-in user onto req.user, or leaves it null.
 *
 * Reads entitlements from the database on every request rather than trusting
 * the token, so a purchase (or refund) in the CRM takes effect immediately
 * instead of when the cookie happens to expire.
 */
export async function loadUser(req, _res, next) {
  req.user = null;
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  try {
    const payload = jwt.verify(token, secret());
    const found = await users().findOne({ _id: new ObjectId(payload.sub) });
    if (found) req.user = found;
  } catch {
    // Expired, tampered with, or the user was deleted - stay signed out.
  }
  next();
}

export function requireUser(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'NOT_SIGNED_IN' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'NOT_SIGNED_IN' });
  }
  // Read from the freshly-loaded database document, never from the JWT: demoting
  // an admin then takes effect on their next request instead of when their
  // week-long cookie happens to expire.
  if (req.user.role !== 'admin') {
    // 404, not 403. A non-admin should not learn that /api/admin exists.
    return res.status(404).json({ error: 'NOT_FOUND' });
  }
  next();
}

/**
 * The client address, honest about proxies.
 *
 * req.ip is the proxy's own address unless TRUST_PROXY is set, so in production
 * this is only meaningful once that is configured - otherwise every row in the
 * audit trail shows the load balancer.
 */
export function clientIp(req) {
  return req.ip || req.socket?.remoteAddress || null;
}

/**
 * Append-only record of a user touching kit content.
 *
 * Deliberately fire-and-forget: an audit write must never fail the request that
 * a paying customer is making. A lost log line is cheaper than a 500.
 */
export function recordAccess(req, { kitId, action, allowed }) {
  const ip = clientIp(req);
  // Resolved once, at write time. Doing it on read would mean re-resolving the
  // whole log on every admin page load, and would lose the location entirely
  // once rows are aged out or the database is updated.
  const geo = lookupGeo(ip);

  const entry = {
    at: new Date(),
    userId: req.user ? String(req.user._id) : null,
    email: req.user?.email || null,
    kitId: kitId || null,
    action,
    allowed: Boolean(allowed),
    ip,
    userAgent: String(req.get('user-agent') || '').slice(0, 300),
    city: geo?.city || null,
    region: geo?.region || null,
    country: geo?.country || null,
    // [lat, lon] - stored denormalised so the map aggregation never needs a
    // second lookup pass.
    ll: geo?.ll || null,
  };
  accessLog()
    .insertOne(entry)
    .catch((err) => console.error('[API] access log write failed:', err.message));
}
