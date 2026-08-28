import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { users } from '../db.js';
import { issueSession, clearSession, publicUser, requireUser } from '../session.js';

export const authRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

authRouter.post('/register', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const name = String(req.body?.name || '').trim();

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'INVALID_EMAIL' });
  }
  if (password.length < MIN_PASSWORD) {
    return res.status(400).json({ error: 'PASSWORD_TOO_SHORT' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Built field by field on purpose. Never spread req.body: a request carrying
  // {"entitlements":["invisible-line"]} must not be able to grant itself a paid
  // kit. Registration ALWAYS produces an account that owns nothing - kits are
  // added only after payment clears.
  const doc = {
    email,
    name: name || email.split('@')[0],
    passwordHash,
    entitlements: [],
    createdAt: new Date(),
  };

  try {
    const result = await users().insertOne(doc);
    const user = { ...doc, _id: result.insertedId };
    issueSession(res, user);
    return res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    // Unique index on email: someone already registered, or two requests raced.
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'EMAIL_TAKEN' });
    }
    throw err;
  }
});

authRouter.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'EMAIL_AND_PASSWORD_REQUIRED' });
  }

  const user = await users().findOne({ email });

  // Same response whether the email is unknown or the password is wrong, so
  // this endpoint can't be used to enumerate which accounts exist.
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS' });
  }

  issueSession(res, user);
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (req, res) => {
  clearSession(res);
  res.json({ ok: true });
});

authRouter.get('/me', requireUser, (req, res) => {
  res.json({ user: publicUser(req.user) });
});
