import React, { useEffect, useRef } from 'react';
import { 
  Sliders, 
  Heart, 
  Waves,
  Lock,
  Compass,
  Flame,
  Thermometer,
  RotateCw,
  Disc,
  Target
} from 'lucide-react';

/**
 * Interactive Tinkercad-Style Sensor Controls Deck for LOF TITAN (Light Theme)
 * Sensor ports are dynamically enabled and selectable ONLY when the active program/code uses that sensor.
 */
export function TitanSensorControls({ state, simulatorEngine }) {
  const { 
    ultrasonic, 
    sensors, 
    pulseSensor, 
    qmc5883l = { heading: 0, dir: 'N', x: 0, y: 0, z: 0, temp: 25 }, 
    amg8833 = { maxTemp: 32, minTemp: 22, avgTemp: 26, centerTemp: 30, thermistor: 25, pixels: Array(64).fill(22) }, 
    as5600 = { angle: 0, raw: 0, turns: 0, cumulativeDeg: 0, rpm: 0, magnetDetected: true, magnetStatus: 'Optimal / Detected', agc: 128 },
    ds18b20 = { 2: 25.0, 1: 25.0, 3: 25.0, 4: 25.0, 5: 25.0, 19: 25.0 },
    vl53l0x = { distanceMm: 250, mode: 'BALANCED' },
    activeSensors = {} 
  } = state;

  const isUltraActive = Boolean(activeSensors.ultrasonic);
  const isPulseActive = Boolean(activeSensors.pulse);
  const isQmcActive = Boolean(activeSensors.qmc5883l);
  const isAmgActive = Boolean(activeSensors.amg8833);
  const isAs5600Active = Boolean(activeSensors.as5600);
  const isVl53l0xActive = Boolean(activeSensors.vl53l0x);

  return (
    <div className="flex flex-col space-y-3.5 text-slate-800">
      
      {/* 1. Ultrasonic Distance Slider (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isUltraActive
          ? 'bg-white border-purple-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isUltraActive 
                ? 'bg-purple-50 text-purple-600 border-purple-200 shadow-xs' 
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Waves size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">Ultrasonic Distance Sensor</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isUltraActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isUltraActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isUltraActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Range: 2cm – 300cm</p>
            </div>
          </div>
          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
            isUltraActive
              ? 'text-purple-700 bg-purple-50 border-purple-200 shadow-xs'
              : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            {ultrasonic.distanceCm.toFixed(1)} cm
          </span>
        </div>

        <input 
          type="range" 
          min="2" 
          max="300" 
          step="1"
          disabled={!isUltraActive}
          value={ultrasonic.distanceCm}
          onChange={(e) => simulatorEngine.setUltrasonicDistance(e.target.value)}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-purple-600 ${
            isUltraActive ? 'bg-purple-100' : 'bg-slate-200 cursor-not-allowed opacity-50'
          }`}
        />

        {isUltraActive && (
          <div className="flex items-center justify-between mt-2.5 gap-1.5 text-[10px]">
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(8)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Obstacle (8cm)
            </button>
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(25)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Medium (25cm)
            </button>
            <button 
              onClick={() => simulatorEngine.setUltrasonicDistance(100)}
              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-mono font-semibold border border-purple-200 shadow-xs transition-colors cursor-pointer"
            >
              Clear (100cm)
            </button>
          </div>
        )}
      </div>

      {/* 2. Analog / Digital Sensors S1 - S5 Control Grid (Light Theme) */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
              <Sliders size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Sensor Ports S1 – S5 (ADC 0 - 4095 & 1-Wire)</h4>
              <p className="text-[10px] text-slate-500 font-mono">Selectable when referenced by script or block code</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {[
            { pin: 2, label: 'S1', defaultType: 'light' },
            { pin: 1, label: 'S2', defaultType: 'potentiometer' },
            { pin: 3, label: 'S3', defaultType: 'flame' },
            { pin: 4, label: 'S4', defaultType: 'line' },
            { pin: 5, label: 'S5', defaultType: 'motion' },
          ].map((item) => {
            const sData = sensors[item.pin] || { value: 0, type: item.defaultType, digital: 0 };
            const isSensorActive = Boolean(activeSensors[item.pin]);
            const isDs18 = sData.type === 'ds18b20';
            const tempVal = ds18b20[item.pin] ?? sData.tempC ?? 25.0;

            return (
              <div 
                key={item.pin} 
                className={`p-2.5 rounded-xl border transition-all duration-300 space-y-1.5 ${
                  isSensorActive
                    ? isDs18 ? 'bg-cyan-50/50 border-cyan-300 shadow-xs' : 'bg-slate-50 border-blue-200 shadow-xs'
                    : 'bg-slate-100/60 border-slate-200 opacity-40'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold font-mono text-xs ${isSensorActive ? (isDs18 ? 'text-cyan-800' : 'text-blue-700') : 'text-slate-400'}`}>
                      {item.label}
                    </span>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      isSensorActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                        : 'bg-slate-200 text-slate-500 border border-slate-300'
                    }`}>
                      {isSensorActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={8} />}
                      {isSensorActive ? 'Active' : 'Disabled'}
                    </span>

                    {isSensorActive && (
                      <select
                        value={sData.type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          if (newType === 'ds18b20') {
                            simulatorEngine.setDS18B20Temp(item.pin, 25.0);
                          } else {
                            simulatorEngine.setSensorValue(item.pin, sData.value, newType);
                          }
                        }}
                        className="text-[10px] bg-white border border-slate-300 text-slate-800 rounded-lg px-2 py-0.5 font-sans cursor-pointer shadow-xs hover:border-slate-400"
                      >
                        <option value="light">☀️ Light / LDR</option>
                        <option value="potentiometer">🎛️ Potentiometer</option>
                        <option value="flame">🔥 Flame Sensor</option>
                        <option value="line">🏁 Line Tracker</option>
                        <option value="motion">🚶 PIR Motion</option>
                        <option value="touch">👆 Touch Sensor</option>
                        <option value="ds18b20">🌡️ DS18B20 Temp Probe</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isDs18 ? (
                      <span className={`font-mono font-bold text-xs text-right ${isSensorActive ? 'text-cyan-700 font-black' : 'text-slate-400'}`}>
                        {isSensorActive ? `${Number(tempVal).toFixed(1)}°C (${((tempVal * 9/5) + 32).toFixed(1)}°F)` : '---'}
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono text-slate-500">
                          {isSensorActive ? `Digital: ${sData.digital}` : 'Inactive'}
                        </span>
                        <span className={`font-mono font-bold text-xs w-12 text-right ${
                          isSensorActive ? 'text-blue-700 font-black' : 'text-slate-400'
                        }`}>
                          {isSensorActive ? sData.value : '---'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {isDs18 ? (
                  <div className="space-y-1.5">
                    <input 
                      type="range"
                      min="-55"
                      max="125"
                      step="0.5"
                      disabled={!isSensorActive}
                      value={tempVal}
                      onChange={(e) => simulatorEngine.setDS18B20Temp(item.pin, e.target.value)}
                      className={`w-full h-1.5 rounded-lg appearance-none accent-cyan-600 ${
                        isSensorActive ? 'bg-cyan-100 cursor-pointer' : 'bg-slate-200 cursor-not-allowed opacity-40'
                      }`}
                    />
                    {isSensorActive && (
                      <div className="flex items-center justify-between gap-1 text-[9px] font-mono font-semibold">
                        {[-10, 0, 25, 37, 60, 100].map(deg => (
                          <button
                            key={deg}
                            onClick={() => simulatorEngine.setDS18B20Temp(item.pin, deg)}
                            className="px-1.5 py-0.5 rounded bg-cyan-100/70 hover:bg-cyan-200 text-cyan-800 border border-cyan-200 cursor-pointer transition-colors shadow-2xs"
                          >
                            {deg}°C
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input 
                    type="range"
                    min="0"
                    max="4095"
                    step="1"
                    disabled={!isSensorActive}
                    value={sData.value}
                    onChange={(e) => simulatorEngine.setSensorValue(item.pin, e.target.value)}
                    className={`w-full h-1.5 rounded-lg appearance-none accent-blue-600 ${
                      isSensorActive ? 'bg-blue-100 cursor-pointer' : 'bg-slate-200 cursor-not-allowed opacity-40'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. QMC5883L 3-Axis Electronic Compass Simulator (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isQmcActive
          ? 'bg-white border-amber-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isQmcActive
                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-xs'
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Compass size={16} className={isQmcActive ? 'animate-spin-slow' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">QMC5883L 3-Axis Digital Compass</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isQmcActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isQmcActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isQmcActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x0D) • Electronic Magnetometer & Azimuth</p>
            </div>
          </div>

          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
            isQmcActive
              ? 'text-amber-800 bg-amber-50 border-amber-200 shadow-xs'
              : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            {qmc5883l.heading.toFixed(1)}° ({qmc5883l.dir})
          </span>
        </div>

        {isQmcActive && (
          <div className="space-y-3 mt-2.5 pt-2.5 border-t border-slate-100">
            {/* Visual Compass Dial & Needle */}
            <div className="flex items-center justify-center gap-4 py-1">
              <div className="relative w-20 h-20 rounded-full border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-inner flex items-center justify-center">
                <span className="absolute top-1 text-[9px] font-bold text-amber-700 font-mono">N</span>
                <span className="absolute bottom-1 text-[9px] font-bold text-slate-500 font-mono">S</span>
                <span className="absolute left-1.5 text-[9px] font-bold text-slate-500 font-mono">W</span>
                <span className="absolute right-1.5 text-[9px] font-bold text-slate-500 font-mono">E</span>
                {/* Needle */}
                <div 
                  className="w-1 h-14 bg-gradient-to-t from-slate-400 via-amber-500 to-rose-600 rounded-full shadow-md transition-transform duration-100 origin-center"
                  style={{ transform: `rotate(${qmc5883l.heading}deg)` }}
                />
                <div className="absolute w-3 h-3 rounded-full bg-amber-600 border border-white shadow-xs" />
              </div>

              <div className="flex flex-col gap-1 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Direction:</span>
                  <span className="font-bold text-amber-700 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200">{qmc5883l.dir}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Raw X/Y:</span>
                  <span className="text-slate-700">{qmc5883l.x}, {qmc5883l.y}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Temp:</span>
                  <span className="text-slate-700">{qmc5883l.temp}°C</span>
                </div>
              </div>
            </div>

            <input 
              type="range"
              min="0"
              max="359"
              step="1"
              value={qmc5883l.heading}
              onChange={(e) => simulatorEngine.setQMC5883LHeading(e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600 bg-amber-100"
            />

            <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-semibold">
              <button onClick={() => simulatorEngine.setQMC5883LHeading(0)} className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer">North (0°)</button>
              <button onClick={() => simulatorEngine.setQMC5883LHeading(90)} className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer">East (90°)</button>
              <button onClick={() => simulatorEngine.setQMC5883LHeading(180)} className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer">South (180°)</button>
              <button onClick={() => simulatorEngine.setQMC5883LHeading(270)} className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer">West (270°)</button>
            </div>
          </div>
        )}
      </div>

      {/* 4. AMG8833 8x8 IR Grid-EYE Thermal Camera Simulator (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isAmgActive
          ? 'bg-white border-orange-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isAmgActive
                ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-xs'
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Flame size={16} className={isAmgActive ? 'text-orange-500 animate-pulse' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">AMG8833 8x8 IR Thermal Camera</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isAmgActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isAmgActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isAmgActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x69) • 64-Pixel Grid-EYE Array</p>
            </div>
          </div>

          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
            isAmgActive
              ? 'text-orange-800 bg-orange-50 border-orange-200 shadow-xs'
              : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            Max: {amg8833.maxTemp.toFixed(1)}°C
          </span>
        </div>

        {isAmgActive && (
          <div className="space-y-3 mt-2.5 pt-2.5 border-t border-slate-100">
            {/* 8x8 Thermal Heatmap Interactive Matrix */}
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-8 gap-1 p-2 bg-slate-900 rounded-xl shadow-inner border border-slate-800">
                {amg8833.pixels.map((pVal, idx) => {
                  // Color calculation from min to max temp
                  const mn = amg8833.minTemp || 20;
                  const mx = amg8833.maxTemp || 35;
                  const norm = Math.max(0, Math.min(1, (pVal - mn) / (mx - mn || 1)));
                  // Blue (240) -> Cyan (180) -> Green (120) -> Yellow (60) -> Red (0)
                  const hue = Math.round((1 - norm) * 240);
                  return (
                    <div 
                      key={idx}
                      title={`Pixel (${Math.floor(idx/8)+1}, ${(idx%8)+1}): ${pVal.toFixed(1)}°C`}
                      onClick={() => simulatorEngine.setAMG8833Pixel(idx, pVal > 40 ? 22 : 42)}
                      className="w-4 h-4 rounded-xs cursor-pointer transition-transform hover:scale-125 border border-black/30"
                      style={{ backgroundColor: `hsl(${hue}, 90%, 50%)` }}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between w-full text-[10px] font-mono px-1">
                <span className="text-slate-500">Min: <strong className="text-blue-600">{amg8833.minTemp.toFixed(1)}°C</strong></span>
                <span className="text-slate-500">Center: <strong className="text-amber-600">{amg8833.centerTemp.toFixed(1)}°C</strong></span>
                <span className="text-slate-500">Max: <strong className="text-rose-600">{amg8833.maxTemp.toFixed(1)}°C</strong></span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Simulated Target Heat:</span>
                <span className="font-mono font-bold text-orange-600 text-sm">{amg8833.maxTemp.toFixed(1)} °C</span>
              </div>
              <input 
                type="range"
                min="20"
                max="75"
                step="0.5"
                value={amg8833.maxTemp}
                onChange={(e) => simulatorEngine.setAMG8833TargetHeat(e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-orange-600 bg-orange-100"
              />
            </div>

            <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-semibold">
              <button onClick={() => simulatorEngine.setAMG8833TargetHeat(22)} className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer">Room (22°C)</button>
              <button onClick={() => simulatorEngine.setAMG8833TargetHeat(36.5)} className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer">Human (36.5°C)</button>
              <button onClick={() => simulatorEngine.setAMG8833TargetHeat(65)} className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer">Hot Cup (65°C)</button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Pulse & Heart Rate Sensor Simulator (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isPulseActive
          ? 'bg-white border-rose-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isPulseActive
                ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-xs'
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Heart size={16} className={isPulseActive && pulseSensor.fingerDetected ? 'animate-pulse text-rose-500' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">MAX30100 / MAX30102 Pulse Sensor</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isPulseActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isPulseActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isPulseActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x57) • Optical Heart Rate & SpO2</p>
            </div>
          </div>

          {isPulseActive && (
            <button 
              onClick={() => simulatorEngine.setPulseSensorState({ fingerDetected: !pulseSensor.fingerDetected })}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border cursor-pointer shadow-xs ${
                pulseSensor.fingerDetected 
                  ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {pulseSensor.fingerDetected ? '👆 Finger Placed' : 'No Finger'}
            </button>
          )}
        </div>

        {isPulseActive && pulseSensor.fingerDetected && (
          <div className="space-y-2 mt-2 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Simulated Heart Rate:</span>
              <span className="font-mono font-bold text-rose-600 text-sm">{pulseSensor.bpm} BPM</span>
            </div>
            <input 
              type="range"
              min="50"
              max="160"
              step="1"
              value={pulseSensor.bpm}
              onChange={(e) => simulatorEngine.setPulseSensorState({ bpm: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600"
            />
            {/* Live PPG ECG Heartbeat Waveform Canvas */}
            <PulseECGCanvas bpm={pulseSensor.bpm} />
          </div>
        )}
      </div>

      {/* 6. AS5600 12-Bit Magnetic Rotary Encoder Simulator (Light Theme) */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isAs5600Active
          ? 'bg-white border-teal-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isAs5600Active
                ? 'bg-teal-50 text-teal-600 border-teal-200 shadow-xs'
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <RotateCw size={16} className={isAs5600Active ? 'text-teal-600' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">AS5600 Magnetic Rotary Encoder</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isAs5600Active 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isAs5600Active ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isAs5600Active ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x36) • 12-Bit (4096 Steps / 0–360°)</p>
            </div>
          </div>

          <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
            isAs5600Active
              ? 'text-teal-700 bg-teal-50 border-teal-200 shadow-xs'
              : 'text-slate-400 bg-slate-100 border-slate-200'
          }`}>
            {as5600.angle.toFixed(1)}°
          </span>
        </div>

        {isAs5600Active && (
          <div className="space-y-3 mt-2 pt-2.5 border-t border-slate-100">
            {/* Visual Angle Dial & Rotational Position */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-teal-500 bg-teal-50 flex items-center justify-center relative shadow-xs transition-transform"
                  style={{ transform: `rotate(${as5600.angle}deg)` }}
                >
                  <div className="w-1 h-4 bg-teal-600 rounded-full absolute top-1" />
                  <Disc size={12} className="text-teal-700" />
                </div>
                <div className="text-[11px] font-mono">
                  <div className="text-slate-700 font-semibold">Angle: <span className="text-teal-700 font-bold">{as5600.angle.toFixed(1)}°</span></div>
                  <div className="text-slate-500">Raw ADC: <span className="text-slate-800 font-bold">{as5600.raw}</span> / 4095</div>
                </div>
              </div>

              <div className="text-right text-[11px] font-mono">
                <div className="text-slate-700 font-semibold">Turns: <span className="text-indigo-600 font-bold">{as5600.turns}</span></div>
                <div className="text-slate-500">Total: <span className="text-slate-700 font-medium">{as5600.cumulativeDeg.toFixed(1)}°</span></div>
              </div>
            </div>

            {/* Rotary Position Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Rotary Shaft Angle:</span>
                <span className="font-mono font-bold text-teal-700 text-sm">{as5600.angle.toFixed(1)}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="359.9" 
                step="0.5"
                value={as5600.angle}
                onChange={(e) => simulatorEngine.setAS5600Angle(e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-teal-600 bg-teal-100"
              />
            </div>

            {/* Quick Angle Preset Buttons */}
            <div className="flex items-center justify-between gap-1 text-[10px] font-mono font-semibold">
              <button 
                onClick={() => simulatorEngine.setAS5600Angle(0)} 
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors shadow-2xs"
              >
                0°
              </button>
              <button 
                onClick={() => simulatorEngine.setAS5600Angle(90)} 
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors shadow-2xs"
              >
                90°
              </button>
              <button 
                onClick={() => simulatorEngine.setAS5600Angle(180)} 
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors shadow-2xs"
              >
                180°
              </button>
              <button 
                onClick={() => simulatorEngine.setAS5600Angle(270)} 
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors shadow-2xs"
              >
                270°
              </button>
              <button 
                onClick={() => simulatorEngine.setAS5600Angle(359)} 
                className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 cursor-pointer transition-colors shadow-2xs"
              >
                360°
              </button>
              <button 
                onClick={() => simulatorEngine.setAS5600State({ zeroOffset: as5600.raw, turns: 0, cumulativeDeg: 0 })} 
                className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer transition-colors"
                title="Reset Software Zero Offset and Turns"
              >
                Reset Zero
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. GY-53 / VL53L0X Laser ToF Distance Sensor Card */}
      <div className={`p-3.5 rounded-2xl border transition-all duration-300 shadow-xs ${
        isVl53l0xActive
          ? 'bg-white border-amber-200 shadow-sm'
          : 'bg-slate-100/70 border-slate-200 opacity-45'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isVl53l0xActive 
                ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-xs' 
                : 'bg-slate-200/60 text-slate-400 border-slate-200'
            }`}>
              <Target size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900">VL53L0X Laser ToF Distance</h4>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  isVl53l0xActive 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' 
                    : 'bg-slate-200 text-slate-500 border border-slate-300'
                }`}>
                  {isVl53l0xActive ? <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> : <Lock size={9} />}
                  {isVl53l0xActive ? 'Active in Code' : 'Not in Code'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">I2C (0x29) • Range: 30mm – 2000mm (Laser ToF)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
              isVl53l0xActive
                ? 'text-amber-700 bg-amber-50 border-amber-200 shadow-xs'
                : 'text-slate-400 bg-slate-100 border-slate-200'
            }`}>
              {(vl53l0x.distanceMm / 10).toFixed(1)} cm ({vl53l0x.distanceMm} mm)
            </span>
          </div>
        </div>

        <input 
          type="range" 
          min="30" 
          max="2000" 
          step="5"
          disabled={!isVl53l0xActive}
          value={vl53l0x.distanceMm}
          onChange={(e) => simulatorEngine.setVL53L0XDistance(e.target.value)}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-amber-600 ${
            isVl53l0xActive ? 'bg-amber-100' : 'bg-slate-200 cursor-not-allowed opacity-50'
          }`}
        />

        {isVl53l0xActive && (
          <div className="flex items-center justify-between mt-2.5 gap-1.5 text-[10px]">
            <button 
              onClick={() => simulatorEngine.setVL53L0XDistance(50)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-semibold border border-amber-200 shadow-xs transition-colors cursor-pointer"
            >
              5 cm (Close)
            </button>
            <button 
              onClick={() => simulatorEngine.setVL53L0XDistance(200)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-semibold border border-amber-200 shadow-xs transition-colors cursor-pointer"
            >
              20 cm
            </button>
            <button 
              onClick={() => simulatorEngine.setVL53L0XDistance(500)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-semibold border border-amber-200 shadow-xs transition-colors cursor-pointer"
            >
              50 cm (Mid)
            </button>
            <button 
              onClick={() => simulatorEngine.setVL53L0XDistance(1000)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-semibold border border-amber-200 shadow-xs transition-colors cursor-pointer"
            >
              1.0 m
            </button>
            <button 
              onClick={() => simulatorEngine.setVL53L0XDistance(1800)}
              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-mono font-semibold border border-amber-200 shadow-xs transition-colors cursor-pointer"
            >
              1.8 m (Far)
            </button>
          </div>
        )}
      </div>

    </div>
  );
}

/**
 * Animated PPG / ECG Heartbeat Waveform Canvas
 */
function PulseECGCanvas({ bpm }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frameId;
    let offset = 0;

    const render = () => {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#f43f5e';

      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const t = (x + offset) * 0.08;
        // Periodic ECG spike synthesis
        const wave = Math.sin(t) + 0.3 * Math.sin(2 * t) + (Math.sin(t * 0.5) > 0.8 ? Math.sin(t * 10) * 1.5 : 0);
        const y = canvas.height / 2 + wave * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      offset += (bpm / 60) * 1.5;
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [bpm]);

  return (
    <div className="w-full h-12 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden relative shadow-inner">
      <canvas ref={canvasRef} width={300} height={48} className="w-full h-full" />
      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-rose-400/80 font-bold">PPG ECG LIVE</span>
    </div>
  );
}
