import { Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Shown wherever a customer has hit something they haven't bought.
 *
 * Deliberately not a redirect: the customer should see what they're missing.
 * The purchase CTA is a placeholder until the CRM is connected.
 */
export function LockedState({
  title = 'Locked',
  message,
  kitName,
  theme = 'dark',
  compact = false,
  showSignIn = false,
}) {
  const light = theme === 'light';

  const shell = light
    ? 'bg-white border-slate-200 text-slate-800 shadow-md'
    : 'bg-white/[0.03] border-white/10 text-white backdrop-blur-xs shadow-2xl';

  const sub = light ? 'text-slate-500' : 'text-gray-400';
  const note = light ? 'text-slate-400' : 'text-gray-500';

  return (
    <div
      className={`w-full rounded-3xl border ${shell} flex flex-col items-center justify-center text-center ${
        compact ? 'p-8 gap-3' : 'p-12 gap-4 min-h-[340px]'
      }`}
    >
      <div
        className={`rounded-2xl flex items-center justify-center ${
          compact ? 'w-12 h-12' : 'w-16 h-16'
        } ${light ? 'bg-slate-100 text-slate-400' : 'bg-white/5 text-cyan-400 border border-white/10'}`}
      >
        <Lock size={compact ? 22 : 28} />
      </div>

      <h3 className={`font-heading font-extrabold ${compact ? 'text-lg' : 'text-2xl'}`}>
        {title}
      </h3>

      {message && (
        <p className={`${sub} max-w-md text-sm leading-relaxed`}>{message}</p>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {showSignIn && (
          <Link
            to="/login"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
              light
                ? 'bg-slate-900 text-white hover:bg-slate-700'
                : 'bg-gradient-to-r from-primary-start to-primary-end text-white hover:shadow-glow'
            }`}
          >
            <LogIn size={16} />
            Sign in
          </Link>
        )}

        <button
          type="button"
          disabled
          title="Checkout is connected in a later phase"
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            light
              ? 'bg-cyan-600 text-white'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
          }`}
        >
          {kitName ? `Get ${kitName}` : 'Get this kit'}
        </button>
      </div>

      <p className={`text-[11px] ${note} pt-1`}>
        Checkout connects to the CRM in a later phase.
      </p>
    </div>
  );
}
