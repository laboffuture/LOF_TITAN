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
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/70">
        <div className="w-full max-w-lg">
          <LockedState
            title={`${toolName} is locked`}
            message="The Block Code Studio, AI Studio, Serial Monitor and Firmware Flasher unlock with your first kit. Any kit unlocks all of them."
          />
        </div>
      </div>
    );
  }

  return children;
}
