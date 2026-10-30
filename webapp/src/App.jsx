import { useLayoutEffect, useRef } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Bluetooth, Usb, Play, Square, RotateCcw, Terminal, Bot, Code, Cpu, LogIn,
} from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';
import { PageWatermarks } from './components/SpaceArt';
import { NAV_SLOT_IDS } from './components/NavSlot';
import { useDeviceContext } from './device/deviceContext';
import { useAuth } from './auth/authContext';
import { RequireAuth } from './auth/RequireAuth';
import { RequireAnyKit } from './auth/RequireAnyKit';
import { RequireAdmin } from './auth/RequireAdmin';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { KitDetail } from './pages/KitDetail';
import { CodeRoute, AIRoute, MonitorRoute, FlashRoute } from './pages/ToolRoutes';
import { Redeem } from './pages/Redeem';
import { Admin } from './pages/Admin';
import { asset } from './lib/asset';
import { PREVIEW_MODE, OPEN_ACCESS } from './lib/backend';
import { EMBED_KIT, EMBED_HOME, isEmbedPath } from './lib/embed';

// Pages that keep the whole screen. /login and /redeem are single-purpose forms
// with their own way back; /admin is staff-only and must not offer the kit tools.
const NAV_HIDDEN_ON = ['/login', '/redeem', '/admin'];

const TOOL_LINKS = [
  { to: '/code', label: 'Code', title: 'Open Block Code Workspace', Icon: Code },
  { to: '/monitor', label: 'Monitor', title: 'Open Serial Monitor', Icon: Terminal },
  { to: '/ai', label: 'AI', title: 'Open AI Studio', Icon: Bot },
  { to: '/flash', label: 'Flash', title: 'Open Dedicated Firmware Flasher', Icon: Cpu },
];

// Shared top-bar control shape (guide: 8px radius, 12.5px semibold, 7px icon gap).
const NAV_BTN =
  'inline-flex items-center gap-[7px] h-[38px] px-3 sm:px-3.5 rounded-lg border font-semibold text-[12.5px] whitespace-nowrap';
// Guide: line icons on a 1.8 stroke; muted at rest, red when active.
const ICON = { size: 18, strokeWidth: 1.8 };

function StatusPill({ device, compact }) {
  return (
    <span
      className={`font-bold flex items-center justify-end gap-1.5 ${compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'} ${
        device.status === 'RUNNING'
          ? 'text-green-600 animate-pulse'
          : device.connected || device.status === 'CONNECTED_IDLE'
          ? 'text-green-600'
          : device.status === 'WAITING_FOR_CONNECTION'
          ? 'text-amber-600'
          : 'text-muted'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          device.connected ? 'bg-green-500' : 'bg-faint'
        }`}
      />
      <span className={compact ? 'truncate max-w-[80px] sm:max-w-full' : ''}>{device.status}</span>
    </span>
  );
}

