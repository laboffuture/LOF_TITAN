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

/**
 * A workspace shaped like a Block Studio export: a project-info header plus
 * TITAN Start -> repeat while <condition> -> steps. Use this when the program
 * came from an actual .lofproject export, so the lab reproduces it exactly.
 */
const exportedLoopProgram = (description, condition, steps) => ({
  blocks: {
    languageVersion: 0,
    blocks: [
      projectInfo(description),
      {
        type: 'titan_start',
        x: 468,
        y: 108,
        inputs: {
          DO: {
            block: {
              type: 'titan_repeat_while',
              fields: { MODE: 'WHILE' },
              inputs: { BOOL: condition, DO: { block: chain(steps) } },
            },
          },
        },
      },
    ],
  },
});

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
};

export function labProgram(componentId) {
  return LAB_PROGRAMS[componentId] || null;
}
