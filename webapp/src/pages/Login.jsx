import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LogIn, UserPlus, AlertCircle, Loader2, FlaskConical, Package,
  ShieldCheck, LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { TEST_ACCOUNTS, TEST_PASSWORD } from '../auth/mockUsers';
import { cld } from '../lib/cld';
import { asset } from '../lib/asset';

const ERROR_TEXT = {
  INVALID_CREDENTIALS: 'That email and password combination is not recognised.',
  EMAIL_AND_PASSWORD_REQUIRED: 'Enter both an email and a password.',
  INVALID_EMAIL: 'That does not look like a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  EMAIL_TAKEN: 'An account with that email already exists. Try signing in instead.',
  NETWORK_ERROR: 'Could not reach the API. Start both processes with "npm run dev" from the project root.',
  BAD_API_RESPONSE:
    'The API is not responding. It runs as a separate process - start both with "npm run dev" from the project root, not from webapp/.',
  TOO_MANY_LOGIN_ATTEMPTS: 'Too many failed sign-in attempts.',
  TOO_MANY_REGISTRATIONS: 'Too many accounts created from this connection.',
  RATE_LIMITED: 'Too many requests.',
};

/** "Try again in 12 minutes." from the retryAfterSeconds the API sends back. */
function retryHint(err) {
  const secs = err?.data?.retryAfterSeconds;
  if (!secs) return '';
  if (secs < 60) return ` Try again in ${secs} second${secs === 1 ? '' : 's'}.`;
  const mins = Math.ceil(secs / 60);
  return ` Try again in ${mins} minute${mins === 1 ? '' : 's'}.`;
}

/**
 * The entry portal.
 *
 * This is the first screen of the product: nothing else renders until there is
 * a session. Customers and staff use the same form - the account's role decides
 * what is reachable afterwards, so there is no second admin login to keep in
 * sync (and no second place for a credential bug to hide).
 */
export function Login() {
  const { user, signIn, register, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('signin'); // 'signin' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Where the guard bounced them from, so a deep link survives the detour.
  const from = location.state?.from?.pathname || '/';
  const isRegister = mode === 'register';
  const isAdmin = user?.role === 'admin';

  const switchMode = (next) => {
    setMode(next);
    setError(null);
    setPassword('');
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      if (isRegister) {
        await register(email.trim(), password, name.trim());
        // A brand new account owns nothing, so a saved deep link into a kit
        // would land on a locked panel. Send them to the dashboard instead.
        navigate('/', { replace: true });
      } else {
        const signedIn = await signIn(email.trim(), password);
        // Staff go to the back office, never to the store - even if they were
        // deep-linked into a kit page before signing in.
        navigate(signedIn?.role === 'admin' ? '/admin' : from, { replace: true });
      }
    } catch (err) {
      const base = ERROR_TEXT[err.code] || err.message || 'Something went wrong.';
      setError(base + retryHint(err));
    } finally {
      setBusy(false);
    }
  };

  const quickFill = (accountEmail) => {
    setMode('signin');
    setEmail(accountEmail);
    setPassword(TEST_PASSWORD);
    setError(null);
  };

  const tabClass = (active) =>
    `flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
      active
        ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-glow'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <div className="col-span-12 min-h-[calc(100vh-3rem)] flex items-center justify-center py-8 px-3">
      <div className="w-full max-w-md space-y-6">
        {/* Brand lockup. The portal is the first thing a customer sees, so it
            carries the identity rather than dropping them onto a bare form. */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-white/15 bg-white flex items-center justify-center shadow-glow">
            <img
              src={cld('lof-titan/lof-normal', 192)}
              alt="LOF TITAN"
              decoding="async"
              className="w-full h-full object-contain p-1.5"
              onError={(e) => { e.target.src = asset('logo.webp'); }}
            />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl tracking-wider text-white">LOF TITAN</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Sign in to open your kits and the build tools.
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-5 sm:p-7 space-y-5">
          {user ? (
            /* Already signed in. Rather than showing a pointless second form,
               offer the two places worth going. */
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
                <p className="text-sm text-gray-200">
                  Signed in as <span className="font-bold text-white">{user.name}</span>
                  <span className="text-gray-400"> · {user.entitlements.length} kit(s)</span>
                  {isAdmin && (
                    <span className="ml-2 px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 text-[10px] font-bold uppercase align-middle">
                      admin
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/25 transition-all"
                  >
                    <ShieldCheck size={17} /> Admin panel
                  </Link>
                ) : (
                  <Link
                    to="/"
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-start to-primary-end text-white hover:shadow-glow transition-all"
                  >
                    <LayoutDashboard size={17} /> Go to dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="w-full px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-1.5 p-1.5 rounded-2xl bg-black/30 border border-white/10">
                <button type="button" onClick={() => switchMode('signin')} className={tabClass(!isRegister)}>
                  <LogIn size={15} /> Sign in
                </button>
                <button type="button" onClick={() => switchMode('register')} className={tabClass(isRegister)}>
                  <UserPlus size={15} /> Register
                </button>
              </div>

              <form onSubmit={submit} className="space-y-4">
                {isRegister && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      className="w-full bg-[#0d1117] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    placeholder="you@example.com"
                    className="w-full bg-[#0d1117] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    placeholder="••••••••"
                    className="w-full bg-[#0d1117] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                  {isRegister && (
                    <p className="text-[11px] text-gray-500">At least 8 characters.</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-400/30 bg-rose-500/10 p-3.5">
                    <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-200">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-start to-primary-end text-white hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {busy ? <Loader2 size={17} className="animate-spin" /> : isRegister ? <UserPlus size={17} /> : <LogIn size={17} />}
                  {busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {isRegister
                  ? 'A new account starts with no kits. Redeem the ID printed on your kit to unlock it.'
                  : 'Bought a kit? Sign in, then redeem the ID printed on the box.'}
              </p>
            </>
          )}
        </div>

        {/* Seeded accounts are a development convenience, not a feature. They are
            compiled out of the production bundle entirely - shipping a list of
            working logins on the real portal would be an open door. */}
        {import.meta.env.DEV && !user && (
          <details className="glass-panel rounded-2xl overflow-hidden">
            <summary className="px-4 py-3 cursor-pointer text-xs font-bold text-amber-300 flex items-center gap-2 select-none">
              <FlaskConical size={14} /> Dev only · seeded test accounts
            </summary>
            <div className="p-3 pt-0 space-y-2">
              {TEST_ACCOUNTS.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => quickFill(a.email)}
                  className="w-full text-left rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/40 px-3.5 py-2.5 transition-all group"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {a.name}
                      </span>
                      <span className="font-mono text-[11px] text-gray-500">{a.email}</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                      <Package size={12} /> {a.kits} kit{a.kits === 1 ? '' : 's'}
                    </span>
                  </div>
                </button>
              ))}
              <p className="text-[11px] text-gray-500 px-1">
                Password for all: <span className="font-mono text-gray-400">{TEST_PASSWORD}</span>
              </p>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
