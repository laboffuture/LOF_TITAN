/**
 * Starting block programs for the component labs.
 *
 * The lab used to draw its blocks as ~300 lines of hand-written divs: a picture
 * of a program that could not be moved, edited, or run. These are the real
 * thing - Blockly workspace JSON, loaded with Blockly.serialization, built from
 * the same blocks Block Studio registers, so the Python generator turns them
 * into the script the lab uploads.
 *
 * A lab with no entry here opens with an empty canvas and the full toolbox,
 * which is the right default: better to let a student build than to invent a
 * program for a component we have no test script for.
 *
 * Field names come from webapp/src/blockly/blocks/customBlocks.js and must match
 * it exactly - a wrong key loads as an empty socket rather than failing loudly.
 */

/** "text" value block - the quoted literal in a print. */
const text = (t) => ({ block: { type: 'titan_text', fields: { TEXT: t } } });

/** Digital sensor read. PIN is the GPIO as a string: S1='2', S2='1', S3='3'. */
const readDigital = (pin) => ({
  block: { type: 'titan_sensor_read_digital', fields: { PIN: pin } },
});

/** Analog sensor read, for sensors that report a range rather than on/off. */
const readAnalog = (pin) => ({
  block: { type: 'titan_sensor_read_analog', fields: { PIN: pin } },
});

/** DS18B20 probe read. VAL picks the unit: TEMP_C, TEMP_F or TEMP_K. */
const readDs18b20 = (pin, val = 'TEMP_C') => ({
  block: { type: 'titan_ds18b20_read', fields: { PIN: pin, VAL: val } },
});

/** Drive one motor. MOTOR is M1..M4, DIR FORWARD or BACKWARD, SPEED a percent. */
const motor = (which, dir, speed) => ({
  type: 'titan_motor_control',
  fields: { MOTOR: which, DIR: dir, SPEED: speed },
});

/**
 * Ultrasonic distance. No PIN field: the block is wired to the dedicated
 * ultrasonic port (Trig 6, Echo 19), so UNIT is all there is to choose.
 */
const readUltrasonic = (unit = 'CM') => ({
  block: { type: 'titan_ultrasonic_distance', fields: { UNIT: unit } },
});

/** Initialise the OLED. SH1106 is the 1.3-inch panel, SSD1306 the 0.96-inch. */
const oledInit = (type = 'SH1106') => ({
  type: 'titan_oled_init',
  fields: { TYPE: type },
});

/** Draw text on the OLED at X,Y. SIZE is a dropdown, so it is a string. */
const oledPrint = (textBlock, x = 0, y = 0, size = '1') => ({
  type: 'titan_oled_print',
  fields: { X: x, Y: y, SIZE: size },
  inputs: { TEXT: textBlock },
});

/** Wake the MPU6050. No fields - the block is fixed to I2C SDA 7 / SCL 8, 0x68. */
const mpuInit = () => ({ type: 'titan_mpu6050_init' });

/** Read one gyroscope axis: X, Y or Z. */
const readGyro = (axis = 'X') => ({
  block: { type: 'titan_mpu6050_read_gyro', fields: { AXIS: axis } },
});

/** Bring up the laser ToF sensor. OFFSET trims the reading in UNIT units. */
const vl53Init = (offset = 0, unit = 'MM') => ({
  type: 'titan_vl53l0x_init',
  fields: { OFFSET: offset, UNIT: unit },
});

/** Laser ToF distance, in CM, MM, INCHES or M. */
const readVl53 = (unit = 'CM') => ({
  block: { type: 'titan_vl53l0x_read_distance', fields: { UNIT: unit } },
});

/** Blockly's built-in boolean literal, when a loop wants an explicit condition. */
const boolTrue = () => ({
  block: { type: 'logic_boolean', fields: { BOOL: 'TRUE' } },
});

/** The header block Block Studio exports; the generator turns it into the
 *  comment banner at the top of the generated Python. */
const projectInfo = (description, author = 'User') => ({
  type: 'project_info',
  x: 36,
  y: 36,
  fields: { AUTHOR: author, DESCRIPTION: description },
});

const print = (value) => ({ type: 'titan_print', inputs: { TEXT: value } });

const wait = (time, unit = 'MILLIS') => ({
  type: 'titan_wait',
  fields: { TIME: time, UNIT: unit },
});

/** Links statement blocks into the next-chain Blockly serialises. */
const chain = (steps) =>
  steps.reduceRight((next, step) => (next ? { ...step, next: { block: next } } : step), null);

