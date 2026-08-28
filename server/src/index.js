import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { connectDb } from './db.js';
import { loadUser } from './session.js';
import { authRouter } from './routes/auth.js';
import { kitsRouter } from './routes/kits.js';
import { globalLimiter, loginLimiter, registerLimiter } from './rateLimit.js';

const app = express();

// Behind a proxy (Render, Railway, nginx) req.ip is the PROXY's address unless
// this is set - which would put every user in one shared rate-limit bucket and
// let one abuser lock out everybody. But enabling it when NOT behind a trusted
// proxy is worse: a direct client can then spoof X-Forwarded-For and dodge the
// limits entirely. So it stays off unless explicitly configured.
if (process.env.TRUST_PROXY) {
  const value = Number(process.env.TRUST_PROXY);
  app.set('trust proxy', Number.isNaN(value) ? process.env.TRUST_PROXY : value);
}

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true, // required for the session cookie to travel
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(loadUser);

// Health check sits above the limiters so uptime monitors never exhaust quota.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Order matters: the broad backstop first, then the tight limits on the two
// endpoints worth attacking.
app.use('/api', globalLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);

app.use('/api/auth', authRouter);
app.use('/api/kits', kitsRouter);

app.use((_req, res) => res.status(404).json({ error: 'NOT_FOUND' }));

// Never leak stack traces or driver internals to the client.
app.use((err, _req, res, _next) => {
  console.error('[API]', err);
  res.status(500).json({ error: 'INTERNAL_ERROR' });
});

// Not 3000: Docker Desktop binds that port on Windows and 404s everything,
// which is indistinguishable from a broken API at the browser.
const port = Number(process.env.PORT) || 4000;

connectDb()
  .then(() => {
    const server = app.listen(port, () => {
      console.log(`[API] LOF TITAN API listening on http://localhost:${port}`);
      console.log(`[API] CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });

    // Fail loudly. Silently losing the port to another service is how a
    // foreign server ends up answering /api/* and confusing everyone.
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[API] Port ${port} is already in use by another process.`);
        console.error('[API] Set a different PORT in server/.env (and match it in webapp/vite.config.js).');
      } else {
        console.error('[API] Server error:', err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('[API] Failed to start:', err.message);
    console.error('[API] Check server/.env, and that your IP is allow-listed in Atlas → Network Access.');
    process.exit(1);
  });
