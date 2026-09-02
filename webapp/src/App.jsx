import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Bluetooth, Usb, Play, Square, RotateCcw, Terminal, Bot, Code, Cpu, LogIn, LogOut,
} from 'lucide-react';
import Galaxy from './components/Galaxy';
import { useDeviceContext } from './device/deviceContext';
import { useAuth } from './auth/authContext';
import { RequireAuth } from './auth/RequireAuth';
import { RequireAnyKit } from './auth/RequireAnyKit';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { KitDetail } from './pages/KitDetail';
import { CodeRoute, AIRoute, MonitorRoute, FlashRoute } from './pages/ToolRoutes';
import { asset } from './lib/asset';

const TOOL_LINKS = [
  { to: '/code', label: 'Code', title: 'Open Block Code Workspace', Icon: Code, tint: 'text-blue-400' },
  { to: '/monitor', label: 'Monitor', title: 'Open Serial Monitor', Icon: Terminal, tint: 'text-green-400' },
  { to: '/ai', label: 'AI', title: 'Open AI Studio', Icon: Bot, tint: 'text-purple-400' },
];

function StatusPill({ device, compact }) {
  return (
    <span
      className={`font-bold flex items-center justify-end gap-1.5 ${compact ? 'text-[10px] sm:text-[11px]' : 'text-[11px]'} ${
        device.status === 'RUNNING'
          ? 'text-emerald-400 animate-pulse'
          : device.connected || device.status === 'CONNECTED_IDLE'
          ? 'text-green-400'
          : device.status === 'WAITING_FOR_CONNECTION'
          ? 'text-amber-400'
          : 'text-gray-400'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          device.connected ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-500'
        }`}
      />
      <span className={compact ? 'truncate max-w-[80px] sm:max-w-full' : ''}>{device.status}</span>
    </span>
  );
}

function App() {
  const device = useDeviceContext();
  const { user, signOut } = useAuth();
  const location = useLocation();

  // The routed screens present as full-screen overlays; pause the WebGL
  // background while one is open so it isn't burning frames behind them.
  const overlayOpen = location.pathname !== '/';
  // The nav belongs to the dashboard only. Every other route is either a
  // full-screen overlay that covers it anyway, or /login, which has its own
  // "Back to kits" link.
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#060911] text-white relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-90">
        <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          disableAnimation={overlayOpen}
          density={1.0}
          glowIntensity={0.45}
          saturation={0.8}
          hueShift={200}
          speed={0.25}
          starSpeed={0.12}
          rotationSpeed={0.02}
          repulsionStrength={0}
          twinkleIntensity={0.25}
          transparent
        />
      </div>

      {isHome && (
        <nav className="glass-panel mx-2 md:mx-4 mt-2 md:mt-4 px-3 md:px-6 py-3 md:py-4 flex flex-col xl:flex-row items-center justify-between rounded-3xl xl:rounded-full sticky top-2 md:top-4 z-50 gap-4 xl:gap-0">
          {/* The brand is centred in its row rather than pinned left. On mobile
              the status sits absolutely to the right so it cannot push the
              wordmark off-centre; from xl the nav is a single row and the brand
              centres between the status block and the action buttons. */}
          <div className="relative flex items-center justify-center w-full xl:w-auto gap-2 sm:gap-4">
            <Link to="/" className="flex items-center gap-2 md:gap-4">
              <img src={asset('logo.webp')} alt="Lab of Future" className="h-8 md:h-10 w-auto object-contain" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-start to-white truncate">
                LOF TITAN
              </h1>
            </Link>

            <div className="absolute right-0 flex flex-col text-right xl:hidden">
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase truncate max-w-[100px] sm:max-w-[150px]">
                {device.deviceName || (device.connected ? 'TITAN' : 'Offline')}
              </span>
              <StatusPill device={device} compact />
            </div>
          </div>

          <div className="flex flex-col xl:flex-row items-center gap-3 xl:gap-4 w-full xl:w-auto">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                {device.deviceName || (device.connected ? 'LOF TITAN' : 'Device Offline')}
              </span>
              <StatusPill device={device} />
            </div>

            <div className="flex flex-wrap xl:flex-nowrap items-center justify-center gap-1.5 sm:gap-2 w-full xl:w-auto">
              {TOOL_LINKS.map(({ to, label, title, Icon, tint }) => (
                <Link
                  key={to}
                  to={to}
                  title={title}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300 text-xs sm:text-sm"
                >
                  <Icon size={16} className={`${tint} sm:w-[18px] sm:h-[18px]`} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}

              <Link
                to="/flash"
                title="Open Dedicated Firmware Flasher"
                className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-gradient-to-r from-purple-600/30 to-indigo-600/30 text-purple-300 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(168,85,247,0.4)] text-xs sm:text-sm"
              >
                <Cpu size={16} className="text-purple-400 sm:w-[18px] sm:h-[18px]" />
                <span className="hidden sm:inline">Flash</span>
              </Link>

              {device.isConnected ? (
                <>
                  <button
                    onClick={device.runCode}
                    title="Run Program"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Play size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Run</span>
                  </button>
                  <button
                    onClick={device.stopExecution}
                    title="Stop Program"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Square size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                  <button
                    onClick={device.softReset}
                    title="Soft Reset Board"
                    className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <RotateCcw size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    onClick={device.disconnectBLE}
                    title="Disconnect"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all duration-300 text-xs sm:text-sm"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={device.connectSerial}
                    title="Connect via Web Serial (USB)"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 bg-surface border border-white/10 hover:bg-white/5 text-gray-300 text-xs sm:text-sm"
                  >
                    <Usb size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span className="hidden sm:inline">USB</span>
                  </button>
                  <button
                    onClick={device.connectBLE}
                    title="Connect via Bluetooth LE"
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium transition-all duration-300 bg-gradient-to-r from-primary-start to-primary-end hover:shadow-glow text-white text-xs sm:text-sm"
                  >
                    <Bluetooth size={16} className="sm:w-[18px] sm:h-[18px]" />
                    BLE
                  </button>
                </>
              )}

              <div className="w-px h-6 bg-white/15 mx-1 hidden sm:block" />

              {user ? (
                <button
                  onClick={signOut}
                  title={`Signed in as ${user.name}`}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300 text-xs sm:text-sm"
                >
                  <LogOut size={16} className="text-emerald-400 sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  title="Sign in"
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium bg-surface border border-white/10 hover:bg-white/5 text-gray-300 transition-all duration-300 text-xs sm:text-sm"
                >
                  <LogIn size={16} className="text-cyan-400 sm:w-[18px] sm:h-[18px]" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* relative z-10 is load-bearing: the Galaxy behind is `fixed z-0`, which
          makes it a POSITIONED element. Without a stacking context of its own,
          <main> is non-positioned and therefore paints BENEATH it - the galaxy
          washed over the kit cards at 90% opacity. z-10 keeps content above the
          background while staying under the sticky nav (z-50). */}
      <main className="relative z-10 flex-1 p-4 grid grid-cols-12 gap-6 max-w-screen-2xl mx-auto w-full">
        <div className="col-span-12 flex flex-col gap-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/kit/:id" element={<KitDetail />} />

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
        </div>
      </main>

      {device.uploadProgress !== null && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-surface p-8 rounded-2xl border border-white/10 max-w-md w-full text-center shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">Uploading Code to LOF TITAN</h2>
            <div className="h-3 w-full bg-black rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.8)]"
                style={{ width: `${device.uploadProgress}%` }}
              />
            </div>
            <p className="text-sm font-mono text-cyan-400 font-bold">{device.uploadProgress}%</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
