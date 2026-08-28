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

  // Live Sensor Monitor Print Block (Terminal)
  Blockly.Blocks['titan_print_sensor_monitor'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("📊 Print")
          .appendField(new Blockly.FieldDropdown([
            ["All Sensors Live Summary (S1-S5, Dist, Buttons)", "ALL"],
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

  Blockly.Blocks['titan_oled_text'] = {
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
}
