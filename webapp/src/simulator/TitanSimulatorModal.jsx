import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  X, 
  Terminal, 
  Sliders, 
  Code, 
  Activity, 
  Trash2,
  Copy,
  Check,
  RefreshCw,
  FileCode,
  Cpu
} from 'lucide-react';
import { TitanBoardPCB } from './TitanBoardPCB';
import { TitanSensorControls } from './TitanSensorControls';
import { titanSimulator } from './TitanSimulatorEngine';

/**
 * Interactive LOF TITAN Hardware Simulator Modal
 * Premium Light Theme with Tinkercad-Style Sensor Controls, 
 * Real-Time Virtual Serial Console, Live PCB Digital Twin, and Interactive Code Editor.
 */
export function TitanSimulatorModal({ isOpen, onClose, workspace, pythonCode, sourceTitle }) {
  const [state, setState] = useState(titanSimulator.state);
  const [activeTab, setActiveTab] = useState('sensors'); // 'sensors' | 'console' | 'code' | 'gpio'
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [logs, setLogs] = useState([]);
  const [editableCode, setEditableCode] = useState(pythonCode || '');
  const [copied, setCopied] = useState(false);
  const logEndRef = useRef(null);

  // Synchronize incoming pythonCode with editable code editor and detect active sensors
  useEffect(() => {
    if (pythonCode) {
      setEditableCode(pythonCode);
      titanSimulator.detectActiveSensors(pythonCode, workspace);
    }
  }, [pythonCode, workspace]);

  // Subscribe to simulator state updates
  useEffect(() => {
    const unsubState = titanSimulator.subscribe(setState);
    const unsubLogs = titanSimulator.subscribeLogs((newLog) => {
      setLogs((prev) => [...prev.slice(-100), newLog]);
    });

    return () => {
      unsubState();
      unsubLogs();
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current && activeTab === 'console') {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [logs, activeTab]);

  const handleRun = (codeToRun = null) => {
    const code = codeToRun || editableCode || pythonCode;
    titanSimulator.detectActiveSensors(code, workspace);
    if (code && code.trim().length > 0) {
      titanSimulator.runPythonCode(code);
    } else if (workspace && workspace.getAllBlocks(false).length > 0) {
      titanSimulator.runBlocklyWorkspace(workspace);
    } else {
      titanSimulator.log(">>> Running default LOF TITAN test routine...");
      titanSimulator.initOLED();
      titanSimulator.oledText("LOF TITAN", 16, 14, 2);
      titanSimulator.oledText("SIMULATOR OK", 16, 36, 1);
      titanSimulator.setLed('47', 'ON');
      titanSimulator.setLed('48', 'ON');
      titanSimulator.playBuzzerTone('STARTUP');
      titanSimulator.driveRover('FORWARD', 75);
    }
  };

  // Auto-run simulation immediately with the latest code when modal opens
  useEffect(() => {
    if (isOpen) {
      titanSimulator.detectActiveSensors(pythonCode || editableCode, workspace);
      const timer = setTimeout(() => {
        handleRun(pythonCode);
      }, 120);
      return () => clearTimeout(timer);
    } else {
      titanSimulator.stop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStop = () => {
    titanSimulator.stop();
  };

  const handlePause = () => {
    titanSimulator.pause();
  };

  const handleReset = () => {
    titanSimulator.reset();
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      titanSimulator.stopBuzzer();
    }
    setIsMuted(!isMuted);
  };

  const handleSpeedChange = (val) => {
    setSpeed(val);
    titanSimulator.executionSpeed = val;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    setEditableCode(pythonCode || '');
  };

  const sourceBadge = sourceTitle || (workspace ? "Blockly Workspace" : pythonCode ? "MicroPython Code" : "Standby");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Simulator Modal Card - Light Theme */}
      <div className={`relative flex flex-col bg-white border border-slate-200 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.25)] overflow-hidden transition-all duration-300 w-full ${
        isFullScreen ? 'h-full max-w-full' : 'max-w-6xl h-[92vh]'
      }`}>
        
        {/* ================= HEADER TOOLBAR (LIGHT THEME) ================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-50/90 border-b border-slate-200 shrink-0">
          
          {/* Title & Status */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Cpu size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-heading font-black text-slate-900 tracking-wide">
                  LOF TITAN Virtual Lab
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5 ${
                  titanSimulator.isRunning
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs animate-pulse'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${titanSimulator.isRunning ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {titanSimulator.isRunning ? (titanSimulator.isPaused ? 'PAUSED' : 'SIMULATING') : 'STANDBY'}
                </span>
                
                {/* Active Code Source Badge */}
                <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-mono text-[10px] font-semibold">
                  <FileCode size={11} />
                  <span>{sourceBadge}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!titanSimulator.isRunning ? (
              <button
                onClick={() => handleRun(editableCode)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 text-xs sm:text-sm transform active:scale-95 cursor-pointer"
                title="Run Simulation with current code"
              >
                <Play size={15} fill="currentColor" />
                <span>Simulate</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handlePause}
                  className={`p-2 rounded-full border transition-all cursor-pointer ${
                    titanSimulator.isPaused 
                      ? 'bg-amber-100 text-amber-800 border-amber-300 shadow-xs'
                      : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                  }`}
                  title={titanSimulator.isPaused ? 'Resume' : 'Pause'}
                >
                  <Pause size={16} />
                </button>
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 shadow-xs transition-all duration-200 text-xs sm:text-sm cursor-pointer"
                  title="Stop Simulation"
                >
                  <Square size={14} fill="currentColor" />
                  <span>Stop</span>
                </button>
              </>
            )}

            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs"
              title="Reset Board State"
            >
              <RotateCcw size={16} />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleMuteToggle}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 text-rose-600 border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-blue-600 border-slate-300'
              }`}
              title={isMuted ? 'Unmute Buzzer' : 'Mute Buzzer Audio'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Execution Speed Dropdown */}
            <select
              value={speed}
              onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
              className="hidden md:block bg-white border border-slate-300 text-slate-800 text-xs font-mono font-bold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer shadow-xs hover:border-slate-400"
            >
              <option value="0.5">0.5x Speed</option>
              <option value="1.0">1.0x Normal</option>
              <option value="2.0">2.0x Fast</option>
            </select>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition-all hidden sm:block cursor-pointer shadow-xs"
              title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button
              onClick={() => {
                handleStop();
                onClose();
              }}
              className="p-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 border border-slate-300 transition-all cursor-pointer shadow-xs"
              title="Close Simulator"
            >
              <X size={18} />
            </button>
          </div>

        </div>

        {/* ================= BODY SPLIT: PCB (LEFT) + CONTROLS / LOGS (RIGHT) ================= */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* LEFT: Virtual LOF TITAN PCB Digital Twin (7 Cols) */}
          <div className="lg:col-span-7 p-3 sm:p-6 overflow-y-auto flex items-center justify-center bg-slate-100/70 border-b lg:border-b-0 lg:border-r border-slate-200">
            <TitanBoardPCB
              state={state}
              onButtonPress={(pin) => titanSimulator.setButtonState(pin, true)}
              onButtonRelease={(pin) => titanSimulator.setButtonState(pin, false)}
              onSensorClick={(target) => {
                setActiveTab('sensors');
              }}
            />
          </div>

          {/* RIGHT: Sensor Control Deck & Virtual Telemetry (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-50/50 overflow-hidden">
            
            {/* Right Panel Tabs - Light Theme */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-slate-200 bg-white shrink-0 shadow-xs">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab('sensors')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'sensors'
                      ? 'bg-blue-50 text-blue-700 border border-blue-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Sliders size={13} />
                  <span>Sensors</span>
                </button>

                <button
                  onClick={() => setActiveTab('console')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'console'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Terminal size={13} />
                  <span>Console</span>
                  {logs.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'code'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Code size={13} />
                  <span>Code Editor</span>
                </button>

                <button
                  onClick={() => setActiveTab('gpio')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    activeTab === 'gpio'
                      ? 'bg-purple-50 text-purple-700 border border-purple-300 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Activity size={13} />
                  <span>State Monitor</span>
                </button>
              </div>

              {activeTab === 'console' && logs.length > 0 && (
                <button
                  onClick={() => setLogs([])}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Clear Console"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto flex flex-col bg-slate-50">
              {activeTab === 'sensors' && (
                <TitanSensorControls state={state} simulatorEngine={titanSimulator} />
              )}

              {activeTab === 'console' && (
                <div 
                  ref={logEndRef} 
                  className="h-full bg-slate-900 rounded-2xl p-3.5 border border-slate-800 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1.5 shadow-inner"
                >
                  {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-10">
                      <Terminal size={28} className="mb-2 opacity-50 text-slate-400" />
                      <p className="font-semibold text-slate-400">Virtual Console Ready.</p>
                      <p className="text-[10px] text-slate-500">`print()` output streams here in real time.</p>
                    </div>
                  ) : (
                    logs.map((line, idx) => (
                      <div key={idx} className="leading-relaxed break-all font-mono">
                        {line}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Interactive Editable MicroPython Code Editor (Light Theme) */}
              {activeTab === 'code' && (
                <div className="h-full flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  
                  {/* Editor Header Toolbar */}
                  <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/80 border-b border-slate-200 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-800 flex items-center gap-1.5">
                        <FileCode size={13} className="text-blue-600" />
                        main.py
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">(Editable)</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleResetCode}
                        className="p-1 px-2.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Reset to original code"
                      >
                        <RefreshCw size={11} />
                        <span>Reset</span>
                      </button>

                      <button
                        onClick={handleCopyCode}
                        className="p-1 px-2.5 rounded-lg bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Copy code"
                      >
                        {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>

                      <button
                        onClick={() => handleRun(editableCode)}
                        className="p-1 px-3.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Run this edited code in simulator"
                      >
                        <Play size={11} fill="currentColor" />
                        <span>Run Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Textarea */}
                  <div className="flex-1 relative overflow-hidden flex bg-white">
                    <textarea
                      value={editableCode}
                      onChange={(e) => setEditableCode(e.target.value)}
                      placeholder="# Write or edit MicroPython code here to simulate on LOF TITAN..."
                      className="w-full h-full p-3.5 font-mono text-xs text-slate-900 bg-transparent outline-none resize-none leading-relaxed selection:bg-blue-100 selection:text-blue-900"
                      spellCheck={false}
                      onKeyDown={(e) => {
                        // Allow Tab key indenting inside textarea
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          const start = e.target.selectionStart;
                          const end = e.target.selectionEnd;
                          const val = editableCode;
                          setEditableCode(val.substring(0, start) + '    ' + val.substring(end));
                          setTimeout(() => {
                            e.target.selectionStart = e.target.selectionEnd = start + 4;
                          }, 0);
                        }
                      }}
                    />
                  </div>

                </div>
              )}

              {activeTab === 'gpio' && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <h5 className="font-bold text-blue-700 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Motor Outputs
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>M1 (Left): <span className="text-slate-900 font-bold">{state.motors.M1.dir} ({state.motors.M1.speed}%)</span></div>
                      <div>M2 (Right): <span className="text-slate-900 font-bold">{state.motors.M2.dir} ({state.motors.M2.speed}%)</span></div>
                      <div>M3 / M6: <span className="text-slate-900 font-bold">{state.motors.M3.dir} ({state.motors.M3.speed}%)</span></div>
                      <div>M4 / M5: <span className="text-slate-900 font-bold">{state.motors.M4.dir} ({state.motors.M4.speed}%)</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <h5 className="font-bold text-amber-700 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Peripherals & Tones
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>LED1 (Red): <span className={state.leds.led1 ? 'text-rose-600 font-bold' : 'text-slate-400'}>{state.leds.led1 ? 'ON' : 'OFF'}</span></div>
                      <div>LED2 (Green): <span className={state.leds.led2 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>{state.leds.led2 ? 'ON' : 'OFF'}</span></div>
                      <div>Buzzer: <span className={state.buzzer.active ? 'text-amber-600 font-bold' : 'text-slate-400'}>{state.buzzer.active ? 'PLAYING' : 'IDLE'}</span></div>
                      <div>OLED Display: <span className={state.oled.initialized ? 'text-blue-600 font-bold' : 'text-slate-400'}>{state.oled.initialized ? 'ONLINE' : 'OFF'}</span></div>
                    </div>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                    <h5 className="font-bold text-purple-700 mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Keypad Push Buttons
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div>SW1: <span className={state.buttons[39] ? 'text-amber-600 font-bold' : 'text-slate-400'}>{state.buttons[39] ? 'PRESSED (0)' : 'RELEASED (1)'}</span></div>
                      <div>SW2: <span className={state.buttons[40] ? 'text-amber-600 font-bold' : 'text-slate-400'}>{state.buttons[40] ? 'PRESSED (0)' : 'RELEASED (1)'}</span></div>
                      <div>SW3: <span className={state.buttons[41] ? 'text-amber-600 font-bold' : 'text-slate-400'}>{state.buttons[41] ? 'PRESSED (0)' : 'RELEASED (1)'}</span></div>
                      <div>SW4: <span className={state.buttons[42] ? 'text-amber-600 font-bold' : 'text-slate-400'}>{state.buttons[42] ? 'PRESSED (0)' : 'RELEASED (1)'}</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
