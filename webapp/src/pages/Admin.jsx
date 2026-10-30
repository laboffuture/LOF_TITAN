import { useState, useEffect, useCallback } from 'react';
import {
  Users, Package, ScrollText, BarChart3, Search, Plus, Check,
  RefreshCw, Ban, LogOut, MapPin, AlertTriangle,
} from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { KITS } from '../auth/kits';
import { useAuth } from '../auth/authContext';
import { ActivityMap } from '../components/ActivityMap';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'units', label: 'Kit IDs', icon: Package },
  { id: 'map', label: 'Map', icon: MapPin },
  { id: 'access', label: 'Access log', icon: ScrollText },
];

const STATUS_STYLE = {
  created: 'bg-slate-500/15 text-ink-2 border-slate-400/30',
  delivered: 'bg-amber-500/15 text-amber-600 border-amber-400/30',
  activated: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30',
};

function fmt(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

/** Chrome shared by every panel so a slow query never collapses the layout. */
function Panel({ title, subtitle, children, actions }) {
  return (
    <div className="rounded-xl bg-panel border border-line overflow-hidden">
      {/* Headerless panels are allowed: without this guard a panel with no title
          still drew an empty bordered bar above its content. */}
      {(title || actions) && (
        <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-3 flex-wrap">
          <div>
            {title && <h2 className="font-heading tracking-[-0.02em] font-bold text-heading text-base">{title}</h2>}
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}

function Stat({ label, value, tone = 'text-heading' }) {
  return (
    <div className="rounded-2xl bg-panel border border-line p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted font-semibold">{label}</div>
      <div className={`text-2xl font-heading tracking-[-0.02em] font-[750] mt-1 ${tone}`}>{value}</div>
    </div>
  );
}

export function Admin() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState('overview');
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [userRows, setUserRows] = useState([]);
  const [unitRows, setUnitRows] = useState([]);
  const [logRows, setLogRows] = useState([]);
  const [geo, setGeo] = useState(null);
  const [geoDays, setGeoDays] = useState(90);

  const [userQuery, setUserQuery] = useState('');
  const [unitKit, setUnitKit] = useState('');
  const [unitStatus, setUnitStatus] = useState('');
  const [genKit, setGenKit] = useState(KITS[0]?.id || '');
  const [genCount, setGenCount] = useState(10);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const load = useCallback(async (which) => {
    setError('');
    try {
      if (which === 'overview') setStats(await api('/admin/stats'));
      if (which === 'users') {
        const q = userQuery.trim() ? `?q=${encodeURIComponent(userQuery.trim())}` : '';
        setUserRows((await api(`/admin/users${q}`)).users);
      }
      if (which === 'units') {
        const p = new URLSearchParams();
        if (unitKit) p.set('kitId', unitKit);
        if (unitStatus) p.set('status', unitStatus);
        p.set('limit', '200');
        setUnitRows((await api(`/admin/units?${p}`)).units);
      }
      if (which === 'access') setLogRows((await api('/admin/access?limit=100')).entries);
      if (which === 'map') setGeo(await api(`/admin/geo?days=${geoDays}`));
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 0
          ? 'API unreachable. Is the server running?'
          : `Could not load ${which}: ${err.message}`
      );
    }
  }, [userQuery, unitKit, unitStatus, geoDays]);

  useEffect(() => { load(tab); }, [tab, load]);

  async function setEntitlement(userId, kitId, action) {
    setBusy(true); setNotice('');
    try {
      await api(`/admin/users/${userId}/entitlements`, { method: 'PATCH', body: { kitId, action } });
      await load('users');
      setNotice(`${action === 'grant' ? 'Granted' : 'Revoked'} ${kitId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setBusy(true); setNotice(''); setError('');
    try {
      const r = await api('/admin/units', { method: 'POST', body: { kitId: genKit, count: Number(genCount) } });
      setNotice(`Created ${r.created} serial${r.created === 1 ? '' : 's'}: ${r.serials[0]} … ${r.serials[r.serials.length - 1]}`);
      await load('units');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function markDelivered(serial) {
    setBusy(true);
    try {
      await api(`/admin/units/${serial}`, { method: 'PATCH', body: { status: 'delivered' } });
      await load('units');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    /* Full viewport, like the four tool surfaces. The admin portal is a data
       screen - tables, a map, wide rows - and the app's centred max-w-screen-2xl
       grid was squeezing it into a column with dead gutters. Its own scroll
       container, so the page behind never scrolls with it. */
    <div className="fixed inset-0 z-[150] overflow-y-auto bg-canvas">
      <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="font-heading font-[750] tracking-[-0.02em] text-xl sm:text-2xl text-heading">
              Admin
            </h1>
            <p className="text-xs text-muted">Users, kit IDs and access history</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(tab)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-subtle hover:bg-subtle text-ink-2 border border-line transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-subtle hover:bg-subtle text-ink-2 border border-line transition-colors"
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
              tab === t.id
                ? 'bg-cyan-500/20 text-cyan-600 border-cyan-400/40'
                : 'bg-panel text-muted border-line hover:text-heading'
            }`}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-rose-500/10 border border-rose-400/30 text-rose-600 text-sm">{error}</div>
      )}
      {notice && (
        <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-600 text-sm break-all">{notice}</div>
      )}

      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Accounts" value={stats?.users ?? '—'} />
            <Stat label="Kit IDs created" value={stats?.units?.created ?? '—'} />
            <Stat label="Delivered" value={stats?.units?.delivered ?? '—'} tone="text-amber-600" />
            <Stat label="Activated" value={stats?.units?.activated ?? '—'} tone="text-emerald-600" />
          </div>
          <Panel title="Delivery by kit" subtitle="Activated means a customer redeemed the printed ID">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted bg-panel">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-semibold">Kit</th>
                    <th className="text-right px-5 py-2.5 font-semibold">Created</th>
                    <th className="text-right px-5 py-2.5 font-semibold">Delivered</th>
                    <th className="text-right px-5 py-2.5 font-semibold">Activated</th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  {(stats?.byKit || []).map((r) => (
                    <tr key={r.kitId} className="border-t border-line">
                      <td className="px-5 py-2.5 font-medium text-heading">{r.kitId}</td>
                      <td className="px-5 py-2.5 text-right font-mono">{r.created}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-amber-600">{r.delivered}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-emerald-600">{r.activated}</td>
                    </tr>
                  ))}
                  {!stats?.byKit?.length && (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No kit IDs yet. Generate some in the Kit IDs tab.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'users' && (
        <Panel
          title="Users"
          subtitle={`${userRows.length} shown · last seen comes from the access log`}
          actions={
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && load('users')}
                placeholder="Search email or name"
                className="pl-8 pr-3 py-1.5 rounded-full bg-subtle border border-line text-xs text-heading placeholder-faint focus:outline-none focus:border-brand"
              />
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted bg-panel">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">Account</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Kits owned</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Last seen</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Grant / revoke</th>
                </tr>
              </thead>
              <tbody className="text-ink-2 align-top">
                {userRows.map((u) => (
                  <tr key={u.id} className="border-t border-line">
                    <td className="px-5 py-3">
                      <div className="text-heading font-medium">{u.email}</div>
                      <div className="text-xs text-slate-500">
                        {u.name}
                        {u.role === 'admin' && (
                          <span className="ml-2 px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-600 text-[10px] font-bold uppercase">admin</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {u.entitlements.length === 0 && <span className="text-slate-500 text-xs">none</span>}
                        {u.entitlements.map((k) => (
                          <button
                            key={k}
                            disabled={busy}
                            onClick={() => setEntitlement(u.id, k, 'revoke')}
                            title={`Revoke ${k}`}
                            className="group px-2 py-0.5 rounded-md bg-subtle border border-line text-[10px] font-mono hover:bg-rose-500/20 hover:border-rose-400/40 hover:text-rose-600 transition-colors disabled:opacity-40"
                          >
                            {k} <Ban size={9} className="inline opacity-0 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted whitespace-nowrap">{fmt(u.lastSeenAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        disabled={busy}
                        defaultValue=""
                        onChange={(e) => { if (e.target.value) { setEntitlement(u.id, e.target.value, 'grant'); e.target.value = ''; } }}
                        className="px-2 py-1 rounded-lg bg-subtle border border-line text-xs text-ink focus:outline-none focus:border-brand disabled:opacity-40"
                      >
                        <option value="">Grant a kit…</option>
                        {KITS.filter((k) => !u.entitlements.includes(k.id)).map((k) => (
                          <option key={k.id} value={k.id} className="bg-panel">{k.name}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!userRows.length && (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-slate-500">No accounts match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      {tab === 'units' && (
        <div className="space-y-5">
          <Panel title="Generate kit IDs" subtitle="Serials continue the run for that kit, so batches never collide">
            <div className="p-5 flex flex-wrap items-end gap-3">
              <label className="text-xs text-muted font-semibold space-y-1">
                <div>Kit</div>
                <select value={genKit} onChange={(e) => setGenKit(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-subtle border border-line text-sm text-heading focus:outline-none focus:border-brand">
                  {KITS.map((k) => <option key={k.id} value={k.id} className="bg-panel">{k.name}</option>)}
                </select>
              </label>
              <label className="text-xs text-muted font-semibold space-y-1">
                <div>How many</div>
                <input type="number" min={1} max={500} value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl bg-subtle border border-line text-sm text-heading focus:outline-none focus:border-brand" />
              </label>
              <button onClick={generate} disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold bg-cyan-500/20 text-cyan-600 border border-cyan-400/40 hover:bg-cyan-500/30 transition-colors disabled:opacity-40">
                <Plus size={14} /> Generate
              </button>
            </div>
          </Panel>

          <Panel
            title="Kit IDs"
            subtitle={`${unitRows.length} shown`}
            actions={
              <div className="flex gap-2">
                <select value={unitKit} onChange={(e) => setUnitKit(e.target.value)}
                  className="px-2.5 py-1.5 rounded-full bg-subtle border border-line text-xs text-ink focus:outline-none">
                  <option value="" className="bg-panel">All kits</option>
                  {KITS.map((k) => <option key={k.id} value={k.id} className="bg-panel">{k.name}</option>)}
                </select>
                <select value={unitStatus} onChange={(e) => setUnitStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-full bg-subtle border border-line text-xs text-ink focus:outline-none">
                  <option value="" className="bg-panel">Any status</option>
                  <option value="created" className="bg-panel">Created</option>
                  <option value="delivered" className="bg-panel">Delivered</option>
                  <option value="activated" className="bg-panel">Activated</option>
                </select>
              </div>
            }
          >
            <div className="overflow-x-auto max-h-[32rem]">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted bg-panel sticky top-0">
                  <tr>
                    <th className="text-left px-5 py-2.5 font-semibold">Serial</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Kit</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Status</th>
                    <th className="text-left px-5 py-2.5 font-semibold">Redeemed by</th>
                    <th className="text-left px-5 py-2.5 font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="text-ink-2">
                  {unitRows.map((u) => (
                    <tr key={u.serial} className="border-t border-line">
                      <td className="px-5 py-2.5 font-mono text-heading text-xs">{u.serial}</td>
                      <td className="px-5 py-2.5 text-xs">{u.kitId}</td>
                      <td className="px-5 py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${STATUS_STYLE[u.status] || STATUS_STYLE.created}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-xs text-muted">{u.activatedByEmail || '—'}</td>
                      <td className="px-5 py-2.5">
                        {u.status === 'created' && (
                          <button onClick={() => markDelivered(u.serial)} disabled={busy}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 text-amber-600 border border-amber-400/30 hover:bg-amber-500/25 transition-colors disabled:opacity-40">
                            <Check size={11} /> Mark delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!unitRows.length && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">No kit IDs match.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'map' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Cities active" value={geo?.totals?.cities ?? '—'} />
            <Stat label="Users located" value={geo?.totals?.users ?? '—'} tone="text-cyan-600" />
            <Stat label="Events" value={geo?.totals?.events ?? '—'} />
            <Stat label="Unlocated events" value={geo?.totals?.unlocated ?? '—'} tone="text-muted" />
          </div>

          {/* If most traffic cannot be placed the map is misleading, so say so
              instead of drawing a confident-looking picture of nothing. */}
          {geo && geo.totals.unlocated > geo.totals.located && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-400/30">
              <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-600 leading-relaxed">
                <strong>{geo.totals.unlocated}</strong> of{' '}
                {geo.totals.unlocated + geo.totals.located} events could not be placed.
                Local addresses never resolve; in production this usually means{' '}
                <code className="font-mono">TRUST_PROXY</code> is unset, so every request
                records the proxy address instead of the visitor.
              </p>
            </div>
          )}

          <Panel
            title="Where LOF TITAN is being used"
            subtitle="Bubble size is distinct users, not events — one heavy user does not outweigh a real community"
            actions={
              <select
                value={geoDays}
                onChange={(e) => setGeoDays(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-full bg-subtle border border-line text-xs text-ink focus:outline-none"
              >
                <option value={7} className="bg-panel">Last 7 days</option>
                <option value={30} className="bg-panel">Last 30 days</option>
                <option value={90} className="bg-panel">Last 90 days</option>
                <option value={365} className="bg-panel">Last year</option>
              </select>
            }
          >
            <div className="p-4">
              <ActivityMap places={geo?.places || []} />
            </div>
          </Panel>

          <Panel>
            <div className="overflow-x-auto max-h-[26rem]">
              <table className="w-full text-sm">
                <tbody className="text-ink-2">
                  {[...(geo?.places || [])]
                    .sort((a, b) => b.users - a.users)
                    .map((p) => (
                      <tr key={`${p.city}-${p.region}-${p.country}`} className="border-t border-line">
                        <td className="px-5 py-2.5">
                          <div className="text-heading font-medium">{p.city}</div>
                          <div className="text-[11px] text-slate-500">
                            {[p.region, p.country].filter(Boolean).join(' · ')}
                          </div>
                        </td>
                        <td className="px-5 py-2.5 text-right font-mono text-cyan-600">{p.users}</td>
                        <td className="px-5 py-2.5 text-right font-mono">{p.kits}</td>
                        <td className="px-5 py-2.5 text-right font-mono text-muted">{p.events}</td>
                        <td className="px-5 py-2.5 text-xs text-muted whitespace-nowrap">{fmt(p.lastSeen)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {tab === 'access' && (
        <Panel title="Access log" subtitle="Newest first. Denied rows are attempts to open a kit the account does not own.">
          <div className="overflow-x-auto max-h-[36rem]">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted bg-panel sticky top-0">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold">When</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Account</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Action</th>
                  <th className="text-left px-5 py-2.5 font-semibold">Kit</th>
                  <th className="text-left px-5 py-2.5 font-semibold">From</th>
                </tr>
              </thead>
              <tbody className="text-ink-2">
                {logRows.map((e, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-5 py-2.5 text-xs text-muted whitespace-nowrap">{fmt(e.at)}</td>
                    <td className="px-5 py-2.5 text-xs text-heading">{e.email || '—'}</td>
                    <td className="px-5 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        e.allowed ? 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30'
                                  : 'bg-rose-500/15 text-rose-600 border-rose-400/30'}`}>
                        {e.action}{e.allowed ? '' : ' denied'}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-xs">{e.kitId || '—'}</td>
                    <td className="px-5 py-2.5 text-xs text-muted font-mono">
                      <div>{e.ip || '—'}</div>
                      <div className="text-[10px] text-faint truncate max-w-xs">{e.userAgent}</div>
                    </td>
                  </tr>
                ))}
                {!logRows.length && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-500">Nothing logged yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
    </div>
  );
}
