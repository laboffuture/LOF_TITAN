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

  pythonGenerator.forBlock['titan_pulse_oled_ecg'] = function(block) {
    return `_draw_pulse_oled_ecg()\n`;
  };

  // ================= MPU6050 6-AXIS IMU GYRO & ACCELEROMETER (0x68) =================
  pythonGenerator.forBlock['titan_mpu6050_init'] = function(block) {
    return `_init_mpu6050()\n`;
  };

  pythonGenerator.forBlock['titan_mpu6050_read_accel'] = function(block) {
    const axis = block.getFieldValue('AXIS') || 'TOTAL';
    return [`_read_mpu6050_accel("${axis}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mpu6050_read_gyro'] = function(block) {
    const axis = block.getFieldValue('AXIS') || 'X';
    return [`_read_mpu6050_gyro("${axis}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mpu6050_read_angle'] = function(block) {
    const angle = block.getFieldValue('ANGLE') || 'PITCH';
    return [`_read_mpu6050_angle("${angle}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mpu6050_read_temp'] = function(block) {
    return [`_read_mpu6050_temp()`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mpu6050_gesture'] = function(block) {
    const gesture = block.getFieldValue('GESTURE') || 'SHAKE';
    return [`_check_mpu6050_gesture("${gesture}")`, Order.FUNCTION_CALL];
  };

  // QMC5883L 3-Axis Electronic Compass Generators (0x0D)
  pythonGenerator.forBlock['titan_qmc5883l_init'] = function(block) {
    return `_init_qmc5883l()\n`;
  };

  pythonGenerator.forBlock['titan_qmc5883l_read'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'HEADING';
    if (valType === 'DIR') {
      return [`_read_qmc5883l("DIR")`, Order.FUNCTION_CALL];
    }
    return [`_read_qmc5883l("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_qmc5883l_heading'] = function(block) {
    return [`_read_qmc5883l("HEADING")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_qmc5883l_direction'] = function(block) {
    return [`_read_qmc5883l("DIR")`, Order.FUNCTION_CALL];
  };

  // AMG8833 8x8 IR Grid-EYE Thermal Camera Generators (0x69)
  pythonGenerator.forBlock['titan_amg8833_init'] = function(block) {
    return `_init_amg8833()\n`;
  };

  pythonGenerator.forBlock['titan_amg8833_read'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'MAX';
    return [`_read_amg8833("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_amg8833_read_pixel'] = function(block) {
    const row = block.getFieldValue('ROW') || 1;
    const col = block.getFieldValue('COL') || 1;
    return [`_read_amg8833_pixel(${row}, ${col})`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_amg8833_heat_detected'] = function(block) {
    const thresh = block.getFieldValue('THRESH') ?? 30;
    return [`(_read_amg8833("MAX") > ${thresh})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_amg8833_oled_heatmap'] = function(block) {
    return `_draw_amg8833_oled()\n`;
  };

  // AS5600 12-Bit Magnetic Rotary Encoder Generators (0x36)
  pythonGenerator.forBlock['titan_as5600_init'] = function(block) {
    return `_init_as5600()\n`;
  };

  pythonGenerator.forBlock['titan_as5600_read_angle'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'DEG';
    return [`_read_as5600_angle("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_as5600_read_rotations'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'TURNS';
    return [`_read_as5600_rotations("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_as5600_reset_zero'] = function(block) {
    return `_reset_as5600_zero()\n`;
  };

  pythonGenerator.forBlock['titan_as5600_magnet_status'] = function(block) {
    const valType = block.getFieldValue('VAL') || 'IS_DETECTED';
    return [`_read_as5600_magnet("${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_as5600_compare'] = function(block) {
    const metric = block.getFieldValue('METRIC') || 'DEG';
    const op = block.getFieldValue('OP') || 'GT';
    const val = block.getFieldValue('VAL') ?? 180;
    const opMap = { 'GT': '>', 'GTE': '>=', 'LT': '<', 'LTE': '<=', 'EQ': '==', 'NEQ': '!=' };
    const pyOp = opMap[op] || '>';
    return [`_compare_as5600("${metric}", "${pyOp}", ${val})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_motion_sensor_check'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    return [`(Pin(${pin}, Pin.IN).value() == 1)`, Order.RELATIONAL];
  };

  // ================= MQ-135 AIR QUALITY & HAZARDOUS GAS SENSOR =================
  pythonGenerator.forBlock['titan_mq135_read'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const valType = block.getFieldValue('VAL') || 'PPM';
    return [`_read_mq135_ppm(${pin}, "${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mq135_quality_status'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    return [`_read_mq135_quality(${pin})`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_mq135_gas_detected'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const thresh = block.getFieldValue('THRESH') || 800;
    return [`_check_mq135_gas(${pin}, ${thresh})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_mq135_calibrate'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    return `_calibrate_mq135(${pin})\n`;
  };

  // ================= DHT22 / DHT11 DIGITAL TEMPERATURE & HUMIDITY =================
  pythonGenerator.forBlock['titan_dht_read'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'DHT22';
    const pin = block.getFieldValue('PIN') || '2';
    const valType = block.getFieldValue('VAL') || 'TEMP_C';
    return [`_read_dht(${pin}, "${type}", "${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_dht_compare'] = function(block) {
    const type = block.getFieldValue('TYPE') || 'DHT22';
    const pin = block.getFieldValue('PIN') || '2';
    const valType = block.getFieldValue('VAL') || 'TEMP_C';
    const op = block.getFieldValue('OP') || '>';
    const val = block.getFieldValue('VALUE') ?? 30;
    return [`(_read_dht(${pin}, "${type}", "${valType}") ${op} ${val})`, Order.RELATIONAL];
  };

  // ================= DS18B20 1-WIRE DIGITAL TEMPERATURE SENSOR =================
  pythonGenerator.forBlock['titan_ds18b20_read'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const valType = block.getFieldValue('VAL') || 'TEMP_C';
    return [`_read_ds18b20(${pin}, "${valType}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_ds18b20_compare'] = function(block) {
    const pin = block.getFieldValue('PIN') || '2';
    const op = block.getFieldValue('OP') || '>';
    const val = block.getFieldValue('VALUE') ?? 30;
    return [`(_read_ds18b20(${pin}, "TEMP_C") ${op} ${val})`, Order.RELATIONAL];
  };

  // ================= GY-53 / VL53L0X LASER TOF DISTANCE SENSOR =================
  pythonGenerator.forBlock['titan_vl53l0x_init'] = function(block) {
    const rawOffset = block.getFieldValue('OFFSET') !== null ? Number(block.getFieldValue('OFFSET')) : -60;
    const unit = block.getFieldValue('UNIT') || 'MM';
    const offsetMm = unit === 'CM' ? Math.round(rawOffset * 10) : Math.round(rawOffset);
    return `_vl = _get_vl53l0x()\n_vl.set_offset(${offsetMm})\n`;
  };

  pythonGenerator.forBlock['titan_vl53l0x_set_offset'] = function(block) {
    const rawOffset = block.getFieldValue('OFFSET') !== null ? Number(block.getFieldValue('OFFSET')) : -60;
    const unit = block.getFieldValue('UNIT') || 'MM';
    const offsetMm = unit === 'CM' ? Math.round(rawOffset * 10) : Math.round(rawOffset);
    return `_get_vl53l0x().set_offset(${offsetMm})\n`;
  };

  pythonGenerator.forBlock['titan_vl53l0x_read_distance'] = function(block) {
    const unit = block.getFieldValue('UNIT') || 'CM';
    return [`_get_vl53l0x().read_distance("${unit}")`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_vl53l0x_compare'] = function(block) {
    const opKey = block.getFieldValue('OP') || 'LT';
    const val = block.getFieldValue('VAL') ?? 20;
    const unit = block.getFieldValue('UNIT') || 'CM';
    const opMap = {
      'LT': '<',
      'LTE': '<=',
      'GT': '>',
      'GTE': '>=',
      'EQ': '==',
      'NEQ': '!='
    };
    const op = opMap[opKey] || '<';
    return [`(_get_vl53l0x().read_distance("${unit}") ${op} ${val})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_vl53l0x_target_in_range'] = function(block) {
    const minVal = block.getFieldValue('MIN_VAL') ?? 5;
    const maxVal = block.getFieldValue('MAX_VAL') ?? 30;
    const unit = block.getFieldValue('UNIT') || 'CM';
    return [`(${minVal} <= _get_vl53l0x().read_distance("${unit}") <= ${maxVal})`, Order.RELATIONAL];
  };

  pythonGenerator.forBlock['titan_vl53l0x_set_mode'] = function(block) {
    const mode = block.getFieldValue('MODE') || 'BALANCED';
    return `_get_vl53l0x().set_mode("${mode}")\n`;
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
    } else if (type === 'VL53L0X') {
      return `_vl_dist = _get_vl53l0x().read_distance("CM")\n` +
             `print(f"[VL53L0X LASER TOF] Distance: {_vl_dist:.1f} cm ({_vl_dist*10:.0f} mm)")\n`;
    } else if (type === 'DHT22') {
      return `_dht_t = _read_dht(2, "DHT22", "TEMP_C")\n` +
             `_dht_h = _read_dht(2, "DHT22", "HUMIDITY")\n` +
             `print(f"[DHT22 SENSOR S1] Temp: {_dht_t:.1f}°C | Humidity: {_dht_h:.1f}% RH")\n`;
    } else if (type === 'DS18B20') {
      return `_ds_t = _read_ds18b20(2, "TEMP_C")\n` +
             `print(f"[DS18B20 PROBE S1] Temp: {_ds_t:.2f}°C ({_ds_t*1.8+32.0:.2f}°F)")\n`;
    } else if (type === 'MQ135') {
      return `_mq = _get_mq135(2)\n` +
             `print(f"[MQ-135 AIR QUALITY] PPM: {_mq.read_ppm('PPM'):.1f} | CO2: {_mq.read_ppm('CO2'):.1f} | Status: {_mq.get_air_quality()} | Raw: {_mq.last_adc}")\n`;
    } else if (type === 'MPU6050') {
      return `_m = _get_mpu6050()\n` +
             `_m.update()\n` +
             `print(f"[MPU6050 IMU] Accel: ({_m.ax:.2f}, {_m.ay:.2f}, {_m.az:.2f})g (Tot:{_m.total_g:.2f}g) | Gyro: ({_m.gx:.1f}, {_m.gy:.1f}, {_m.gz:.1f})°/s | Pitch:{_m.pitch}° Roll:{_m.roll}° | Temp:{_m.temp}°C")\n`;
    } else if (type === 'QMC5883L') {
      return `_q = _get_qmc5883l()\n` +
             `_q.update()\n` +
             `print(f"[QMC5883L COMPASS] Heading: {_q.heading}° ({_q.direction}) | X:{_q.x} Y:{_q.y} Z:{_q.z} | Temp: {_q.temp}°C")\n`;
    } else if (type === 'AMG8833') {
      return `_cam = _get_amg8833()\n` +
             `_cam.update()\n` +
             `print(f"[AMG8833 THERMAL] Max: {_cam.max_temp:.1f}°C | Min: {_cam.min_temp:.1f}°C | Avg: {_cam.avg_temp:.1f}°C | Thermistor: {_cam.thermistor:.1f}°C")\n`;
    } else if (type === 'AS5600') {
      return `_enc = _get_as5600()\n` +
             `_enc.update()\n` +
             `print(f"[AS5600 ENCODER] Angle: {_enc.angle:.1f}° | Raw: {_enc.raw_angle} | Turns: {_enc.turns} | RPM: {_enc.rpm:.1f} | Magnet: {_enc.get_status_str()}")\n`;
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
             `_names = {0x0D:"QMC5883L 3-Axis Compass", 0x69:"AMG8833 8x8 IR Thermal", 0x57:"Pulse Rate Sensor (MAX30102/MAX30100)", 0x3C:"OLED (SSD1306/SH1106)", 0x68:"IMU (MPU6050)", 0x29:"ToF Laser (VL53L0X)", 0x36:"Mag Encoder (AS5600)", 0x76:"BMP280 Baro", 0x40:"PCA9685/INA219", 0x48:"ADS1115", 0x27:"LCD 1602", 0x1E:"HMC5883L Compass", 0x23:"BH1750 Light", 0x50:"AT24C32 EEPROM"}\n` +
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

  pythonGenerator.forBlock['titan_onboard_buzzer_melody'] = function(block) {
    const melody = block.getFieldValue('MELODY') || 'STAR_WARS';
    return `_play_titan_melody("${melody}")\n`;
  };

  pythonGenerator.forBlock['titan_onboard_buzzer_sound_effect'] = function(block) {
    const effect = block.getFieldValue('EFFECT') || 'LASER';
    return `_play_titan_sound_effect("${effect}")\n`;
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

  pythonGenerator.forBlock['titan_oled_print'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `_get_oled().print_text(str(${text}), ${x}, ${y}, size=${size})\n_get_oled().show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_text'] = pythonGenerator.forBlock['titan_oled_print'];

  pythonGenerator.forBlock['titan_oled_print_custom'] = function(block) {
    const label = pythonGenerator.valueToCode(block, 'LABEL', Order.NONE) || "''";
    const value = pythonGenerator.valueToCode(block, 'VALUE', Order.NONE) || "''";
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const size = block.getFieldValue('SIZE') || 1;
    return `_get_oled().print_text(str(${label}) + ": " + str(${value}), ${x}, ${y}, size=${size})\n_get_oled().show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_draw_line'] = function(block) {
    const x1 = block.getFieldValue('X1') || 0;
    const y1 = block.getFieldValue('Y1') || 0;
    const x2 = block.getFieldValue('X2') || 127;
    const y2 = block.getFieldValue('Y2') || 63;
    const col = block.getFieldValue('COLOR') || 1;
    return `_get_oled().line(${x1}, ${y1}, ${x2}, ${y2}, ${col})\n_get_oled().show()\n`;
  };

  pythonGenerator.forBlock['titan_oled_draw_rect'] = function(block) {
    const x = block.getFieldValue('X') || 0;
    const y = block.getFieldValue('Y') || 0;
    const w = block.getFieldValue('W') || 30;
    const h = block.getFieldValue('H') || 20;
    const fill = block.getFieldValue('FILL') === '1';
    if (fill) {
      return `_get_oled().fill_rect(${x}, ${y}, ${w}, ${h}, 1)\n_get_oled().show()\n`;
    } else {
      return `_get_oled().rect(${x}, ${y}, ${w}, ${h}, 1)\n_get_oled().show()\n`;
    }
  };

  pythonGenerator.forBlock['titan_oled_draw_circle'] = function(block) {
    const x = block.getFieldValue('X') || 64;
    const y = block.getFieldValue('Y') || 32;
    const r = block.getFieldValue('R') || 10;
    const fill = block.getFieldValue('FILL') === '1' ? 'True' : 'False';
    return `_get_oled().circle(${x}, ${y}, ${r}, c=1, fill=${fill})\n_get_oled().show()\n`;
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

  // ================= 2x16 LIQUID CRYSTAL I2C DISPLAY (LCD 1602) =================
  pythonGenerator.forBlock['titan_lcd1602_init'] = function(block) {
    const addr = block.getFieldValue('ADDR') || '0x27';
    const addrCode = addr === 'AUTO' ? '"AUTO"' : addr;
    return `global _lcd_global, lcd\n_lcd_global = _TitanLCD1602(addr=${addrCode})\nlcd = _lcd_global\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_print'] = function(block) {
    const text = pythonGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
    const col = block.getFieldValue('COL') || 0;
    const row = block.getFieldValue('ROW') || 0;
    return `_get_lcd().print(str(${text}), col=${col}, row=${row})\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_print_lines'] = function(block) {
    const line1 = pythonGenerator.valueToCode(block, 'LINE1', Order.NONE) || "''";
    const line2 = pythonGenerator.valueToCode(block, 'LINE2', Order.NONE) || "''";
    return `_get_lcd().print_lines(str(${line1}), str(${line2}))\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_clear'] = function(block) {
    return `_get_lcd().clear()\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_backlight'] = function(block) {
    const state = block.getFieldValue('STATE') === '1' ? 'True' : 'False';
    return `_get_lcd().backlight(${state})\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_set_cursor'] = function(block) {
    const col = block.getFieldValue('COL') || 0;
    const row = block.getFieldValue('ROW') || 0;
    return `_get_lcd().set_cursor(${col}, ${row})\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_scroll'] = function(block) {
    const dir = block.getFieldValue('DIR') || 'LEFT';
    return dir === 'LEFT' ? `_get_lcd().scroll_left()\n` : `_get_lcd().scroll_right()\n`;
  };

  pythonGenerator.forBlock['titan_lcd1602_show_sensor'] = function(block) {
    const pin = block.getFieldValue('SENSOR') || '2';
    const row = block.getFieldValue('ROW') || 0;
    const col = block.getFieldValue('COL') || 0;
    return `_get_lcd().print("S" + str(${pin}) + ": " + str(ADC(Pin(${pin}), atten=ADC.ATTN_11DB).read()), col=${col}, row=${row})\n`;
  };

  // ================= 5. WIRELESS & SERIAL =================
  pythonGenerator.forBlock['titan_wifi_connect'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nwlan = network.WLAN(network.STA_IF)\nwlan.active(True)\nwlan.connect("${ssid}", "${pass}")\n`;
  };

  pythonGenerator.forBlock['titan_wifi_status'] = function(block) {
    const prop = block.getFieldValue('PROPERTY') || 'IS_CONNECTED';
    if (prop === 'IS_CONNECTED') {
      return [`(network.WLAN(network.STA_IF).isconnected() if 'network' in dir() else False)`, Order.RELATIONAL];
    } else if (prop === 'IP_ADDR') {
      return [`(network.WLAN(network.STA_IF).ifconfig()[0] if 'network' in dir() else '0.0.0.0')`, Order.RELATIONAL];
    } else {
      return [`(network.WLAN(network.STA_IF).status('rssi') if 'network' in dir() else 0)`, Order.RELATIONAL];
    }
  };

  pythonGenerator.forBlock['titan_wifi_ap'] = function(block) {
    const ssid = block.getFieldValue('SSID');
    const pass = block.getFieldValue('PASS');
    return `import network\nap = network.WLAN(network.AP_IF)\nap.config(essid="${ssid}", password="${pass}", authmode=network.AUTH_WPA_WPA2_PSK)\nap.active(True)\n`;
  };

  pythonGenerator.forBlock['titan_http_get'] = function(block) {
    const url = pythonGenerator.valueToCode(block, 'URL', Order.NONE) || "''";
    return [`_http_get(${url})`, Order.FUNCTION_CALL];
  };

  pythonGenerator.forBlock['titan_http_post'] = function(block) {
    const url = pythonGenerator.valueToCode(block, 'URL', Order.NONE) || "''";
    const data = pythonGenerator.valueToCode(block, 'DATA', Order.NONE) || "''";
    return `_http_post(${url}, ${data})\n`;
  };

  pythonGenerator.forBlock['titan_mqtt_connect'] = function(block) {
    const server = block.getFieldValue('SERVER') || 'broker.hivemq.com';
    const port = block.getFieldValue('PORT') || 1883;
    const clientId = block.getFieldValue('CLIENT_ID') || 'titan_rover_01';
    return `_mqtt_connect("${server}", ${port}, "${clientId}")\n`;
  };

  pythonGenerator.forBlock['titan_mqtt_publish'] = function(block) {
    const msg = pythonGenerator.valueToCode(block, 'MSG', Order.NONE) || "''";
    const topic = pythonGenerator.valueToCode(block, 'TOPIC', Order.NONE) || "''";
    return `_mqtt_publish(${topic}, ${msg})\n`;
  };

  pythonGenerator.forBlock['titan_mqtt_subscribe'] = function(block) {
    const topic = pythonGenerator.valueToCode(block, 'TOPIC', Order.NONE) || "''";
    return `_mqtt_subscribe(${topic})\n`;
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

  // ================= 6. DFPLAYER MINI AUDIO MODULE =================
  pythonGenerator.forBlock['titan_dfplayer_init'] = function(block) {
    const tx = block.getFieldValue('TX') || 17;
    const rx = block.getFieldValue('RX') || 18;
    const volume = block.getFieldValue('VOLUME') || 20;
    return `_dfplayer_init(tx=${tx}, rx=${rx}, volume=${volume})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_play_track'] = function(block) {
    const track = block.getFieldValue('TRACK') || 1;
    return `_get_dfplayer().play_track(${track})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_play_folder'] = function(block) {
    const folder = block.getFieldValue('FOLDER') || 1;
    const track = block.getFieldValue('TRACK') || 1;
    return `_get_dfplayer().play_folder(${folder}, ${track})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_play_mp3'] = function(block) {
    const track = block.getFieldValue('TRACK') || 1;
    return `_get_dfplayer().play_mp3(${track})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_play_wait'] = function(block) {
    const track = block.getFieldValue('TRACK') || 1;
    const seconds = block.getFieldValue('SECONDS') || 3;
    return `_get_dfplayer().play_track(${track})\ntime.sleep(${seconds})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_control'] = function(block) {
    const action = block.getFieldValue('ACTION') || 'PLAY';
    switch (action) {
      case 'PLAY': return `_get_dfplayer().play()\n`;
      case 'PAUSE': return `_get_dfplayer().pause()\n`;
      case 'STOP': return `_get_dfplayer().stop()\n`;
      case 'NEXT': return `_get_dfplayer().next()\n`;
      case 'PREV': return `_get_dfplayer().prev()\n`;
      case 'VOL_UP': return `_get_dfplayer().volume_up()\n`;
      case 'VOL_DOWN': return `_get_dfplayer().volume_down()\n`;
      case 'RESET': return `_get_dfplayer().reset()\n`;
      default: return `_get_dfplayer().play()\n`;
    }
  };

  pythonGenerator.forBlock['titan_dfplayer_set_volume'] = function(block) {
    const vol = block.getFieldValue('VOLUME') || 20;
    return `_get_dfplayer().set_volume(${vol})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_volume_change'] = function(block) {
    const dir = block.getFieldValue('DIR') || 'UP';
    if (dir === 'UP') {
      return `_get_dfplayer().volume_up()\n`;
    } else {
      return `_get_dfplayer().volume_down()\n`;
    }
  };

  pythonGenerator.forBlock['titan_dfplayer_step_volume'] = pythonGenerator.forBlock['titan_dfplayer_volume_change'];

  pythonGenerator.forBlock['titan_dfplayer_set_eq'] = function(block) {
    const eq = block.getFieldValue('EQ') || 0;
    return `_get_dfplayer().set_eq(${eq})\n`;
  };

  pythonGenerator.forBlock['titan_dfplayer_loop'] = function(block) {
    const mode = block.getFieldValue('MODE') || 'CURRENT';
    const track = block.getFieldValue('TRACK') || 1;
    if (mode === 'CURRENT') {
      return `_get_dfplayer().loop_track(${track})\n`;
    } else if (mode === 'ALL') {
      return `_get_dfplayer().loop_all(True)\n`;
    } else {
      return `_get_dfplayer().loop_all(False)\n`;
    }
  };

  pythonGenerator.forBlock['titan_dfplayer_is_busy'] = function(block) {
    const pin = block.getFieldValue('PIN') || 2;
    return [`(Pin(${pin}, Pin.IN).value() == 0)`, Order.RELATIONAL];
  };
}

const SHARED_I2C_DRIVER_CODE = `_shared_i2c = None
def _get_shared_i2c():
    global _shared_i2c
    if _shared_i2c is None:
        try:
            _shared_i2c = SoftI2C(sda=Pin(7), scl=Pin(8), freq=100000, timeout=50000)
        except Exception:
            try:
                _shared_i2c = I2C(0, sda=Pin(7), scl=Pin(8), freq=100000)
            except Exception: pass
    return _shared_i2c
`;

const OLED_DRIVER_CODE = `import framebuf
class _TitanOLED(framebuf.FrameBuffer):
  def __init__(self, is_sh1106=True):
    self.is_sh1106 = is_sh1106
    self.addr = 0x3C
    self.buf = bytearray(1024)
    super().__init__(self.buf, 128, 64, framebuf.MONO_VLSB)
    self.i2c = _get_shared_i2c()
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
  def circle(self, cx, cy, r, c=1, fill=False):
    if fill:
      for y in range(-r, r + 1):
        for x in range(-r, r + 1):
          if x*x + y*y <= r*r:
            if 0 <= cx + x < 128 and 0 <= cy + y < 64:
              self.pixel(cx + x, cy + y, c)
    else:
      x, y, err = r, 0, 0
      while x >= y:
        for px, py in ((cx+x, cy+y), (cx+y, cy+x), (cx-y, cy+x), (cx-x, cy+y),
                       (cx-x, cy-y), (cx-y, cy-x), (cx+y, cy-x), (cx+x, cy-y)):
          if 0 <= px < 128 and 0 <= py < 64:
            self.pixel(px, py, c)
        y += 1
        err += 1 + 2*y
        if 2*(err - x) + 1 > 0:
          x -= 1
          err += 1 - 2*x
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

const LCD1602_DRIVER_CODE = `import time
from machine import Pin, SoftI2C, I2C

class _TitanLCD1602:
    def __init__(self, addr=0x27, cols=16, rows=2, sda=7, scl=8):
        self.cols = cols
        self.rows = rows
        self.backlight_state = 0x08
        if addr == "AUTO":
            self.addr = 0x27
        elif isinstance(addr, int):
            self.addr = addr
        else:
            self.addr = int(str(addr), 16 if str(addr).startswith("0x") else 10)
        self.i2c = None
        try:
            self.i2c = SoftI2C(sda=Pin(sda, Pin.OUT), scl=Pin(scl, Pin.OUT), freq=400000, timeout=50000)
            devs = self.i2c.scan()
            if addr == "AUTO" or self.addr not in devs:
                if 0x27 in devs: self.addr = 0x27
                elif 0x3F in devs: self.addr = 0x3F
                elif devs: self.addr = devs[0]
        except Exception:
            try:
                self.i2c = I2C(0, sda=Pin(sda), scl=Pin(scl), freq=100000)
                devs = self.i2c.scan()
                if addr == "AUTO" or self.addr not in devs:
                    if 0x27 in devs: self.addr = 0x27
                    elif 0x3F in devs: self.addr = 0x3F
                    elif devs: self.addr = devs[0]
            except Exception:
                self.i2c = None
        self._init_lcd()

    def _write_byte(self, data):
        if not self.i2c: return
        try: self.i2c.writeto(self.addr, bytes([data | self.backlight_state]))
        except Exception: pass

    def _pulse_enable(self, data):
        self._write_byte(data | 0x04)
        time.sleep_us(500)
        self._write_byte(data & ~0x04)
        time.sleep_us(100)

    def _write_nibble(self, nibble, mode=0):
        byte = (nibble & 0xF0) | mode
        self._write_byte(byte)
        self._pulse_enable(byte)

    def _send(self, value, mode=0):
        self._write_nibble(value & 0xF0, mode)
        self._write_nibble((value << 4) & 0xF0, mode)

    def command(self, cmd):
        self._send(cmd, 0)
        if cmd <= 3: time.sleep_ms(2)

    def write_char(self, char_code):
        self._send(char_code, 1)

    def _init_lcd(self):
        time.sleep_ms(50)
        for _ in range(3):
            self._write_nibble(0x30, 0)
            time.sleep_ms(5)
        self._write_nibble(0x20, 0)
        time.sleep_ms(2)
        self.command(0x28)
        self.command(0x0C)
        self.command(0x06)
        self.command(0x01)
        time.sleep_ms(5)

    def clear(self):
        self.command(0x01)
        time.sleep_ms(2)

    def backlight(self, on=True):
        self.backlight_state = 0x08 if on else 0x00
        self._write_byte(0)

    def set_cursor(self, col, row):
        col = max(0, min(col, self.cols - 1))
        row = max(0, min(row, self.rows - 1))
        row_offsets = [0x00, 0x40, 0x14, 0x54]
        self.command(0x80 | (col + row_offsets[row]))

    def print(self, text, col=None, row=None):
        if col is not None and row is not None:
            self.set_cursor(col, row)
        s = str(text)
        curr_row = row if row is not None else 0
        for char in s:
            if char == '\\n':
                curr_row = (curr_row + 1) % self.rows
                self.set_cursor(0, curr_row)
            else:
                self.write_char(ord(char))

    def print_lines(self, line1="", line2=""):
        self.clear()
        if line1:
            self.set_cursor(0, 0)
            for char in str(line1)[:self.cols]: self.write_char(ord(char))
        if line2:
            self.set_cursor(0, 1)
            for char in str(line2)[:self.cols]: self.write_char(ord(char))

    def scroll_left(self):
        self.command(0x18)

    def scroll_right(self):
        self.command(0x1C)

_lcd_global = None
def _get_lcd(addr=0x27):
    global _lcd_global
    if _lcd_global is None:
        try: _lcd_global = _TitanLCD1602(addr=addr)
        except Exception: pass
    return _lcd_global
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

def _draw_pulse_oled_ecg():
  p = _get_pulse()
  p.update()
  try:
    oled = _get_oled()
    if not oled: return
    oled.fill(0)
    
    # Top status bar
    if p.finger_detected:
      bpm_str = f"BPM:{p.average_bpm}" if p.average_bpm > 0 else "BPM:--"
      oled.print_text(bpm_str, 0, 0, 1)
      oled.print_text("LIVE ECG", 70, 0, 1)
      # Heart indicator
      oled.pixel(122, 1, 1); oled.pixel(124, 1, 1)
      oled.pixel(121, 2, 1); oled.pixel(123, 2, 1); oled.pixel(125, 2, 1)
      oled.pixel(122, 3, 1); oled.pixel(124, 3, 1)
      oled.pixel(123, 4, 1)
    else:
      oled.print_text("BPM:--", 0, 0, 1)
      oled.print_text("NO FINGER", 64, 0, 1)

    oled.hline(0, 10, 128, 1)
    
    # Live Waveform Canvas (Y: 13 to 62, Baseline: 38)
    if not hasattr(p, 'wave_buf'):
      p.wave_buf = [38] * 128
      
    if p.finger_detected:
      ac = getattr(p.detector, 'ir_ac_signal_current', 0)
      y_point = 38 - int(ac * 0.08)
      if y_point < 13: y_point = 13
      if y_point > 62: y_point = 62
      p.wave_buf.pop(0)
      p.wave_buf.append(y_point)
      
      for x in range(127):
        oled.line(x, p.wave_buf[x], x + 1, p.wave_buf[x + 1], 1)
    else:
      p.wave_buf.pop(0)
      p.wave_buf.append(38)
      oled.hline(0, 38, 128, 1)
      oled.print_text("PLACE FINGER", 16, 24, 1)
      oled.print_text("ON SENSOR", 28, 42, 1)
      
    oled.show()
  except Exception:
    pass
`;

const QMC5883L_DRIVER_CODE = `import math, struct
class _TitanQMC5883L:
  def __init__(self, addr=0x0D):
    self.addr = addr
    try:
      self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
    except Exception:
      self.i2c = None
    self.x = 0
    self.y = 0
    self.z = 0
    self.heading = 0.0
    self.direction = "N"
    self.temp = 25.0
    self.init_sensor()

  def _w(self, reg, val):
    if self.i2c:
      try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
      except Exception: pass

  def _r(self, reg, n=1):
    if self.i2c:
      try: return self.i2c.readfrom_mem(self.addr, reg, n)
      except Exception: pass
    return bytearray(n)

  def init_sensor(self):
    self._w(0x0A, 0x80)
    time.sleep_ms(20)
    self._w(0x0B, 0x01)
    self._w(0x09, 0x1D)

  def update(self):
    data = self._r(0x00, 6)
    if len(data) == 6:
      raw_x, raw_y, raw_z = struct.unpack('<hhh', data)
      self.x, self.y, self.z = raw_x, raw_y, raw_z
      rad = math.atan2(self.y, self.x)
      deg = math.degrees(rad)
      if deg < 0: deg += 360.0
      self.heading = round(deg, 1)
      dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
      idx = int((self.heading + 22.5) / 45.0) % 8
      self.direction = dirs[idx]
    t_data = self._r(0x07, 2)
    if len(t_data) == 2:
      raw_t = struct.unpack('<h', t_data)[0]
      self.temp = round(25.0 + (raw_t / 100.0), 1)

_qmc_inst = None
def _get_qmc5883l():
  global _qmc_inst
  if _qmc_inst is None: _qmc_inst = _TitanQMC5883L()
  return _qmc_inst

def _init_qmc5883l():
  _get_qmc5883l().init_sensor()

def _read_qmc5883l(val_type="HEADING"):
  q = _get_qmc5883l()
  q.update()
  if val_type == "HEADING": return q.heading
  if val_type == "DIR": return q.direction
  if val_type == "X": return q.x
  if val_type == "Y": return q.y
  if val_type == "Z": return q.z
  if val_type == "TEMP": return q.temp
  return q.heading
`;

const AMG8833_DRIVER_CODE = `class _TitanAMG8833:
  def __init__(self, addr=0x69):
    self.addr = addr
    try:
      self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
    except Exception:
      self.i2c = None
    self.pixels = [0.0] * 64
    self.thermistor = 25.0
    self.max_temp = 0.0
    self.min_temp = 0.0
    self.avg_temp = 0.0
    self.init_sensor()

  def _w(self, reg, val):
    if self.i2c:
      try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
      except Exception: pass

  def _r(self, reg, n=1):
    if self.i2c:
      try: return self.i2c.readfrom_mem(self.addr, reg, n)
      except Exception: pass
    return bytearray(n)

  def init_sensor(self):
    self._w(0x00, 0x00)
    self._w(0x01, 0x3F)
    self._w(0x02, 0x00)
    time.sleep_ms(50)

  def update(self):
    t_data = self._r(0x0E, 2)
    if len(t_data) == 2:
      raw_t = (t_data[1] << 8) | t_data[0]
      if raw_t & 0x800: raw_t -= 0x1000
      self.thermistor = round(raw_t * 0.0625, 2)
    data = self._r(0x80, 128)
    if len(data) == 128:
      for i in range(64):
        raw = (data[2*i + 1] << 8) | data[2*i]
        if raw & 0x800: raw -= 0x1000
        self.pixels[i] = round(raw * 0.25, 1)
      self.max_temp = max(self.pixels)
      self.min_temp = min(self.pixels)
      self.avg_temp = round(sum(self.pixels) / 64.0, 1)

_amg_inst = None
def _get_amg8833():
  global _amg_inst
  if _amg_inst is None: _amg_inst = _TitanAMG8833()
  return _amg_inst

def _init_amg8833():
  _get_amg8833().init_sensor()

def _read_amg8833(val_type="MAX"):
  cam = _get_amg8833()
  cam.update()
  if val_type == "MAX": return cam.max_temp
  if val_type == "MIN": return cam.min_temp
  if val_type == "AVG": return cam.avg_temp
  if val_type == "CENTER": return round((cam.pixels[27] + cam.pixels[28] + cam.pixels[35] + cam.pixels[36]) / 4.0, 1)
  if val_type == "THERMISTOR": return cam.thermistor
  if val_type == "PIXELS": return cam.pixels
  return cam.max_temp

def _read_amg8833_pixel(row, col):
  cam = _get_amg8833()
  cam.update()
  r = max(1, min(8, int(row))) - 1
  c = max(1, min(8, int(col))) - 1
  return cam.pixels[r * 8 + c]

def _draw_amg8833_oled():
  cam = _get_amg8833()
  cam.update()
  try:
    oled = _TitanOLED()
    oled.fill(0)
    mn, mx = cam.min_temp, cam.max_temp
    diff = mx - mn if mx > mn else 1.0
    for r in range(8):
      for c in range(8):
        val = cam.pixels[r * 8 + c]
        intensity = int(((val - mn) / diff) * 3)
        x0, y0 = c * 8, r * 8
        oled.rect(x0, y0, 7, 7, 1)
        if intensity >= 2:
          oled.fill_rect(x0 + 1, y0 + 1, 5, 5, 1)
        elif intensity == 1:
          oled.pixel(x0 + 2, y0 + 2, 1)
          oled.pixel(x0 + 4, y0 + 4, 1)
    oled.print_text(f"Mx:{mx:.1f}C", 68, 8, 1)
    oled.print_text(f"Mn:{mn:.1f}C", 68, 24, 1)
    oled.print_text(f"Av:{cam.avg_temp:.1f}C", 68, 40, 1)
    oled.show()
  except Exception: pass
`;

const AS5600_DRIVER_CODE = `import math, struct
class _TitanAS5600:
  def __init__(self, addr=0x36):
    self.addr = addr
    try:
      self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=100000, timeout=1000)
    except Exception:
      self.i2c = None
    self.raw_angle = 0
    self.angle = 0.0
    self.rad = 0.0
    self.zero_offset = 0
    self.turns = 0
    self.last_raw = 0
    self.cumulative_deg = 0.0
    self.rpm = 0.0
    self.deg_per_sec = 0.0
    self.last_time_ms = 0
    self.magnet_detected = False
    self.magnet_status = "Unknown"
    self.agc = 0
    self.magnitude = 0
    self.init_sensor()

  def _w(self, reg, val):
    if self.i2c:
      try: self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
      except Exception: pass

  def _r(self, reg, n=1):
    if self.i2c:
      try: return self.i2c.readfrom_mem(self.addr, reg, n)
      except Exception: pass
    return bytearray(n)

  def init_sensor(self):
    self.update()
    self.last_raw = self.raw_angle
    self.last_time_ms = time.ticks_ms()

  def reset_zero(self):
    self.update()
    self.zero_offset = self.raw_angle
    self.turns = 0
    self.cumulative_deg = 0.0

  def update(self):
    raw_data = self._r(0x0C, 2)
    if len(raw_data) == 2:
      raw = ((raw_data[0] & 0x0F) << 8) | raw_data[1]
      self.raw_angle = raw
      adj = (raw - self.zero_offset) % 4096
      self.angle = round((adj * 360.0) / 4096.0, 2)
      self.rad = round((adj * 2.0 * math.pi) / 4096.0, 4)

      diff = raw - self.last_raw
      if diff < -2048:
        self.turns += 1
      elif diff > 2048:
        self.turns -= 1
      self.last_raw = raw

      self.cumulative_deg = round(self.turns * 360.0 + self.angle, 2)

      now = time.ticks_ms()
      dt_ms = time.ticks_diff(now, self.last_time_ms)
      if dt_ms >= 100:
        d_deg = (diff if abs(diff) <= 2048 else (diff - 4096 if diff > 0 else diff + 4096)) * (360.0 / 4096.0)
        self.deg_per_sec = round((d_deg / (dt_ms / 1000.0)), 1)
        self.rpm = round(self.deg_per_sec / 6.0, 1)
        self.last_time_ms = now

    st = self._r(0x0B, 1)
    if len(st) == 1:
      status_byte = st[0]
      md = bool(status_byte & 0x20)
      ml = bool(status_byte & 0x10)
      mh = bool(status_byte & 0x08)
      self.magnet_detected = md
      if not md:
        self.magnet_status = "Magnet Missing"
      elif ml:
        self.magnet_status = "Magnet Weak"
      elif mh:
        self.magnet_status = "Magnet Too Strong"
      else:
        self.magnet_status = "Optimal / Detected"

    agc_data = self._r(0x1A, 1)
    if len(agc_data) == 1:
      self.agc = agc_data[0]

    mag_data = self._r(0x1B, 2)
    if len(mag_data) == 2:
      self.magnitude = ((mag_data[0] & 0x0F) << 8) | mag_data[1]

  def get_status_str(self):
    return self.magnet_status

_as5600_inst = None
def _get_as5600():
  global _as5600_inst
  if _as5600_inst is None: _as5600_inst = _TitanAS5600()
  return _as5600_inst

def _init_as5600():
  _get_as5600().init_sensor()

def _read_as5600_angle(val_type="DEG"):
  enc = _get_as5600()
  enc.update()
  if val_type == "DEG": return enc.angle
  if val_type == "RAW": return enc.raw_angle
  if val_type == "RAD": return enc.rad
  return enc.angle

def _read_as5600_rotations(val_type="TURNS"):
  enc = _get_as5600()
  enc.update()
  if val_type == "TURNS": return enc.turns
  if val_type == "CUMULATIVE_DEG": return enc.cumulative_deg
  if val_type == "RPM": return enc.rpm
  if val_type == "DEG_PER_SEC": return enc.deg_per_sec
  return enc.turns

def _reset_as5600_zero():
  _get_as5600().reset_zero()

def _read_as5600_magnet(val_type="IS_DETECTED"):
  enc = _get_as5600()
  enc.update()
  if val_type == "IS_DETECTED": return enc.magnet_detected
  if val_type == "STATUS_STR": return enc.magnet_status
  if val_type == "AGC": return enc.agc
  if val_type == "MAGNITUDE": return enc.magnitude
  return enc.magnet_detected

def _compare_as5600(metric="DEG", op=">", val=180):
  enc = _get_as5600()
  enc.update()
  curr = enc.angle if metric == "DEG" else (enc.raw_angle if metric == "RAW" else (enc.turns if metric == "TURNS" else enc.rpm))
  v = float(val)
  if op == ">": return curr > v
  if op == ">=": return curr >= v
  if op == "<": return curr < v
  if op == "<=": return curr <= v
  if op == "==": return curr == v
  if op == "!=": return curr != v
  return curr > v
`;

const DFPLAYER_DRIVER_CODE = `class _TitanDFPlayer:
  def __init__(self, uart_id=1, tx=17, rx=18):
    self.uart_id = uart_id
    self.tx = tx
    self.rx = rx
    try:
      self.uart = UART(uart_id, baudrate=9600, tx=tx, rx=rx)
    except Exception:
      try: self.uart = UART(uart_id, baudrate=9600)
      except Exception: self.uart = None
    time.sleep_ms(100)

  def _send_cmd(self, cmd, param1=0, param2=0):
    if not self.uart: return
    buf = bytearray(10)
    buf[0] = 0x7E
    buf[1] = 0xFF
    buf[2] = 0x06
    buf[3] = cmd
    buf[4] = 0x00
    buf[5] = param1 & 0xFF
    buf[6] = param2 & 0xFF
    chk = 0 - (0xFF + 0x06 + cmd + 0x00 + param1 + param2)
    buf[7] = (chk >> 8) & 0xFF
    buf[8] = chk & 0xFF
    buf[9] = 0xEF
    try:
      self.uart.write(buf)
      time.sleep_ms(30)
    except Exception: pass

  def play_track(self, track_num):
    t = int(track_num)
    self._send_cmd(0x03, (t >> 8) & 0xFF, t & 0xFF)

  def play_folder(self, folder, track):
    self._send_cmd(0x0F, int(folder) & 0xFF, int(track) & 0xFF)

  def play_mp3(self, track_num):
    t = int(track_num)
    self._send_cmd(0x12, (t >> 8) & 0xFF, t & 0xFF)

  def play(self):
    self._send_cmd(0x0D, 0, 0)

  def pause(self):
    self._send_cmd(0x0E, 0, 0)

  def stop(self):
    self._send_cmd(0x16, 0, 0)

  def next(self):
    self._send_cmd(0x01, 0, 0)

  def prev(self):
    self._send_cmd(0x02, 0, 0)

  def set_volume(self, vol):
    v = max(0, min(30, int(vol)))
    self._send_cmd(0x06, 0, v)

  def volume_up(self):
    self._send_cmd(0x04, 0, 0)

  def volume_down(self):
    self._send_cmd(0x05, 0, 0)

  def set_eq(self, eq_type):
    self._send_cmd(0x07, 0, int(eq_type) & 0x07)

  def loop_track(self, track_num):
    t = int(track_num)
    self._send_cmd(0x08, (t >> 8) & 0xFF, t & 0xFF)

  def loop_all(self, enable=True):
    self._send_cmd(0x11, 0, 1 if enable else 0)

  def reset(self):
    self._send_cmd(0x0C, 0, 0)
    time.sleep_ms(300)

_df_inst = None
def _get_dfplayer(tx=17, rx=18):
  global _df_inst
  if _df_inst is None: _df_inst = _TitanDFPlayer(uart_id=1, tx=tx, rx=rx)
  return _df_inst

def _dfplayer_init(tx=17, rx=18, volume=20):
  global _df_inst
  _df_inst = _TitanDFPlayer(uart_id=1, tx=int(tx), rx=int(rx))
  _df_inst.set_volume(volume)
`;

const MPU6050_DRIVER_CODE = `import math

class _TitanMPU6050:
  def __init__(self, addr=0x68):
    self.addr = addr
    self.i2c = SoftI2C(sda=Pin(7, Pin.OUT), scl=Pin(8, Pin.OUT), freq=400000, timeout=1000)
    self.ax = 0.0
    self.ay = 0.0
    self.az = 0.0
    self.gx = 0.0
    self.gy = 0.0
    self.gz = 0.0
    self.temp = 0.0
    self.pitch = 0.0
    self.roll = 0.0
    self.total_g = 1.0
    self.init_sensor()

  def _w(self, reg, val):
    try:
      self.i2c.writeto_mem(self.addr, reg, bytearray([val]))
    except Exception: pass

  def _r(self, reg, n):
    try:
      return self.i2c.readfrom_mem(self.addr, reg, n)
    except Exception:
      return bytearray(n)

  def init_sensor(self):
    self._w(0x6B, 0x00)
    time.sleep_ms(30)
    self._w(0x19, 0x00)
    self._w(0x1A, 0x03)
    self._w(0x1B, 0x08)
    self._w(0x1C, 0x08)
    time.sleep_ms(20)

  def update(self):
    data = self._r(0x3B, 14)
    if len(data) == 14:
      def _to_i16(hi, lo):
        v = (hi << 8) | lo
        return v - 65536 if v >= 32768 else v
      raw_ax = _to_i16(data[0], data[1])
      raw_ay = _to_i16(data[2], data[3])
      raw_az = _to_i16(data[4], data[5])
      raw_t  = _to_i16(data[6], data[7])
      raw_gx = _to_i16(data[8], data[9])
      raw_gy = _to_i16(data[10], data[11])
      raw_gz = _to_i16(data[12], data[13])

      self.ax = round(raw_ax / 8192.0, 3)
      self.ay = round(raw_ay / 8192.0, 3)
      self.az = round(raw_az / 8192.0, 3)
      self.total_g = round(math.sqrt(self.ax*self.ax + self.ay*self.ay + self.az*self.az), 3)

      self.gx = round(raw_gx / 65.5, 2)
      self.gy = round(raw_gy / 65.5, 2)
      self.gz = round(raw_gz / 65.5, 2)

      self.temp = round(36.53 + (raw_t / 340.0), 1)

      try:
        self.pitch = round(math.atan2(self.ax, math.sqrt(self.ay*self.ay + self.az*self.az)) * 57.2957795, 1)
        self.roll  = round(math.atan2(self.ay, math.sqrt(self.ax*self.ax + self.az*self.az)) * 57.2957795, 1)
      except Exception: pass

_mpu_inst = None
def _get_mpu6050():
  global _mpu_inst
  if _mpu_inst is None: _mpu_inst = _TitanMPU6050()
  return _mpu_inst

def _init_mpu6050():
  _get_mpu6050().init_sensor()

def _read_mpu6050_accel(axis="TOTAL"):
  m = _get_mpu6050(); m.update()
  if axis == "X": return m.ax
  if axis == "Y": return m.ay
  if axis == "Z": return m.az
  if axis == "TOTAL": return m.total_g
  return m.total_g

def _read_mpu6050_gyro(axis="X"):
  m = _get_mpu6050(); m.update()
  if axis == "X": return m.gx
  if axis == "Y": return m.gy
  if axis == "Z": return m.gz
  return m.gx

def _read_mpu6050_angle(angle="PITCH"):
  m = _get_mpu6050(); m.update()
  if angle == "PITCH": return m.pitch
  if angle == "ROLL": return m.roll
  return m.pitch

def _read_mpu6050_temp():
  m = _get_mpu6050(); m.update()
  return m.temp

def _check_mpu6050_gesture(gesture="SHAKE"):
  m = _get_mpu6050(); m.update()
  if gesture == "SHAKE":
    return (abs(m.gx) > 200 or abs(m.gy) > 200 or abs(m.gz) > 200 or m.total_g > 2.0)
  elif gesture == "TILT_LEFT":
    return m.roll < -25.0
  elif gesture == "TILT_RIGHT":
    return m.roll > 25.0
  elif gesture == "TILT_FORWARD":
    return m.pitch > 25.0
  elif gesture == "TILT_BACKWARD":
    return m.pitch < -25.0
  elif gesture == "FREE_FALL":
    return m.total_g < 0.25
  elif gesture == "FLAT":
    return (abs(m.pitch) < 10.0 and abs(m.roll) < 10.0 and 0.8 <= m.total_g <= 1.2)
  return False
`;

const MQ135_DRIVER_CODE = `class _TitanMQ135:
  def __init__(self, pin=2, r0=76.63, rl=10.0):
    self.pin = int(pin)
    self.r0 = r0
    self.rl = rl
    self.adc = ADC(Pin(self.pin), atten=ADC.ATTN_11DB)
    self.last_adc = 0
    self.last_ppm = 400.0

  def read_raw(self):
    total = 0
    for _ in range(5):
      total += self.adc.read()
      time.sleep_ms(2)
    self.last_adc = total // 5
    return self.last_adc

  def read_voltage(self):
    return round((self.read_raw() / 4095.0) * 3.3, 3)

  def get_rs(self):
    raw = max(1, min(4094, self.read_raw()))
    v_out = (raw / 4095.0) * 3.3
    if v_out <= 0.05: return 999.0
    return ((3.3 - v_out) / v_out) * self.rl

  def read_ppm(self, gas_type="PPM"):
    rs = self.get_rs()
    ratio = rs / self.r0 if self.r0 > 0 else 1.0
    try:
      ppm = 116.602 * (ratio ** -2.769)
      ppm = max(350.0, min(10000.0, ppm))
    except Exception:
      ppm = 400.0
    self.last_ppm = round(ppm, 1)

    if gas_type == "RAW": return self.last_adc
    if gas_type == "VOLT": return self.read_voltage()
    if gas_type == "CO2": return round(ppm, 1)
    if gas_type == "SMOKE": return round(max(0.0, (self.last_adc - 800) * 1.5), 1)
    return self.last_ppm

  def get_air_quality(self):
    ppm = self.read_ppm("PPM")
    if ppm < 600: return "Good / Clean"
    if ppm < 1000: return "Moderate"
    if ppm < 1800: return "Unhealthy / Poor"
    return "Hazardous / Alert"

  def calibrate(self, samples=20):
    total_rs = 0.0
    for _ in range(samples):
      total_rs += self.get_rs()
      time.sleep_ms(50)
    self.r0 = max(1.0, (total_rs / samples) / 3.6)
    return round(self.r0, 2)

_mq135_pool = {}
def _get_mq135(pin=2):
  p = int(pin)
  if p not in _mq135_pool: _mq135_pool[p] = _TitanMQ135(pin=p)
  return _mq135_pool[p]

def _read_mq135_ppm(pin=2, gas_type="PPM"):
  return _get_mq135(pin).read_ppm(gas_type)

def _read_mq135_quality(pin=2):
  return _get_mq135(pin).get_air_quality()

def _check_mq135_gas(pin=2, thresh=800):
  return _get_mq135(pin).read_ppm("PPM") > float(thresh)

def _calibrate_mq135(pin=2):
  return _get_mq135(pin).calibrate()
`;

const DHT_DRIVER_CODE = `import dht

_dht_pool = {}
def _get_dht(pin, dht_type="DHT22"):
  key = (int(pin), dht_type)
  if key not in _dht_pool:
    p = Pin(int(pin))
    if dht_type == "DHT11":
      _dht_pool[key] = (dht.DHT11(p), 0, 0.0, 0.0)
    else:
      _dht_pool[key] = (dht.DHT22(p), 0, 0.0, 0.0)
  return _dht_pool[key]

def _read_dht(pin, dht_type="DHT22", val_type="TEMP_C"):
  key = (int(pin), dht_type)
  sensor, last_t_ms, cached_temp, cached_hum = _get_dht(pin, dht_type)
  now = time.ticks_ms()
  if time.ticks_diff(now, last_t_ms) > 1000 or last_t_ms == 0:
    try:
      sensor.measure()
      cached_temp = sensor.temperature()
      cached_hum = sensor.humidity()
      _dht_pool[key] = (sensor, now, cached_temp, cached_hum)
    except Exception: pass

  if val_type == "TEMP_C": return float(cached_temp)
  if val_type == "TEMP_F": return round(cached_temp * 1.8 + 32.0, 1)
  if val_type == "HUMIDITY": return float(cached_hum)
  if val_type == "HEAT_INDEX":
    t = float(cached_temp); r = float(cached_hum)
    hi = 0.5 * (t + 61.0 + ((t - 68.0) * 1.2) + (r * 0.094))
    return round(hi if t > 20 else t, 1)
  return float(cached_temp)
`;

const DS18B20_DRIVER_CODE = `import onewire, ds18x20

_ds18_pool = {}
def _get_ds18(pin):
  p = int(pin)
  if p not in _ds18_pool:
    try:
      ow = onewire.OneWire(Pin(p))
      ds = ds18x20.DS18X20(ow)
      roms = ds.scan()
      _ds18_pool[p] = (ds, roms, 0, 25.0)
    except Exception:
      _ds18_pool[p] = (None, [], 0, 25.0)
  return _ds18_pool[p]

def _read_ds18b20(pin=2, val_type="TEMP_C"):
  p = int(pin)
  ds, roms, last_t, cached = _get_ds18(p)
  now = time.ticks_ms()
  if ds and (time.ticks_diff(now, last_t) > 750 or last_t == 0):
    try:
      if not roms:
        roms = ds.scan()
      if roms:
        ds.convert_temp()
        time.sleep_ms(30)
        temp = ds.read_temp(roms[0])
        if temp is not None:
          cached = round(float(temp), 2)
          _ds18_pool[p] = (ds, roms, now, cached)
    except Exception: pass

  if val_type == "TEMP_C": return float(cached)
  if val_type == "TEMP_F": return round(cached * 1.8 + 32.0, 2)
  if val_type == "TEMP_K": return round(cached + 273.15, 2)
  return float(cached)
`;

const VL53L0X_DRIVER_CODE = `
# ================= VL53L0X LASER TOF DRIVER (DIRECT NO-CALIBRATION) =================
class VL53L0X:
    """Direct VL53L0X / V2 Laser Distance Driver for MicroPython."""
    def __init__(self, i2c=None, address=0x29, offset_mm=-6):
        self.i2c = i2c if i2c else _get_shared_i2c()
        self.address = address
        self.stop_variable = 0x3C
        self.offset_mm = offset_mm
        self._filtered_mm = None
        self._init_sensor()

    def _w(self, reg, val):
        if not self.i2c: return
        try: self.i2c.writeto_mem(self.address, reg, bytes([val]))
        except: pass

    def _r(self, reg, n=1):
        if not self.i2c: return bytearray(n)
        try: return self.i2c.readfrom_mem(self.address, reg, n)
        except: return bytearray(n)

    def _init_sensor(self):
        if not self.i2c: return
        try:
            self._w(0x89, self._r(0x89)[0] | 0x01)
            self._w(0x88, 0x00); self._w(0x80, 0x01); self._w(0xFF, 0x01); self._w(0x00, 0x00)
            r91 = self._r(0x91)
            if r91 and len(r91) > 0: self.stop_variable = r91[0]
            self._w(0x00, 0x01); self._w(0xFF, 0x00); self._w(0x80, 0x00)
            self._w(0x60, self._r(0x60)[0] | 0x12)
            self._w(0x0A, 0x04); self._w(0x84, self._r(0x84)[0] & ~0x10); self._w(0x0B, 0x01)

            # Auto Zero-Point Calibration (VHV & Phase baseline locks true 0mm reference)
            self._w(0x01, 0xE8)
            self._w(0x01, 0x01); self._cal(0x40) # VHV bias
            self._w(0x01, 0x02); self._cal(0x00) # Phase zero
            self._w(0x01, 0xE8)

            # Start continuous back-to-back measurement
            self._w(0x80, 0x01); self._w(0xFF, 0x01); self._w(0x00, 0x00)
            self._w(0x91, self.stop_variable); self._w(0x00, 0x01); self._w(0xFF, 0x00); self._w(0x80, 0x00)
            self._w(0x00, 0x02)
        except: pass

    def _cal(self, b):
        self._w(0x00, 0x01 | b)
        for _ in range(40):
            if self._r(0x13)[0] & 0x07: break
            time.sleep_ms(2)
        self._w(0x0B, 0x01); self._w(0x00, 0x00)

    def set_offset(self, val):
        self.offset_mm = val

    def _read_raw_mm(self):
        if not self.i2c: return -1
        try:
            for _ in range(40):
                if self._r(0x13)[0] & 0x07: break
                time.sleep_ms(2)
            d = self._r(0x14, 12); self._w(0x0B, 0x01)
            if len(d) >= 12:
                status = (d[0] >> 3) & 0x07
                mm = (d[10] << 8) | d[11]
                if status != 4 and 20 <= mm <= 2000 and mm not in (8190, 8191):
                    return max(0, mm + self.offset_mm)
            return -1
        except: return -1

    def read_distance_mm(self, smooth=True):
        raw = self._read_raw_mm()
        if raw == -1:
            self._filtered_mm = None
            return -1
        if not smooth: return raw
        if self._filtered_mm is None:
            self._filtered_mm = float(raw)
        else:
            diff = abs(raw - self._filtered_mm)
            if diff < 4.5:
                self._filtered_mm = self._filtered_mm * 0.82 + raw * 0.18
            elif diff < 15.0:
                self._filtered_mm = self._filtered_mm * 0.5 + raw * 0.5
            else:
                self._filtered_mm = float(raw)
        return int(round(self._filtered_mm))

    def read_distance(self, unit="CM", smooth=True):
        mm = self.read_distance_mm(smooth=smooth)
        if mm == -1: return -1
        return round(mm / 10.0, 1) if unit == "CM" else round(mm / 25.4, 1) if unit == "INCHES" else round(mm / 1000.0, 2) if unit == "M" else mm

_vl53l0x_instance = None
def _get_vl53l0x():
    global _vl53l0x_instance
    if _vl53l0x_instance is None:
        _vl53l0x_instance = VL53L0X(_get_shared_i2c())
    return _vl53l0x_instance
`;

const BUZZER_MELODIES_CODE = `def _play_titan_melody(name):
    _m = {
        "STAR_WARS": [(440, 500, 50), (440, 500, 50), (440, 500, 50), (349, 350, 50), (523, 150, 50), (440, 500, 50), (349, 350, 50), (523, 150, 50), (440, 650, 50)],
        "MARIO": [(660, 100, 50), (660, 100, 50), (660, 100, 100), (510, 100, 50), (660, 100, 50), (770, 100, 150), (380, 100, 50)],
        "HAPPY_BIRTHDAY": [(262, 250, 50), (262, 250, 50), (294, 500, 50), (262, 500, 50), (349, 500, 50), (330, 1000, 50)],
        "MISSION_IMPOSSIBLE": [(784, 150, 50), (784, 150, 50), (932, 150, 50), (1046, 150, 50), (784, 150, 50), (784, 150, 50), (698, 150, 50), (740, 150, 50)],
        "CYBERPUNK": [(300, 80, 20), (600, 80, 20), (1200, 120, 30), (800, 80, 20), (1500, 200, 50)],
        "VICTORY": [(523, 150, 30), (659, 150, 30), (784, 150, 30), (1046, 400, 50)]
    }
    notes = _m.get(name, [(1000, 200, 50)])
    for f, d, p in notes:
        getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(f, d)
        time.sleep_ms(p)

def _play_titan_sound_effect(name):
    if name == "LASER":
        for f in range(2000, 400, -100):
            getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(f, 10)
    elif name == "JUMP":
        for f in range(400, 1600, 80):
            getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(f, 10)
    elif name == "COIN":
        getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(988, 100)
        getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(1319, 250)
    elif name == "POWERUP":
        for f in (330, 392, 659, 523, 587, 784):
            getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(f, 80)
    elif name == "EXPLOSION":
        for f in range(600, 100, -30):
            getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(f, 15)
    else:
        getattr(hw, 'play_buzzer_freq', lambda freq, dur: None)(1500, 150)
`;

const IOT_DRIVER_CODE = `def _http_get(url):
    try:
        import urequests
        r = urequests.get(url)
        txt = r.text
        r.close()
        return txt
    except Exception as e:
        return str(e)

def _http_post(url, data):
    try:
        import urequests
        r = urequests.post(url, json=data if isinstance(data, dict) else None, data=data if not isinstance(data, dict) else None)
        r.close()
    except Exception: pass

_mqtt_client = None
def _mqtt_connect(server, port=1883, client_id="titan"):
    global _mqtt_client
    try:
        from umqtt.simple import MQTTClient
        _mqtt_client = MQTTClient(client_id, server, port=port)
        _mqtt_client.connect()
    except Exception: pass

def _mqtt_publish(topic, msg):
    global _mqtt_client
    if _mqtt_client:
        try: _mqtt_client.publish(str(topic), str(msg))
        except Exception: pass

def _mqtt_subscribe(topic):
    global _mqtt_client
    if _mqtt_client:
        try: _mqtt_client.subscribe(str(topic))
        except Exception: pass
`;

export function generateTitanWorkspaceCode(workspace) {
  if (!workspace) return '';
  
  const allBlocks = workspace.getAllBlocks(false);
  const hasAmgHeatmap = allBlocks.some(b => b.type === 'titan_amg8833_oled_heatmap');
  const hasPulseEcg = allBlocks.some(b => b.type === 'titan_pulse_oled_ecg');
  const hasOled = allBlocks.some(b => b.type && b.type.startsWith('titan_oled')) || hasAmgHeatmap || hasPulseEcg;
  const hasLcd = allBlocks.some(b => b.type && b.type.startsWith('titan_lcd1602'));
  const hasPulse = allBlocks.some(b => b.type && (b.type.startsWith('titan_pulse') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'PULSE'))) || hasPulseEcg;
  const hasDht = allBlocks.some(b => b.type && (b.type.startsWith('titan_dht') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'DHT22')));
  const hasDs18b20 = allBlocks.some(b => b.type && (b.type.startsWith('titan_ds18b20') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'DS18B20')));
  const hasVl53l0x = allBlocks.some(b => b.type && (b.type.startsWith('titan_vl53l0x') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'VL53L0X')));
  const hasMq135 = allBlocks.some(b => b.type && (b.type.startsWith('titan_mq135') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'MQ135')));
  const hasMpu = allBlocks.some(b => b.type && (b.type.startsWith('titan_mpu6050') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'MPU6050')));
  const hasQmc = allBlocks.some(b => b.type && (b.type.startsWith('titan_qmc5883l') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'QMC5883L')));
  const hasAmg = allBlocks.some(b => b.type && (b.type.startsWith('titan_amg8833') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'AMG8833')));
  const hasAs5600 = allBlocks.some(b => b.type && (b.type.startsWith('titan_as5600') || (b.type === 'titan_print_sensor_monitor' && b.getFieldValue('TYPE') === 'AS5600')));
  const hasDfPlayer = allBlocks.some(b => b.type && b.type.startsWith('titan_dfplayer'));
  const hasBuzzerMelody = allBlocks.some(b => b.type === 'titan_onboard_buzzer_melody' || b.type === 'titan_onboard_buzzer_sound_effect');
  const hasIot = allBlocks.some(b => b.type && (b.type.startsWith('titan_http') || b.type.startsWith('titan_mqtt')));
  const hasI2C = hasOled || hasLcd || hasPulse || hasVl53l0x || hasMpu || hasQmc || hasAmg || hasAs5600;

  const topBlocks = workspace.getTopBlocks(true);
  const titanStartBlock = topBlocks.find(b => b.type === 'titan_start');
  const projectInfoBlock = topBlocks.find(b => b.type === 'project_info');

  let code = '';
  if (projectInfoBlock) {
    code += pythonGenerator.blockToCode(projectInfoBlock) + '\n';
  }

  if (hasI2C) {
    code += SHARED_I2C_DRIVER_CODE + '\n';
  }

  if (hasOled) {
    code += OLED_DRIVER_CODE + '\n';
  }

  if (hasLcd) {
    code += LCD1602_DRIVER_CODE + '\n';
  }

  if (hasBuzzerMelody) {
    code += BUZZER_MELODIES_CODE + '\n';
  }

  if (hasIot) {
    code += IOT_DRIVER_CODE + '\n';
  }

  if (hasPulse) {
    code += PULSE_DRIVER_CODE + '\n';
  }

  if (hasDht) {
    code += DHT_DRIVER_CODE + '\n';
  }

  if (hasDs18b20) {
    code += DS18B20_DRIVER_CODE + '\n';
  }

  if (hasVl53l0x) {
    code += VL53L0X_DRIVER_CODE + '\n';
  }

  if (hasMq135) {
    code += MQ135_DRIVER_CODE + '\n';
  }

  if (hasMpu) {
    code += MPU6050_DRIVER_CODE + '\n';
  }

  if (hasQmc) {
    code += QMC5883L_DRIVER_CODE + '\n';
  }

  if (hasAmg) {
    code += AMG8833_DRIVER_CODE + '\n';
  }

  if (hasAs5600) {
    code += AS5600_DRIVER_CODE + '\n';
  }

  if (hasDfPlayer) {
    code += DFPLAYER_DRIVER_CODE + '\n';
  }

  if (titanStartBlock) {
    code += pythonGenerator.blockToCode(titanStartBlock);
  } else {
    code += pythonGenerator.workspaceToCode(workspace);
  }

  return code;
}
