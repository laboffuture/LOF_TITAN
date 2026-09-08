import { Router } from 'express';
import { requireUser, recordAccess } from '../session.js';
import { TITAN_SYSTEM_PROMPT } from '../titanPrompt.js';

export const aiRouter = Router();

/**
 * Models the client may ask for.
 *
 * An allowlist, not a passthrough: the model id used to come from localStorage,
 * so anyone could edit a browser value and bill us for the expensive tier on
 * every request. The client picks a LABEL; the server decides what that costs.
 */
const MODELS = {
  'gemini-3.6-flash': 'gemini-3.6-flash',
  'gemini-3.5-flash-lite': 'gemini-3.5-flash-lite',
  'gemini-3.6-pro': 'gemini-3.6-pro',
  // short aliases, so the UI can move to labels later without a server change
  flash: 'gemini-3.6-flash',
  'flash-lite': 'gemini-3.5-flash-lite',
  pro: 'gemini-3.6-pro',
};
const DEFAULT_MODEL = 'gemini-3.6-flash';

/** Hard ceiling regardless of what the client asks for. */
const MAX_OUTPUT_TOKENS = 8192;
const MAX_PROMPT_CHARS = 24000;
const MAX_TURNS = 24;

const ACK =
  'Understood! I am the Official LOF TITAN AI Assistant with complete knowledge of all ' +
  'ESP32-S3 hardware pins, 4-channel motor drivers, OLED, buttons (39-42), sensors ' +
  '(S1-S5), and safe non-blocking PWM loops. I will generate clean, ready-to-run ' +
  'MicroPython code.';

function apiKey() {
  const k = process.env.GEMINI_API_KEY;
  if (!k) {
    throw Object.assign(new Error('GEMINI_API_KEY is not set'), { code: 'AI_NOT_CONFIGURED' });
  }
  return k;
}

/**
 * Generate MicroPython from a chat transcript.
 *
 * The provider key never reaches the browser. It used to be inlined into the
 * bundle by Vite AND sent as a URL query parameter, which put it in browser
 * history and every proxy log between the student and Google.
 *
 * requireUser + the entitlement check below are what actually gate this. The
 * React guard only hides the button; without this the endpoint Google sees
 * would be reachable by anyone who read the bundle.
 */
aiRouter.post('/generate', requireUser, async (req, res) => {
  // Model B: owning any kit unlocks the tools. Checked here rather than trusted
  // from the client, because this endpoint costs real money per call.
  if (!(req.user.entitlements || []).length) {
    recordAccess(req, { kitId: null, action: 'ai', allowed: false });
    return res.status(403).json({ error: 'NOT_ENTITLED' });
  }

  const label = String(req.body?.model || DEFAULT_MODEL);
  const model = MODELS[label];
  if (!model) {
    return res.status(400).json({ error: 'UNKNOWN_MODEL', allowed: Object.keys(MODELS) });
  }

  const turns = Array.isArray(req.body?.messages) ? req.body.messages : null;
  if (!turns || turns.length === 0) {
    return res.status(400).json({ error: 'MESSAGES_REQUIRED' });
  }

  // Trim to the recent window and cap total size. An unbounded transcript is
  // both a cost problem and a way to push the system preamble out of context.
  const recent = turns.slice(-MAX_TURNS);
  const totalChars = recent.reduce((n, m) => n + String(m?.text || '').length, 0);
  if (totalChars > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: 'PROMPT_TOO_LARGE', maxChars: MAX_PROMPT_CHARS });
  }

  // The full hardware briefing is prepended here, server-side. It used to be
  // sent by the browser, which meant the client could shrink or replace it.
  const contents = [
    { role: 'user', parts: [{ text: TITAN_SYSTEM_PROMPT }] },
    { role: 'model', parts: [{ text: ACK }] },
    ...recent.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: String(m.text || '') }],
    })),
  ];

  let key;
  try {
    key = apiKey();
  } catch (err) {
    console.error('[API]', err.message);
    return res.status(503).json({ error: 'AI_NOT_CONFIGURED' });
  }

  // Abort rather than hold the socket open forever if the provider stalls.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        // Header, not ?key= : a query string ends up in access logs on every hop.
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.2, topP: 0.95, maxOutputTokens: MAX_OUTPUT_TOKENS },
        }),
        signal: controller.signal,
      }
    );

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      // Log the provider's message for us; never forward it, since it can quote
      // the key or internal project details back to the browser.
      console.error('[API] AI upstream %d: %s', upstream.status, data?.error?.message || 'unknown');
      recordAccess(req, { kitId: null, action: 'ai', allowed: false });
      return res.status(502).json({ error: 'AI_UPSTREAM_ERROR', status: upstream.status });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const usage = data?.usageMetadata || {};

    recordAccess(req, { kitId: null, action: 'ai', allowed: true });

    res.json({
      text: text || 'No code generated.',
      model: label,
      usage: {
        promptTokens: usage.promptTokenCount ?? null,
        outputTokens: usage.candidatesTokenCount ?? null,
      },
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      recordAccess(req, { kitId: null, action: 'ai', allowed: false });
      return res.status(504).json({ error: 'AI_TIMEOUT' });
    }
    console.error('[API] AI request failed:', err.message);
    recordAccess(req, { kitId: null, action: 'ai', allowed: false });
    res.status(502).json({ error: 'AI_UPSTREAM_ERROR' });
  } finally {
    clearTimeout(timeout);
  }
});

/** Lets the UI render the picker without hardcoding ids the server may change. */
aiRouter.get('/models', requireUser, (_req, res) => {
  res.json({
    models: [
      { id: 'gemini-3.6-flash', name: 'Flash', desc: 'Fast, low cost - recommended' },
      { id: 'gemini-3.5-flash-lite', name: 'Flash Lite', desc: 'Lightest and quickest' },
      { id: 'gemini-3.6-pro', name: 'Pro', desc: 'Deeper reasoning, costs more per request' },
    ],
    default: DEFAULT_MODEL,
    configured: Boolean(process.env.GEMINI_API_KEY),
  });
});
