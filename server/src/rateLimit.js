import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

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

/**
 * Serial redemption. Codes follow a printed pattern (TITAN-ANEMOM-0004), so a
 * script could walk the space and claim kits it never bought. Successful
 * redemptions are cheap and rare; wrong guesses are the thing to throttle.
 */
export const redeemLimiter = rateLimit({
  ...base,
  windowMs: 60 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: limitHandler('TOO_MANY_REDEEM_ATTEMPTS'),
});

/**
 * AI generation. Unlike the other limits this one protects a BILL, not a
 * password: every allowed request spends provider quota. Keyed by user id
 * rather than IP, so a whole classroom behind one school NAT is not throttled
 * as if it were a single person - and one student in a retry loop cannot spend
 * everyone else's budget.
 */
export const aiLimiter = rateLimit({
  ...base,
  windowMs: 60 * MINUTE,
  limit: 60,
  // The IP branch must go through ipKeyGenerator, which collapses an IPv6
  // address to its /56 prefix. A bare req.ip would let one IPv6 client walk
  // its own address range and get a fresh budget for every request.
  keyGenerator: (req) => (req.user ? String(req.user._id) : ipKeyGenerator(req.ip)),
  handler: limitHandler('TOO_MANY_AI_REQUESTS'),
});
