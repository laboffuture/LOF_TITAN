import { pythonGenerator, Order } from 'blockly/python';

export function registerPythonGenerators() {
  // ================= 1. TITAN BASE / START BLOCK (SCRATCH FLAG EQUIVALENT) =================
  pythonGenerator.forBlock['titan_start'] = function(block) {
    const branch = pythonGenerator.statementToCode(block, 'DO') || '    pass\n';
    return `# ================= LOF TITAN MAIN =================\nimport time\nfrom machine import Pin, PWM, ADC, I2C, SoftI2C, UART\nfrom supervisor.led_buzzer import hw\n\n_pwm_pool = {}\ndef _get_pwm(pin, freq=1000):\n    if pin not in _pwm_pool:\n        _pwm_pool[pin] = PWM(Pin(pin), freq=freq)\n    else:\n        try: _pwm_pool[pin].freq(freq)\n        except Exception: pass\n    return _pwm_pool[pin]\n\ndef main():\n${branch}\nif __name__ == '__main__':\n    main()\n`;
  };

  pythonGenerator.forBlock['project_info'] = function(block) {
    const author = block.getFieldValue('AUTHOR') || 'User';
    const desc = block.getFieldValue('DESCRIPTION') || 'My project';
    return `# ==========================================\n# LOF TITAN Project\n# Author: ${author}\n# Description: ${desc}\n# ==========================================\n\n`;
  };

  pythonGenerator.INDENT = '  ';

  pythonGenerator.forBlock['titan_repeat_while'] = function(block) {
    const mode = block.getFieldValue('MODE');
    let condition = pythonGenerator.valueToCode(block, 'BOOL', Order.NONE) || 'True';
    if (mode === 'UNTIL') {
      condition = `not (${condition})`;
    }
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(5)\n';
    }
    return `while ${condition}:\n${branch}`;
  };

  pythonGenerator.forBlock['titan_repeat_times'] = function(block) {
    const times = block.getFieldValue('TIMES') || 10;
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(2)\n';
    }
    return `for _ in range(${times}):\n${branch}`;
  };

  pythonGenerator.forBlock['controls_whileUntil'] = function(block) {
    const until = block.getFieldValue('MODE') === 'UNTIL';
    let argument0 = pythonGenerator.valueToCode(block, 'BOOL', until ? Order.LOGICAL_NOT : Order.NONE) || 'False';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (until) {
      argument0 = 'not ' + argument0;
    }
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(5)\n';
    }
    return `while ${argument0}:\n${branch}`;
  };

  pythonGenerator.forBlock['controls_repeat_ext'] = function(block) {
    let repeats = pythonGenerator.valueToCode(block, 'TIMES', Order.NONE) || '0';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(2)\n';
    }
    return `for _ in range(int(${repeats})):\n${branch}`;
  };

  pythonGenerator.forBlock['controls_for'] = function(block) {
    const variable0 = pythonGenerator.getVariableName(block.getFieldValue('VAR'));
    const argument0 = pythonGenerator.valueToCode(block, 'FROM', Order.NONE) || '0';
    const argument1 = pythonGenerator.valueToCode(block, 'TO', Order.NONE) || '0';
    const increment = pythonGenerator.valueToCode(block, 'BY', Order.NONE) || '1';
    let branch = pythonGenerator.statementToCode(block, 'DO');
    if (!branch || branch.trim() === '') {
      branch = '  time.sleep_ms(10)\n';
    } else if (!branch.includes('time.sleep')) {
      branch = branch + '  time.sleep_ms(1)\n';
    }
    return `for ${variable0} in range(int(${argument0}), int(${argument1}) + 1, int(${increment})):\n${branch}`;
  };

  pythonGenerator.forBlock['titan_print'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    return `print(${text})\n`;
  };

  pythonGenerator.forBlock['titan_wait'] = function(block) {
    const timeVal = block.getFieldValue('TIME') || 1;
    const unit = block.getFieldValue('UNIT');
    if (unit === 'SECONDS') {
      return `time.sleep(${timeVal})\n`;
    } else if (unit === 'MILLIS') {
      return `time.sleep_ms(int(${timeVal}))\n`;
    } else {
      return `time.sleep_us(int(${timeVal}))\n`;
    }
  };

  pythonGenerator.forBlock['titan_boolean'] = function(block) {
    const code = (block.getFieldValue('BOOL') === 'TRUE') ? 'True' : 'False';
    return [code, Order.ATOMIC];
  };

  pythonGenerator.forBlock['titan_text'] = function(block) {
    const text = block.getFieldValue('TEXT') || '';
    return [`"${text}"`, Order.ATOMIC];
  };

  pythonGenerator.forBlock['titan_number'] = function(block) {
    const num = block.getFieldValue('NUM') || 0;
    return [String(num), Order.ATOMIC];
  };

  // Motor Pin Mapping for 4 Hardware Channels / 6 Motor Ports
  const MOTOR_PIN_MAP = {
    'M1': [15, 16],
    'M2': [13, 14],
    'M3': [11, 12],
    'M4': [9, 10],
    'M5': [9, 10], // Parallel shared output with M4
    'M6': [11, 12]  // Parallel shared output with M3
  };

  // ================= 2. MOTOR GENERATORS =================
  pythonGenerator.forBlock['titan_motor_control'] = function(block) {
    const motor = block.getFieldValue('MOTOR') || 'M1';
    const dir = block.getFieldValue('DIR');
    const speed = block.getFieldValue('SPEED') || 80;
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    const pinA = pins[0];
    const pinB = pins[1];
    const dutyVal = `int(${speed} * 10.23)`;
    if (dir === 'FORWARD') {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Forward at ${speed}%\n_get_pwm(${pinA}).duty(${dutyVal})\n_get_pwm(${pinB}).duty(0)\n`;
    } else {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Backward at ${speed}%\n_get_pwm(${pinA}).duty(0)\n_get_pwm(${pinB}).duty(${dutyVal})\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_speed_var'] = function(block) {
    const motor = block.getFieldValue('MOTOR') || 'M1';
    const dir = block.getFieldValue('DIR');
    const speedCode = pythonGenerator.valueToCode(block, 'SPEED_INPUT', Order.NONE) || '80';
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    const pinA = pins[0];
    const pinB = pins[1];
    if (dir === 'FORWARD') {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Forward\n_get_pwm(${pinA}).duty(int(min(100, max(0, ${speedCode})) * 10.23))\n_get_pwm(${pinB}).duty(0)\n`;
    } else {
      return `# Motor ${motor} (GPIO ${pinA}, ${pinB}) Backward\n_get_pwm(${pinA}).duty(0)\n_get_pwm(${pinB}).duty(int(min(100, max(0, ${speedCode})) * 10.23))\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_custom_pins'] = function(block) {
    const pinA = block.getFieldValue('PIN_A');
    const pinB = block.getFieldValue('PIN_B');
    const dir = block.getFieldValue('DIR');
    const speed = block.getFieldValue('SPEED') || 80;
    return `# Custom Motor Pins (A: GPIO ${pinA}, B: GPIO ${pinB})\nif ${dir === 'FORWARD' ? 'True' : 'False'}:\n    _get_pwm(${pinA}).duty(int(${speed} * 10.23))\n    _get_pwm(${pinB}).duty(0)\nelse:\n    _get_pwm(${pinA}).duty(0)\n    _get_pwm(${pinB}).duty(int(${speed} * 10.23))\n`;
  };

  pythonGenerator.forBlock['titan_motor_dual_drive'] = function(block) {
    const dir = block.getFieldValue('DIRECTION');
    const speed = block.getFieldValue('SPEED') || 80;
    const dutyVal = `int(${speed} * 10.23)`;
    if (dir === 'FORWARD') {
      return `# Drive Rover Forward\n_get_pwm(15).duty(${dutyVal}); _get_pwm(16).duty(0)\n_get_pwm(13).duty(${dutyVal}); _get_pwm(14).duty(0)\n`;
    } else if (dir === 'BACKWARD') {
      return `# Drive Rover Backward\n_get_pwm(15).duty(0); _get_pwm(16).duty(${dutyVal})\n_get_pwm(13).duty(0); _get_pwm(14).duty(${dutyVal})\n`;
    } else if (dir === 'LEFT' || dir === 'SPIN_LEFT') {
      return `# Turn Left\n_get_pwm(15).duty(0); _get_pwm(16).duty(${dutyVal})\n_get_pwm(13).duty(${dutyVal}); _get_pwm(14).duty(0)\n`;
    } else {
      return `# Turn Right\n_get_pwm(15).duty(${dutyVal}); _get_pwm(16).duty(0)\n_get_pwm(13).duty(0); _get_pwm(14).duty(${dutyVal})\n`;
    }
  };

  pythonGenerator.forBlock['titan_motor_stop'] = function(block) {
    const motor = block.getFieldValue('MOTOR');
    if (motor === 'ALL') {
      return `# Stop All Motors (M1-M6)\nfor _p in (15, 16, 13, 14, 11, 12, 9, 10):\n    if _p in _pwm_pool: _pwm_pool[_p].duty(0)\n`;
    }
    const pins = MOTOR_PIN_MAP[motor] || [15, 16];
    return `# Stop Motor ${motor} (GPIO ${pins[0]}, ${pins[1]})\n_get_pwm(${pins[0]}).duty(0)\n_get_pwm(${pins[1]}).duty(0)\n`;
  };

  pythonGenerator.forBlock['titan_servo_angle'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const angle = block.getFieldValue('ANGLE') || 90;
    return `# Servo Port S${pin} (GPIO ${pin}) to ${angle} deg\n_get_pwm(${pin}, 50).duty(int(25 + (${angle} / 180.0) * 100))\n`;
  };

  // ================= 3. HARDWARE & SENSORS =================
  pythonGenerator.forBlock['titan_sensor_read_analog'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_sensor_read_digital'] = function(block) {
    const pin = block.getFieldValue('PIN');
    return [`Pin(${pin}, Pin.IN).value()`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_sensor_write_digital'] = function(block) {
    const pin = block.getFieldValue('PIN');
    const state = block.getFieldValue('STATE');
    return `Pin(${pin}, Pin.OUT).value(${state})\n`;
  };

  pythonGenerator.forBlock['titan_ultrasonic_distance'] = function(block) {
    const unit = block.getFieldValue('UNIT');
    return [`hw.read_ultrasonic_distance(trig=6, echo=19, unit="${unit}")`, Order.FUNCTION_CALL];
  };

  // I2C Generators (SDA: 7, SCL: 8)
  pythonGenerator.forBlock['titan_i2c_scan'] = function(block) {
    return [`[hex(a) for a in SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).scan()]`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_i2c_read_byte'] = function(block) {
    const addr = block.getFieldValue('ADDR') || '0x3C';
    const reg = block.getFieldValue('REG') || 0;
    return [`int.from_bytes(SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).readfrom_mem(int("${addr}", 0 if "${addr}".startswith("0x") else 10), ${reg}, 1), 'big')`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_i2c_write_byte'] = function(block) {
    const addr = block.getFieldValue('ADDR') || '0x3C';
    const reg = block.getFieldValue('REG') || 0;
    const val = block.getFieldValue('VAL') || 0;
    return `SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000).writeto_mem(int("${addr}", 0 if "${addr}".startswith("0x") else 10), ${reg}, bytearray([${val}]))\n`;
  };

  // Pulse Rate Sensor Generators (MAX30102 / MAX30100 on 0x57)
  pythonGenerator.forBlock['titan_pulse_sensor_init'] = function(block) {
    return `_init_pulse()\n`;
  };

  pythonGenerator.forBlock['titan_pulse_sensor_read'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'IR';
    return [`_read_pulse("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_pulse_finger_detected'] = function(block) {
    return [`_read_pulse("FINGER")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_motion_sensor_check'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    return [`(Pin(${pin}, Pin.IN).value() == 1)`, Order.RELATIONAL];
  };

  // Sensor Monitor Print Generator
  pythonGenerator.forBlock['titan_print_sensor_monitor'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'ALL';
    if (type === 'ALL') {
      return `_s1 = ADC(Pin(2), atten=ADC.ATTN_11DB).read()\n` +
             `_s2 = ADC(Pin(1), atten=ADC.ATTN_11DB).read()\n` +
             `_s3 = ADC(Pin(3), atten=ADC.ATTN_11DB).read()\n` +
             `_s4 = ADC(Pin(4), atten=ADC.ATTN_11DB).read()\n` +
             `_s5 = ADC(Pin(5), atten=ADC.ATTN_11DB).read()\n` +
             `_d = hw.read_ultrasonic_distance(6, 19, "cm")\n` +
             `_b1 = 1 - Pin(39, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b2 = 1 - Pin(40, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b3 = 1 - Pin(41, Pin.IN, Pin.PULL_UP).value()\n` +
             `_b4 = 1 - Pin(42, Pin.IN, Pin.PULL_UP).value()\n` +
             `print(f"[SENSORS] S1:{_s1} S2:{_s2} S3:{_s3} S4:{_s4} S5:{_s5} | Dist:{_d:.1f}cm | Btns:[{_b1},{_b2},{_b3},{_b4}]")\n`;
    } else if (type === 'PULSE') {
      return `_pi = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000)\n` +
             `try:\n` +
             `  _raw = _pi.readfrom_mem(0x57, 0x07, 6)\n` +
             `  _ir_val = (int.from_bytes(_raw[3:6], 'big') & 0x3FFFF)\n` +
             `  _finger = "Finger Detected ✅" if _ir_val > 50000 else "No Finger ❌"\n` +
             `  print(f"[PULSE SENSOR 0x57] IR Value: {_ir_val} | {_finger}")\n` +
             `except Exception as _pe:\n` +
             `  print(f"[PULSE SENSOR 0x57] Device present at 0x57 (init required: {_pe})")\n`;
    } else if (type === 'DIST') {
      return `print(f"[ULTRASONIC] Distance: {hw.read_ultrasonic_distance(6, 19, 'cm'):.1f} cm")\n`;
    } else if (type === 'BTNS') {
      return `print(f"[BUTTONS] B1:{1-Pin(39,Pin.IN,Pin.PULL_UP).value()} B2:{1-Pin(40,Pin.IN,Pin.PULL_UP).value()} B3:{1-Pin(41,Pin.IN,Pin.PULL_UP).value()} B4:{1-Pin(42,Pin.IN,Pin.PULL_UP).value()}")\n`;
    } else if (type === 'I2C_SCAN') {
      return `_i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=1000)\n` +
             `_names = {0x57:"Pulse Rate Sensor (MAX30102/MAX30100)", 0x3C:"OLED (SSD1306/SH1106)", 0x68:"IMU (MPU6050)", 0x29:"ToF Laser (VL53L0X)", 0x36:"Mag Encoder (AS5600)", 0x76:"BMP280 Baro", 0x40:"PCA9685/INA219", 0x48:"ADS1115", 0x27:"LCD 1602", 0x1E:"HMC5883L Compass", 0x23:"BH1750 Light", 0x50:"AT24C32 EEPROM"}\n` +
             `_devs = _i2c.scan()\n` +
             `if not _devs:\n` +
             `  print("[I2C SCAN] No I2C devices detected (SDA:7, SCL:8)")\n` +
             `else:\n` +
             `  print(f"[I2C SCAN] Found {len(_devs)} device(s): " + ", ".join([f"{hex(a)} ({_names.get(a, 'I2C Device')})" for a in _devs]))\n`;
    } else {
      const pinMap = { 'S1': 2, 'S2': 1, 'S3': 3, 'S4': 4, 'S5': 5 };
      const pin = pinMap[type] || 2;
      return `print(f"[SENSOR ${type}] ADC Value: {ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()}")\n`;
    }
  };

  // Labeled Print Generator
  pythonGenerator.forBlock['titan_print_labeled'] = function(block) {
    const label = block.getFieldValue('LABEL') || '';
    const valCode = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
    return `print(f"${label} {${valCode}}")\n`;
  };

  // Sensor Comparison / Conditions for If / While
  pythonGenerator.forBlock['titan_sensor_compare'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const op = block.getFieldValue('OP') || '>';
    const val = block.getFieldValue('VALUE') || 500;
    return [`(ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read() ${op} ${val})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_digital_sensor_check'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const state = block.getFieldValue('STATE') || '1';
    return [`(Pin(${pin}, Pin.IN).value() == ${state})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_ultrasonic_compare'] = function(block) {
    const op = block.getFieldValue('OP') || '<';
    const dist = block.getFieldValue('DIST') || 15;
    const unit = block.getFieldValue('UNIT') || 'cm';
    return [`(hw.read_ultrasonic_distance(trig=6, echo=19, unit="${unit}") ${op} ${dist})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_onboard_led'] = function(block) {
    const led = block.getFieldValue('LED');
    const state = block.getFieldValue('STATE');
    if (led === 'BOTH') {
      if (state === 'ON') return `Pin(47, Pin.OUT).value(1); Pin(48, Pin.OUT).value(1)\n`;
      if (state === 'OFF') return `Pin(47, Pin.OUT).value(0); Pin(48, Pin.OUT).value(0)\n`;
      return `Pin(47, Pin.OUT).value(not Pin(47).value()); Pin(48, Pin.OUT).value(not Pin(48).value())\n`;
    }
    if (state === 'ON') return `Pin(${led}, Pin.OUT).value(1)\n`;
    if (state === 'OFF') return `Pin(${led}, Pin.OUT).value(0)\n`;
    return `_p = Pin(${led}, Pin.OUT); _p.value(not _p.value())\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_tone'] = function(block) {
    const tone = block.getFieldValue('TONE');
    if (tone === 'STARTUP') return `hw.play_startup_tone()\n`;
    if (tone === 'RUN') return `hw.play_run_tone()\n`;
    if (tone === 'CONNECTED') return `hw.play_connect_tone()\n`;
    if (tone === 'DISCONNECTED') return `hw.play_disconnect_tone()\n`;
    if (tone === 'ERROR') return `hw.play_error_tone()\n`;
    if (tone === 'STOP') return `hw.play_stop_tone()\n`;
    return `hw.play_confirmation_tone()\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_freq'] = function(block) {
    const freq = block.getFieldValue('FREQ') || 1000;
    const dur = block.getFieldValue('DURATION') || 200;
    return `getattr(hw, 'play_buzzer_freq', lambda f, d: hw.play_confirmation_tone())(${freq}, ${dur})\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_stop'] = function(block) {
    return `getattr(hw, 'stop_buzzer', lambda: None)()\n`;
  };

  // ================= 4. DISPLAY =================
  pythonGenerator.forBlock['titan_oled_init'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'SH1106';
    const isSh1106 = (type === 'SH1106') ? 'True' : 'False';
    return `global _oled_global, oled\n_oled_global = _TitanOLED(is_sh1106=${isSh1106})\noled = _oled_global\n`;
  };

  pythonGenerator.forBlock['titan_oled_text'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `_get_oled().print_text(str(${text}), ${x}, ${y}, size=${size})\n_get_oled().show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_clear'] = function(block) {
    return `_get_oled().fill(0)\n_get_oled().show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_show_sensor'] = function(block) {
    const pin = block.getFieldValue('SENSOR') || '2';
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `_get_oled().print_text("S" + str(${pin}) + ": " + str(ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()), ${x}, ${y}, size=${size})\n_get_oled().show()\n`;
  };

  // Push Button Generators (GPIO 39 - 42)
  pythonGenerator.forBlock['titan_button_is_pressed'] = function(block) {
    const btn = block.getFieldValue('BUTTON') || '39';
    return [`(Pin(${btn}, Pin.IN, Pin.PULL_UP).value() == 0)`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_wait_for_button'] = function(block) {
    const btn = block.getFieldValue('BUTTON') || '39';
    return `while Pin(${btn}, Pin.IN, Pin.PULL_UP).value() != 0:\n    time.sleep_ms(20)\n`;
  };

  pythonGenerator.forBlock['titan_oled_show'] = function(block) {
    return `_get_oled().show()\n`;
  };

  // ================= 5. WIRELESS & SERIAL =================
  pythonGenerator.forBlock['titan_wifi_connect'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect("${ssid}", "${pass}")\n`;
  };

  pythonGenerator.forBlock['titan_wifi_ap'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nap = network.WLAN(network.AP_IF)\nap.config(essid="${ssid}", password="${pass}", authmode=network.AUTH_WPA_WPA2_PSK)\nap.active(True)\n`;
  };

  pythonGenerator.forBlock['titan_ble_send'] = function(block) {
    const data = pythonGenerator.valueToCode(block, 'DATA', Order.NONE) || "''";
    return `hw.ble_send(str(${data}))\n`;
  };

  pythonGenerator.forBlock['titan_uart_send'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const baud = block.getFieldValue('BAUD') || 115200;
    return `_uart = UART(1, baudrate=${baud}, tx=17, rx=18)\n_uart.write(str(${text}) + '\\r\\n')\n`;
  };
}

const OLED_DRIVER_CODE = `import framebuf
class _TitanOLED(framebuf.FrameBuffer):
  def __init__(self, is_sh1106=True):
    self.is_sh1106 = is_sh1106
    self.addr = 0x3C
    self.buf = bytearray(1024)
    super().__init__(self.buf, 128, 64, framebuf.MONO_VLSB)
    try:
      self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)
    except Exception:
      try: self.i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
      except Exception: self.i2c = None
    if self.i2c:
      for c in (0xAE,0x20,0x00,0x40,0xA1,0xC8,0x81,0xCF,0xA6,0xA8,0x3F,0xD3,0x00,0xD5,0x80,0xD9,0xF1,0xDA,0x12,0xDB,0x40,0x8D,0x14,0xAF):
        try: self.i2c.writeto(self.addr, bytearray([0x80, c]))
        except Exception: pass
      self.fill(0)
      self.show()
  def print_text(self, s, x, y, size=1, col=1):
    s = str(s)
    if size <= 1:
      super().text(s, x, y, col)
    else:
      _w = len(s) * 8
      _tmp = bytearray((_w * 8 + 7) // 8)
      _tb = framebuf.FrameBuffer(_tmp, _w, 8, framebuf.MONO_VLSB)
      _tb.fill(0)
      _tb.text(s, 0, 0, 1)
      for px in range(_w):
        for py in range(8):
          if _tb.pixel(px, py):
            for dx in range(size):
              for dy in range(size):
                if 0 <= x + px * size + dx < 128 and 0 <= y + py * size + dy < 64:
                  self.pixel(x + px * size + dx, y + py * size + dy, col)
  def show(self):
    if not self.i2c: return
    try:
      if self.is_sh1106:
        for p in range(8):
          self.i2c.writeto(self.addr, bytearray([0x80, 0xB0 + p, 0x80, 0x02, 0x80, 0x10]))
          self.i2c.writeto(self.addr, b'\\x40' + self.buf[128*p:128*(p+1)])
      else:
        self.i2c.writeto(self.addr, bytearray([0x80, 0x21, 0x80, 0, 0x80, 127, 0x80, 0x22, 0x80, 0, 0x80, 7]))
        self.i2c.writeto(self.addr, b'\\x40' + self.buf)
    except Exception: pass

_oled_global = None
def _get_oled():
  global _oled_global
  if _oled_global is None:
    try: _oled_global = _TitanOLED()
    except Exception: pass
  return _oled_global
`;

const PULSE_DRIVER_CODE = `class _SparkFunHeartRate:
  def __init__(self):
    self.ir_ac_max = 20
    self.ir_ac_min = -20
    self.ir_ac_signal_current = 0
    self.ir_ac_signal_previous = 0
    self.ir_ac_signal_min = 0
    self.ir_ac_signal_max = 0
    self.ir_avg_reg = 0
    self.positive_edge = 0
    self.negative_edge = 0

  def check_for_beat(self, sample):
    beat_detected = False
    self.ir_ac_signal_previous = self.ir_ac_signal_current
    self.ir_avg_reg = int((self.ir_avg_reg * 15 + sample) / 16)
    self.ir_ac_signal_current = sample - self.ir_avg_reg

    if (self.ir_ac_signal_previous < 0 and self.ir_ac_signal_current >= 0):
      self.ir_ac_max = self.ir_ac_signal_max
      self.ir_ac_min = self.ir_ac_signal_min
      self.positive_edge = 1
      self.negative_edge = 0
      self.ir_ac_signal_max = 0
      if (self.ir_ac_max - self.ir_ac_min) > 20 and (self.ir_ac_max - self.ir_ac_min) < 1000:
        beat_detected = True

    if (self.ir_ac_signal_previous > 0 and self.ir_ac_signal_current <= 0):
      self.positive_edge = 0
      self.negative_edge = 1
      self.ir_ac_signal_min = 0

    if self.positive_edge and (self.ir_ac_signal_current > self.ir_ac_signal_max):
      self.ir_ac_signal_max = self.ir_ac_signal_current

    if self.negative_edge and (self.ir_ac_signal_current < self.ir_ac_signal_min):
      self.ir_ac_signal_min = self.ir_ac_signal_current

    return beat_detected

class _TitanPulse:
  def __init__(self, addr=0x57):
    self.addr = addr
    self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)
    self.chip_type = "UNKNOWN"
    self.detector = _SparkFunHeartRate()
    self.finger_detected = False
    self.finger_detected_at = 0
    self.last_beat_anchor = 0
    self.current_bpm = 0.0
    self.average_bpm = 0
    self.bpm_history = [0, 0, 0, 0]
    self.bpm_index = 0
    self.bpm_count = 0
    self.latest_ir = 0
    self.latest_red = 0
    self.init_sensor()

  def _w(self, reg, val):
    self.i2c.writeto_mem(self.addr, reg, bytearray([val]))

  def _r(self, reg, n=1):
    return self.i2c.readfrom_mem(self.addr, reg, n)

  def init_sensor(self):
    part_id = 0
    try: part_id = self._r(0xFF, 1)[0]
    except Exception: pass

    if part_id in (0x15, 0x25):
      self.chip_type = "MAX30102"
      try:
        self._w(0x09, 0x40)
        time.sleep_ms(100)
        self._w(0x08, 0x30)
        self._w(0x09, 0x03)
        self._w(0x0A, 0x27)
        self._w(0x0C, 0x1F)
        self._w(0x0D, 0x3C)
        self._w(0x04, 0x00)
        self._w(0x05, 0x00)
        self._w(0x06, 0x00)
      except Exception: pass
    else:
      self.chip_type = "MAX30100"
      try:
        self._w(0x06, 0x40)
        time.sleep_ms(100)
        self._w(0x07, 0x03)
        self._w(0x09, 0x33)
        self._w(0x06, 0x03)
      except Exception: pass

  def _process_sample(self, ir, red, now):
    self.latest_ir = ir
    self.latest_red = red

    # Finger placement state (Hysteresis: ON >= 10000, OFF <= 4000)
    if not self.finger_detected:
      if ir >= 10000:
        self.finger_detected = True
        self.finger_detected_at = now
        self.last_beat_anchor = 0
        self.current_bpm = 0.0
        self.average_bpm = 0
        self.bpm_history = [0, 0, 0, 0]
        self.bpm_count = 0
    else:
      if ir <= 4000:
        self.finger_detected = False
        self.last_beat_anchor = 0
        self.current_bpm = 0.0
        self.average_bpm = 0

    if self.finger_detected:
      if self.detector.check_for_beat(ir):
        if time.ticks_diff(now, self.finger_detected_at) >= 1200:
          if self.last_beat_anchor == 0:
            self.last_beat_anchor = now
          else:
            interval = time.ticks_diff(now, self.last_beat_anchor)
            if 400 <= interval <= 1333:
              self.last_beat_anchor = now
              self.current_bpm = 60000.0 / interval
              self.bpm_history[self.bpm_index] = int(self.current_bpm + 0.5)
              self.bpm_index = (self.bpm_index + 1) % 4
              if self.bpm_count < 4: self.bpm_count += 1
              self.average_bpm = int(sum(self.bpm_history[:self.bpm_count]) / self.bpm_count)
            elif interval > 1333:
              self.last_beat_anchor = now

  def update(self):
    now = time.ticks_ms()
    if time.ticks_diff(now, getattr(self, '_last_call', 0)) < 5:
      return
    self._last_call = now

    try:
      if self.chip_type == "MAX30102":
        wr = self._r(0x04, 1)[0]
        rd = self._r(0x06, 1)[0]
        n = (wr - rd) & 0x1F
        if n == 0: n = 1
        raw = self._r(0x07, n * 6)
        for i in range(n):
          off = i * 6
          ir = (raw[off+3] << 16 | raw[off+4] << 8 | raw[off+5]) & 0x03FFFF
          red = (raw[off+0] << 16 | raw[off+1] << 8 | raw[off+2]) & 0x03FFFF
          if ir == 0: ir = (raw[off+2] << 8) | raw[off+3]
          self._process_sample(ir, red, now)
      else:
        wr = self._r(0x02, 1)[0]
        rd = self._r(0x04, 1)[0]
        n = (wr - rd) & 0x0F
        if n == 0: n = 1
        raw = self._r(0x05, n * 4)
        for i in range(n):
          off = i * 4
          ir = (raw[off+0] << 8) | raw[off+1]
          red = (raw[off+2] << 8) | raw[off+3]
          self._process_sample(ir, red, now)
    except Exception:
      pass

_pulse_inst = None
def _get_pulse():
  global _pulse_inst
  if _pulse_inst is None: _pulse_inst = _TitanPulse()
  return _pulse_inst

def _init_pulse():
  _get_pulse().init_sensor()

def _read_pulse(val_type='IR'):
  p = _get_pulse()
  p.update()
  if val_type == 'IR': return p.latest_ir
  if val_type == 'RED': return p.latest_red
  if val_type == 'FINGER': return p.finger_detected
  return p.average_bpm
`;

export function generateTitanWorkspaceCode(workspace) {
  if (!workspace) return '';
  
  const allBlocks = workspace.getAllBlocks(false);
  const hasOled = allBlocks.some(b => b.type && b.type.startsWith('titan_oled'));
  const hasPulse = allBlocks.some(b => b.type && b.type.startsWith('titan_pulse'));

  const topBlocks = workspace.getTopBlocks(true);
  const titanStartBlock = topBlocks.find(b => b.type === 'titan_start');
  const projectInfoBlock = topBlocks.find(b => b.type === 'project_info');

  let code = '';
  if (projectInfoBlock) {
    code += pythonGenerator.blockToCode(projectInfoBlock) + '\n';
  }

  if (hasOled) {
    code += OLED_DRIVER_CODE + '\n';
  }

  if (hasPulse) {
    code += PULSE_DRIVER_CODE + '\n';
  }

  if (titanStartBlock) {
    code += pythonGenerator.blockToCode(titanStartBlock);
  } else {
    code += pythonGenerator.workspaceToCode(workspace);
  }

  return code;
}
