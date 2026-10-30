import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { getKit } from '../auth/kits';
import { ApiError } from '../lib/api';

/**
 * Redeem the ID printed on a physical kit.
 *
 * This is the self-serve path from "I bought a box" to "the content is
 * unlocked". Without it every purchase needs someone to edit the database by
 * hand.
 */
const ERROR_TEXT = {
  SERIAL_REQUIRED: 'Enter the ID printed on your kit.',
  SERIAL_NOT_FOUND: 'That kit ID was not recognised. Check the characters and try again.',
  ALREADY_REDEEMED: 'That kit ID has already been used on another account.',
  ALREADY_REDEEMED_BY_YOU: 'You have already redeemed that kit ID — it is on your account.',
  TOO_MANY_REDEEM_ATTEMPTS: 'Too many attempts. Wait a few minutes and try again.',
  NOT_SIGNED_IN: 'Please sign in first.',
  NETWORK_ERROR: 'Could not reach the server. Check your connection and try again.',
};

export function Redeem() {
  const { redeem, user } = useAuth();
  const navigate = useNavigate();

  const [serial, setSerial] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!serial.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await redeem(serial);
      setDone(result.kitId);
      setSerial('');
    } catch (err) {
      const code = err instanceof ApiError ? err.code : 'NETWORK_ERROR';
      setError(ERROR_TEXT[code] || 'Could not redeem that kit ID.');
    } finally {
      setBusy(false);
    }
  }

  const kitName = done ? getKit(done)?.name || done : null;

  return (
    <div className="col-span-12 flex justify-center py-10">
      <div className="w-full max-w-md space-y-5">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-heading transition-colors">
          <ArrowLeft size={15} /> Back to kits
        </Link>

        <div className="rounded-xl bg-panel border border-line p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-600">
              <KeyRound size={20} />
            </div>
            <div>
              <h1 className="font-heading tracking-[-0.02em] font-[750] text-lg text-heading">Redeem a kit ID</h1>
              <p className="text-xs text-muted">Unlock the kit you purchased</p>
            </div>
          </div>

          {done ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-sm text-emerald-600">
                  <strong className="block text-emerald-600">{kitName} unlocked.</strong>
                  It is now on your account, along with the LOF TITAN tools.
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/kit/${done}`)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-cyan-500/20 text-cyan-600 border border-cyan-400/40 hover:bg-cyan-500/30 transition-colors"
                >
                  Open {kitName}
                </button>
                <button
                  onClick={() => setDone(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold bg-subtle text-ink-2 border border-line hover:bg-subtle transition-colors"
                >
                  Redeem another
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="serial" className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Kit ID
                </label>
                <input
                  id="serial"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="TITAN-ANEMOM-0001"
                  autoComplete="off"
                  spellCheck={false}
                  /* uppercase is cosmetic only - the server normalises case and
                     spacing, so a lowercase paste still works */
                  className="w-full px-4 py-3 rounded-xl bg-subtle border border-line text-heading font-mono uppercase tracking-wider placeholder-faint focus:outline-none focus:border-cyan-500/50"
                />
                <p className="text-[11px] text-slate-500">Printed on the kit box and on the insert card.</p>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !serial.trim()}
                className="lof-primary border w-full py-3 rounded-lg text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy ? 'Checking…' : 'Unlock kit'}
              </button>

              {!user && (
                <p className="text-xs text-slate-500 text-center">
                  You need to <Link to="/login" className="text-cyan-600 hover:underline">sign in</Link> before redeeming.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
