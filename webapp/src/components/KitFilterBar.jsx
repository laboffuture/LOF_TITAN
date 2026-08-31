import { Search, X, SlidersHorizontal, Check, Lock, LayoutGrid } from 'lucide-react';
import { hasActiveFilters } from '../lib/kitSearch';

/**
 * Search and facet controls above the kit grid.
 *
 * Presentational only - all matching lives in lib/kitSearch.js. Facet options
 * arrive already derived from the kit data, so a new difficulty or duration
 * shows up here without a code change.
 */

const OWNERSHIP = [
  { value: 'all', label: 'All kits', Icon: LayoutGrid },
  { value: 'owned', label: 'My kits', Icon: Check },
  { value: 'locked', label: 'Locked', Icon: Lock },
];

function Select({ label, value, options, onChange }) {
  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none cursor-pointer rounded-full border px-4 py-2 pr-9 text-xs sm:text-sm font-semibold transition-all outline-none focus:border-cyan-400/60 ${
          value
            ? 'bg-cyan-500/15 text-cyan-200 border-cyan-400/40'
            : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/[0.07]'
        }`}
      >
        <option value="" className="bg-slate-900 text-gray-300">{label}</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-slate-900 text-white">{o}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-[10px] text-gray-400">&#9662;</span>
    </label>
  );
}

export function KitFilterBar({ filters, facets, onChange, total, shown, signedIn }) {
  const set = (patch) => onChange({ ...filters, ...patch });
  const active = hasActiveFilters(filters);

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={filters.q}
            onChange={(e) => set({ q: e.target.value })}
            placeholder="Search kits, components, topics…"
            aria-label="Search kits"
            className="w-full bg-white/[0.03] text-white placeholder:text-gray-500 rounded-full border border-white/10 pl-11 pr-10 py-2.5 text-sm outline-none focus:border-cyan-400/60 focus:bg-white/[0.06] transition-all"
          />
          {filters.q && (
            <button
              onClick={() => set({ q: '' })}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Ownership segmented control. Hidden when signed out - "My kits" would
            always be empty and reads as a broken filter rather than a prompt. */}
        {signedIn && (
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/30 border border-white/10 shrink-0">
            {OWNERSHIP.map(({ value, label, Icon }) => (
              <button
                key={value}
                onClick={() => set({ ownership: value })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filters.ownership === value
                    ? 'bg-gradient-to-r from-primary-start to-primary-end text-white shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={15} className="text-gray-500 shrink-0" />
        <Select label="Any level" value={filters.level} options={facets.levels} onChange={(v) => set({ level: v })} />
        <Select label="Any duration" value={filters.duration} options={facets.durations} onChange={(v) => set({ duration: v })} />
        <Select label="Any age" value={filters.age} options={facets.ages} onChange={(v) => set({ age: v })} />

        {active && (
          <button
            onClick={() => onChange({ q: '', level: '', duration: '', age: '', ownership: 'all' })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/20 transition-colors"
          >
            <X size={13} /> Clear
          </button>
        )}

        <span className="ml-auto text-xs font-semibold text-gray-400 shrink-0">
          {shown === total ? `${total} kits` : `${shown} of ${total} kits`}
        </span>
      </div>
    </div>
  );
}
