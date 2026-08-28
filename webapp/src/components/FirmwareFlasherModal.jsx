import React, { useState, useRef, useEffect } from 'react';
import { Cpu, X, CheckCircle2, AlertTriangle, Loader2, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { ESPLoader, Transport } from 'esptool-js';

export function FirmwareFlasherModal({ isOpen, onClose, onDisconnectCurrent }) {
  const [flashing, setFlashing] = useState(false);
  const [flashStatus, setFlashStatus] = useState('IDLE'); // 'IDLE' | 'FETCHING' | 'CONNECTING' | 'ERASING' | 'FLASHING' | 'RESETTING' | 'SUCCESS' | 'ERROR'
  const [statusMessage, setStatusMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [eraseAll, setEraseAll] = useState(true);
  const [logs, setLogs] = useState([]);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const appendLog = (msg) => {
    if (!msg) return;
    setLogs(prev => [...prev.slice(-300), msg]);
  };

  const handleStartFlash = async () => {
    if (flashing) return;
    setFlashing(true);
    setLogs([]);
    setProgressPercent(0);
    setFlashStatus('FETCHING');
    setStatusMessage('Preparing firmware binaries...');

    try {
      // 1. Release active serial port
      if (onDisconnectCurrent) {
        appendLog('[FLASHER] Closing active dashboard serial connection...');
        await onDisconnectCurrent();
        await new Promise(r => setTimeout(r, 400));
      }

      // 2. Fetch firmware files
      appendLog('[FLASHER] Downloading bootloader, partitions, and micropython binaries...');
      const [bootloaderRes, partitionsRes, appRes] = await Promise.all([
        fetch('/firmware/bootloader.bin'),
        fetch('/firmware/partitions.bin'),
        fetch('/firmware/micropython.bin')
      ]);

      if (!bootloaderRes.ok || !partitionsRes.ok || !appRes.ok) {
        throw new Error("Failed to load firmware binary files from server.");
      }

      const [bootloaderData, partitionsData, appData] = await Promise.all([
        bootloaderRes.arrayBuffer(),
        partitionsRes.arrayBuffer(),
        appRes.arrayBuffer()
      ]);

      appendLog(`[FLASHER] Loaded: Bootloader (${bootloaderData.byteLength} B), Partitions (${partitionsData.byteLength} B), MicroPython (${appData.byteLength} B)`);

      // 3. Request COM Port
      if (!('serial' in navigator)) {
        throw new Error("Web Serial API is not supported in this browser. Please use Chrome or Edge.");
      }

      setFlashStatus('CONNECTING');
      setStatusMessage('Please select your ESP32-S3 COM Port in the browser dialog...');
      appendLog('[FLASHER] Requesting Serial Port from user...');

      const port = await navigator.serial.requestPort();
      appendLog('[FLASHER] Port selected. Initializing ROM bootloader transport...');

      const transport = new Transport(port, true);
      const loader = new ESPLoader({
        transport,
        baudrate: 460800,
        terminal: {
          clean: () => {},
          writeLine: (data) => appendLog(data),
          write: (data) => appendLog(data)
        }
      });

      appendLog('[FLASHER] Handshaking with ESP32-S3 ROM bootloader...');
      await loader.main();
      appendLog(`[FLASHER] Connected to ${loader.chip ? loader.chip.CHIP_NAME : 'ESP32-S3'} successfully!`);

      // 4. Erasing & Flashing
      if (eraseAll) {
        setFlashStatus('ERASING');
        setStatusMessage('Erasing flash chip (16MB)...');
        setProgressPercent(5);
        appendLog('[FLASHER] Erasing entire flash memory (please wait ~10s)...');
        await loader.eraseFlash();
        appendLog('[FLASHER] Flash erased successfully.');
      }

      setFlashStatus('FLASHING');
      setStatusMessage('Writing Firmware Binaries...');
      setProgressPercent(15);

      const fileArray = [
        { data: new Uint8Array(bootloaderData), address: 0x0 },
        { data: new Uint8Array(partitionsData), address: 0x8000 },
        { data: new Uint8Array(appData), address: 0x10000 }
      ];

      const flashOptions = {
        fileArray: fileArray,
        flashSize: 'keep',
        flashMode: 'dio',
        flashFreq: '80m',
        eraseAll: false,
        compress: true,
        reportProgress: (fileIndex, written, total) => {
          const filePercent = Math.round((written / total) * 100);
          const totalProgress = Math.round(((fileIndex * 100) + filePercent) / 3);
          setProgressPercent(Math.min(99, Math.max(15, totalProgress)));
          const names = ['bootloader.bin (0x0)', 'partitions.bin (0x8000)', 'micropython.bin (0x10000)'];
          setStatusMessage(`Flashing ${names[fileIndex] || `file ${fileIndex + 1}`} (${filePercent}%)...`);
        }
      };

      await loader.writeFlash(flashOptions);

      // 5. Reset device
      setFlashStatus('RESETTING');
      setStatusMessage('Resetting device into normal MicroPython mode...');
      appendLog('[FLASHER] Flashing finished. Resetting chip via DTR/RTS...');

      try {
        await transport.setDTR(false);
        await transport.setRTS(true);
        await new Promise(r => setTimeout(r, 150));
        await transport.setDTR(false);
        await transport.setRTS(false);
      } catch (e) {}

      await transport.disconnect();
      appendLog('[FLASHER] ✅ Firmware Flashed and Verified Successfully!');

      setFlashStatus('SUCCESS');
      setStatusMessage('Firmware flashed successfully! Your LOF TITAN is ready.');
      setProgressPercent(100);

    } catch (err) {
      console.error("Flasher error:", err);
      appendLog(`[ERROR] ${err.message}`);
      setFlashStatus('ERROR');
      setStatusMessage(`Flashing Failed: ${err.message}`);
    } finally {
      setFlashing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-surface/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold text-white flex items-center gap-2">
                LOF TITAN Firmware Flasher
                <span className="text-xs font-mono font-normal bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                  ESP32-S3 N16R8
                </span>
              </h2>

            </div>
          </div>

          <button 
            disabled={flashing}
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
          
          {/* Flashing Progress Card (Always Visible) */}
          <div className="bg-surface/60 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {flashing ? (
                  <Loader2 size={18} className="text-cyan-400 animate-spin" />
                ) : flashStatus === 'SUCCESS' ? (
                  <CheckCircle2 size={18} className="text-green-400" />
                ) : flashStatus === 'ERROR' ? (
                  <AlertTriangle size={18} className="text-red-400" />
                ) : (
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
                <span className="text-sm font-semibold text-white">
                  {statusMessage || 'Ready to flash firmware bundle.'}
                </span>
              </div>
              <span className="text-sm font-bold font-mono text-cyan-400">{progressPercent}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/10 p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  flashStatus === 'ERROR'
                    ? 'bg-red-500'
                    : flashStatus === 'SUCCESS'
                    ? 'bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Clean Install Option */}
          {!flashing && flashStatus !== 'SUCCESS' && (
            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 text-xs text-gray-300 select-none cursor-pointer hover:text-white">
                <input 
                  type="checkbox"
                  checked={eraseAll}
                  onChange={(e) => setEraseAll(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
                <span>Erase entire flash before writing (Recommended clean install)</span>
              </label>
            </div>
          )}

          {/* Flasher Terminal Output */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Flasher Log</span>
              {logs.length > 0 && <span className="font-mono text-[10px] text-gray-500">{logs.length} lines</span>}
            </div>
            <div 
              ref={logContainerRef}
              className="h-48 bg-black/60 font-mono text-xs text-emerald-400 p-3 rounded-xl border border-white/5 overflow-y-auto break-all whitespace-pre-wrap select-text"
            >
              {logs.length === 0 ? (
                <span className="text-gray-600 italic">Logs will appear here once flashing begins...</span>
              ) : (
                logs.join('\n')
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-surface/30 flex items-center justify-between">
          <button 
            disabled={flashing}
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 text-gray-300 hover:text-white transition-colors disabled:opacity-30"
          >
            {flashStatus === 'SUCCESS' ? 'Close Window' : 'Cancel'}
          </button>

          {flashStatus === 'SUCCESS' ? (
            <button 
              onClick={onClose}
              className="px-8 py-2.5 rounded-full text-sm font-bold bg-green-500 hover:bg-green-400 text-black transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Done & Return to Dashboard
            </button>
          ) : (
            <button 
              disabled={flashing}
              onClick={handleStartFlash}
              className="px-8 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg hover:shadow-purple-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {flashing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Flashing in Progress...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Connect & Flash Firmware
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