/**
 * TITAN Start -> repeat while -> the given steps.
 *
 * BOOL is deliberately left unconnected: the generator falls back to `True`
 * when it is empty, so this produces `while True:` without needing a literal
 * boolean block - and the socket stays open for a student to drop a real
 * condition into.
 */
const loopProgram = (steps) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'titan_start',
        x: 40,
        y: 40,
        inputs: {
          DO: {
            block: {
              type: 'titan_repeat_while',
              fields: { MODE: 'WHILE' },
              inputs: { DO: { block: chain(steps) } },
            },
          },
        },
      },
    ],
  },
});

/** A repeat-while statement block, chainable like any other. */
const loopBlock = (condition, steps) => ({
  type: 'titan_repeat_while',
  fields: { MODE: 'WHILE' },
  inputs: { BOOL: condition, DO: { block: chain(steps) } },
});

/**
 * A workspace shaped like a Block Studio export: a project-info header plus
 * TITAN Start -> setup statements -> repeat while <condition> -> steps. Use
 * this when the program came from an actual .lofproject export, so the lab
 * reproduces it exactly.
 *
 * `setup` is for the one-off statements an export runs before its loop - an
 * OLED init, say - which have to sit inside TITAN Start ahead of the loop
 * rather than inside it.
 */
const exportedProgram = (description, setup, condition, steps) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      projectInfo(description),
      {
        type: 'titan_start',
        x: 468,
        y: 108,
        inputs: {
          DO: { block: chain([...setup, loopBlock(condition, steps)]) },
        },
      },
    ],
  },
});

/** The common case: no setup, straight into the loop. */
const exportedLoopProgram = (description, condition, steps) =>
  exportedProgram(description, [], condition, steps);

