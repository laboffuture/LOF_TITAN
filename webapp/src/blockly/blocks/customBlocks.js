import * as Blockly from 'blockly';

export function registerCustomBlocks() {
  // ================= 1. TITAN BASE / START BLOCK (SCRATCH FLAG EQUIVALENT) =================
  Blockly.Blocks['titan_start'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🚀")
          .appendField("TITAN")
          .appendField("Start");
      this.appendStatementInput("DO")
          .setCheck(null);
      this.setStyle('project_blocks');
      this.setTooltip("Base starting block for LOF Titan Rover (Equivalent to Scratch Green Flag)");
      this.setHelpUrl("");
    }
  };

  // Project Info Metadata Block
  Blockly.Blocks['project_info'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Project Info")
          .appendField("ⓘ");
      this.appendDummyInput()
          .appendField("Author")
          .appendField(new Blockly.FieldTextInput("User"), "AUTHOR");
      this.appendDummyInput()
          .appendField("Description")
          .appendField(new Blockly.FieldTextInput("My project"), "DESCRIPTION");
      this.setStyle('project_blocks');
      this.setTooltip("Define project author and description");
      this.setHelpUrl("");
    }
  };

  // Standard Timing Wait Block
  Blockly.Blocks['titan_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Wait")
          .appendField(new Blockly.FieldNumber(1, 0), "TIME")
          .appendField(new Blockly.FieldDropdown([
            ["seconds", "SECONDS"],
            ["milliseconds", "MILLIS"],
            ["microseconds", "MICROS"]
          ]), "UNIT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('timing_blocks');
      this.setTooltip("Pause execution for duration");
      this.setHelpUrl("");
    }
  };

  // Text Print Block
  Blockly.Blocks['titan_print'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck(null)
          .appendField("print");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('text_blocks');
      this.setTooltip("Print value to REPL terminal");
      this.setHelpUrl("");
    }
  };

  // Text string literal with quotes
  Blockly.Blocks['titan_text'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("“")
          .appendField(new Blockly.FieldTextInput("trg"), "TEXT")
          .appendField("”");
      this.setOutput(true, "String");
      this.setStyle('text_blocks');
      this.setTooltip("Text string");
      this.setHelpUrl("");
    }
  };

  // Repeat While Loop
  Blockly.Blocks['titan_repeat_while'] = {
    init: function() {
      this.appendValueInput("BOOL")
          .setCheck("Boolean")
          .appendField("repeat")
          .appendField(new Blockly.FieldDropdown([["while", "WHILE"], ["until", "UNTIL"]]), "MODE");
      this.appendStatementInput("DO")
          .appendField("do");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('loop_blocks');
      this.setTooltip("Loop repeatedly while condition is met");
      this.setHelpUrl("");
    }
  };

  // Number literal
  Blockly.Blocks['titan_number'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldNumber(0), "NUM");
      this.setOutput(true, "Number");
      this.setStyle('math_blocks');
      this.setTooltip("A numerical value");
      this.setHelpUrl("");
    }
  };

  // ================= 2. MOTOR LIBRARY (SPEED, DIRECTION & PINS) =================

  // 1. Motor Single Control (with embedded speed % and direction)
  Blockly.Blocks['titan_motor_control'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Motor")
          .appendField(new Blockly.FieldDropdown([
            ["M1 (GPIO 15, 16)", "M1"],
            ["M2 (GPIO 13, 14)", "M2"],
            ["M3 & M6 (GPIO 11, 12)", "M3"],
            ["M4 & M5 (GPIO 9, 10)", "M4"],
            ["M5 (Parallel with M4)", "M5"],
            ["M6 (Parallel with M3)", "M6"]
          ]), "MOTOR")
          .appendField("direction")
          .appendField(new Blockly.FieldDropdown([
            ["Forward ⏩", "FORWARD"],
            ["Backward ⏪", "BACKWARD"]
          ]), "DIR")
          .appendField("speed")
          .appendField(new Blockly.FieldNumber(80, 0, 100), "SPEED")
          .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Control motor channel direction and speed (0-100%)");
      this.setHelpUrl("");
    }
  };

  // 2. Motor with Variable Speed Input (e.g. from sensor or math calculation)
  Blockly.Blocks['titan_motor_speed_var'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Motor")
          .appendField(new Blockly.FieldDropdown([
            ["M1 (GPIO 15, 16)", "M1"],
            ["M2 (GPIO 13, 14)", "M2"],
            ["M3 & M6 (GPIO 11, 12)", "M3"],
            ["M4 & M5 (GPIO 9, 10)", "M4"],
            ["M5 (Parallel with M4)", "M5"],
            ["M6 (Parallel with M3)", "M6"]
          ]), "MOTOR")
          .appendField("direction")
          .appendField(new Blockly.FieldDropdown([
            ["Forward ⏩", "FORWARD"],
            ["Backward ⏪", "BACKWARD"]
          ]), "DIR");
      this.appendValueInput("SPEED_INPUT")
          .setCheck("Number")
          .appendField("set speed");
      this.setInputsInline(true);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Set motor speed using a variable or sensor calculation");
      this.setHelpUrl("");
    }
  };

  // 3. Custom Motor Pins (Pin A PWM & Pin B)
  Blockly.Blocks['titan_motor_custom_pins'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Motor Pins")
          .appendField("Pin A")
          .appendField(new Blockly.FieldDropdown([
            ["GPIO 15 (M1_A)", "15"],
            ["GPIO 13 (M2_A)", "13"],
            ["GPIO 11 (M3_A)", "11"],
            ["GPIO 9 (M4_A)", "9"],
            ["GPIO 2 (S1)", "2"],
            ["GPIO 1 (S2)", "1"],
            ["GPIO 3 (S3)", "3"],
            ["GPIO 4 (S4)", "4"],
            ["GPIO 5 (S5)", "5"]
          ]), "PIN_A")
          .appendField("Pin B")
          .appendField(new Blockly.FieldDropdown([
            ["GPIO 16 (M1_B)", "16"],
            ["GPIO 14 (M2_B)", "14"],
            ["GPIO 12 (M3_B)", "12"],
            ["GPIO 10 (M4_B)", "10"],
            ["GPIO 2 (S1)", "2"],
            ["GPIO 1 (S2)", "1"],
            ["GPIO 3 (S3)", "3"],
            ["GPIO 4 (S4)", "4"],
            ["GPIO 5 (S5)", "5"]
          ]), "PIN_B")
          .appendField("direction")
          .appendField(new Blockly.FieldDropdown([
            ["Forward ⏩", "FORWARD"],
            ["Backward ⏪", "BACKWARD"]
          ]), "DIR")
          .appendField("speed")
          .appendField(new Blockly.FieldNumber(80, 0, 100), "SPEED")
          .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Drive custom motor bridge with explicit GPIO pin selection");
      this.setHelpUrl("");
    }
  };

  // 4. Dual Drive Rover Movement
  Blockly.Blocks['titan_motor_dual_drive'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Drive Rover")
          .appendField(new Blockly.FieldDropdown([
            ["Forward ⬆️", "FORWARD"],
            ["Backward ⬇️", "BACKWARD"],
            ["Turn Left ⬅️", "LEFT"],
            ["Turn Right ➡️", "RIGHT"],
            ["Spin Left 🔄", "SPIN_LEFT"],
            ["Spin Right 🔃", "SPIN_RIGHT"]
          ]), "DIRECTION")
          .appendField("at speed")
          .appendField(new Blockly.FieldNumber(80, 0, 100), "SPEED")
          .appendField("%");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Drive differential motors M1 (Left) & M2 (Right)");
      this.setHelpUrl("");
    }
  };

  // 5. Stop Motors Block
  Blockly.Blocks['titan_motor_stop'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Stop")
          .appendField(new Blockly.FieldDropdown([
            ["All Motors", "ALL"],
            ["Motor M1 (GPIO 15, 16)", "M1"],
            ["Motor M2 (GPIO 13, 14)", "M2"],
            ["Motor M3 & M6 (GPIO 11, 12)", "M3"],
            ["Motor M4 & M5 (GPIO 9, 10)", "M4"],
            ["Motor M5 (Parallel with M4)", "M5"],
            ["Motor M6 (Parallel with M3)", "M6"]
          ]), "MOTOR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Brake and stop motor channels");
      this.setHelpUrl("");
    }
  };

  // 6. Servo Motor on Sensor Port
  Blockly.Blocks['titan_servo_angle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set Servo on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField("to angle")
          .appendField(new Blockly.FieldNumber(90, 0, 180), "ANGLE")
          .appendField("°");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('motor_blocks');
      this.setTooltip("Rotate standard servo motor to target angle (0-180°)");
      this.setHelpUrl("");
    }
  };

  // ================= 3. HARDWARE & SENSORS (SEPARATE INTEGER VALUE PIECES) =================
  Blockly.Blocks['titan_sensor_read_analog'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Get analog sensor reading as an integer (0 - 4095)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_sensor_read_digital'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Digital Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Get digital sensor reading as an integer (1 or 0)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_sensor_write_digital'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set Digital Output on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField("to")
          .appendField(new Blockly.FieldDropdown([
            ["HIGH (1)", "1"],
            ["LOW (0)", "0"]
          ]), "STATE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Output HIGH/LOW digital voltage to sensor pin");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_ultrasonic_distance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Ultrasonic Distance (Trig: 6, Echo: 19) in")
          .appendField(new Blockly.FieldDropdown([
            ["cm", "CM"],
            ["inches", "INCHES"],
            ["mm", "MM"]
          ]), "UNIT");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Measure distance using the Ultrasonic Port (GPIO 6 & 19)");
      this.setHelpUrl("");
    }
  };

  // I2C Bus Scanner Block (SDA 7, SCL 8)
  Blockly.Blocks['titan_i2c_scan'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("I2C Scan Devices (SDA: 7, SCL: 8)");
      this.setOutput(true, "Array");
      this.setStyle('machine_blocks');
      this.setTooltip("Scan I2C bus on GPIO 7 (SDA) and GPIO 8 (SCL), returns list of hex addresses");
      this.setHelpUrl("");
    }
  };

  // I2C Read Register Byte
  Blockly.Blocks['titan_i2c_read_byte'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("I2C Read Byte (SDA 7, SCL 8) from Addr")
          .appendField(new Blockly.FieldTextInput("0x3C"), "ADDR")
          .appendField("Reg")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "REG");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Reads one byte from the specified I2C device address and register");
      this.setHelpUrl("");
    }
  };

  // I2C Write Register Byte
  Blockly.Blocks['titan_i2c_write_byte'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("I2C Write Byte (SDA 7, SCL 8) to Addr")
          .appendField(new Blockly.FieldTextInput("0x3C"), "ADDR")
          .appendField("Reg")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "REG")
          .appendField("Val")
          .appendField(new Blockly.FieldNumber(0, 0, 255), "VAL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Writes one byte to the specified I2C device address and register");
      this.setHelpUrl("");
    }
  };

  // Pulse Rate Sensor (MAX30100 / MAX30102)
  Blockly.Blocks['titan_pulse_sensor_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("❤️ Initialize Pulse Sensor (MAX30100)")
          .appendField("(I2C SDA: 7, SCL: 8)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize MAX30100 / MAX30102 pulse oximeter & heart rate sensor on I2C port");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_pulse_sensor_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("❤️ MAX30100 Pulse Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["Heart Rate (BPM)", "BPM"],
            ["Finger Placed? (True/False)", "FINGER"],
            ["IR Value (Raw Reflection)", "IR"],
            ["Red Value (Raw Reflection)", "RED"]
          ]), "VAL");
      this.setOutput(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Read live heart rate (BPM), finger detection, or raw optical values from MAX30100 sensor");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_pulse_finger_detected'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("❤️ Finger Placed on Pulse Sensor?");
      this.setOutput(true, "Boolean");
      this.setStyle('machine_blocks');
      this.setTooltip("Returns True if finger is placed on MAX30100 pulse sensor, False otherwise");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_pulse_oled_ecg'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("❤️ OLED show Live ECG / Pulse Wave")
          .appendField("(MAX30100)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Display live real-time heart rate (BPM) and ECG / pulse cardiac waveform from MAX30100 / MAX30102 on OLED screen");
      this.setHelpUrl("");
    }
  };

  // ================= QMC5883L 3-AXIS COMPASS (I2C 0x0D) =================
  Blockly.Blocks['titan_qmc5883l_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🧭 Initialize QMC5883L Compass (I2C SDA: 7, SCL: 8, Addr: 0x0D)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize QMC5883L 3-axis digital compass & magnetometer sensor on I2C port (Addr: 0x0D)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_qmc5883l_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🧭 QMC5883L Compass")
          .appendField(new Blockly.FieldDropdown([
            ["Heading Angle (0 - 360°)", "HEADING"],
            ["Compass Direction (N, NE, E...)", "DIR"],
            ["Raw X-Axis Field", "X"],
            ["Raw Y-Axis Field", "Y"],
            ["Raw Z-Axis Field", "Z"],
            ["Sensor Temp (°C)", "TEMP"]
          ]), "VAL");
      this.setOutput(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Read electronic compass heading angle (0-360°), 8-point cardinal direction (N, NE, E, SE, S, SW, W, NW), raw magnetometer axes, or temperature");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_qmc5883l_heading'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🧭 Compass Heading Angle (°)");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Get 3-axis electronic compass heading angle between 0° and 360°");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_qmc5883l_direction'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🧭 Compass Cardinal Direction");
      this.setOutput(true, "String");
      this.setStyle('machine_blocks');
      this.setTooltip("Get current 8-point compass cardinal direction string ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')");
      this.setHelpUrl("");
    }
  };

  // ================= MPU6050 6-AXIS IMU GYRO & ACCELEROMETER (I2C 0x68) =================
  Blockly.Blocks['titan_mpu6050_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 Initialize MPU6050 Gyro & Accel")
          .appendField("(I2C SDA: 7, SCL: 8, Addr: 0x68)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize MPU6050 6-axis gyroscope and accelerometer motion tracking sensor on I2C port (Addr: 0x68)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mpu6050_read_accel'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 MPU6050 Acceleration")
          .appendField(new Blockly.FieldDropdown([
            ["X-Axis (g)", "X"],
            ["Y-Axis (g)", "Y"],
            ["Z-Axis (g)", "Z"],
            ["Total G-Force (g)", "TOTAL"]
          ]), "AXIS");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read 3-axis linear acceleration in standard g units (±4g range)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mpu6050_read_gyro'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 MPU6050 Gyroscope")
          .appendField(new Blockly.FieldDropdown([
            ["X-Axis (Roll Rate °/s)", "X"],
            ["Y-Axis (Pitch Rate °/s)", "Y"],
            ["Z-Axis (Yaw Rate °/s)", "Z"]
          ]), "AXIS");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read angular rotational speed along X, Y, or Z axis in degrees per second (°/s)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mpu6050_read_angle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 MPU6050 Tilt Angle")
          .appendField(new Blockly.FieldDropdown([
            ["Pitch Angle (° Tilt Front/Back)", "PITCH"],
            ["Roll Angle (° Tilt Left/Right)", "ROLL"]
          ]), "ANGLE");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read calculated pitch or roll inclination tilt angle in degrees (-90° to +90°)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mpu6050_read_temp'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 MPU6050 Temperature (°C)");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read MPU6050 internal on-chip die temperature in Celsius");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mpu6050_gesture'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📐 MPU6050 detects")
          .appendField(new Blockly.FieldDropdown([
            ["Shake / Impact 💥", "SHAKE"],
            ["Tilt Left ⬅️", "TILT_LEFT"],
            ["Tilt Right ➡️", "TILT_RIGHT"],
            ["Tilt Forward ⬆️", "TILT_FORWARD"],
            ["Tilt Backward ⬇️", "TILT_BACKWARD"],
            ["Free Fall (Zero-G) 🪂", "FREE_FALL"],
            ["Flat / Level ⚖️", "FLAT"]
          ]), "GESTURE");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Returns true if rover orientation, impact, tilt, or motion matches the selected gesture condition");
      this.setHelpUrl("");
    }
  };

  // ================= AMG8833 8x8 IR THERMAL CAMERA (I2C 0x69) =================
  Blockly.Blocks['titan_amg8833_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ Initialize AMG8833 8x8 Thermal Camera (I2C SDA: 7, SCL: 8, Addr: 0x69)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize Panasonic AMG8833 8x8 IR Grid-EYE Thermal Camera sensor on I2C port (Addr: 0x69)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_amg8833_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ AMG8833 Thermal Camera")
          .appendField(new Blockly.FieldDropdown([
            ["Max Temperature (°C)", "MAX"],
            ["Min Temperature (°C)", "MIN"],
            ["Average Temperature (°C)", "AVG"],
            ["Center Temperature (°C)", "CENTER"],
            ["Body Thermistor Temp (°C)", "THERMISTOR"],
            ["8x8 Temperature Array", "PIXELS"]
          ]), "VAL");
      this.setOutput(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Read thermal values across the 64-pixel IR thermal sensor matrix");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_amg8833_read_pixel'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ AMG8833 Pixel Temp at Row")
          .appendField(new Blockly.FieldNumber(1, 1, 8), "ROW")
          .appendField("Col")
          .appendField(new Blockly.FieldNumber(1, 1, 8), "COL")
          .appendField("(°C)");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read infrared temperature of a specific pixel in the 8x8 thermal matrix (Row 1-8, Column 1-8)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_amg8833_heat_detected'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ Thermal Heat Detected? (Max Temp >")
          .appendField(new Blockly.FieldNumber(30, 0, 100), "THRESH")
          .appendField("°C)");
      this.setOutput(true, "Boolean");
      this.setStyle('machine_blocks');
      this.setTooltip("Returns True if any pixel in the 8x8 thermal matrix detects temperature higher than threshold (e.g. human body heat)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_amg8833_oled_heatmap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ Display AMG8833 Thermal Heatmap on OLED Screen");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Render real-time 8x8 thermal heat map with min/max telemetry directly on the I2C OLED display");
      this.setHelpUrl("");
    }
  };

  // ================= AS5600 12-BIT MAGNETIC ROTARY ENCODER (I2C 0x36) =================
  Blockly.Blocks['titan_as5600_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 Initialize AS5600 Magnetic Encoder (I2C SDA: 7, SCL: 8, Addr: 0x36)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize AS5600 12-bit contactless magnetic rotary encoder on I2C port (Addr: 0x36)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_as5600_read_angle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 AS5600 Magnetic Encoder")
          .appendField(new Blockly.FieldDropdown([
            ["Angle in Degrees (0 - 360°)", "DEG"],
            ["Raw 12-Bit Value (0 - 4095)", "RAW"],
            ["Angle in Radians (0 - 2π)", "RAD"]
          ]), "VAL");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read current rotational angle from the AS5600 magnetic encoder in degrees (0-360°), raw 12-bit steps (0-4095), or radians");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_as5600_read_rotations'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 AS5600 Encoder")
          .appendField(new Blockly.FieldDropdown([
            ["Total Revolutions / Turns", "TURNS"],
            ["Total Cumulative Angle (°)", "CUMULATIVE_DEG"],
            ["Rotational Speed (RPM)", "RPM"],
            ["Angular Velocity (°/s)", "DEG_PER_SEC"]
          ]), "VAL");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read continuous multi-turn revolution count, cumulative total rotation angle in degrees, or rotational velocity (RPM / deg/s)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_as5600_reset_zero'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 AS5600 Set Current Position as Zero / Reset Turns");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Set current angle as the software zero reference position and reset revolution count to 0");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_as5600_magnet_status'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 AS5600 Magnet")
          .appendField(new Blockly.FieldDropdown([
            ["Magnet Detected? (True / False)", "IS_DETECTED"],
            ["Magnet Status (Normal / Weak / Strong / Missing)", "STATUS_STR"],
            ["AGC Gain (0 - 255)", "AGC"],
            ["CORDIC Magnitude", "MAGNITUDE"]
          ]), "VAL");
      this.setOutput(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Check magnet detection presence, field strength status, or read the Automatic Gain Control (AGC 0-255)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_as5600_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔄 AS5600")
          .appendField(new Blockly.FieldDropdown([
            ["Angle (°)", "DEG"],
            ["Raw (0-4095)", "RAW"],
            ["Total Turns", "TURNS"],
            ["Speed (RPM)", "RPM"]
          ]), "METRIC")
          .appendField(new Blockly.FieldDropdown([
            [">", "GT"],
            [">=", "GTE"],
            ["<", "LT"],
            ["<=", "LTE"],
            ["==", "EQ"],
            ["!=", "NEQ"]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(180), "VAL");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Compare AS5600 magnetic encoder angle, turns, or speed to a numeric threshold");
      this.setHelpUrl("");
    }
  };

  // Dedicated PIR Motion Sensor Block
  Blockly.Blocks['titan_motion_sensor_check'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🚶 Motion Sensor on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField("Motion Detected?");
      this.setOutput(true, "Boolean");
      this.setStyle('machine_blocks');
      this.setTooltip("Returns True if PIR / Microwave Motion sensor on the specified port detects motion (HIGH / 1)");
      this.setHelpUrl("");
    }
  };

  // ================= MQ-135 AIR QUALITY & HAZARDOUS GAS SENSOR =================
  Blockly.Blocks['titan_mq135_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("☁️ MQ-135 Air Quality on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([
            ["Air Quality (PPM)", "PPM"],
            ["CO2 Equivalent (PPM)", "CO2"],
            ["Smoke / Gas Level", "SMOKE"],
            ["Raw ADC Value (0-4095)", "RAW"],
            ["Sensor Voltage (V)", "VOLT"]
          ]), "VAL");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read Air Quality PPM, CO2 equivalent, Smoke/Gas concentration, or raw ADC voltage from MQ-135 sensor");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mq135_quality_status'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("☁️ MQ-135 Air Quality Status on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN");
      this.setOutput(true, "String");
      this.setStyle('machine_blocks');
      this.setTooltip("Returns real-time air quality rating string: Good / Clean, Moderate, Unhealthy / Poor, or Hazardous / Alert");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mq135_gas_detected'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("☁️ MQ-135 Gas / Smoke Detected? Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField("above")
          .appendField(new Blockly.FieldNumber(800, 100, 10000), "THRESH")
          .appendField("PPM");
      this.setOutput(true, "Boolean");
      this.setStyle('machine_blocks');
      this.setTooltip("Returns True if gas/smoke concentration or air pollution exceeds the given PPM threshold");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mq135_calibrate'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("☁️ Calibrate MQ-135 Sensor Baseline (R0) on Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Calibrate MQ-135 sensor baseline resistance (R0) in clean fresh air (takes ~1 second)");
      this.setHelpUrl("");
    }
  };

  // ================= DHT22 / DHT11 DIGITAL TEMPERATURE & HUMIDITY =================
  Blockly.Blocks['titan_dht_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️")
          .appendField(new Blockly.FieldDropdown([
            ["DHT22 (AM2302)", "DHT22"],
            ["DHT11", "DHT11"]
          ]), "TYPE")
          .appendField("Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"],
            ["GPIO 19 (Echo)", "19"],
            ["GPIO 17", "17"],
            ["GPIO 18", "18"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([
            ["Temperature (°C)", "TEMP_C"],
            ["Temperature (°F)", "TEMP_F"],
            ["Relative Humidity (% RH)", "HUMIDITY"],
            ["Heat Index (°C)", "HEAT_INDEX"]
          ]), "VAL");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read temperature in °C or °F, relative humidity (%), or perceived heat index from DHT22 / DHT11 sensor");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dht_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️")
          .appendField(new Blockly.FieldDropdown([
            ["DHT22 (AM2302)", "DHT22"],
            ["DHT11", "DHT11"]
          ]), "TYPE")
          .appendField("Port")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"],
            ["GPIO 19 (Echo)", "19"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([
            ["Temperature (°C)", "TEMP_C"],
            ["Humidity (%)", "HUMIDITY"]
          ]), "VAL")
          .appendField(new Blockly.FieldDropdown([
            [">", ">"],
            ["<", "<"],
            [">=", ">="],
            ["<=", "<="],
            ["==", "=="]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(30, -40, 125), "VALUE");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Returns True if DHT22 temperature or humidity matches the threshold comparison");
      this.setHelpUrl("");
    }
  };

  // ================= DS18B20 1-WIRE DIGITAL TEMPERATURE SENSOR =================
  Blockly.Blocks['titan_ds18b20_read'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ DS18B20 Temp Probe on")
          .appendField(new Blockly.FieldDropdown([
            ["Port S1 (GPIO 2)", "2"],
            ["Port S2 (GPIO 1)", "1"],
            ["Port S3 (GPIO 3)", "3"],
            ["Port S4 (GPIO 4)", "4"],
            ["Port S5 (GPIO 5)", "5"],
            ["GPIO 19", "19"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([
            ["Temperature (°C)", "TEMP_C"],
            ["Temperature (°F)", "TEMP_F"],
            ["Temperature (Kelvin)", "TEMP_K"]
          ]), "VAL");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Read digital temperature from DS18B20 1-Wire waterproof temperature probe (-55°C to +125°C, 0.0625°C resolution)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_ds18b20_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🌡️ DS18B20 on")
          .appendField(new Blockly.FieldDropdown([
            ["Port S1 (GPIO 2)", "2"],
            ["Port S2 (GPIO 1)", "1"],
            ["Port S3 (GPIO 3)", "3"],
            ["Port S4 (GPIO 4)", "4"],
            ["Port S5 (GPIO 5)", "5"],
            ["GPIO 19", "19"]
          ]), "PIN")
          .appendField("Temp (°C)")
          .appendField(new Blockly.FieldDropdown([
            [">", ">"],
            ["<", "<"],
            [">=", ">="],
            ["<=", "<="],
            ["==", "=="],
            ["!=", "!="]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(30, -55, 125), "VALUE");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Returns True if DS18B20 probe temperature matches the threshold comparison");
      this.setHelpUrl("");
    }
  };

  // Live Sensor Monitor Print Block (Terminal)
  Blockly.Blocks['titan_print_sensor_monitor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📊 Print")
          .appendField(new Blockly.FieldDropdown([
            ["All Sensors Live Summary (S1-S5, Dist, Buttons)", "ALL"],
            ["DHT22 Temp & Humidity (S1)", "DHT22"],
            ["DS18B20 Temp Probe (S1)", "DS18B20"],
            ["MQ-135 Air Quality & Gas (S1)", "MQ135"],
            ["MPU6050 Gyro/Accel/Tilt (0x68)", "MPU6050"],
            ["QMC5883L Compass (0x0D)", "QMC5883L"],
            ["AMG8833 8x8 IR Thermal (0x69)", "AMG8833"],
            ["AS5600 Magnetic Encoder (0x36)", "AS5600"],
            ["Pulse Rate Sensor (MAX30102)", "PULSE"],
            ["Analog Sensor S1 (GPIO 2)", "S1"],
            ["Analog Sensor S2 (GPIO 1)", "S2"],
            ["Analog Sensor S3 (GPIO 3)", "S3"],
            ["Analog Sensor S4 (GPIO 4)", "S4"],
            ["Analog Sensor S5 (GPIO 5)", "S5"],
            ["Ultrasonic Distance", "DIST"],
            ["Push Buttons 1-4 States", "BTNS"],
            ["I2C Scan Detected Addresses", "I2C_SCAN"]
          ]), "TYPE")
          .appendField("to Terminal");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('text_blocks');
      this.setTooltip("Prints real-time sensor telemetry and diagnostics to the Serial Monitor / Console");
      this.setHelpUrl("");
    }
  };

  // Formatted Labeled Print Block
  Blockly.Blocks['titan_print_labeled'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("print label")
          .appendField(new Blockly.FieldTextInput("Sensor reading:"), "LABEL");
      this.appendValueInput("VALUE")
          .setCheck(null)
          .appendField("value");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('text_blocks');
      this.setTooltip("Prints a text label followed by any sensor value, number, or variable to Terminal");
      this.setHelpUrl("");
    }
  };

  // Sensor Condition / Comparison Blocks for While Loops & If Statements
  Blockly.Blocks['titan_sensor_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField(new Blockly.FieldDropdown([
            [">", ">"],
            ["<", "<"],
            [">=", ">="],
            ["<=", "<="],
            ["==", "=="],
            ["!=", "!="]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(500, 0, 4095), "VALUE");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Compare analog sensor value (0-4095) for if conditions and while loops");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_digital_sensor_check'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Digital Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "PIN")
          .appendField("is")
          .appendField(new Blockly.FieldDropdown([
            ["HIGH (1)", "1"],
            ["LOW (0)", "0"]
          ]), "STATE");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Check digital sensor state for if conditions and while loops");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_ultrasonic_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Distance")
          .appendField(new Blockly.FieldDropdown([
            ["<", "<"],
            [">", ">"],
            ["<=", "<="],
            [">=", ">="],
            ["==", "=="]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(15, 0, 400), "DIST")
          .appendField(new Blockly.FieldDropdown([
            ["cm", "cm"],
            ["inch", "inch"]
          ]), "UNIT");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Check if ultrasonic distance meets condition for if / while blocks");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_led'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set Onboard")
          .appendField(new Blockly.FieldDropdown([
            ["LED1 Red (GPIO 47)", "47"],
            ["LED2 Green (GPIO 48)", "48"],
            ["Both LEDs (47 & 48)", "BOTH"]
          ]), "LED")
          .appendField("to")
          .appendField(new Blockly.FieldDropdown([
            ["ON", "ON"],
            ["OFF", "OFF"],
            ["Toggle", "TOGGLE"]
          ]), "STATE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Control onboard LEDs (GPIO 47 / 48)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_buzzer_tone'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buzzer (GPIO 20) play tone")
          .appendField(new Blockly.FieldDropdown([
            ["Startup Fanfare", "STARTUP"],
            ["Run Chime", "RUN"],
            ["Connected Beep", "CONNECTED"],
            ["Disconnected Warning", "DISCONNECTED"],
            ["Error Alert", "ERROR"],
            ["Short Beep", "BEEP"]
          ]), "TONE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Play preset sound tones on onboard buzzer");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_buzzer_melody'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buzzer (GPIO 20) play melody")
          .appendField(new Blockly.FieldDropdown([
            ["Star Wars Theme 🌌", "STAR_WARS"],
            ["Super Mario 🍄", "MARIO"],
            ["Happy Birthday 🎂", "HAPPY_BIRTHDAY"],
            ["Mission Impossible 🕵️", "MISSION_IMPOSSIBLE"],
            ["Cyberpunk Siren 🚨", "CYBERPUNK"],
            ["Victory Fanfare 🏆", "VICTORY"]
          ]), "MELODY");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Play melodic tune on onboard buzzer");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_buzzer_sound_effect'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buzzer (GPIO 20) sound effect")
          .appendField(new Blockly.FieldDropdown([
            ["Laser Zap 🔫", "LASER"],
            ["Jump ⬆️", "JUMP"],
            ["Coin Collect 🪙", "COIN"],
            ["Power Up ⚡", "POWERUP"],
            ["Explosion 💥", "EXPLOSION"],
            ["Warning Alert ⚠️", "ALERT"]
          ]), "EFFECT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Play retro arcade sound effects on onboard buzzer");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_buzzer_freq'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Buzzer (GPIO 20) frequency")
          .appendField(new Blockly.FieldNumber(1000, 10, 10000), "FREQ")
          .appendField("Hz for")
          .appendField(new Blockly.FieldNumber(200, 0, 10000), "DURATION")
          .appendField("ms");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Generate custom audio frequency on buzzer");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_onboard_buzzer_stop'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Stop Buzzer (GPIO 20)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Stop buzzer audio");
      this.setHelpUrl("");
    }
  };

  // ================= 4. DISPLAY (OLED SDA: 7, SCL: 8) =================
  Blockly.Blocks['titan_oled_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Initialize OLED Display")
          .appendField(new Blockly.FieldDropdown([
            ["1.3 inch (SH1106)", "SH1106"],
            ["0.96 inch (SSD1306)", "SSD1306"]
          ]), "TYPE")
          .appendField("(I2C SDA: 7, SCL: 8)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Initialize 1.3-inch (SH1106) or 0.96-inch (SSD1306) OLED display on I2C port");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_print'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck(null)
          .appendField("OLED print");
      this.appendDummyInput()
          .appendField("at X")
          .appendField(new Blockly.FieldNumber(0, 0, 127), "X")
          .appendField("Y")
          .appendField(new Blockly.FieldNumber(0, 0, 63), "Y")
          .appendField("size")
          .appendField(new Blockly.FieldDropdown([
            ["Size 1 (Small 8px)", "1"],
            ["Size 2 (Medium 16px)", "2"],
            ["Size 3 (Large 24px)", "3"]
          ]), "SIZE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Print text on OLED screen with customizable text size (1x, 2x, 3x)");
      this.setHelpUrl("");
    }
  };

  // Alias for backward compatibility
  Blockly.Blocks['titan_oled_text'] = Blockly.Blocks['titan_oled_print'];

  Blockly.Blocks['titan_oled_print_custom'] = {
    init: function() {
      this.appendValueInput("LABEL")
          .setCheck("String")
          .appendField("OLED print label");
      this.appendValueInput("VALUE")
          .setCheck(null)
          .appendField("value");
      this.appendDummyInput()
          .appendField("at X")
          .appendField(new Blockly.FieldNumber(0, 0, 127), "X")
          .appendField("Y")
          .appendField(new Blockly.FieldNumber(0, 0, 63), "Y")
          .appendField("size")
          .appendField(new Blockly.FieldDropdown([
            ["Size 1 (Small 8px)", "1"],
            ["Size 2 (Medium 16px)", "2"],
            ["Size 3 (Large 24px)", "3"]
          ]), "SIZE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Print formatted 'Label: Value' on OLED screen at (X, Y)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_draw_line'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED draw line from X1")
          .appendField(new Blockly.FieldNumber(0, 0, 127), "X1")
          .appendField("Y1")
          .appendField(new Blockly.FieldNumber(0, 0, 63), "Y1")
          .appendField("to X2")
          .appendField(new Blockly.FieldNumber(127, 0, 127), "X2")
          .appendField("Y2")
          .appendField(new Blockly.FieldNumber(63, 0, 63), "Y2")
          .appendField("color")
          .appendField(new Blockly.FieldDropdown([
            ["White ⚪", "1"],
            ["Black ⚫", "0"]
          ]), "COLOR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Draw a straight line between two points on the OLED screen");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_draw_rect'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED draw rect at X")
          .appendField(new Blockly.FieldNumber(0, 0, 127), "X")
          .appendField("Y")
          .appendField(new Blockly.FieldNumber(0, 0, 63), "Y")
          .appendField("width")
          .appendField(new Blockly.FieldNumber(30, 1, 128), "W")
          .appendField("height")
          .appendField(new Blockly.FieldNumber(20, 1, 64), "H")
          .appendField("fill")
          .appendField(new Blockly.FieldDropdown([
            ["Outline 🔲", "0"],
            ["Filled ⬛", "1"]
          ]), "FILL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Draw an outline or filled rectangle on the OLED screen");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_draw_circle'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED draw circle at center X")
          .appendField(new Blockly.FieldNumber(64, 0, 127), "X")
          .appendField("Y")
          .appendField(new Blockly.FieldNumber(32, 0, 63), "Y")
          .appendField("radius")
          .appendField(new Blockly.FieldNumber(10, 1, 64), "R")
          .appendField("fill")
          .appendField(new Blockly.FieldDropdown([
            ["Outline ⭕", "0"],
            ["Filled 🔴", "1"]
          ]), "FILL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Draw an outline or filled circle on the OLED screen");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_clear'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED clear screen");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Clear OLED screen buffer");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_show_sensor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED show Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "SENSOR")
          .appendField("at X")
          .appendField(new Blockly.FieldNumber(0, 0, 127), "X")
          .appendField("Y")
          .appendField(new Blockly.FieldNumber(0, 0, 63), "Y")
          .appendField("size")
          .appendField(new Blockly.FieldDropdown([
            ["Size 1 (Small 8px)", "1"],
            ["Size 2 (Medium 16px)", "2"],
            ["Size 3 (Large 24px)", "3"]
          ]), "SIZE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Display live sensor reading (S1 - S5) on OLED display with custom text size");
      this.setHelpUrl("");
    }
  };

  // ================= 2x16 LIQUID CRYSTAL I2C DISPLAY (LCD 1602) =================
  Blockly.Blocks['titan_lcd1602_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 Initialize LCD 16x2 Display")
          .appendField("Addr:")
          .appendField(new Blockly.FieldDropdown([
            ["0x27 (Default)", "0x27"],
            ["0x3F", "0x3F"],
            ["Auto-detect", "AUTO"]
          ]), "ADDR")
          .appendField("(I2C SDA: 7, SCL: 8)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Initialize 16x2 (2 rows, 16 columns) Liquid Crystal I2C display (PCF8574 backpack)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_print'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck(null)
          .appendField("📟 LCD 16x2 print");
      this.appendDummyInput()
          .appendField("at Col")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL")
          .appendField("Row")
          .appendField(new Blockly.FieldDropdown([
            ["Row 0 (Top)", "0"],
            ["Row 1 (Bottom)", "1"]
          ]), "ROW");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Print text or number on LCD 16x2 screen at specified column (0-15) and row (0-1)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_print_lines'] = {
    init: function() {
      this.appendValueInput("LINE1")
          .setCheck(null)
          .appendField("📟 LCD 16x2 Line 1");
      this.appendValueInput("LINE2")
          .setCheck(null)
          .appendField("Line 2");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Clear and display 2 full lines of text on 16x2 LCD");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_clear'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 LCD 16x2 clear screen");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Clear all characters from the LCD 16x2 screen");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_backlight'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 LCD 16x2 Backlight")
          .appendField(new Blockly.FieldDropdown([
            ["ON 💡", "1"],
            ["OFF 🌑", "0"]
          ]), "STATE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Turn LCD 16x2 I2C LED backlight ON or OFF");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_set_cursor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 LCD 16x2 set cursor Col")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL")
          .appendField("Row")
          .appendField(new Blockly.FieldDropdown([
            ["Row 0 (Top)", "0"],
            ["Row 1 (Bottom)", "1"]
          ]), "ROW");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Move writing cursor to specific column (0-15) and row (0-1)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_scroll'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 LCD 16x2 scroll text")
          .appendField(new Blockly.FieldDropdown([
            ["Left ⬅️", "LEFT"],
            ["Right ➡️", "RIGHT"]
          ]), "DIR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Shift/scroll entire display content one position to the left or right");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_lcd1602_show_sensor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📟 LCD 16x2 show Sensor")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"]
          ]), "SENSOR")
          .appendField("Row")
          .appendField(new Blockly.FieldDropdown([
            ["Row 0 (Top)", "0"],
            ["Row 1 (Bottom)", "1"]
          ]), "ROW")
          .appendField("Col")
          .appendField(new Blockly.FieldNumber(0, 0, 15), "COL");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Display live analog sensor reading (S1 - S5) on 16x2 LCD screen");
      this.setHelpUrl("");
    }
  };

  // ================= PUSH BUTTONS (GPIO 39 - 42) =================
  Blockly.Blocks['titan_button_is_pressed'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Push Button")
          .appendField(new Blockly.FieldDropdown([
            ["Button 1 (GPIO 39)", "39"],
            ["Button 2 (GPIO 40)", "40"],
            ["Button 3 (GPIO 41)", "41"],
            ["Button 4 (GPIO 42)", "42"]
          ]), "BUTTON")
          .appendField("is pressed?");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Check if onboard push button is pressed for if conditions and while loops");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_wait_for_button'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Wait until Push Button")
          .appendField(new Blockly.FieldDropdown([
            ["Button 1 (GPIO 39)", "39"],
            ["Button 2 (GPIO 40)", "40"],
            ["Button 3 (GPIO 41)", "41"],
            ["Button 4 (GPIO 42)", "42"]
          ]), "BUTTON")
          .appendField("is pressed");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Pause execution until the selected push button is pressed");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_oled_show'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("OLED update / show");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('display_blocks');
      this.setTooltip("Refresh OLED display");
      this.setHelpUrl("");
    }
  };

  // ================= 5. WIRELESS & SERIAL =================
  Blockly.Blocks['titan_wifi_connect'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Connect WiFi SSID")
          .appendField(new Blockly.FieldTextInput("LOF_TITAN_WIFI"), "SSID")
          .appendField("Password")
          .appendField(new Blockly.FieldTextInput("12345678"), "PASS");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Connect to WiFi");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_wifi_ap'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Create WiFi Hotspot SSID")
          .appendField(new Blockly.FieldTextInput("TITAN_AP"), "SSID")
          .appendField("Password")
          .appendField(new Blockly.FieldTextInput("12345678"), "PASS");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Create local WiFi Hotspot AP");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_wifi_status'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("WiFi")
          .appendField(new Blockly.FieldDropdown([
            ["is connected?", "IS_CONNECTED"],
            ["IP Address", "IP_ADDR"],
            ["Signal RSSI", "RSSI"]
          ]), "PROPERTY");
      this.setOutput(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Get WiFi connection status or IP address");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_http_get'] = {
    init: function() {
      this.appendValueInput("URL")
          .setCheck("String")
          .appendField("HTTP GET URL");
      this.setOutput(true, "String");
      this.setStyle('iot_blocks');
      this.setTooltip("Send HTTP GET request and return response text");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_http_post'] = {
    init: function() {
      this.appendValueInput("URL")
          .setCheck("String")
          .appendField("HTTP POST URL");
      this.appendValueInput("DATA")
          .setCheck(null)
          .appendField("Payload Data");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Send HTTP POST request with JSON / text data payload");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mqtt_connect'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("MQTT Connect Server")
          .appendField(new Blockly.FieldTextInput("broker.hivemq.com"), "SERVER")
          .appendField("Port")
          .appendField(new Blockly.FieldNumber(1883, 1, 65535), "PORT")
          .appendField("Client ID")
          .appendField(new Blockly.FieldTextInput("titan_rover_01"), "CLIENT_ID");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Connect to MQTT Broker");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mqtt_publish'] = {
    init: function() {
      this.appendValueInput("MSG")
          .setCheck(null)
          .appendField("MQTT Publish Msg");
      this.appendValueInput("TOPIC")
          .setCheck("String")
          .appendField("to Topic");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Publish message payload to MQTT topic");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_mqtt_subscribe'] = {
    init: function() {
      this.appendValueInput("TOPIC")
          .setCheck("String")
          .appendField("MQTT Subscribe to Topic");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Subscribe to MQTT topic for incoming messages");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_ble_send'] = {
    init: function() {
      this.appendValueInput("DATA")
          .setCheck(null)
          .appendField("BLE send message");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Send Bluetooth LE packet");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_uart_send'] = {
    init: function() {
      this.appendValueInput("TEXT")
          .setCheck(null)
          .appendField("UART Port (TX: 17, RX: 18) send");
      this.appendDummyInput()
          .appendField("baud")
          .appendField(new Blockly.FieldDropdown([
            ["115200", "115200"],
            ["9600", "9600"]
          ]), "BAUD");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('iot_blocks');
      this.setTooltip("Transmit serial UART data");
      this.setHelpUrl("");
    }
  };

  // ================= 6. DFPLAYER MINI AUDIO MODULE =================
  Blockly.Blocks['titan_dfplayer_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎵 DFPlayer Mini Init")
          .appendField("TX")
          .appendField(new Blockly.FieldDropdown([
            ["GPIO 17 (Default TX)", "17"],
            ["GPIO 18", "18"],
            ["GPIO 2 (S1)", "2"],
            ["GPIO 1 (S2)", "1"],
            ["GPIO 3 (S3)", "3"],
            ["GPIO 4 (S4)", "4"],
            ["GPIO 5 (S5)", "5"],
            ["GPIO 19", "19"]
          ]), "TX")
          .appendField("RX")
          .appendField(new Blockly.FieldDropdown([
            ["GPIO 18 (Default RX)", "18"],
            ["GPIO 17", "17"],
            ["GPIO 2 (S1)", "2"],
            ["GPIO 1 (S2)", "1"],
            ["GPIO 3 (S3)", "3"],
            ["GPIO 4 (S4)", "4"],
            ["GPIO 5 (S5)", "5"],
            ["GPIO 19", "19"]
          ]), "RX")
          .appendField("Vol")
          .appendField(new Blockly.FieldNumber(20, 0, 30), "VOLUME");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Initialize DFPlayer Mini MP3 module on UART Serial (Default TX: 17, RX: 18) with volume (0-30)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_play_track'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎵 DFPlayer play Track #")
          .appendField(new Blockly.FieldNumber(1, 1, 2999), "TRACK");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Play audio track by number on SD card (1-2999)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_play_folder'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📁 DFPlayer play Folder")
          .appendField(new Blockly.FieldNumber(1, 1, 99), "FOLDER")
          .appendField("Track")
          .appendField(new Blockly.FieldNumber(1, 1, 255), "TRACK");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Play specific track from a folder (e.g. Folder 01, Track 001)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_play_mp3'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎵 DFPlayer play /MP3/ Track")
          .appendField(new Blockly.FieldNumber(1, 1, 9999), "TRACK");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Play 4-digit track in /MP3/ folder (e.g. 0001.mp3)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_play_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("⏳ DFPlayer play Track #")
          .appendField(new Blockly.FieldNumber(1, 1, 2999), "TRACK")
          .appendField("and wait")
          .appendField(new Blockly.FieldNumber(3, 0.1, 3600), "SECONDS")
          .appendField("sec");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Play track and pause program execution for duration in seconds");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_control'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎵 DFPlayer")
          .appendField(new Blockly.FieldDropdown([
            ["Play / Resume ▶️", "PLAY"],
            ["Pause ⏸️", "PAUSE"],
            ["Stop ⏹️", "STOP"],
            ["Next Track ⏭️", "NEXT"],
            ["Previous Track ⏮️", "PREV"],
            ["Volume Up 🔊+", "VOL_UP"],
            ["Volume Down 🔉-", "VOL_DOWN"],
            ["Reset Module 🔄", "RESET"]
          ]), "ACTION");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Control DFPlayer Mini playback and hardware state");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_set_volume'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔊 DFPlayer set Volume")
          .appendField(new Blockly.FieldNumber(20, 0, 30), "VOLUME")
          .appendField("(0-30)");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Set DFPlayer Mini playback volume from 0 (Mute) to 30 (Max)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_volume_change'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔊 DFPlayer Volume")
          .appendField(new Blockly.FieldDropdown([
            ["Increase (+1) 🔊+", "UP"],
            ["Decrease (-1) 🔉-", "DOWN"]
          ]), "DIR");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Step volume up or down by 1 level");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_step_volume'] = Blockly.Blocks['titan_dfplayer_volume_change'];

  Blockly.Blocks['titan_dfplayer_set_eq'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎚️ DFPlayer Equalizer")
          .appendField(new Blockly.FieldDropdown([
            ["Normal", "0"],
            ["Pop", "1"],
            ["Rock", "2"],
            ["Jazz", "3"],
            ["Classic", "4"],
            ["Bass", "5"]
          ]), "EQ");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Select hardware audio equalizer preset");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_loop'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🔁 DFPlayer Loop Mode")
          .appendField(new Blockly.FieldDropdown([
            ["Loop Current Track", "CURRENT"],
            ["Loop All Tracks", "ALL"],
            ["Disable Loop", "DISABLE"]
          ]), "MODE")
          .appendField("Track #")
          .appendField(new Blockly.FieldNumber(1, 1, 2999), "TRACK");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('audio_blocks');
      this.setTooltip("Set repeat/loop playback mode");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_dfplayer_is_busy'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎵 DFPlayer is playing? BUSY Pin")
          .appendField(new Blockly.FieldDropdown([
            ["S1 (GPIO 2)", "2"],
            ["S2 (GPIO 1)", "1"],
            ["S3 (GPIO 3)", "3"],
            ["S4 (GPIO 4)", "4"],
            ["S5 (GPIO 5)", "5"],
            ["GPIO 19 (Echo)", "19"],
            ["Button 1 (GPIO 39)", "39"],
            ["Button 2 (GPIO 40)", "40"]
          ]), "PIN");
      this.setOutput(true, "Boolean");
      this.setStyle('audio_blocks');
      this.setTooltip("Returns true if DFPlayer Mini is actively playing audio (reads Active LOW on BUSY pin)");
      this.setHelpUrl("");
    }
  };

  // ================= GY-53 / VL53L0X LASER TOF DISTANCE SENSOR =================
  Blockly.Blocks['titan_vl53l0x_init'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Initialize Laser ToF Sensor (VL53L0X)")
          .appendField("Offset:")
          .appendField(new Blockly.FieldNumber(-60, -1000, 1000), "OFFSET")
          .appendField(new Blockly.FieldDropdown([
            ["mm", "MM"],
            ["cm", "CM"]
          ]), "UNIT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Initialize VL53L0X laser sensor on I2C (GPIO 7, 8) with calibration offset (+/-)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_vl53l0x_set_offset'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Set Laser Distance Offset (VL53L0X) to")
          .appendField(new Blockly.FieldNumber(-60, -1000, 1000), "OFFSET")
          .appendField(new Blockly.FieldDropdown([
            ["mm", "MM"],
            ["cm", "CM"]
          ]), "UNIT");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Set positive (+) or negative (-) zero calibration offset in mm or cm");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_vl53l0x_read_distance'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Laser Distance (VL53L0X) in")
          .appendField(new Blockly.FieldDropdown([
            ["cm", "CM"],
            ["mm", "MM"],
            ["inches", "INCHES"],
            ["meters (m)", "M"]
          ]), "UNIT");
      this.setOutput(true, "Number");
      this.setStyle('machine_blocks');
      this.setTooltip("Measure distance using VL53L0X / GY-53 Laser Time-of-Flight ranging sensor (30mm to 2000mm)");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_vl53l0x_compare'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Laser Distance (VL53L0X)")
          .appendField(new Blockly.FieldDropdown([
            ["< (Closer than)", "LT"],
            ["<= (At or closer)", "LTE"],
            ["> (Further than)", "GT"],
            [">= (At or further)", "GTE"],
            ["== (Exactly)", "EQ"],
            ["!= (Not equal)", "NEQ"]
          ]), "OP")
          .appendField(new Blockly.FieldNumber(20, 0, 2000), "VAL")
          .appendField(new Blockly.FieldDropdown([
            ["cm", "CM"],
            ["mm", "MM"],
            ["inches", "INCHES"]
          ]), "UNIT");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Compare laser distance measured by VL53L0X to a numeric threshold");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_vl53l0x_target_in_range'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Laser Target Detected between")
          .appendField(new Blockly.FieldNumber(5, 0, 200), "MIN_VAL")
          .appendField("and")
          .appendField(new Blockly.FieldNumber(30, 0, 200), "MAX_VAL")
          .appendField(new Blockly.FieldDropdown([
            ["cm", "CM"],
            ["mm", "MM"]
          ]), "UNIT")
          .appendField("?");
      this.setOutput(true, "Boolean");
      this.setStyle('logic_blocks');
      this.setTooltip("Returns true if an obstacle / target is detected within the specified min and max distance window");
      this.setHelpUrl("");
    }
  };

  Blockly.Blocks['titan_vl53l0x_set_mode'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("🎯 Set Laser Mode (VL53L0X)")
          .appendField(new Blockly.FieldDropdown([
            ["Default / Balanced (33ms)", "BALANCED"],
            ["High Accuracy (200ms)", "HIGH_ACCURACY"],
            ["High Speed / Fast (20ms)", "HIGH_SPEED"],
            ["Long Range (up to 2m)", "LONG_RANGE"]
          ]), "MODE");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setStyle('machine_blocks');
      this.setTooltip("Configure VL53L0X timing budget and measurement mode");
      this.setHelpUrl("");
    }
  };
}