function App() {
  const device = useDeviceContext();
  const { user } = useAuth();
  const location = useLocation();

  const showNav = !NAV_HIDDEN_ON.includes(location.pathname);
  // Inside an LMS iframe the student stays on their kit and its tools. Any
  // other route - the store, another kit, sign-in - leads back to the kit.
  const embedOutOfScope = Boolean(EMBED_KIT) && !isEmbedPath(location.pathname);
  const navRef = useRef(null);

  // Every routed screen (kit page, Code, AI, Monitor, Flash) is a fixed
  // full-screen overlay. They start at --app-nav-h instead of the top edge, so
  // the nav stays visible above them. The nav's height is not a constant - it
  // wraps onto two or three rows below xl - so it is measured, not guessed.
  // Layout effect, so the first paint of an overlay is already offset.
  useLayoutEffect(() => {
    const root = document.documentElement;
    const nav = navRef.current;
    if (!showNav || !nav) {
      root.style.setProperty('--app-nav-h', '0px');
      return undefined;
    }
    const update = () => {
      // bottom edge plus the same gap the nav keeps from the top of the page
      const gap = parseFloat(getComputedStyle(nav).marginTop) || 0;
      root.style.setProperty('--app-nav-h', `${Math.ceil(nav.getBoundingClientRect().bottom + gap)}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(nav);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      root.style.setProperty('--app-nav-h', '0px');
    };
  }, [showNav]);

  return (
    <div className="min-h-screen flex flex-col font-sans text-ink relative overflow-x-hidden">
      {/* Faint solar system and head mark behind every page. */}
      <PageWatermarks />

      {showNav && (
        <nav ref={navRef} className="glass-panel mx-2 md:mx-4 mt-2 md:mt-4 px-3 md:px-5 py-3 flex flex-col xl:flex-row items-center justify-between rounded-2xl sticky top-2 md:top-4 z-50 gap-3 xl:gap-0">
          {/* The brand is centred in its row rather than pinned left. On mobile
              the status sits absolutely to the right so it cannot push the
              wordmark off-centre; from xl the nav is a single row and the brand
              centres between the status block and the action buttons. */}
          <div className="relative flex items-center justify-center w-full xl:w-auto gap-2 sm:gap-4">
            <Link to={EMBED_HOME || '/'} className="flex items-center gap-2 md:gap-4">
              {/* Guide: the full-colour logo sits on white; in dark it gets a white plate. */}
              <img src={asset('logo.webp')} alt="Lab of Future" className="h-8 md:h-9 w-auto object-contain dark:bg-white dark:rounded-[10px] dark:px-2.5 dark:py-1.5 dark:box-content" />
              <h1 className="text-lg sm:text-xl font-heading font-[750] tracking-[-0.02em] text-heading truncate">
                LOF TITAN
              </h1>
            </Link>

            <div className="absolute right-0 flex flex-col text-right xl:hidden">
              <span className="text-[10.5px] text-muted font-bold tracking-[0.12em] uppercase truncate max-w-[100px] sm:max-w-[150px]">
                {device.deviceName || (device.connected ? 'TITAN' : 'Offline')}
              </span>
              <StatusPill device={device} compact />
            </div>
          </div>

          {/* Page controls (e.g. a kit's title and section switcher) land here,
              so a full-screen page never needs a second toolbar. See NavSlot. */}
          <div id={NAV_SLOT_IDS.start} className="flex items-center justify-center gap-3 min-w-0 empty:hidden" />

          <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-4 w-full xl:w-auto">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-[10.5px] text-muted font-bold tracking-[0.12em] uppercase">
                {device.deviceName || (device.connected ? 'LOF TITAN' : 'Device Offline')}
              </span>
              <StatusPill device={device} />
            </div>

            <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-1.5 sm:gap-2 w-full xl:w-auto">
              {TOOL_LINKS.map(({ to, label, title, Icon }) => {
                const active = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    title={title}
                    aria-current={active ? 'page' : undefined}
                    className={`${NAV_BTN} lof-secondary group ${active ? 'border-brand text-brand-text' : ''}`}
                  >
                    <Icon {...ICON} className={active ? 'text-brand' : 'text-muted group-hover:text-brand-text'} />
                    <span className="hidden sm:inline">{label}</span>
                  </Link>
                );
              })}

              {device.isConnected ? (
                <>
                  <button
                    onClick={device.runCode}
                    title="Run Program"
                    className={`${NAV_BTN} lof-primary border`}
                  >
                    <Play {...ICON} />
                    <span className="hidden sm:inline">Run</span>
                  </button>
                  <button
                    onClick={device.stopExecution}
                    title="Stop Program"
                    className={`${NAV_BTN} lof-secondary`}
                  >
                    <Square {...ICON} className="text-brand" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                  <button
                    onClick={device.softReset}
                    title="Soft Reset Board"
                    className="lof-icon-btn inline-flex items-center justify-center w-[38px] h-[38px]"
                  >
                    <RotateCcw {...ICON} />
                  </button>
                  <button
                    onClick={device.disconnectBLE}
                    title="Disconnect"
                    className={`${NAV_BTN} lof-secondary`}
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={device.connectSerial}
                    title="Connect via Web Serial (USB)"
                    className={`${NAV_BTN} lof-secondary group`}
                  >
                    <Usb {...ICON} className="text-muted group-hover:text-brand-text" />
                    <span className="hidden sm:inline">USB</span>
                  </button>
                  <button
                    onClick={device.connectBLE}
                    title="Connect via Bluetooth LE"
                    className={`${NAV_BTN} lof-primary border`}
                  >
                    <Bluetooth {...ICON} />
                    BLE
                  </button>
                </>
              )}

              {/* A static preview has nothing to sign in to, so offering the
                  button would send visitors to a form that cannot succeed. With
                  OPEN_ACCESS there is no student sign-in either: /login is the
                  staff door to /admin and is reached by URL, not from here. */}
              {!PREVIEW_MODE && !EMBED_KIT && !OPEN_ACCESS && !user && (
                <>
                <div className="w-px h-6 bg-line mx-1 hidden sm:block" />
                <Link
                  to="/login"
                  title="Sign in"
                  className={`${NAV_BTN} lof-secondary group`}
                >
                  <LogIn {...ICON} className="text-muted group-hover:text-brand-text" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
                </>
              )}

              {/* Page actions (Upload & Run, Close) sit after the shared tools. */}
              <div id={NAV_SLOT_IDS.end} className="contents" />

              <ThemeToggle />

              {/* A page's Close button is always the last item. */}
              <div id={NAV_SLOT_IDS.close} className="contents" />
            </div>
          </div>
        </nav>
      )}

      {/* z-10 keeps page content under the sticky nav (z-50). */}
      <main className="relative z-10 flex-1 p-4 grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full">
        <div className="col-span-12 flex flex-col gap-6">
          {embedOutOfScope ? (
            <Navigate to={EMBED_HOME} replace />
          ) : (
          <Routes>
            {/* The portal is the entry point: the dashboard and every kit page
                now sit behind a session. RequireAuth preserves the attempted
                path in location.state, so a deep link into a kit survives the
                detour through sign-in. */}
            <Route
              path="/"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route path="/login" element={<Login />} />
            {/* One kit, embedded in an LMS page. See lib/embed.js. */}
            <Route
              path="/embed/kit/:id"
              element={
                EMBED_KIT ? (
                  <RequireAuth>
                    <KitDetail />
                  </RequireAuth>
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route
              path="/kit/:id"
              element={
                <RequireAuth>
                  <KitDetail />
                </RequireAuth>
              }
            />
            <Route
              path="/redeem"
              element={
                <RequireAuth>
                  <Redeem />
                </RequireAuth>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireAdmin>
                  <Admin />
                </RequireAdmin>
              }
            />

            <Route
              path="/code"
              element={
                <RequireAuth>
                  <RequireAnyKit toolName="Block Code Studio">
                    <CodeRoute />
                  </RequireAnyKit>
                </RequireAuth>
              }
            />
            <Route
              path="/ai"
              element={
                <RequireAuth>
                  <RequireAnyKit toolName="AI Studio">
                    <AIRoute />
                  </RequireAnyKit>
                </RequireAuth>
              }
            />
            <Route
              path="/monitor"
              element={
                <RequireAuth>
                  <RequireAnyKit toolName="Serial Monitor">
                    <MonitorRoute />
                  </RequireAnyKit>
                </RequireAuth>
              }
            />
            <Route
              path="/flash"
              element={
                <RequireAuth>
                  <RequireAnyKit toolName="Firmware Flasher">
                    <FlashRoute />
                  </RequireAnyKit>
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          )}
        </div>
      </main>

      {device.uploadProgress !== null && (
        <div className="fixed inset-0 z-[200] lof-scrim flex items-center justify-center p-5">
          <div className="lof-modal-pop bg-panel p-6 rounded-lof-modal border-t-4 border-brand max-w-md w-full shadow-lof">
            <h2 className="text-lg font-bold mb-1.5 text-heading">Uploading code to LOF TITAN</h2>
            <p className="text-[13px] text-muted mb-4">Keep the board connected until the upload finishes.</p>
            <div className="h-1.5 w-full bg-track rounded-full overflow-hidden">
              <div
                className="h-full lof-progress rounded-full transition-[width] duration-300"
                style={{ width: `${device.uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs font-bold text-link tabular-nums text-right">{device.uploadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
