import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, UserPlus, ArrowLeft, Package, FlaskConical, AlertCircle, Loader2, Info } from 'lucide-react';
import { useAuth } from '../auth/authContext';
import { TEST_ACCOUNTS, TEST_PASSWORD } from '../auth/mockUsers';

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

  const from = location.state?.from?.pathname || '/';
  const isRegister = mode === 'register';

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
        navigate('/', { replace: true });
      } else {
        await signIn(email.trim(), password);
        navigate(from, { replace: true });
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10 flex flex-col gap-5 sm:gap-6">
      <Link
        to="/"
        className="self-start flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/10"
      >
        <ArrowLeft size={16} /> Back to kits
      </Link>

      <div className="glass-panel rounded-3xl p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-7">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-start to-primary-end flex items-center justify-center text-white shadow-glow">
            {isRegister ? <UserPlus size={24} /> : <LogIn size={24} />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              {isRegister ? 'Create an account' : 'Sign in'}
            </h1>
            <p className="text-sm text-gray-400">
              {isRegister
                ? 'Free to join. Kits are added once you buy them.'
                : 'Access the kits on your account.'}
            </p>
          </div>
        </div>

        {user ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-4">
            <span className="text-sm text-gray-200">
              Signed in as <span className="font-bold text-white">{user.name}</span>
              <span className="text-gray-400"> · {user.entitlements.length} kit(s)</span>
            </span>
            <div className="flex gap-2">
              <Link
                to="/"
                className="px-4 py-2 rounded-full text-xs font-bold bg-white/10 text-white border border-white/15 hover:bg-white/20 transition-colors"
              >
                Go to kits
              </Link>
              <button
                onClick={signOut}
                className="px-4 py-2 rounded-full text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 transition-colors"
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
                    Name <span className="text-gray-600 normal-case font-medium">(optional)</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegister ? 'At least 8 characters' : '••••••••'}
                  className="w-full bg-[#0d1117] text-white px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/60 transition-colors"
                />
              </div>

              {isRegister && (
                <div className="flex items-start gap-2.5 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.07] p-3.5">
                  <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-cyan-100/80 leading-relaxed">
                    A new account starts with <span className="font-bold">no kits</span>. You can browse
                    the whole store; kits unlock on your account after you buy them.
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5">
                  <AlertCircle size={17} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-200 leading-relaxed">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-gradient-to-r from-primary-start to-primary-end text-white hover:shadow-glow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : isRegister ? (
                  <UserPlus size={17} />
                ) : (
                  <LogIn size={17} />
                )}
                {busy ? 'Working…' : isRegister ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </>
        )}

        {!user && !isRegister && (
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-4">
              <FlaskConical size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold">Testing phase.</span> These seeded accounts exercise each
                entitlement case. Click one to fill the form.
              </p>
            </div>

            {TEST_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                type="button"
                onClick={() => quickFill(a.email)}
                className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/40 p-4 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {a.name}
                    </span>
                    <span className="font-mono text-[11px] text-gray-500">{a.email}</span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <Package size={13} />
                    {a.kits} kit{a.kits === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5">{a.caseLabel}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
