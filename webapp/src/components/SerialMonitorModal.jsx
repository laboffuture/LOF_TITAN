import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Play, 
  Square, 
  RotateCcw, 
  Trash2, 
  Send, 
  X, 
  Cpu, 
  Sparkles, 
  CornerDownLeft, 
  Wifi, 
  Check, 
  Copy 
} from 'lucide-react';

export function SerialMonitorModal({ isOpen, onClose, device }) {
  const [serialInput, setSerialInput] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const consoleBottomRef = useRef(null);

  useEffect(() => {
    if (autoScroll && consoleBottomRef.current) {
      consoleBottomRef.current.scrollTop = consoleBottomRef.current.scrollHeight;
    }
  }, [device?.consoleOutput, autoScroll, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!serialInput.trim() || !device) return;
    device.writeToSerial(serialInput + '\r\n');
    setSerialInput('');
  };

  const handleCopy = () => {
    if (!device?.consoleOutput) return;
    navigator.clipboard.writeText(device.consoleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-6 backdrop-blur-md bg-slate-900/65 transition-all duration-300">
      
      {/* Main Container Card with Clean White Bezel/Chassis */}
      <div className="relative w-full max-w-4xl h-[86vh] flex flex-col rounded-[22px] bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.18)] overflow-hidden text-slate-800">
        
        {/* Top Header Bar - Clean White Lunar Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200/80 bg-white shrink-0 z-20 gap-3">
          
          {/* Top Left: Terminal Icon & TITAN Branding */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative w-8 h-8 rounded-full overflow-hidden shadow-xs border border-slate-200 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <Terminal size={17} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm tracking-wider text-slate-700">
                LOF TITAN
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Serial REPL
              </span>
            </div>
          </div>

          {/* Center: Device Status Pill */}
          <div className="hidden sm:flex items-center bg-slate-50 border border-slate-200 rounded-full px-3.5 py-0.5 text-xs gap-2 shadow-xs">
            <span className="text-slate-500 font-medium text-[11px]">Device:</span>
            <span className={`font-bold text-xs uppercase ${device?.status === 'CONNECTED_IDLE' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {device?.deviceName || device?.status || 'TITAN ROVER'}
            </span>
          </div>

          {/* Top Right: Hardware Control Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Run Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RUN') : null}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border border-emerald-300 transition-all shadow-xs active:scale-95"
              title="Run active script"
            >
              <Play size={12} className="fill-current text-emerald-500" />
              <span className="hidden sm:inline">Run</span>
            </button>

            {/* Stop Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('STOP') : null}
              className="flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border border-rose-300 transition-all shadow-xs active:scale-95"
              title="Stop script execution"
            >
              <Square size={11} className="fill-current text-rose-500" />
              <span className="hidden sm:inline">Stop</span>
            </button>

            {/* Reset Button */}
            <button 
              onClick={() => device?.sendCommand ? device.sendCommand('RESET') : null}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-all active:scale-95"
              title="Soft Reset Board"
            >
              <RotateCcw size={11} />
              <span className="hidden sm:inline">Reset</span>
            </button>

            <div className="w-px h-4 bg-slate-200 mx-0.5" />

            {/* Close Button */}
            <button 
              onClick={onClose} 
              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors"
              title="Close Serial Monitor"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Balanced White Border Frame Surround Area */}
        <div className="flex-1 p-2.5 sm:p-3 bg-slate-50 flex flex-col overflow-hidden">
          
          {/* Inner Recessed Terminal Box */}
          <div className="flex-1 flex flex-col bg-[#060911] rounded-xl border border-slate-800 shadow-xs overflow-hidden relative">
            
            {/* Terminal Subheader Toolbar */}
            <div className="h-10 px-4 bg-[#0B0F19] border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <span>Baud: 115200</span>
                <span>•</span>
                <span>Encoding: UTF-8</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAutoScroll(!autoScroll)}
                  className={`px-2.5 py-1 rounded text-xs flex items-center gap-1.5 font-semibold transition-colors ${
                    autoScroll ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${autoScroll ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  <span>Auto-Scroll</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy Terminal Logs"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => device?.clearConsole ? device.clearConsole() : null}
                  className="p-1 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  title="Clear Terminal Output"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Terminal Logs Output Screen */}
            <div 
              ref={consoleBottomRef}
              className="flex-1 p-4 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 selection:bg-emerald-500/30"
            >
              {!device?.consoleOutput ? (
                <div className="text-slate-500 italic flex items-center gap-2">
                  <Terminal size={14} />
                  <span>Waiting for serial REPL data from LOF TITAN...</span>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono">
                  {device.consoleOutput}
                </pre>
              )}
            </div>

            {/* Terminal Command Input Bar */}
            <form onSubmit={handleSend} className="p-3 bg-[#0F172A] border-t border-slate-800 flex items-center gap-2">
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-3 text-emerald-400 font-mono text-xs font-bold">&gt;</span>
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  placeholder="Type command or MicroPython statement (e.g. print(hw.read_ultrasonic_distance(6,19)))..."
                  className="w-full bg-[#060911] text-slate-100 text-xs pl-7 pr-3 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!serialInput.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Send size={13} />
                <span>Send</span>
              </button>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
}
