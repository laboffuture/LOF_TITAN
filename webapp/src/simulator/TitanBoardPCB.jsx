import React from 'react';
import { TitanOLEDCanvas } from './TitanOLEDCanvas';
import { Volume2, ArrowUp, ArrowDown } from 'lucide-react';

/**
 * Interactive LOF TITAN PCB Board Visual Digital Twin
 * Features realistic rotating robotic wheels with dynamic variable-speed rotation,
 * large crisp text metrics for motors & sensors, tactile push buttons, glowing LEDs, and live OLED.
 */
export function TitanBoardPCB({ state, onButtonPress, onButtonRelease, onSensorClick }) {
  const { motors, leds, buzzer, oled, buttons, ultrasonic } = state;

  return (
    <div className="relative select-none flex flex-col items-center justify-center p-2 sm:p-4 bg-slate-200/50 rounded-2xl border border-slate-300/80 shadow-md overflow-hidden w-full">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[580px] bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Deep Red PCB Board Container */}
      <div className="relative w-full max-w-[580px] bg-gradient-to-br from-[#d91424] via-[#b50a18] to-[#82050f] rounded-3xl p-3.5 sm:p-4 border-2 border-[#ff4757]/50 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_25px_rgba(0,0,0,0.5)] flex flex-col justify-between space-y-3">
        
        {/* Golden PCB Mounting Holes */}
        <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-[#1e293b] border-2 border-amber-400 shadow-inner" />
        <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-[#1e293b] border-2 border-amber-400 shadow-inner" />
        <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-[#1e293b] border-2 border-amber-400 shadow-inner" />
        <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-[#1e293b] border-2 border-amber-400 shadow-inner" />

        {/* ================= TOP ROW: SPI, I2C, UART PORTS ================= */}
        <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-white/20 px-3">
          {/* SPI Port */}
          <div className="bg-black/40 backdrop-blur-xs p-1.5 rounded-xl border border-white/15">
            <span className="text-[10px] sm:text-xs font-bold text-white tracking-wide block">SPI PORT</span>
            <div className="flex justify-center gap-2 mt-0.5 text-[9px] sm:text-[10px] font-mono text-gray-300">
              <span>CS</span>
              <span>MOSI</span>
              <span>CLK</span>
              <span>MISO</span>
            </div>
          </div>

          {/* I2C Port */}
          <div className="bg-black/40 backdrop-blur-xs p-1.5 rounded-xl border border-cyan-500/30">
            <span className="text-[10px] sm:text-xs font-bold text-cyan-300 tracking-wide block">I2C PORT</span>
            <div className="flex justify-center gap-3 mt-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-cyan-200">
              <span>SCL</span>
              <span>SDA</span>
            </div>
          </div>

          {/* UART Port */}
          <div className="bg-black/40 backdrop-blur-xs p-1.5 rounded-xl border border-amber-500/30">
            <span className="text-[10px] sm:text-xs font-bold text-amber-300 tracking-wide block">UART PORT</span>
            <div className="flex justify-center gap-3 mt-0.5 text-[9px] sm:text-[10px] font-mono font-bold text-amber-200">
              <span>TX</span>
              <span>RX</span>
            </div>
          </div>
        </div>

        {/* ================= MIDDLE SECTION: MOTORS (LEFT), OLED/CHIPS (CENTER), SENSORS (RIGHT) ================= */}
        <div className="grid grid-cols-12 gap-2 sm:gap-2.5 items-stretch">
          
          {/* Left Column (3.5 Cols): Motor Terminals M4/M5, M3/M6, M2, M1 */}
          <div className="col-span-3.5 sm:col-span-3 flex flex-col justify-between space-y-1.5">
            <MotorVisualCard label="M4 / M5" motor={motors.M4} />
            <MotorVisualCard label="M3 / M6" motor={motors.M3} />
            <MotorVisualCard label="M2 (Right)" motor={motors.M2} />
            <MotorVisualCard label="M1 (Left)" motor={motors.M1} />
          </div>

          {/* Center Column (5.5-6 Cols): OLED Screen, Motor Drivers, Keypad Buttons, Status LEDs */}
          <div className="col-span-5.5 sm:col-span-6 flex flex-col items-center justify-between space-y-2 px-0.5">
            
            {/* Silkscreen Header */}
            <div className="text-center">
              <h2 className="text-sm sm:text-base font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                LOF TITAN
              </h2>
              <span className="text-[8px] sm:text-[9px] font-bold text-white/80 uppercase tracking-widest block -mt-0.5">
                LAB OF FUTURE
              </span>
            </div>

            {/* Live 128x64 OLED Display Screen */}
            <div className="w-full flex justify-center">
              <TitanOLEDCanvas displayState={oled} />
            </div>

            {/* Motor Driver IC Graphics */}
            <div className="grid grid-cols-2 gap-1.5 w-full">
              <div className="bg-[#18181b] border border-amber-500/40 rounded-lg p-1 text-center shadow-md">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 block">M1 & M2</span>
                <span className="text-[7px] text-gray-400 block">Dual H-Bridge Driver</span>
              </div>
              <div className="bg-[#18181b] border border-amber-500/40 rounded-lg p-1 text-center shadow-md">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 block">M3, M4, M5, M6</span>
                <span className="text-[7px] text-gray-400 block">Quad H-Bridge Driver</span>
              </div>
            </div>

            {/* Keypad Tactile Push Buttons (SW1 - SW4) */}
            <div className="w-full bg-black/40 backdrop-blur-xs p-1.5 rounded-xl border border-white/20 text-center">
              <span className="text-[9px] sm:text-[10px] font-bold text-white/90 uppercase tracking-wider block mb-1">
                KEYPAD BUTTONS (SW1 - SW4)
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'SW1', pin: 39 },
                  { id: 'SW2', pin: 40 },
                  { id: 'SW3', pin: 41 },
                  { id: 'SW4', pin: 42 }
                ].map((btn) => {
                  const isPressed = buttons[btn.pin];
                  return (
                    <button
                      key={btn.pin}
                      onMouseDown={() => onButtonPress?.(btn.pin)}
                      onMouseUp={() => onButtonRelease?.(btn.pin)}
                      onTouchStart={() => onButtonPress?.(btn.pin)}
                      onTouchEnd={() => onButtonRelease?.(btn.pin)}
                      className={`py-1.5 rounded-md font-mono text-[10px] sm:text-xs font-bold transition-all duration-100 border cursor-pointer ${
                        isPressed
                          ? 'bg-amber-400 text-black shadow-[0_0_12px_#f59e0b] scale-95 border-amber-300'
                          : 'bg-[#27272a] text-gray-200 hover:bg-[#3f3f46] border-white/20'
                      }`}
                      title={`Press ${btn.id}`}
                    >
                      {btn.id}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Onboard Hardware Status: Buzzer & LEDs */}
            <div className="w-full grid grid-cols-3 gap-1.5 items-center bg-black/40 p-1.5 rounded-xl border border-white/15">
              {/* LED 1 (Red) */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    leds.led1
                      ? 'bg-red-500 border-red-300 shadow-[0_0_18px_#ef4444] animate-pulse'
                      : 'bg-red-950/80 border-red-800/60'
                  }`} 
                />
                <span className="text-[9px] font-bold text-red-300 mt-0.5">LED1</span>
              </div>

              {/* Buzzer */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    buzzer.active
                      ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-[0_0_15px_#f59e0b] scale-105'
                      : 'bg-black/60 border-gray-600 text-gray-400'
                  }`}
                >
                  <Volume2 size={13} className={buzzer.active ? 'animate-bounce' : ''} />
                </div>
                <span className="text-[9px] font-bold text-amber-300 mt-0.5">Buzzer</span>
              </div>

              {/* LED 2 (Green) */}
              <div className="flex flex-col items-center text-center">
                <div 
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    leds.led2
                      ? 'bg-green-400 border-green-200 shadow-[0_0_18px_#22c55e] animate-pulse'
                      : 'bg-green-950/80 border-green-800/60'
                  }`} 
                />
                <span className="text-[9px] font-bold text-green-300 mt-0.5">LED2</span>
              </div>
            </div>

          </div>

          {/* Right Column (3 Cols): Ultrasonic & Sensor Ports S1 - S5 */}
          <div className="col-span-3.5 sm:col-span-3 flex flex-col justify-between space-y-1.5">
            {/* Ultrasonic Port */}
            <div 
              onClick={() => state.activeSensors?.ultrasonic && onSensorClick?.('ultrasonic')}
              className={`p-1.5 rounded-xl border text-center transition-all duration-300 shadow-md ${
                state.activeSensors?.ultrasonic
                  ? 'bg-purple-950/40 hover:bg-purple-900/50 cursor-pointer border-purple-500/50 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                  : 'bg-black/25 border-white/5 opacity-40 cursor-default'
              }`}
              title={state.activeSensors?.ultrasonic ? "Click to adjust Ultrasonic Distance" : "Ultrasonic Sensor not referenced in active code"}
            >
              <div className="flex items-center justify-between px-1">
                <span className={`text-[10px] sm:text-xs font-bold uppercase ${
                  state.activeSensors?.ultrasonic ? 'text-purple-300' : 'text-gray-500'
                }`}>
                  Ultrasonic
                </span>
                <span className={`text-[8px] sm:text-[9px] font-mono ${
                  state.activeSensors?.ultrasonic ? 'text-purple-400 font-bold' : 'text-gray-600'
                }`}>
                  {state.activeSensors?.ultrasonic ? 'ACTIVE' : 'IDLE'}
                </span>
              </div>
              <span className={`text-[11px] sm:text-xs font-mono font-black block mt-0.5 ${
                state.activeSensors?.ultrasonic ? 'text-purple-200' : 'text-gray-600'
              }`}>
                {state.activeSensors?.ultrasonic ? `${ultrasonic.distanceCm.toFixed(0)} cm` : '---'}
              </span>
            </div>

            {/* S5 */}
            <SensorPortCard pin={5} label="S5" sensor={state.sensors[5]} active={Boolean(state.activeSensors?.[5])} onClick={() => onSensorClick?.(5)} />

            {/* S4 */}
            <SensorPortCard pin={4} label="S4" sensor={state.sensors[4]} active={Boolean(state.activeSensors?.[4])} onClick={() => onSensorClick?.(4)} />

            {/* S3 */}
            <SensorPortCard pin={3} label="S3" sensor={state.sensors[3]} active={Boolean(state.activeSensors?.[3])} onClick={() => onSensorClick?.(3)} />

            {/* S2 */}
            <SensorPortCard pin={1} label="S2" sensor={state.sensors[1]} active={Boolean(state.activeSensors?.[1])} onClick={() => onSensorClick?.(1)} />

            {/* S1 */}
            <SensorPortCard pin={2} label="S1" sensor={state.sensors[2]} active={Boolean(state.activeSensors?.[2])} onClick={() => onSensorClick?.(2)} />
          </div>

        </div>

        {/* ================= BOTTOM ROW: POWER CONNECTORS & STATUS ================= */}
        <div className="flex items-center justify-between pt-1.5 border-t border-white/20 text-[9px] sm:text-[10px] font-mono text-white/80 px-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
            <span className="font-bold">PWR ON (5V / 12V)</span>
          </div>
          <div className="text-gray-300">
            ESP32-S3 Dual Core • MicroPython
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * High-Detail Robotic Wheel Component with Dynamic 2-Direction Physics Animation
 * Rotates clockwise for FORWARD with cyan aero glow, and counter-clockwise for BACKWARD with amber trail glow.
 */
function RoboticRoverWheelLogo({ isSpinning, isForward, speed }) {
  // Dynamic rotation duration: higher speed = shorter duration (faster rotation)
  const animDuration = Math.max(0.12, 1.8 - (speed / 100) * 1.6);

  const animationStyle = isSpinning
    ? {
        animation: `${isForward ? 'spin-clockwise' : 'spin-counterclockwise'} ${animDuration}s linear infinite`,
        transformOrigin: '50% 50%',
      }
    : {};

  return (
    <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center">
      {/* Dynamic Ambient Speed Glow */}
      {isSpinning && (
        <div 
          className={`absolute -inset-1 rounded-full blur-xs transition-opacity duration-300 ${
            isForward ? 'bg-cyan-500/30' : 'bg-amber-500/30'
          }`} 
        />
      )}

      {/* SVG Detailed 2-Direction Rover Wheel */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md relative z-10"
        style={animationStyle}
      >
        {/* Outer Heavy Duty Rubber Tire */}
        <circle 
          cx="50" 
          cy="50" 
          r="46" 
          fill="#131418" 
          stroke={isSpinning ? (isForward ? '#06b6d4' : '#f59e0b') : '#3f3f46'} 
          strokeWidth="3.5" 
        />

        {/* 8 Aggressive Directional Tire Treads with Grip Blocks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <rect
              x="46"
              y="1"
              width="8"
              height="8"
              rx="2"
              fill={isSpinning ? (isForward ? '#38bdf8' : '#fbbf24') : '#52525b'}
            />
            <line x1="47" y1="5" x2="53" y2="5" stroke="#0f172a" strokeWidth="1" />
          </g>
        ))}

        {/* Outer Alloy Wheel Rim */}
        <circle cx="50" cy="50" r="36" fill="#1e2028" stroke={isSpinning ? (isForward ? '#22d3ee' : '#f59e0b') : '#64748b'} strokeWidth="2" />
        <circle cx="50" cy="50" r="28" fill="#111217" stroke="#334155" strokeWidth="1.5" />

        {/* 6 Aerodynamic High-Torque Spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 50 50)`}>
            <line 
              x1="50" 
              y1="50" 
              x2="50" 
              y2="22" 
              stroke={isSpinning ? (isForward ? '#67e8f9' : '#fde047') : '#94a3b8'} 
              strokeWidth="4" 
              strokeLinecap="round" 
            />
            <circle cx="50" cy="24" r="2.5" fill={isSpinning ? '#ffffff' : '#cbd5e1'} />
          </g>
        ))}

        {/* Center Metallic Hub Cap */}
        <circle 
          cx="50" 
          cy="50" 
          r="14" 
          fill="#090a0f" 
          stroke={isSpinning ? (isForward ? '#22d3ee' : '#f59e0b') : '#475569'} 
          strokeWidth="2.5" 
        />
        
        {/* Center Hub Indicator Point */}
        <circle cx="50" cy="50" r="6" fill={isSpinning ? (isForward ? '#06b6d4' : '#d97706') : '#64748b'} />
        
        {/* Visual Rotation Marker Notch (Spins with wheel) */}
        <circle cx="50" cy="40" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="0.5" />
      </svg>

      {/* Stationary Center Directional Telemetry Badge */}
      {isSpinning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className={`rounded-full p-0.5 backdrop-blur-md shadow-md border ${
            isForward 
              ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300' 
              : 'bg-amber-950/80 border-amber-400 text-amber-300'
          }`}>
            {isForward ? (
              <ArrowUp size={10} className="animate-bounce" />
            ) : (
              <ArrowDown size={10} className="animate-bounce" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Animated Motor Wheel Card component
 */
function MotorVisualCard({ label, motor }) {
  const isSpinning = motor && motor.dir !== 'STOP' && motor.speed > 0;
  const isForward = motor?.dir === 'FORWARD';
  const speed = motor?.speed || 0;

  return (
    <div className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-300 text-center flex flex-col items-center justify-between shadow-md ${
      isSpinning
        ? isForward
          ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
          : 'bg-amber-950/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
        : 'bg-black/40 border-white/15'
    }`}>
      {/* Header with large crisp text */}
      <div className="w-full flex items-center justify-between mb-1">
        <span className="text-[11px] sm:text-xs font-bold text-white font-mono tracking-tight">{label}</span>
        <span className={`text-[10px] sm:text-[11px] font-mono font-black ${
          isSpinning 
            ? (isForward ? 'text-cyan-300' : 'text-amber-300') 
            : 'text-gray-400'
        }`}>
          {isSpinning ? `${speed}%` : 'OFF'}
        </span>
      </div>

      {/* Animated 2-Direction Robotic Wheel */}
      <div className="my-0.5 flex items-center justify-center">
        <RoboticRoverWheelLogo isSpinning={isSpinning} isForward={isForward} speed={speed} />
      </div>

      {/* Status telemetry indicator */}
      <div className="mt-0.5 flex items-center gap-1">
        <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider ${
          isSpinning 
            ? (isForward ? 'text-cyan-300 font-black' : 'text-amber-300 font-black') 
            : 'text-gray-400 font-medium'
        }`}>
          {isSpinning ? (isForward ? '▲ FWD' : '▼ REV') : 'STOPPED'}
        </span>
      </div>
    </div>
  );
}

/**
 * Sensor Port Visual Card with larger, high-contrast text metrics
 */
function SensorPortCard({ pin, label, sensor, active = false, onClick }) {
  const value = sensor?.value ?? 0;
  const type = sensor?.type || 'analog';

  return (
    <div 
      onClick={active ? onClick : undefined}
      className={`p-1.5 rounded-xl border text-center transition-all duration-300 shadow-md ${
        active 
          ? 'bg-black/40 hover:bg-black/60 cursor-pointer border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
          : 'bg-black/20 border-white/5 opacity-40 cursor-default'
      }`}
      title={active ? `Click to adjust ${label} value` : `${label} is not referenced in active code`}
    >
      <div className="flex items-center justify-between px-1">
        <span className={`text-[11px] sm:text-xs font-bold ${active ? 'text-cyan-300' : 'text-gray-500'}`}>
          {label}
        </span>
        <span className={`text-[8px] sm:text-[9px] uppercase font-mono font-semibold ${
          active ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {active ? type : 'DISABLED'}
        </span>
      </div>
      <div className="w-full bg-black/70 rounded-full h-1.5 mt-1 overflow-hidden">
        <div 
          className={`h-full transition-all duration-150 ${
            active ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300' : 'bg-gray-800'
          }`}
          style={{ width: `${active ? (value / 4095) * 100 : 0}%` }}
        />
      </div>
      <span className={`text-[10px] sm:text-xs font-mono font-black block mt-0.5 ${
        active ? 'text-cyan-200' : 'text-gray-600'
      }`}>
        {active ? value : '---'}
      </span>
    </div>
  );
}
