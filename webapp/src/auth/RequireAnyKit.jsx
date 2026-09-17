import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useHasAnyKit } from './authContext';
import { LockedState } from './LockedState';

/**
 * Tool gate (entitlement model B): owning ANY kit unlocks all four tools.
 *
 * Renders a locked panel rather than redirecting - a signed-in customer who
 * hasn't bought yet should see what a purchase would give them.
 */
export function RequireAnyKit({ children, toolName = 'This tool' }) {
  const hasAnyKit = useHasAnyKit();

  if (!hasAnyKit) {
    return (
      <div className="fixed inset-x-0 bottom-0 top-[var(--app-nav-h,0px)] z-[150] flex flex-col items-center justify-center gap-4 p-6 backdrop-blur-md bg-slate-900/70">
        <div className="w-full max-w-lg">
          <LockedState
            title={`${toolName} is locked`}
            message="The Block Code Studio, AI Studio, Serial Monitor and Firmware Flasher unlock with your first kit. Any kit unlocks all of them."
          />
        </div>

        {/* A direct way back to the catalogue. The nav above offers the tools,
            but every one of them is locked here too, so without this link the
            only escape is the browser's Back button. */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
          >
            <ArrowLeft size={16} /> Back to kits
          </Link>
          {/* Someone who owns a kit but has not redeemed its ID lands here. The
              route out is the redeem screen, not the store. */}
          <Link
            to="/redeem"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition-all"
          >
            <KeyRound size={16} /> I have a kit ID
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
