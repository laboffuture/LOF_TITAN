import rateLimit from 'express-rate-limit';

/**
 * Rate limits.
 *
 * Without these, an attacker can send password guesses as fast as the network
 * allows - measured at ~20/second locally, which is 72,000 guesses an hour. That
 * cracks any weak password. Registration is the same problem in reverse: a script
 * can create accounts in a loop until the database is full.
 *
 * These caps are far above what a real person does and far below what a script
 * needs. Limits are per IP, so someone with many IPs can still spread the load -
 * this makes casual abuse pointless, not sophisticated abuse impossible.
 */

const MINUTE = 60 * 1000;

/**
 * Every error this API returns carries an `error` field; the frontend relies on
 * that to tell a real API response from some other service answering. The default
 * express-rate-limit body is plain text, which would trip that check and surface a
 * misleading message, so the 429 is shaped like the rest of our errors.
 */
function limitHandler(code) {
  return (req, res) => {
    const resetTime = req.rateLimit?.resetTime;
    const retryAfterSeconds = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : undefined;

    res.status(429).json({ error: code, retryAfterSeconds });
  };
}

const base = {
  standardHeaders: 'draft-7', // RateLimit / RateLimit-Policy response headers
  legacyHeaders: false,
};

/** Broad backstop so no single client can hammer the API generally. */
export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 200,
  handler: limitHandler('RATE_LIMITED'),
});

/**
 * Password guessing. `skipSuccessfulRequests` means a correct sign-in does not
 * consume quota, so only wrong guesses count toward the limit - a real person who
 * signs in successfully is never affected, however often they do it.
 */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: limitHandler('TOO_MANY_LOGIN_ATTEMPTS'),
});

/** Mass account creation. A real person registers once. */
export const registerLimiter = rateLimit({
  ...base,
  windowMs: 60 * MINUTE,
  limit: 5,
  handler: limitHandler('TOO_MANY_REGISTRATIONS'),
});
