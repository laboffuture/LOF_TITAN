import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { users } from './db.js';

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