/** Keyed by the component id the lab was opened from. */
export const LAB_PROGRAMS = {
  // Reads the three sensor ports in turn and prints each value, so a student can
  // watch the UV reading jump when a UV pen is shone at the sensor.
  'uv-sensor': loopProgram([
    print(text('sensor 1')),
    print(readDigital('2')),
    print(text('sensor 2')),
    print(readDigital('1')),
    print(text('sensor 3')),
    print(readDigital('3')),
    wait(150),
  ]),

  // Water Hunt on Mars. Taken from the Block Studio export of the capacitive
  // soil moisture sensor test: read the analog value on S1 once a second and
  // print it, so a student can watch the reading move between a dry and a
  // moist sample. Analog, not digital - this sensor reports a range.
  'moisture-sensor': exportedLoopProgram(
    'capacitive soil moisture sensor test code',
    boolTrue(),
    [print(readAnalog('2')), wait(1, 'SECONDS')],
  ),

  // Water Hunt on Mars, from the Block Studio export of the DS18B20 probe
  // test: print the probe temperature in Celsius once a second. The generator
  // emits the OneWire scan, the 750 ms conversion wait and the cached-reading
  // pool, so this one block carries a good deal of driver code with it.
  //
  // NOTE: anti-icing-systems also has a DS18B20, but under the component id
  // 'ds18b20-sensor', so it does NOT pick this up. Add that key too if the
  // same starting program suits it.
  'ds18b20': exportedLoopProgram(
    'DS18B20 temp probe test code',
    boolTrue(),
    [print(readDs18b20('2', 'TEMP_C')), wait(1, 'SECONDS')],
  ),

  // Water Hunt on Mars, from the Block Studio export of the motor test: drive
  // M1 forward at 80% for a second, then backward for a second, forever - the
  // standard way to prove the drive wiring and direction before trusting the
  // rover to follow a route.
  //
  // Keyed to rover-chassis because that is the drive platform and the id is
  // unique to this kit. The other motor components (bo-motor, which four kits
  // share, and tb6612fng-motor-driver, which four share) are deliberately not
  // keyed here - one seed would appear in every kit using that id.
  'rover-chassis': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  // Heat Seek Rover, IR Flame Phototransistor Sensor. From the Block Studio
  // export: a digital read on S1 printed once a second - a simple starting
  // point a student can extend.
  //
  // This component also carries experiment.testCode, a richer script that
  // reads BOTH flame sensors as analog values (S1 GPIO 2 and S2 GPIO 1) and
  // prints them side by side every 200 ms. Because a lab with a block program
  // takes ownership of the generated Python, that script no longer drives this
  // lab - it stays in projects.js but is unused. Remove it, or build it out in
  // blocks, when you want the two-sensor version back.
  'flame-sensor': exportedLoopProgram(
    'flame sensor test code',
    boolTrue(),
    [print(readDigital('2')), wait(1, 'SECONDS')],
  ),

  // Heat Seek Rover, Ultrasonic Obstacle Scanner. From the Block Studio export:
  // print the distance in centimetres once a second.
  //
  // This one supersedes experiment.testCode like its sibling does, but here it
  // is like for like: the old script drove the same trig 6 / echo 19 port and
  // printed centimetres, just hand-rolling the pulse timing instead of calling
  // hw.read_ultrasonic_distance.
  'obstacle-scanner': exportedLoopProgram(
    'ultrasonic sensor',
    boolTrue(),
    [print(readUltrasonic('CM')), wait(1, 'SECONDS')],
  ),

  // Terrain Trek's motor driver: M1 forward at 80% for a second, then
  // backward, looping - the same export used for Water Hunt's rover chassis.
  // The driver board is what actually switches the BO motors, and since the
  // separate BO Motor component was removed this entry covers both parts.
  //
  // Kit-scoped on purpose: 'motor-driver' is unique to this kit, but the
  // related 'bo-motor' and 'tb6612fng-motor-driver' ids are each shared by
  // several kits, where a bare key would seed every one of them.
  'terrain-trek/motor-driver': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  // Invisible Line Patrol's dual DC motors, completing that kit. Same export
  // again: M1 forward at 80% for a second, then backward, looping.
  //
  // This lab had a getDynamicCode branch building parameterised Python from
  // motorSpeed / motorDirection / motorDuration. The controls that once drove
  // those values were removed in the UI rewrite, so it was generating from
  // constants nobody could change. The canvas owns the code now, which leaves
  // the isDcMotor branch in ProjectStoreDetailModal dead.
  'invisible-line/dc-motor': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  // Anti-Icing Systems' DS18B20. The same probe as water-hunt-mars/ds18b20 and
  // the same export, but a separate key: this kit calls the component
  // 'ds18b20-sensor', so the other entry never reached it. Reading the probe
  // once a second is the first step before the heater pad is driven from it.
  'anti-icing-systems/ds18b20-sensor': exportedLoopProgram(
    'DS18B20 temp probe test code',
    boolTrue(),
    [print(readDs18b20('2', 'TEMP_C')), wait(1, 'SECONDS')],
  ),

  // Anemometer's 1.3-inch OLED. The first export with setup: the panel is
  // initialised once inside TITAN Start, before the loop, then the loop draws
  // text at 0,0 every second. SH1106 is the 1.3-inch controller, which is the
  // panel this kit ships - a 0.96-inch kit would want SSD1306 instead, so this
  // is kit-scoped rather than keyed on the bare 'oled-display' that 8 other
  // kits also use.
  'anemometer/oled-display': exportedProgram(
    'oled test code',
    [oledInit('SH1106')],
    boolTrue(),
    [oledPrint(text('lof'), 0, 0, '1'), wait(1, 'SECONDS')],
  ),

  // Anti-Icing Systems' 1.3-inch OLED, the same export as the Anemometer one.
  // With its DS18B20 already seeded, this kit's next step is putting the probe
  // reading on the screen - this gets the panel drawing first.
  //
  // Kit-scoped because the panels differ: star-spectrum-decoder's OLED is a
  // 2.42-inch, which needs SSD1309 rather than SH1106, so a bare
  // 'oled-display' key would init the wrong controller there.
  'anti-icing-systems/oled-display': exportedProgram(
    'oled test code',
    [oledInit('SH1106')],
    boolTrue(),
    [oledPrint(text('lof'), 0, 0, '1'), wait(1, 'SECONDS')],
  ),

  // Anti-Icing Systems' 12V silicone heater pad, completing that kit. The pad
  // is driven from a motor channel, so the motor-control block is what switches
  // it: a second on at 80%, a second off, which is enough to confirm the
  // channel and the wiring before any thermostat logic is written.
  //
  // FORWARD/BACKWARD are the block's direction labels; for a heater pad only
  // the duty matters, so treat the second step as "off" rather than reverse.
  // Terrain Trek's HC-SR04, the same export as heat-seek-rover's obstacle
  // scanner. Both run off the dedicated ultrasonic port (Trig 6, Echo 19),
  // which the block is wired to, so the program carries across unchanged.
  // navigation-radar's ultrasonic sensor is the remaining one of this type.
  // Terrain Trek's MPU6050. Like the OLED seeds this has setup: the sensor is
  // woken once inside TITAN Start, then the loop prints the X gyro rate every
  // second - enough to see the number move when the rover is turned.
  //
  // stability-scout and navigation-radar carry the same sensor under different
  // component ids (mpu6050-gyroscope, imu-sensor), so they are not covered by
  // this key.
  'terrain-trek/mpu6050': exportedProgram(
    'MPU6050 test code',
    [mpuInit()],
    boolTrue(),
    [print(readGyro('X')), wait(1, 'SECONDS')],
  ),

  'terrain-trek/hc-sr04': exportedLoopProgram(
    'ultrasonic sensor',
    boolTrue(),
    [print(readUltrasonic('CM')), wait(1, 'SECONDS')],
  ),

  // AquaNova's PIR motion sensor: print the digital state on S1 once a second.
  // A PIR reports presence as a plain high/low, so the digital read is the
  // whole story - 1 while motion is seen, 0 once it settles.
  // AquaNova's water sensor: print the analog value on S1 once a second.
  // Analog rather than digital - the sensor reports how far up the probe the
  // water reaches, not just wet or dry, so the number moves as the level does.
  // AquaNova's OLED, completing that kit. The component name does not state a
  // size, but this kit's own firmware initialises an SH1106, so the panel is
  // the 1.3-inch one and that is the controller to init here. Worth checking
  // the firmware rather than assuming: SSD1306 on an SH1106 leaves the screen
  // blank, and the two are told apart only by the init sequence.
  // Magnet Security Rover's TB6612FNG driver - the board that switches this
  // kit's N20 motors, so it runs the same drive test as the motors themselves.
  //
  // Kit-scoped: 'tb6612fng-motor-driver' is also a component of
  // bluetooth-navigator, lost-bots-navigation and stability-scout, whose labs
  // stay empty until each is asked for.
  // Lost Bot's Navigation's driver and motors, now a single component: the
  // standard drive test, M1 forward at 80% for a second then backward.
  // Kit-scoped - bluetooth-navigator and cosmic-grip still have their own
  // separate bo-motor components and keep empty canvases.
  'lost-bots-navigation/tb6612fng-motor-driver': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  // Lost Bot's Navigation, VL53L0X laser ToF: bring the sensor up with no
  // offset, then print the distance in centimetres once a second.
  //
  // The export that supplied this was titled "Lost bot's cooling system", but
  // that kit (lostbot-cooling) has no ToF sensor - MQ135, DHT22, OLED and a DC
  // fan. The two kit names are easy to confuse; the VL53L0X is in Navigation.
  //
  // measuring-the-cosmos has a 'tof-sensor' component too, left unseeded: its
  // lab is about converting a measured distance to astronomical units, so it
  // wants more than a bare read.
  'lost-bots-navigation/vl53l0x-tof-sensor': exportedProgram(
    "Lost bot's cooling system",
    [vl53Init(0, 'MM')],
    boolTrue(),
    [print(readVl53('CM')), wait(1, 'SECONDS')],
  ),

  'magnet-security-rover/tb6612fng-motor-driver': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  // The same kit's N20 gear motors: the parts the driver above turns, so the
  // same test. n20-gear-motors is unique to this kit, unlike the driver id.
  'magnet-security-rover/n20-gear-motors': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),

  'aquanova/oled-display': exportedProgram(
    'oled test code',
    [oledInit('SH1106')],
    boolTrue(),
    [oledPrint(text('lof'), 0, 0, '1'), wait(1, 'SECONDS')],
  ),

  'aquanova/water-sensor': exportedLoopProgram(
    'water sensor test code',
    boolTrue(),
    [print(readAnalog('2')), wait(1, 'SECONDS')],
  ),

  'aquanova/pir-motion-sensor': exportedLoopProgram(
    'pir sensor',
    boolTrue(),
    [print(readDigital('2')), wait(1, 'SECONDS')],
  ),

  'anti-icing-systems/silicone-heater-pad': exportedLoopProgram(
    'motor test code',
    boolTrue(),
    [
      motor('M1', 'FORWARD', 80),
      wait(1, 'SECONDS'),
      motor('M1', 'BACKWARD', 80),
      wait(1, 'SECONDS'),
    ],
  ),
};

/**
 * The starting program for one kit's component lab, or null for an empty canvas.
 *
 * Keys are looked up most specific first:
 *   'terrain-trek/bo-motor'  - this component in this kit only
 *   'bo-motor'               - this component in every kit that has it
 *
 * The kit-scoped form matters because component ids repeat across the
 * catalogue: 17 kits have an 'esp32-s3', 9 have an 'oled-display', and 4 share
 * 'bo-motor'. A bare key would put one starting program in all of them, which
 * is wrong whenever the kits wire the same part differently.
 */
export function labProgram(kitId, componentId) {
  return LAB_PROGRAMS[`${kitId}/${componentId}`] || LAB_PROGRAMS[componentId] || null;
}
