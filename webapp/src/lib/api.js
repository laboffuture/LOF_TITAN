/**
 * Thin fetch wrapper for the LOF TITAN API.
 *
 * In development Vite proxies /api to the Express server, so requests are
 * same-origin and the httpOnly session cookie travels automatically. In
 * production set VITE_API_URL to the deployed API origin.
 */
const BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  constructor(status, code, message, data) {
    super(message || code || `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    // Full error body, so callers can read extras like retryAfterSeconds.
    this.data = data ?? null;
  }
}

export async function api(path, { method = 'GET', body, ...rest } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include', // send/receive the session cookie
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch {
    // Network-level failure - almost always "the API isn't running".
    throw new ApiError(0, 'NETWORK_ERROR', 'Could not reach the API. Is the server running?');
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Every error this API returns carries an `error` field. A failure without
    // one means something that isn't our API answered - most often another
    // service already holding the proxy target port (Docker Desktop binds 3000
    // on Windows and 404s everything). Say so, instead of reporting a bare
    // "HTTP 404" that sends people hunting for a missing route.
    if (!data || typeof data.error !== 'string') {
      throw new ApiError(
        res.status,
        'BAD_API_RESPONSE',
        `Got HTTP ${res.status} from something that is not the LOF TITAN API. ` +
          `Check the API is running and that no other service holds its port.`
      );
    }
    throw new ApiError(res.status, data.error, data.error, data);
  }
  return data;
}
