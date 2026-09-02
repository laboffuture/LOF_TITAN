import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
      <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center gap-4 p-6 backdrop-blur-md bg-slate-900/70">
        <div className="w-full max-w-lg">
          <LockedState
            title={`${toolName} is locked`}
            message="The Block Code Studio, AI Studio, Serial Monitor and Firmware Flasher unlock with your first kit. Any kit unlocks all of them."
          />
        </div>

        {/* Load-bearing: this panel covers the whole viewport and the nav only
            renders on the dashboard, so without this the route is a dead end -
            no close button, nothing behind it, browser Back the only way out. */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all"
        >
          <ArrowLeft size={16} /> Back to kits
        </Link>
      </div>
    );
  }

  return children;
}
