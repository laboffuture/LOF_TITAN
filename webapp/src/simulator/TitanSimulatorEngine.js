import { titanAudio } from './TitanAudioSynthesizer.js';

/**
 * LOF TITAN Hardware Simulation Engine
 * Full MicroPython Execution Runtime & AST Transpiler.
 * Accurately simulates Rover robotics, 3-UV sensors, Wi-Fi AP, Motor Drivers, OLED, and peripherals.
 */
export class TitanSimulatorEngine {
  constructor() {
    this.listeners = new Set();
    this.logListeners = new Set();
    this.isRunning = false;
    this.isPaused = false;
    this.executionSpeed = 1.0;
    this.abortController = null;

    this.state = this._getInitialState();
  }

  _getInitialState() {
    return {
      motors: {
        M1: { dir: 'STOP', speed: 0, pinA: 15, pinB: 16, dutyA: 0, dutyB: 0 },
        M2: { dir: 'STOP', speed: 0, pinA: 13, pinB: 14, dutyA: 0, dutyB: 0 },
        M3: { dir: 'STOP', speed: 0, pinA: 11, pinB: 12, dutyA: 0, dutyB: 0 },
        M4: { dir: 'STOP', speed: 0, pinA: 9, pinB: 10, dutyA: 0, dutyB: 0 },
        M5: { dir: 'STOP', speed: 0, pinA: 9, pinB: 10, dutyA: 0, dutyB: 0 },
        M6: { dir: 'STOP', speed: 0, pinA: 11, pinB: 12, dutyA: 0, dutyB: 0 },
      },
      servos: { 2: 90, 1: 90, 3: 90, 4: 90, 5: 90 },
      leds: { led1: false, led2: false },
      buzzer: { active: false, freq: 0, tone: null },
      oled: {
        initialized: true,
        type: 'SSD1306',
        textLines: [],
        pixels: [],
        version: Date.now(),
      },
      lcd1602: {
        initialized: false,
        addr: '0x27',
        backlight: true,
        line1: '',
        line2: '',
      },
      buttons: { 39: false, 40: false, 41: false, 42: false },
      sensors: {
        2: { value: 1200, type: 'light', digital: 0 },
        1: { value: 2048, type: 'potentiometer', digital: 1 },
        3: { value: 500,  type: 'flame', digital: 0 },
        4: { value: 3200, type: 'line', digital: 1 },
        5: { value: 800,  type: 'motion', digital: 0 },
      },
      digitalOutputs: { 2: 0, 1: 0, 3: 0, 4: 0, 5: 0 },
      ultrasonic: { distanceCm: 25.0 },
      pulseSensor: {
        initialized: false,
        fingerDetected: true,
        bpm: 74,
        ir: 45000,
        red: 38000,
      },
      qmc5883l: {
        heading: 90.0,
        dir: 'E',
        x: 120,
        y: 350,
        z: -45,
        temp: 26.5,
      },
      amg8833: {
        maxTemp: 33.5,
        minTemp: 22.0,
        avgTemp: 26.8,
        centerTemp: 31.0,
        thermistor: 25.5,
        pixels: Array(64).fill(22.0).map((v, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const dist = Math.hypot(r - 3.5, c - 3.5);
          return Number((33.5 - dist * 2.2 + (Math.sin(i) * 0.4)).toFixed(1));
        }),
      },
      as5600: {
        angle: 0.0,
        raw: 0,
        turns: 0,
        cumulativeDeg: 0.0,
        rpm: 0.0,
        degPerSec: 0.0,
        magnetDetected: true,
        magnetStatus: 'Optimal / Detected',
        agc: 128,
        magnitude: 2048,
        zeroOffset: 0,
      },
      ds18b20: {
        2: 25.0, // S1
        1: 25.0, // S2
        3: 25.0, // S3
        4: 25.0, // S4
        5: 25.0, // S5
        19: 25.0, // GPIO 19
      },
      vl53l0x: {
        distanceMm: 250,
        mode: 'BALANCED',
      },
      activeSensors: {
        2: false, // S1 (GPIO 2)
        1: false, // S2 (GPIO 1)
        3: false, // S3 (GPIO 3)
        4: false, // S4 (GPIO 4)
        5: false, // S5 (GPIO 5)
        ultrasonic: false,
        pulse: false,
        qmc5883l: false,
        amg8833: false,
        as5600: false,
        vl53l0x: false,
      },
      telemetry: {
        cycleCount: 0,
        uptimeMs: 0,
        activeBlockId: null,
      }
    };
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this._getSnapshot());
    return () => this.listeners.delete(callback);
  }

  subscribeLogs(callback) {
    this.logListeners.add(callback);
    return () => this.logListeners.delete(callback);
  }

  _getSnapshot() {
    return {
      ...this.state,
      motors: { ...this.state.motors },
      servos: { ...this.state.servos },
      leds: { ...this.state.leds },
      buzzer: { ...this.state.buzzer },
      oled: {
        ...this.state.oled,
        textLines: [...this.state.oled.textLines],
        pixels: [...this.state.oled.pixels],
      },
      lcd1602: { ...this.state.lcd1602 },
      buttons: { ...this.state.buttons },
      sensors: { ...this.state.sensors },
      ultrasonic: { ...this.state.ultrasonic },
      pulseSensor: { ...this.state.pulseSensor },
      qmc5883l: { ...this.state.qmc5883l },
      amg8833: { ...this.state.amg8833, pixels: [...this.state.amg8833.pixels] },
      as5600: { ...this.state.as5600 },
      ds18b20: { ...this.state.ds18b20 },
      activeSensors: { ...this.state.activeSensors },
      telemetry: { ...this.state.telemetry },
    };
  }

  _notify() {
    const snapshot = this._getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  log(msg) {
    const text = String(msg);
    console.log("[TITAN LOG]", text);
    for (const listener of this.logListeners) {
      listener(text);
    }
  }

  // ================= Hardware Mutators =================

  setButtonState(pin, isPressed) {
    if (this.state.buttons[pin] !== undefined) {
      this.state.buttons[pin] = isPressed;
      this._notify();
    }
  }

  setSensorValue(pin, val, type = null) {
    if (this.state.sensors[pin]) {
      this.state.sensors[pin].value = Math.max(0, Math.min(4095, Math.round(val)));
      this.state.sensors[pin].digital = val > 2000 ? 1 : 0;
      if (type) this.state.sensors[pin].type = type;
      this._notify();
    }
  }

  setUltrasonicDistance(cm) {
    this.state.ultrasonic.distanceCm = Math.max(2, Math.min(400, parseFloat(cm)));
    this._notify();
  }

  setPulseSensorState(params) {
    this.state.pulseSensor = {
      ...this.state.pulseSensor,
      ...params
    };
    this.state.activeSensors.pulse = true;
    this._notify();
  }

  setQMC5883LHeading(heading) {
    const h = ((parseFloat(heading) || 0) % 360 + 360) % 360;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const idx = Math.floor(((h + 22.5) % 360) / 45);
    const rad = (h * Math.PI) / 180;
    this.state.qmc5883l = {
      ...this.state.qmc5883l,
      heading: Number(h.toFixed(1)),
      dir: dirs[idx],
      x: Math.round(Math.cos(rad) * 400),
      y: Math.round(Math.sin(rad) * 400),
    };
    this.state.activeSensors.qmc5883l = true;
    this._notify();
  }

  setAMG8833State(params) {
    this.state.amg8833 = {
      ...this.state.amg8833,
      ...params
    };
    this.state.activeSensors.amg8833 = true;
    this._notify();
  }

  setAMG8833TargetHeat(targetTemp) {
    const t = parseFloat(targetTemp) || 32.0;
    const pixels = Array(64).fill(22.0).map((v, i) => {
      const r = Math.floor(i / 8);
      const c = i % 8;
      const dist = Math.hypot(r - 3.5, c - 3.5);
      const val = t - (dist * Math.max(1.0, (t - 22.0) / 4.5)) + (Math.sin(i * 1.5) * 0.4);
      return Number(Math.max(15, val).toFixed(1));
    });
    const maxTemp = Math.max(...pixels);
    const minTemp = Math.min(...pixels);
    const avgTemp = Number((pixels.reduce((a, b) => a + b, 0) / 64).toFixed(1));
    const centerTemp = Number(((pixels[27] + pixels[28] + pixels[35] + pixels[36]) / 4).toFixed(1));
    this.state.amg8833 = {
      ...this.state.amg8833,
      pixels,
      maxTemp,
      minTemp,
      avgTemp,
      centerTemp
    };
    this.state.activeSensors.amg8833 = true;
    this._notify();
  }

  setAMG8833Pixel(index, temp) {
    const pixels = [...this.state.amg8833.pixels];
    pixels[index] = Number(parseFloat(temp).toFixed(1));
    const maxTemp = Math.max(...pixels);
    const minTemp = Math.min(...pixels);
    const avgTemp = Number((pixels.reduce((a, b) => a + b, 0) / 64).toFixed(1));
    const centerTemp = Number(((pixels[27] + pixels[28] + pixels[35] + pixels[36]) / 4).toFixed(1));
    this.state.amg8833 = {
      ...this.state.amg8833,
      pixels,
      maxTemp,
      minTemp,
      avgTemp,
      centerTemp
    };
    this.state.activeSensors.amg8833 = true;
    this._notify();
  }

  setAS5600Angle(angleDeg) {
    let deg = parseFloat(angleDeg) || 0.0;
    deg = ((deg % 360) + 360) % 360;
    const raw = Math.round((deg * 4096) / 360) % 4096;
    const prevRaw = this.state.as5600.raw;
    let turns = this.state.as5600.turns;
    const diff = raw - prevRaw;
    if (diff < -2048) turns += 1;
    else if (diff > 2048) turns -= 1;
    const cumulative = Number((turns * 360 + deg).toFixed(1));
    this.state.as5600 = {
      ...this.state.as5600,
      angle: Number(deg.toFixed(1)),
      raw,
      turns,
      cumulativeDeg: cumulative,
    };
    this.state.activeSensors.as5600 = true;
    this._notify();
  }

  setAS5600State(params) {
    this.state.as5600 = {
      ...this.state.as5600,
      ...params,
    };
    this.state.activeSensors.as5600 = true;
    this._notify();
  }

  setVL53L0XDistance(distMm) {
    const mm = Math.max(0, Math.min(2200, parseInt(distMm, 10) || 0));
    if (!this.state.vl53l0x) this.state.vl53l0x = { distanceMm: 250, mode: 'BALANCED' };
    this.state.vl53l0x.distanceMm = mm;
    this.state.activeSensors.vl53l0x = true;
    this._notify();
  }

  setVL53L0XMode(mode) {
    if (!this.state.vl53l0x) this.state.vl53l0x = { distanceMm: 250, mode: 'BALANCED' };
    this.state.vl53l0x.mode = mode;
    this._notify();
  }

  readVL53L0X(unit = 'CM') {
    const mm = this.state.vl53l0x?.distanceMm ?? 250;
    const u = String(unit).toUpperCase();
    if (u === 'MM') return mm;
    if (u === 'CM') return Number((mm / 10.0).toFixed(1));
    if (u === 'INCHES') return Number((mm / 25.4).toFixed(1));
    if (u === 'M') return Number((mm / 1000.0).toFixed(2));
    return mm;
  }

  setDS18B20Temp(pin, tempC) {
    const p = parseInt(pin, 10) || 2;
    const t = parseFloat(tempC) || 25.0;
    if (!this.state.ds18b20) this.state.ds18b20 = {};
    this.state.ds18b20[p] = t;
    if (this.state.sensors[p]) {
      this.state.sensors[p].tempC = t;
      this.state.sensors[p].type = 'ds18b20';
    }
    if (!this.state.activeSensors[p]) {
      this.state.activeSensors[p] = true;
    }
    this._notify();
  }

  readDS18B20(pin = 2, unit = 'C') {
    const p = parseInt(pin, 10) || 2;
    const tempC = (this.state.ds18b20 && this.state.ds18b20[p] !== undefined) 
      ? this.state.ds18b20[p] 
      : (this.state.sensors[p]?.tempC ?? 25.0);
    if (unit === 'F') return Number(((tempC * 9 / 5) + 32).toFixed(2));
    if (unit === 'K') return Number((tempC + 273.15).toFixed(2));
    return Number(tempC.toFixed(2));
  }

  detectActiveSensors(codeString, workspace = null) {
    const active = {
      2: false,
      1: false,
      3: false,
      4: false,
      5: false,
      ultrasonic: false,
      pulse: false,
      qmc5883l: false,
      amg8833: false,
      as5600: false,
      vl53l0x: false,
    };

    if (codeString) {
      const code = String(codeString);
      // S1 (GPIO 2)
      if (/\b(S1|PIN_UV_LEFT|adc_left)\b/i.test(code) || /ADC\(Pin\(2\)/.test(code) || /read_analog_sensor\(2\)/i.test(code) || /Pin\(2\b/i.test(code)) {
        active[2] = true;
      }
      // S2 (GPIO 1)
      if (/\b(S2|PIN_UV_FRONT|adc_front)\b/i.test(code) || /ADC\(Pin\(1\)/.test(code) || /read_analog_sensor\(1\)/i.test(code) || /Pin\(1\b/i.test(code)) {
        active[1] = true;
      }
      // S3 (GPIO 3)
      if (/\b(S3|PIN_UV_RIGHT|adc_right)\b/i.test(code) || /ADC\(Pin\(3\)/.test(code) || /read_analog_sensor\(3\)/i.test(code) || /Pin\(3\b/i.test(code)) {
        active[3] = true;
      }
      // S4 (GPIO 4)
      if (/\b(S4)\b/i.test(code) || /ADC\(Pin\(4\)/.test(code) || /read_analog_sensor\(4\)/i.test(code) || /Pin\(4\b/i.test(code)) {
        active[4] = true;
      }
      // S5 (GPIO 5)
      if (/\b(S5)\b/i.test(code) || /ADC\(Pin\(5\)/.test(code) || /read_analog_sensor\(5\)/i.test(code) || /Pin\(5\b/i.test(code)) {
        active[5] = true;
      }
      // Ultrasonic (Trig 6, Echo 19)
      if (/ultrasonic/i.test(code) || /read_ultrasonic/i.test(code) || /read_distance/i.test(code) || /Pin\(6\)/.test(code) || /Pin\(19\)/.test(code)) {
        active.ultrasonic = true;
      }
      // Pulse & Heart Rate
      if (/pulse/i.test(code) || /max3010/i.test(code) || /bpm/i.test(code) || /heart/i.test(code) || /spo2/i.test(code)) {
        active.pulse = true;
      }
      // QMC5883L Compass
      if (/qmc5883/i.test(code) || /compass/i.test(code) || /heading/i.test(code) || /0x0D\b/i.test(code) || /_read_qmc/i.test(code)) {
        active.qmc5883l = true;
      }
      // AMG8833 Thermal Camera
      if (/amg8833/i.test(code) || /thermal/i.test(code) || /heatmap/i.test(code) || /0x69\b/i.test(code) || /_read_amg/i.test(code)) {
        active.amg8833 = true;
      }
      // AS5600 Magnetic Encoder
      if (/as5600/i.test(code) || /encoder/i.test(code) || /_read_as5600/i.test(code) || /0x36\b/i.test(code) || /_get_as5600/i.test(code)) {
        active.as5600 = true;
      }
      // VL53L0X Laser ToF
      if (/vl53l0x/i.test(code) || /gy53/i.test(code) || /_get_vl53l0x/i.test(code) || /0x29\b/i.test(code)) {
        active.vl53l0x = true;
      }
      // DS18B20 1-Wire Digital Temperature
      if (/ds18b20/i.test(code) || /ds18x20/i.test(code) || /onewire/i.test(code) || /_read_ds18b20/i.test(code)) {
        const pinMatch = code.match(/_read_ds18b20\s*\(\s*(\d+)/i) || code.match(/Pin\s*\(\s*(\d+)\s*\)/i);
        const pinNum = pinMatch ? parseInt(pinMatch[1], 10) : 2;
        if (active[pinNum] !== undefined) active[pinNum] = true;
        else active[2] = true;
      }
    }

    if (workspace && typeof workspace.getAllBlocks === 'function') {
      const blocks = workspace.getAllBlocks(false);
      for (const b of blocks) {
        if (b.type === 'titan_ultrasonic_read' || b.type === 'titan_ultrasonic_distance' || b.type === 'titan_ultrasonic_compare') active.ultrasonic = true;
        if (b.type?.startsWith('titan_pulse')) active.pulse = true;
        if (b.type?.startsWith('titan_qmc5883l')) active.qmc5883l = true;
        if (b.type?.startsWith('titan_amg8833')) active.amg8833 = true;
        if (b.type?.startsWith('titan_as5600')) active.as5600 = true;
        if (b.type?.startsWith('titan_vl53l0x')) active.vl53l0x = true;
        if (b.type?.startsWith('titan_ds18b20')) {
          const p = parseInt(b.getFieldValue('PIN') || 2, 10);
          if (active[p] !== undefined) active[p] = true;
          else active[2] = true;
        }
        if (b.type === 'titan_print_sensor_monitor') {
          const t = b.getFieldValue('TYPE');
          if (t === 'PULSE') active.pulse = true;
          if (t === 'QMC5883L') active.qmc5883l = true;
          if (t === 'VL53L0X') active.vl53l0x = true;
          if (t === 'AMG8833') active.amg8833 = true;
          if (t === 'AS5600') active.as5600 = true;
          if (t === 'DS18B20') active[2] = true;
          if (t === 'DIST') active.ultrasonic = true;
          if (['S1','S2','S3','S4','S5'].includes(t)) {
            const pMap = { S1: 2, S2: 1, S3: 3, S4: 4, S5: 5 };
            active[pMap[t]] = true;
          }
        }
        if (b.type === 'titan_analog_sensor' || b.type === 'titan_digital_sensor' || b.type === 'titan_sensor_read_analog' || b.type === 'titan_sensor_read_digital' || b.type === 'titan_sensor_compare' || b.type === 'titan_digital_sensor_check' || b.type === 'titan_motion_sensor_check') {
          const pinVal = parseInt(b.getFieldValue('PIN') || b.getFieldValue('PORT') || 0, 10);
          if (pinVal && active[pinVal] !== undefined) active[pinVal] = true;
        }
      }
    }

    this.state.activeSensors = active;
    this._notify();
    return active;
  }

  toggleSensorActive(sensorKey) {
    if (this.state.activeSensors[sensorKey] !== undefined) {
      this.state.activeSensors[sensorKey] = !this.state.activeSensors[sensorKey];
      this._notify();
    }
  }

  // ================= Execution & Control =================

  async delay(ms) {
    const actualMs = Math.max(1, Math.round(ms / (this.executionSpeed || 1)));
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), actualMs);
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error("SIMULATION_ABORTED"));
        });
      }
    });
  }

  async checkYield() {
    if (this.abortController?.signal.aborted) {
      throw new Error("SIMULATION_ABORTED");
    }
    while (this.isPaused && !this.abortController?.signal.aborted) {
      await new Promise(r => setTimeout(r, 50));
    }
  }

  setMotor(channel, dir, speed) {
    const s = Math.max(0, Math.min(100, Math.round(speed)));
    const chs = channel === 'ALL' ? ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] : [channel];
    chs.forEach(ch => {
      if (this.state.motors[ch]) {
        this.state.motors[ch].dir = dir;
        this.state.motors[ch].speed = dir === 'STOP' ? 0 : s;
        if (dir === 'FORWARD') {
          this.state.motors[ch].dutyA = s;
          this.state.motors[ch].dutyB = 0;
        } else if (dir === 'BACKWARD') {
          this.state.motors[ch].dutyA = 0;
          this.state.motors[ch].dutyB = s;
        } else {
          this.state.motors[ch].dutyA = 0;
          this.state.motors[ch].dutyB = 0;
        }
      }
    });
    this._notify();
  }

  driveRover(direction, speed) {
    const s = Math.max(0, Math.min(100, Math.round(speed)));
    switch (direction) {
      case 'FORWARD':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'BACKWARD':
        this.setMotor('M1', 'BACKWARD', s);
        this.setMotor('M2', 'BACKWARD', s);
        break;
      case 'LEFT':
        this.setMotor('M1', 'STOP', 0);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'RIGHT':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'STOP', 0);
        break;
      case 'SPIN_LEFT':
        this.setMotor('M1', 'BACKWARD', s);
        this.setMotor('M2', 'FORWARD', s);
        break;
      case 'SPIN_RIGHT':
        this.setMotor('M1', 'FORWARD', s);
        this.setMotor('M2', 'BACKWARD', s);
        break;
      default:
        this.setMotor('M1', 'STOP', 0);
        this.setMotor('M2', 'STOP', 0);
    }
  }

  stopMotors(channel = 'ALL') {
    this.setMotor(channel, 'STOP', 0);
  }

  setServo(pin, angle) {
    const a = Math.max(0, Math.min(180, Math.round(angle)));
    this.state.servos[pin] = a;
    this._notify();
  }

  setLed(ledKey, state) {
    const applyState = (curr, target) => {
      if (target === 'ON' || target === 1 || target === true) return true;
      if (target === 'OFF' || target === 0 || target === false) return false;
      if (target === 'TOGGLE') return !curr;
      return Boolean(target);
    };

    if (ledKey === '47' || ledKey === 47 || ledKey === 'BOTH') {
      this.state.leds.led1 = applyState(this.state.leds.led1, state);
    }
    if (ledKey === '48' || ledKey === 48 || ledKey === 'BOTH') {
      this.state.leds.led2 = applyState(this.state.leds.led2, state);
    }
    this._notify();
  }

  playBuzzerTone(toneName) {
    this.state.buzzer = { active: true, freq: 0, tone: toneName };
    this._notify();
    titanAudio.playMelody(toneName);
    setTimeout(() => {
      this.state.buzzer.active = false;
      this._notify();
    }, 400);
  }

  playBuzzerFreq(freq, durationMs = 200) {
    this.state.buzzer = { active: true, freq, tone: null };
    this._notify();
    titanAudio.playTone(freq, durationMs);
    setTimeout(() => {
      this.state.buzzer.active = false;
      this._notify();
    }, durationMs);
  }

  stopBuzzer() {
    this.state.buzzer = { active: false, freq: 0, tone: null };
    this._notify();
    titanAudio.stop();
  }

  initOLED(type = 'SSD1306') {
    this.state.oled = {
      initialized: true,
      type,
      textLines: [],
      pixels: [],
      version: Date.now()
    };
    this._notify();
  }

  oledText(text, x = 0, y = 0, size = 1, color = '#38bdf8') {
    if (!this.state.oled.initialized) {
      this.initOLED();
    }
    const posX = parseInt(x, 10) || 0;
    const posY = parseInt(y, 10) || 0;
    const textSize = parseInt(size, 10) || 1;
    const lineHeight = textSize * 8;

    const filtered = this.state.oled.textLines.filter(
      item => !(Math.abs(item.y - posY) < lineHeight && Math.abs(item.x - posX) < 50)
    );

    filtered.push({
      text: String(text),
      x: posX,
      y: posY,
      size: textSize,
      color
    });

    if (filtered.length > 25) {
      filtered.shift();
    }

    this.state.oled = {
      ...this.state.oled,
      textLines: filtered,
      version: Date.now()
    };
    this._notify();
  }

  oledClear() {
    this.state.oled = {
      ...this.state.oled,
      textLines: [],
      pixels: [],
      version: Date.now()
    };
    this._notify();
  }

  // ================= LCD 1602 Simulator Methods =================
  initLCD1602(addr = '0x27') {
    this.state.lcd1602 = {
      initialized: true,
      addr: String(addr),
      backlight: true,
      line1: '',
      line2: '',
    };
    this.log(`[LCD 1602] Initialized 2x16 Character LCD at I2C ${addr}`);
    this._notify();
  }

  lcdPrint(text, col = 0, row = 0) {
    if (!this.state.lcd1602.initialized) this.initLCD1602();
    const strText = String(text ?? '');
    const colNum = Math.max(0, Math.min(15, parseInt(col, 10) || 0));
    const rowNum = (parseInt(row, 10) || 0) === 1 ? 1 : 0;
    const lineKey = rowNum === 1 ? 'line2' : 'line1';
    let line = this.state.lcd1602[lineKey].padEnd(16, ' ').split('');
    for (let i = 0; i < strText.length && colNum + i < 16; i++) {
      line[colNum + i] = strText[i];
    }
    this.state.lcd1602[lineKey] = line.join('').trimEnd();
    this.log(`[LCD 1602] Row ${rowNum} Col ${colNum}: "${strText}"`);
    this._notify();
  }

  lcdPrintLines(line1 = '', line2 = '') {
    if (!this.state.lcd1602.initialized) this.initLCD1602();
    this.state.lcd1602.line1 = String(line1 ?? '').substring(0, 16);
    this.state.lcd1602.line2 = String(line2 ?? '').substring(0, 16);
    this.log(`[LCD 1602] L1: "${this.state.lcd1602.line1}" | L2: "${this.state.lcd1602.line2}"`);
    this._notify();
  }

  lcdClear() {
    if (!this.state.lcd1602.initialized) this.initLCD1602();
    this.state.lcd1602.line1 = '';
    this.state.lcd1602.line2 = '';
    this.log(`[LCD 1602] Screen cleared`);
    this._notify();
  }

  lcdBacklight(on = true) {
    if (!this.state.lcd1602.initialized) this.initLCD1602();
    this.state.lcd1602.backlight = Boolean(on);
    this.log(`[LCD 1602] Backlight: ${on ? 'ON' : 'OFF'}`);
    this._notify();
  }

  readAnalogSensor(pin) {
    if (this.state.activeSensors[pin] !== undefined && !this.state.activeSensors[pin]) {
      this.state.activeSensors[pin] = true;
      this._notify();
    }
    return this.state.sensors[pin]?.value ?? 0;
  }

  readDigitalSensor(pin) {
    if (this.state.activeSensors[pin] !== undefined && !this.state.activeSensors[pin]) {
      this.state.activeSensors[pin] = true;
      this._notify();
    }
    return this.state.sensors[pin]?.digital ?? 0;
  }

  writeDigitalOutput(pin, val) {
    this.state.digitalOutputs[pin] = val ? 1 : 0;
    if (pin === 47) this.setLed('47', val);
    if (pin === 48) this.setLed('48', val);
    if ([15, 16, 13, 14, 11, 12, 9, 10].includes(pin)) {
      this._handlePwmDuty(pin, val ? 100 : 0);
    }
    this._notify();
  }

  readUltrasonicDistance(unit = 'CM') {
    if (!this.state.activeSensors.ultrasonic) {
      this.state.activeSensors.ultrasonic = true;
      this._notify();
    }
    const cm = this.state.ultrasonic.distanceCm;
    if (unit === 'INCHES' || unit === 'inch') return cm / 2.54;
    if (unit === 'MM') return cm * 10;
    return cm;
  }

  isButtonPressed(pin) {
    return Boolean(this.state.buttons[pin]);
  }

  // ================= 1. Blockly Workspace Interpreter =================

  async runBlocklyWorkspace(workspace) {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    this.log("=== LOF TITAN SIMULATION REPL ACTIVE ===");
    this.initOLED();

    try {
      const topBlocks = workspace.getTopBlocks(true);
      if (!topBlocks || topBlocks.length === 0) {
        this.log("⚠️ No blocks found in workspace.");
        this.stop();
        return;
      }

      const startBlock = topBlocks.find(b => b.type === 'titan_start');
      if (startBlock && startBlock.getInputTargetBlock('DO')) {
        await this._executeBlockSequence(startBlock.getInputTargetBlock('DO'));
      } else {
        for (const blk of topBlocks) {
          if (blk.type !== 'project_info' && blk.type !== 'titan_start') {
            await this._executeBlockSequence(blk);
          }
        }
      }

      this.log(">>> Simulation completed.");
    } catch (err) {
      if (err.message === "SIMULATION_ABORTED") {
        this.log(">>> Simulation stopped by user.");
      } else {
        this.log(`Traceback (most recent call last): ${err.message}`);
        console.error("Simulation error:", err);
      }
    } finally {
      this.isRunning = false;
      this._notify();
    }
  }

  async _executeBlockSequence(firstBlock) {
    let currentBlock = firstBlock;
    while (currentBlock && !this.abortController?.signal.aborted) {
      await this.checkYield();
      this.state.telemetry.activeBlockId = currentBlock.id;
      this._notify();

      await this._executeSingleBlock(currentBlock);
      await this.delay(5);
      currentBlock = currentBlock.getNextBlock();
    }
  }

  async _executeSingleBlock(block) {
    const type = block.type;
    const getFieldVal = (name) => block.getFieldValue(name);

    switch (type) {
      case 'titan_wait': {
        const time = parseFloat(getFieldVal('TIME')) || 0;
        const unit = getFieldVal('UNIT');
        const ms = unit === 'SECONDS' ? time * 1000 : unit === 'MICROS' ? time / 1000 : time;
        await this.delay(ms);
        break;
      }

      case 'titan_print': {
        const val = this._evalValueInput(block, 'TEXT');
        this.log(val);
        break;
      }

      case 'titan_print_labeled': {
        const label = getFieldVal('LABEL');
        const val = this._evalValueInput(block, 'VALUE');
        this.log(`${label} ${val}`);
        break;
      }

      case 'titan_motor_control': {
        const motor = getFieldVal('MOTOR');
        const dir = getFieldVal('DIR');
        const speed = parseFloat(getFieldVal('SPEED')) || 0;
        this.setMotor(motor, dir, speed);
        break;
      }

      case 'titan_motor_speed_var': {
        const motor = getFieldVal('MOTOR');
        const dir = getFieldVal('DIR');
        const speed = this._evalValueInput(block, 'SPEED_INPUT') ?? 80;
        this.setMotor(motor, dir, speed);
        break;
      }

      case 'titan_motor_dual_drive': {
        const dir = getFieldVal('DIRECTION');
        const speed = parseFloat(getFieldVal('SPEED')) || 0;
        this.driveRover(dir, speed);
        break;
      }

      case 'titan_motor_stop': {
        const motor = getFieldVal('MOTOR');
        this.stopMotors(motor);
        break;
      }

      case 'titan_servo_angle': {
        const pin = parseInt(getFieldVal('PIN'), 10);
        const angle = parseFloat(getFieldVal('ANGLE')) || 90;
        this.setServo(pin, angle);
        break;
      }

      case 'titan_onboard_led': {
        const led = getFieldVal('LED');
        const state = getFieldVal('STATE');
        this.setLed(led, state);
        break;
      }

      case 'titan_onboard_buzzer_tone': {
        const tone = getFieldVal('TONE');
        this.playBuzzerTone(tone);
        break;
      }

      case 'titan_onboard_buzzer_freq': {
        const freq = parseFloat(getFieldVal('FREQ')) || 1000;
        const dur = parseFloat(getFieldVal('DURATION')) || 200;
        this.playBuzzerFreq(freq, dur);
        break;
      }

      case 'titan_onboard_buzzer_stop': {
        this.stopBuzzer();
        break;
      }

      case 'titan_oled_init': {
        const type = getFieldVal('TYPE');
        this.initOLED(type);
        break;
      }

      case 'titan_oled_text': {
        const text = this._evalValueInput(block, 'TEXT') ?? '';
        const x = parseFloat(getFieldVal('X')) || 0;
        const y = parseFloat(getFieldVal('Y')) || 0;
        const size = parseInt(getFieldVal('SIZE'), 10) || 1;
        this.oledText(text, x, y, size);
        break;
      }

      case 'titan_oled_clear': {
        this.oledClear();
        break;
      }

      case 'titan_oled_show': {
        this._notify();
        break;
      }

      // 2x16 LCD I2C Display Execution
      case 'titan_lcd1602_init': {
        const addr = getFieldVal('ADDR') || '0x27';
        this.initLCD1602(addr);
        break;
      }

      case 'titan_lcd1602_print': {
        const text = this._evalValueInput(block, 'TEXT') ?? '';
        const col = parseInt(getFieldVal('COL'), 10) || 0;
        const row = parseInt(getFieldVal('ROW'), 10) || 0;
        this.lcdPrint(text, col, row);
        break;
      }

      case 'titan_lcd1602_print_lines': {
        const line1 = this._evalValueInput(block, 'LINE1') ?? '';
        const line2 = this._evalValueInput(block, 'LINE2') ?? '';
        this.lcdPrintLines(line1, line2);
        break;
      }

      case 'titan_lcd1602_clear': {
        this.lcdClear();
        break;
      }

      case 'titan_lcd1602_backlight': {
        const state = getFieldVal('STATE') === '1';
        this.lcdBacklight(state);
        break;
      }

      case 'titan_lcd1602_set_cursor': {
        const col = parseInt(getFieldVal('COL'), 10) || 0;
        const row = parseInt(getFieldVal('ROW'), 10) || 0;
        this.log(`[LCD 1602] Set Cursor -> Col: ${col}, Row: ${row}`);
        break;
      }

      case 'titan_lcd1602_scroll': {
        const dir = getFieldVal('DIR') || 'LEFT';
        this.log(`[LCD 1602] Scroll ${dir}`);
        break;
      }

      case 'titan_lcd1602_show_sensor': {
        const pin = parseInt(getFieldVal('SENSOR') || '2', 10);
        const row = parseInt(getFieldVal('ROW') || '0', 10);
        const col = parseInt(getFieldVal('COL') || '0', 10);
        const val = this.readAnalogSensor(pin);
        this.lcdPrint(`S${pin}:${val}`, col, row);
        break;
      }

      case 'titan_as5600_init': {
        this.state.activeSensors.as5600 = true;
        this.log("[AS5600] Initialized 12-bit magnetic rotary encoder at I2C 0x36");
        this._notify();
        break;
      }

      case 'titan_as5600_reset_zero': {
        this.state.as5600.zeroOffset = this.state.as5600.raw;
        this.state.as5600.turns = 0;
        this.state.as5600.cumulativeDeg = 0.0;
        this.log("[AS5600] Zero position set and turns reset to 0");
        this._notify();
        break;
      }

      default:
        break;
    }
  }

  _evalValueInput(parentBlock, inputName) {
    const targetBlock = parentBlock.getInputTargetBlock(inputName);
    if (!targetBlock) {
      const fieldVal = parentBlock.getFieldValue(inputName);
      if (fieldVal !== null && fieldVal !== undefined) return fieldVal;
      return '';
    }
    return this._evalExpression(targetBlock);
  }

  _evalExpression(block) {
    if (!block) return '';
    const type = block.type;
    const getFieldVal = (name) => block.getFieldValue(name);

    switch (type) {
      case 'titan_text':
      case 'text':
        return block.getFieldValue('TEXT') || '';
      case 'titan_number':
      case 'math_number':
        return parseFloat(getFieldVal('NUM')) || 0;
      case 'titan_qmc5883l_read': {
        const val = getFieldVal('VAL') || 'HEADING';
        if (val === 'DIR') return this.state.qmc5883l.dir;
        if (val === 'X') return this.state.qmc5883l.x;
        if (val === 'Y') return this.state.qmc5883l.y;
        if (val === 'Z') return this.state.qmc5883l.z;
        if (val === 'TEMP') return this.state.qmc5883l.temp;
        return this.state.qmc5883l.heading;
      }
      case 'titan_qmc5883l_heading':
        return this.state.qmc5883l.heading;
      case 'titan_qmc5883l_direction':
        return this.state.qmc5883l.dir;
      case 'titan_amg8833_read': {
        const val = getFieldVal('VAL') || 'MAX';
        if (val === 'MIN') return this.state.amg8833.minTemp;
        if (val === 'AVG') return this.state.amg8833.avgTemp;
        if (val === 'CENTER') return this.state.amg8833.centerTemp;
        if (val === 'THERMISTOR') return this.state.amg8833.thermistor;
        if (val === 'PIXELS') return this.state.amg8833.pixels;
        return this.state.amg8833.maxTemp;
      }
      case 'titan_amg8833_read_pixel': {
        const r = Math.max(1, Math.min(8, parseInt(getFieldVal('ROW'), 10) || 1)) - 1;
        const c = Math.max(1, Math.min(8, parseInt(getFieldVal('COL'), 10) || 1)) - 1;
        return this.state.amg8833.pixels[r * 8 + c] || 22.0;
      }
      case 'titan_amg8833_heat_detected': {
        const thresh = parseFloat(getFieldVal('THRESH')) ?? 30.0;
        return this.state.amg8833.maxTemp > thresh;
      }
      case 'titan_as5600_read_angle': {
        const val = getFieldVal('VAL') || 'DEG';
        if (val === 'RAW') return this.state.as5600.raw;
        if (val === 'RAD') return Number(((this.state.as5600.angle * Math.PI) / 180).toFixed(4));
        return this.state.as5600.angle;
      }
      case 'titan_as5600_read_rotations': {
        const val = getFieldVal('VAL') || 'TURNS';
        if (val === 'CUMULATIVE_DEG') return this.state.as5600.cumulativeDeg;
        if (val === 'RPM') return this.state.as5600.rpm;
        if (val === 'DEG_PER_SEC') return this.state.as5600.degPerSec;
        return this.state.as5600.turns;
      }
      case 'titan_as5600_magnet_status': {
        const val = getFieldVal('VAL') || 'IS_DETECTED';
        if (val === 'STATUS_STR') return this.state.as5600.magnetStatus;
        if (val === 'AGC') return this.state.as5600.agc;
        if (val === 'MAGNITUDE') return this.state.as5600.magnitude;
        return this.state.as5600.magnetDetected;
      }
      case 'titan_as5600_compare': {
        const metric = getFieldVal('METRIC') || 'DEG';
        const op = getFieldVal('OP') || 'GT';
        const val = parseFloat(getFieldVal('VAL')) ?? 180;
        let curr = this.state.as5600.angle;
        if (metric === 'RAW') curr = this.state.as5600.raw;
        else if (metric === 'TURNS') curr = this.state.as5600.turns;
        else if (metric === 'RPM') curr = this.state.as5600.rpm;
        if (op === 'GT' || op === '>') return curr > val;
        if (op === 'GTE' || op === '>=') return curr >= val;
        if (op === 'LT' || op === '<') return curr < val;
        if (op === 'LTE' || op === '<=') return curr <= val;
        if (op === 'EQ' || op === '==') return curr === val;
        if (op === 'NEQ' || op === '!=') return curr !== val;
        return curr > val;
      }
      case 'titan_ds18b20_read': {
        const pin = parseInt(getFieldVal('PIN') || 2, 10);
        const unit = getFieldVal('UNIT') || 'C';
        return this.readDS18B20(pin, unit);
      }
      case 'titan_ds18b20_compare': {
        const pin = parseInt(getFieldVal('PIN') || 2, 10);
        const unit = getFieldVal('UNIT') || 'C';
        const op = getFieldVal('OP') || 'GT';
        const val = parseFloat(getFieldVal('VAL')) ?? 30.0;
        const curr = this.readDS18B20(pin, unit);
        if (op === 'GT' || op === '>') return curr > val;
        if (op === 'GTE' || op === '>=') return curr >= val;
        if (op === 'LT' || op === '<') return curr < val;
        if (op === 'LTE' || op === '<=') return curr <= val;
        if (op === 'EQ' || op === '==') return Math.abs(curr - val) < 0.01;
        if (op === 'NEQ' || op === '!=') return Math.abs(curr - val) >= 0.01;
        return curr > val;
      }
      case 'titan_vl53l0x_init': {
        return '';
      }
      case 'titan_vl53l0x_read_distance': {
        const unit = getFieldVal('UNIT') || 'CM';
        return this.readVL53L0X(unit);
      }
      case 'titan_vl53l0x_compare': {
        const op = getFieldVal('OP') || 'LT';
        const val = parseFloat(getFieldVal('VAL')) ?? 20.0;
        const unit = getFieldVal('UNIT') || 'CM';
        const curr = this.readVL53L0X(unit);
        if (op === 'LT' || op === '<') return curr < val;
        if (op === 'LTE' || op === '<=') return curr <= val;
        if (op === 'GT' || op === '>') return curr > val;
        if (op === 'GTE' || op === '>=') return curr >= val;
        if (op === 'EQ' || op === '==') return Math.abs(curr - val) < 0.01;
        if (op === 'NEQ' || op === '!=') return Math.abs(curr - val) >= 0.01;
        return curr < val;
      }
      case 'titan_vl53l0x_target_in_range': {
        const minVal = parseFloat(getFieldVal('MIN_VAL')) ?? 5.0;
        const maxVal = parseFloat(getFieldVal('MAX_VAL')) ?? 30.0;
        const unit = getFieldVal('UNIT') || 'CM';
        const curr = this.readVL53L0X(unit);
        return curr >= minVal && curr <= maxVal;
      }
      case 'titan_vl53l0x_set_mode': {
        const mode = getFieldVal('MODE') || 'BALANCED';
        this.setVL53L0XMode(mode);
        return '';
      }
      default:
        return '';
    }
  }

  // ================= 2. MicroPython Script Execution Engine =================

  async runPythonCode(codeString) {
    this.stop();
    this.isRunning = true;
    this.isPaused = false;
    this.abortController = new AbortController();

    this.log("=== LOF TITAN MICROPYTHON REPL ===");
    this.initOLED();

    try {
      const sandbox = this._createPythonSandbox();
      const runner = this._transpilePythonToAsyncJs(codeString);
      await runner(sandbox);
      this.log(">>> Execution finished.");
    } catch (err) {
      if (err.message === "SIMULATION_ABORTED") {
        this.log(">>> Execution stopped by user.");
      } else {
        this.log(`Traceback (most recent call last): ${err.message}`);
        console.error("Python Simulation Error:", err);
      }
    } finally {
      this.isRunning = false;
      this._notify();
    }
  }

  _createPythonSandbox() {
    const self = this;

    const oledObj = {
      print_text: (s, x = 0, y = 0, size = 1) => {
        self.oledText(s, x, y, size);
      },
      text: (s, x = 0, y = 0, col = 1) => {
        self.oledText(s, x, y, 1);
      },
      fill: (val) => {
        if (!val) self.oledClear();
      },
      show: () => {
        self._notify();
      },
      clear: () => {
        self.oledClear();
      }
    };

    const lcdObj = {
      print: (text, col = null, row = null) => self.lcdPrint(text, col ?? 0, row ?? 0),
      print_lines: (line1 = '', line2 = '') => self.lcdPrintLines(line1, line2),
      clear: () => self.lcdClear(),
      backlight: (on = true) => self.lcdBacklight(on),
      set_cursor: (col = 0, row = 0) => {},
      scroll_left: () => {},
      scroll_right: () => {},
      command: () => {},
      write_char: () => {},
    };

    const pulseObj = {
      update: () => self.state.pulseSensor.fingerDetected,
      get current_bpm() { return self.state.pulseSensor.bpm; },
      get average_bpm() { return self.state.pulseSensor.bpm; },
      get finger_detected() { return self.state.pulseSensor.fingerDetected; },
      get latest_ir() { return self.state.pulseSensor.ir; },
      get latest_red() { return self.state.pulseSensor.red; },
      init_sensor: () => {}
    };

    return {
      print: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
        self.log(text);
      },
      time: {
        sleep: async (s) => await self.delay(s * 1000),
        sleep_ms: async (ms) => await self.delay(ms),
        sleep_us: async (us) => await self.delay(us / 1000),
        ticks_ms: () => Date.now(),
        ticks_diff: (a, b) => a - b,
      },
      network: {
        STA_IF: 0,
        AP_IF: 1,
        AUTH_WPA_WPA2_PSK: 3,
        WLAN: (mode) => ({
          active: (val) => true,
          config: (opts) => {
            if (opts?.essid) self.log(`[WIFI AP] Started SSID: "${opts.essid}" IP: 192.168.4.1`);
          },
          ifconfig: () => ['192.168.4.1', '255.255.255.0', '192.168.4.1', '8.8.8.8'],
          connect: (ssid, pass) => self.log(`[WIFI STA] Connecting to ${ssid}...`),
          isconnected: () => true,
          status: () => 1010
        })
      },
      socket: {
        AF_INET: 2,
        SOCK_STREAM: 1,
        SOL_SOCKET: 1,
        SO_REUSEADDR: 4,
        socket: function() {
          return {
            setsockopt: () => {},
            bind: (addr) => self.log(`[SOCKET] Bound to ${addr[0]}:${addr[1]}`),
            listen: (backlog) => {},
            setblocking: (flag) => {},
            settimeout: (t) => {},
            accept: () => [
              {
                settimeout: () => {},
                recv: () => '',
                sendall: (data) => {},
                close: () => {}
              },
              ['192.168.4.2', 80]
            ],
            close: () => {}
          };
        }
      },
      select: {
        POLLIN: 1,
        POLLOUT: 4,
        poll: () => ({
          register: () => {},
          unregister: () => {},
          poll: (t) => []
        })
      },
      hw: {
        play_startup_tone: () => self.playBuzzerTone('STARTUP'),
        play_run_tone: () => self.playBuzzerTone('RUN'),
        play_confirmation_tone: () => self.playBuzzerTone('CONNECTED'),
        play_stop_tone: () => self.playBuzzerTone('DISCONNECTED'),
        play_error_tone: () => self.playBuzzerTone('ERROR'),
        play_buzzer_freq: (freq, dur) => self.playBuzzerFreq(freq, dur),
        stop_buzzer: () => self.stopBuzzer(),
        read_ultrasonic_distance: (trig, echo, unit = "cm") => self.readUltrasonicDistance(unit),
        ble_send: (data) => self.log(`[BLE TX] ${data}`),
      },
      _get_pwm: (pin, freq = 1000) => ({
        duty: (d) => {
          const pct = Math.round((d / 1023) * 100);
          self._handlePwmDuty(pin, pct, freq);
        },
        duty_u16: (d) => {
          const pct = Math.round((d / 65535) * 100);
          self._handlePwmDuty(pin, pct, freq);
        },
        freq: (f) => {},
        deinit: () => {}
      }),
      PWM: (pinObj, freq = 1000) => {
        const pin = pinObj?.pin || (typeof pinObj === 'number' ? pinObj : 15);
        return {
          duty: (d) => {
            const pct = Math.round((d / 1023) * 100);
            self._handlePwmDuty(pin, pct, freq);
          },
          duty_u16: (d) => {
            const pct = Math.round((d / 65535) * 100);
            self._handlePwmDuty(pin, pct, freq);
          },
          freq: (f) => {},
          deinit: () => {}
        };
      },
      Pin: Object.assign((pin, mode, pull) => ({
        pin,
        value: (val) => {
          if (val === undefined) {
            if (pin >= 39 && pin <= 42) {
              return self.isButtonPressed(pin) ? 0 : 1;
            }
            return self.readDigitalSensor(pin);
          } else {
            self.writeDigitalOutput(pin, val);
            if (pin === 47) self.setLed('47', val);
            if (pin === 48) self.setLed('48', val);
            return val;
          }
        },
        on: () => {
          self.writeDigitalOutput(pin, 1);
          if (pin === 47) self.setLed('47', 'ON');
          if (pin === 48) self.setLed('48', 'ON');
        },
        off: () => {
          self.writeDigitalOutput(pin, 0);
          if (pin === 47) self.setLed('47', 'OFF');
          if (pin === 48) self.setLed('48', 'OFF');
        }
      }), { OUT: 1, IN: 0, PULL_UP: 2, PULL_DOWN: 3 }),
      bytearray: (n) => new Uint8Array(typeof n === 'number' ? n : 0),
      framebuf: { FrameBuffer: function(){}, MONO_VLSB: 1, MONO_HLSB: 2, RGB565: 5 },
      ADC: (pinObj, atten) => {
        const pin = pinObj?.pin || (typeof pinObj === 'number' ? pinObj : 2);
        return {
          read: () => self.readAnalogSensor(pin),
          read_u16: () => Math.round((self.readAnalogSensor(pin) / 4095) * 65535),
          atten: () => {}
        };
      },
      _TitanOLED: function(is_sh1106) {
        self.initOLED();
        return oledObj;
      },
      _get_oled: () => oledObj,
      _oled_global: oledObj,
      oled: oledObj,

      // 2x16 LCD 1602 Sandbox
      _TitanLCD1602: function(addr = 0x27) {
        self.initLCD1602(addr);
        return lcdObj;
      },
      _get_lcd: (addr = 0x27) => {
        if (!self.state.lcd1602.initialized) self.initLCD1602(addr);
        return lcdObj;
      },
      _lcd_global: lcdObj,
      lcd: lcdObj,
      _TitanPulse: function() {
        return pulseObj;
      },
      _get_pulse: () => pulseObj,
      _pulse_inst: pulseObj,
      pulse: pulseObj,
      _init_pulse: () => {},
      _read_pulse: (t) => t === 'FINGER' ? pulseObj.finger_detected : pulseObj.average_bpm,

      // QMC5883L Compass Sandbox
      _TitanQMC5883L: function() {
        return {
          get heading() { return self.state.qmc5883l.heading; },
          get direction() { return self.state.qmc5883l.dir; },
          get x() { return self.state.qmc5883l.x; },
          get y() { return self.state.qmc5883l.y; },
          get z() { return self.state.qmc5883l.z; },
          get temp() { return self.state.qmc5883l.temp; },
          update: () => {},
          init_sensor: () => {}
        };
      },
      _get_qmc5883l: () => ({
        get heading() { return self.state.qmc5883l.heading; },
        get direction() { return self.state.qmc5883l.dir; },
        get x() { return self.state.qmc5883l.x; },
        get y() { return self.state.qmc5883l.y; },
        get z() { return self.state.qmc5883l.z; },
        get temp() { return self.state.qmc5883l.temp; },
        update: () => {},
        init_sensor: () => {}
      }),
      _qmc_inst: null,
      _init_qmc5883l: () => {},
      _read_qmc5883l: (val_type = "HEADING") => {
        const q = self.state.qmc5883l;
        if (val_type === "DIR") return q.dir;
        if (val_type === "X") return q.x;
        if (val_type === "Y") return q.y;
        if (val_type === "Z") return q.z;
        if (val_type === "TEMP") return q.temp;
        return q.heading;
      },

      // AMG8833 Thermal Camera Sandbox
      _TitanAMG8833: function() {
        return {
          get max_temp() { return self.state.amg8833.maxTemp; },
          get min_temp() { return self.state.amg8833.minTemp; },
          get avg_temp() { return self.state.amg8833.avgTemp; },
          get center_temp() { return self.state.amg8833.centerTemp; },
          get thermistor() { return self.state.amg8833.thermistor; },
          get pixels() { return self.state.amg8833.pixels; },
          update: () => {},
          init_sensor: () => {}
        };
      },
      _get_amg8833: () => ({
        get max_temp() { return self.state.amg8833.maxTemp; },
        get min_temp() { return self.state.amg8833.minTemp; },
        get avg_temp() { return self.state.amg8833.avgTemp; },
        get center_temp() { return self.state.amg8833.centerTemp; },
        get thermistor() { return self.state.amg8833.thermistor; },
        get pixels() { return self.state.amg8833.pixels; },
        update: () => {},
        init_sensor: () => {}
      }),
      _amg_inst: null,
      _init_amg8833: () => {},
      _read_amg8833: (val_type = "MAX") => {
        const cam = self.state.amg8833;
        if (val_type === "MIN") return cam.minTemp;
        if (val_type === "AVG") return cam.avgTemp;
        if (val_type === "CENTER") return cam.centerTemp;
        if (val_type === "THERMISTOR") return cam.thermistor;
        if (val_type === "PIXELS") return cam.pixels;
        return cam.maxTemp;
      },
      _read_amg8833_pixel: (row, col) => {
        const r = Math.max(1, Math.min(8, parseInt(row, 10) || 1)) - 1;
        const c = Math.max(1, Math.min(8, parseInt(col, 10) || 1)) - 1;
        return self.state.amg8833.pixels[r * 8 + c] || 22.0;
      },
      _draw_amg8833_oled: () => {
        const cam = self.state.amg8833;
        self.oledClear();
        self.oledText(`Mx:${cam.maxTemp.toFixed(1)}C`, 64, 8, 1);
        self.oledText(`Mn:${cam.minTemp.toFixed(1)}C`, 64, 24, 1);
        self.oledText(`Av:${cam.avgTemp.toFixed(1)}C`, 64, 40, 1);
        self._notify();
      },

      // DS18B20 1-Wire Digital Temperature Sandbox
      _read_ds18b20: (pin = 2, unit = "C") => self.readDS18B20(pin, unit),
      _get_ds18b20: (pin = 2) => ({
        read: (unit = "C") => self.readDS18B20(pin, unit),
        read_c: () => self.readDS18B20(pin, "C"),
        read_f: () => self.readDS18B20(pin, "F"),
        read_k: () => self.readDS18B20(pin, "K"),
        convert_temp: () => {},
        read_temp: (rom) => self.readDS18B20(pin, "C"),
      }),
      onewire: {
        OneWire: function(p) { return { pin: p }; }
      },
      ds18x20: {
        DS18X20: function(ow) {
          const pinNum = ow?.pin?.pin || 2;
          return {
            scan: () => [bytearray([0x28, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07])],
            convert_temp: () => {},
            read_temp: (rom) => self.readDS18B20(pinNum, "C"),
          };
        }
      },

      // VL53L0X / GY-53 Laser ToF Sandbox
      _get_vl53l0x: () => ({
        read_distance: (unit = "CM") => self.readVL53L0X(unit),
        read_distance_mm: () => self.readVL53L0X("MM"),
        set_mode: (m) => self.setVL53L0XMode(m),
      }),
      VL53L0X: function(i2c, addr = 0x29) {
        return {
          read_distance: (unit = "CM") => self.readVL53L0X(unit),
          read_distance_mm: () => self.readVL53L0X("MM"),
          set_mode: (m) => self.setVL53L0XMode(m),
        };
      },

      SoftI2C: function() {},
      I2C: function() {},
      UART: function() {
        return {
          write: (d) => self.log(`[UART TX] ${d}`),
          read: () => ''
        };
      },
      getattr: (obj, name, defaultVal) => {
        if (obj && obj[name] !== undefined) return obj[name];
        return typeof defaultVal === 'function' ? defaultVal : () => defaultVal;
      },
      range: (a, b, step = 1) => {
        const start = b === undefined ? 0 : a;
        const stop = b === undefined ? a : b;
        const res = [];
        for (let i = start; i < stop; i += step) res.push(i);
        return res;
      },
      True: true,
      False: false,
      None: null,
      max: (...args) => Math.max(...args),
      min: (...args) => Math.min(...args),
      str: (v) => String(v),
      int: (v) => parseInt(v, 10) || 0,
      float: (v) => parseFloat(v) || 0,
      len: (v) => (v ? v.length : 0),
      round: (v, n = 0) => {
        const p = Math.pow(10, n);
        return Math.round(v * p) / p;
      },
      _in: (item, container) => {
        if (!container) return false;
        if (typeof container === 'string' || Array.isArray(container)) return container.indexOf(item) !== -1;
        return item in container;
      },
      _not_in: (item, container) => {
        if (!container) return true;
        if (typeof container === 'string' || Array.isArray(container)) return container.indexOf(item) === -1;
        return !(item in container);
      },
      checkYield: async () => await self.checkYield(),
      delay: async (ms) => await self.delay(ms),
    };
  }

  _handlePwmDuty(pin, pct, freq) {
    if (pin === 20) {
      if (pct > 0) {
        this.playBuzzerFreq(freq || 1000, 200);
      } else {
        this.stopBuzzer();
      }
      return;
    }

    const updateDualPinMotor = (motorKey, pinA, pinB) => {
      const m = this.state.motors[motorKey];
      if (!m) return;
      if (pin === pinA) m.dutyA = pct;
      if (pin === pinB) m.dutyB = pct;

      if (m.dutyA > 0 && m.dutyB === 0) {
        m.dir = 'FORWARD';
        m.speed = m.dutyA;
      } else if (m.dutyB > 0 && m.dutyA === 0) {
        m.dir = 'BACKWARD';
        m.speed = m.dutyB;
      } else if (m.dutyA > 0 && m.dutyB > 0) {
        if (m.dutyA >= m.dutyB) {
          m.dir = 'FORWARD';
          m.speed = m.dutyA - m.dutyB;
        } else {
          m.dir = 'BACKWARD';
          m.speed = m.dutyB - m.dutyA;
        }
      } else {
        m.dir = 'STOP';
        m.speed = 0;
      }
    };

    if (pin === 15 || pin === 16) {
      updateDualPinMotor('M1', 15, 16);
    } else if (pin === 13 || pin === 14) {
      updateDualPinMotor('M2', 13, 14);
    } else if (pin === 11 || pin === 12) {
      updateDualPinMotor('M3', 11, 12);
      updateDualPinMotor('M6', 11, 12);
    } else if (pin === 9 || pin === 10) {
      updateDualPinMotor('M4', 9, 10);
      updateDualPinMotor('M5', 9, 10);
    }

    this._notify();
  }

  _transpilePythonToAsyncJs(pyCode) {
    // 1. Replace triple-quoted strings with JS template strings (before line split)
    let cleanCode = pyCode
      .replace(/"""([\s\S]*?)"""/g, (m, content) => {
        return '`' + content.replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`';
      })
      .replace(/'''([\s\S]*?)'''/g, (m, content) => {
        return '`' + content.replace(/`/g, '\\`').replace(/\${/g, '\\${') + '`';
      });

    // 2. Replace f-strings with template literals (handle {{ }} escapes)
    cleanCode = cleanCode
      .replace(/f"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m, p1) => {
        let t = p1.replace(/\{\{/g, '___LBRACE___').replace(/\}\}/g, '___RBRACE___');
        t = t.replace(/\{([^}]+)\}/g, '${$1}');
        t = t.replace(/___LBRACE___/g, '{').replace(/___RBRACE___/g, '}');
        return '`' + t + '`';
      })
      .replace(/f'([^'\\]*(?:\\.[^'\\]*)*)'/g, (m, p1) => {
        let t = p1.replace(/\{\{/g, '___LBRACE___').replace(/\}\}/g, '___RBRACE___');
        t = t.replace(/\{([^}]+)\}/g, '${$1}');
        t = t.replace(/___LBRACE___/g, '{').replace(/___RBRACE___/g, '}');
        return '`' + t + '`';
      });

    const rawLines = cleanCode.split('\n');
    let jsBody = `
      var { 
        print, time, network, socket, select, hw, _get_pwm, PWM, Pin, ADC, 
        _TitanOLED, _get_oled, _oled_global, oled, 
        _TitanLCD1602, _get_lcd, _lcd_global, lcd,
        _TitanPulse, _get_pulse, _pulse_inst, pulse, 
        _init_pulse, _read_pulse,
        _TitanQMC5883L, _get_qmc5883l, _qmc_inst, _init_qmc5883l, _read_qmc5883l,
        _TitanAMG8833, _get_amg8833, _amg_inst, _init_amg8833, _read_amg8833, _read_amg8833_pixel, _draw_amg8833_oled,
        _TitanAS5600, _get_as5600, _as5600_inst, _init_as5600, _read_as5600_angle, _read_as5600_rotations, _reset_as5600_zero, _read_as5600_magnet, _compare_as5600,
        _read_ds18b20, _get_ds18b20, onewire, ds18x20,
        getattr, 
        SoftI2C, I2C, UART,
        str, int, float, len, range, min, max, round, _in, _not_in, checkYield, delay,
        bytearray, framebuf, True, False, None 
      } = sandbox;
    `;

    // Indentation-aware block stack
    const blockStack = [];
    // skipUntilIndent: skip all lines with indent > this value (used for class/helper defs)
    let skipUntilIndent = -1;

    // Sandbox-provided helpers — skip user redefinitions to keep them synchronous
    const SANDBOX_HELPERS = ['_get_oled', '_get_lcd', '_get_pulse', '_get_pwm', '_get_qmc5883l', '_get_amg8833', '_get_as5600', '_get_ds18b20', '_read_ds18b20'];

    for (let raw of rawLines) {
      let trimmed = raw.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Strip inline comments outside strings
      if (trimmed.includes('#') && !trimmed.startsWith('`') && !trimmed.startsWith('"') && !trimmed.startsWith("'")) {
        const hashIndex = trimmed.indexOf('#');
        const prefix = trimmed.substring(0, hashIndex);
        const quotes = (prefix.match(/["'`]/g) || []).length;
        if (quotes % 2 === 0) {
          trimmed = prefix.trim();
        }
      }

      if (!trimmed) continue;

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue;
      if (trimmed.startsWith('global ')) continue;
      if (trimmed.startsWith('if __name__') || trimmed === 'main()') continue;

      const matchIndentEarly = raw.match(/^(\s*)/);
      const earlyIndent = matchIndentEarly ? matchIndentEarly[1].replace(/\t/g, '    ').length : 0;

      // Handle skip zone (class bodies, sandbox helper function bodies)
      if (skipUntilIndent >= 0) {
        if (earlyIndent > skipUntilIndent) continue; // still inside skipped block
        else skipUntilIndent = -1; // exited the block
      }

      // Skip class definitions entirely — sandbox simulates hardware drivers
      if (trimmed.startsWith('class ')) {
        skipUntilIndent = earlyIndent;
        continue;
      }

      // Skip sandbox helper function re-definitions (keeps them sync for method chaining)
      if (trimmed.startsWith('def ') && SANDBOX_HELPERS.some(h => trimmed.startsWith(`def ${h}(`))) {
        skipUntilIndent = earlyIndent;
        continue;
      }

      // Skip TOP-LEVEL sandbox state variable re-initializations (indent 0 only)
      if (earlyIndent === 0 && /^(_pwm_pool|_oled_global|_pulse_inst|_qmc_inst|_amg_inst)\s*=/.test(trimmed)) continue;

      const currentIndent = earlyIndent;

      const isElif = trimmed.startsWith('elif ');
      const isElse = trimmed === 'else:';
      const isExcept = trimmed.startsWith('except');
      const isFinally = trimmed === 'finally:';

      // Close blocks based on indentation
      if (isElif || isElse || isExcept || isFinally) {
        while (blockStack.length > 0 && blockStack[blockStack.length - 1] > currentIndent) {
          blockStack.pop();
          jsBody += `\n}\n`;
        }
      } else {
        while (blockStack.length > 0 && currentIndent <= blockStack[blockStack.length - 1]) {
          blockStack.pop();
          jsBody += `\n}\n`;
        }
      }

      let line = trimmed;

      // Normalize common Python keywords
      line = line.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');

      const condTransform = (c) => c
        .replace(/([^\s\(\)]+)\s+not\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_not_in(${p1}, ${p2})`)
        .replace(/([^\s\(\)]+)\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_in(${p1}, ${p2})`)
        .replace(/\bnot\b\s+/g, '!')
        .replace(/ == /g, ' === ')
        .replace(/ != /g, ' !== ')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||');

      // 1. Handle Function Definitions
      if (line.startsWith('def ') && line.endsWith(':')) {
        const match = line.match(/^def\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*:$/);
        if (match) {
          const fname = match[1];
          const rawParams = match[2] ? match[2].split(',') : [];
          const cleanParams = rawParams.map(p => {
            const pTrim = p.trim();
            if (pTrim.includes('=')) {
              const eqIdx = pTrim.indexOf('=');
              return `${pTrim.substring(0, eqIdx).trim()} = ${pTrim.substring(eqIdx + 1).trim()}`;
            }
            return pTrim;
          }).filter(Boolean).join(', ');
          jsBody += `\n${fname} = async function(${cleanParams}) {\n await checkYield();\n`;
          blockStack.push(currentIndent);
          continue;
        }
      }

      // 2. Handle Loops
      if (line.startsWith('while ') && line.endsWith(':')) {
        const cond = condTransform(line.slice(6, -1));
        jsBody += `\nwhile (${cond}) {\n await checkYield();\n`;
        blockStack.push(currentIndent);
        continue;
      }

      if (line.startsWith('for ') && line.includes(' in ') && line.endsWith(':')) {
        const match = line.match(/^for\s+([a-zA-Z0-9_]+)\s+in\s+(.+):$/);
        if (match) {
          jsBody += `\nfor (let ${match[1]} of ${match[2]}) {\n await checkYield();\n`;
          blockStack.push(currentIndent);
          continue;
        }
      }

      // 3. Handle Conditionals
      if (line.startsWith('if ') && line.endsWith(':')) {
        jsBody += `\nif (${condTransform(line.slice(3, -1))}) {\n`;
        blockStack.push(currentIndent);
        continue;
      }
      if (isElif) {
        jsBody += `\n} else if (${condTransform(line.slice(5, -1))}) {\n`;
        continue;
      }
      if (isElse) {
        jsBody += `\n} else {\n`;
        continue;
      }

      // 4. Handle Try / Catch / Finally
      if (line.startsWith('try:')) {
        const rest = line.slice(4).trim();
        jsBody += `\ntry {\n${rest && rest !== 'pass' ? ' ' + rest + ';' : ''}\n`;
        blockStack.push(currentIndent);
        continue;
      }
      if (isExcept) {
        const colonIdx = line.indexOf(':');
        const rest = line.substring(colonIdx + 1).trim();
        jsBody += `\n} catch(e) {\n${rest && rest !== 'pass' ? ' ' + rest + ';' : ''}\n`;
        continue;
      }
      if (isFinally) {
        jsBody += `\n} finally {\n`;
        continue;
      }

      // 5. Statement-level transformations
      // Python ternary: val_true if cond else val_false
      line = line.replace(/(".*?"|'.*?'|[a-zA-Z0-9_]+)\s+if\s+([a-zA-Z0-9_\.\(\)\s===!><]+)\s+else\s+(".*?"|'.*?'|[a-zA-Z0-9_]+)/g, '($2 ? $1 : $3)');

      // not in / in operators in statements
      line = line.replace(/([^\s\(\)]+)\s+not\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_not_in(${p1}, ${p2})`);
      line = line.replace(/([^\s\(\)]+)\s+in\s+([^\s,:\)\{]+)/g, (m, p1, p2) => `_in(${p1}, ${p2})`);

      // Tuple unpacking: a, b = x, y
      if (/^[a-zA-Z0-9_]+,\s*[a-zA-Z0-9_]+\s*=\s*/.test(line)) {
        const eqIdx = line.indexOf('=');
        const left = line.substring(0, eqIdx).trim();
        const right = line.substring(eqIdx + 1).trim();
        line = `var [${left}] = ${right.includes(',') && !right.startsWith('[') ? `[${right}]` : right}`;
      }

      line = line.replace(/([a-zA-Z0-9_\.\(\)]+)\s*\/\/\s*([a-zA-Z0-9_\.\(\)]+)/g, 'Math.floor($1 / $2)');
      line = line.replace(/,\s*end\s*=\s*["'][^"']*["']/g, '');
      line = line.replace(/time\.sleep_ms\((.*?)\)/g, 'await time.sleep_ms($1)');
      line = line.replace(/time\.sleep\((.*?)\)/g, 'await time.sleep($1)');
      line = line.replace(/size\s*=\s*/g, '');
      line = line.replace(/is_sh1106\s*=\s*/g, '');
      line = line.replace(/atten\s*=\s*[^,\)]+/g, '');
      line = line.replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null');
      line = line.replace(/lambda\s*([^:]*)\s*:\s*([^,\)]+)/g, '($1) => $2');

      // Auto-await known async user functions
      line = line.replace(/\b(read_average_uv|auto_uv_control|stop_motors|forward|backward|left_turn|right_turn|left_motor_forward|left_motor_backward|right_motor_forward|right_motor_backward|handle_http_request|main)\s*\(/g, 'await $1(');

      const statements = line.split(';').map(s => s.trim()).filter(Boolean);
      for (const st of statements) {
        if (st === 'pass') continue;
        // Add var prefix for plain assignments
        if (/^[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*/.test(st) && !st.startsWith('var ')) {
          jsBody += `\nvar ${st};`;
        } else {
          jsBody += `\n${st};`;
        }
      }
    }

    // Close any remaining open blocks
    while (blockStack.length > 0) {
      blockStack.pop();
      jsBody += `\n}\n`;
    }

    // Auto-invoke main() if defined
    jsBody += `\nif (typeof main === 'function') { await main(); }\n`;

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      return new AsyncFunction('sandbox', jsBody);
    } catch (e) {
      this.log(`⚠️ Script transpiler notice: ${e.message}`);
      console.error('Transpiler JS Code:\n', jsBody);
      throw e;
    }
  }

  pause() {
    this.isPaused = !this.isPaused;
    this._notify();
  }

  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isRunning = false;
    this.isPaused = false;
    this.stopMotors('ALL');
    this.setLed('BOTH', 'OFF');
    this.stopBuzzer();
    this.state.telemetry.activeBlockId = null;
    this._notify();
  }

  reset() {
    this.stop();
    this.state = this._getInitialState();
    this._notify();
    this.log(">>> LOF TITAN board reset to default state.");
  }
}

export const titanSimulator = new TitanSimulatorEngine();
