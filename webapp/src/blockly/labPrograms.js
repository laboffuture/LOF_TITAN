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
};

export function labProgram(componentId) {
  return LAB_PROGRAMS[componentId] || null;
}
