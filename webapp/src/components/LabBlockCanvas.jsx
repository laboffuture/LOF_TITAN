import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import 'blockly/blocks';
import * as En from 'blockly/msg/en';

import { registerCustomBlocks } from '../blockly/blocks/customBlocks';
import {
  registerPythonGenerators,
  generateTitanWorkspaceCode,
} from '../blockly/generators/pythonGenerator';
import { currentBlocklyTheme } from '../blockly/theme/lunarTheme';
import { toolboxDefinition } from '../blockly/toolbox/toolboxDefinition';
import '../blockly/blocklyCustom.css';

/**
 * A live Blockly workspace for a component lab.
 *
 * Same blocks, theme, toolbox and Python generator as Block Studio, so a lab is
 * not a second block system to keep in step - it is the same one, smaller.
 *
 * Unlike BlocklyIDE this deliberately keeps NO localStorage: a lab is a scratch
 * space for one experiment, and autosaving it would overwrite the student's
 * actual Block Studio project.
 */

// Registration is global to Blockly and must happen once per page, not per
// mount - re-registering throws on the second lab you open.
let registered = false;
function ensureBlockly() {
  if (registered) return;
  Blockly.setLocale(En);
  registerCustomBlocks();
  registerPythonGenerators();
  registered = true;
}

export function LabBlockCanvas({ program, onCodeChange, className = '' }) {
  const hostRef = useRef(null);
  // Held in a ref so a new callback identity does not tear down the workspace
  // and throw away whatever the student has just dragged.
  const onCodeChangeRef = useRef(onCodeChange);
  onCodeChangeRef.current = onCodeChange;

  useEffect(() => {
    ensureBlockly();
    const host = hostRef.current;
    if (!host) return undefined;

    const workspace = Blockly.inject(host, {
      toolbox: toolboxDefinition,
      theme: currentBlocklyTheme(),
      renderer: 'zelos',
      grid: { spacing: 24, length: 2, colour: '#8A94AB', snap: true },
      zoom: {
        controls: true,
        wheel: true,
        // A shade under 1 so the seeded program fits a lab-sized panel without
        // the student having to zoom out first.
        startScale: 0.9,
        maxScale: 2.5,
        minScale: 0.4,
        scaleSpeed: 1.1,
      },
      trashcan: true,
      move: { scrollbars: { horizontal: true, vertical: true }, drag: true, wheel: false },
    });

    if (program) {
      try {
        Blockly.serialization.workspaces.load(program, workspace);
      } catch {
        // A malformed seed must leave the student an empty canvas, not a dead one.
      }
    }

    const emit = () => {
      // Mid-drag the tree is half-connected and the generated Python is
      // meaningless, so wait for the block to land.
      if (workspace.isDragging()) return;
      try {
        onCodeChangeRef.current?.(generateTitanWorkspaceCode(workspace));
      } catch {
        // A generator error should not take the canvas down with it.
      }
    };
    emit();
    workspace.addChangeListener(emit);

    // Blockly measures its host once, at inject. The lab panel is still
    // animating in at that point and can be resized afterwards, so re-measure
    // on settle and on every resize - otherwise blocks render offset from the
    // pointer and dragging feels broken.
    const resize = () => Blockly.svgResize(workspace);
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    const settle = setTimeout(resize, 80);

    return () => {
      clearTimeout(settle);
      observer.disconnect();
      workspace.dispose();
    };
  }, [program]);

  return <div ref={hostRef} className={className} />;
}
