import * as Blockly from 'blockly';

export const LunarTheme = Blockly.Theme.defineTheme('lunar_light', {
  base: Blockly.Themes.Classic,
  blockStyles: {
    project_blocks: {
      colourPrimary: '#7e97cc',
      colourSecondary: '#6e87bc',
      colourTertiary: '#5c74a6',
      hat: 'cap'
    },
    sketch_blocks: {
      colourPrimary: '#7e97cc',
      colourSecondary: '#6e87bc',
      colourTertiary: '#5c74a6'
    },
    loop_blocks: {
      colourPrimary: '#7dbb73',
      colourSecondary: '#6ca962',
      colourTertiary: '#59944f'
    },
    text_blocks: {
      colourPrimary: '#62b8b3',
      colourSecondary: '#51a6a1',
      colourTertiary: '#3e8f8a'
    },
    timing_blocks: {
      colourPrimary: '#7889c3',
      colourSecondary: '#6879b1',
      colourTertiary: '#54659b'
    },
    logic_blocks: {
      colourPrimary: '#6e8baa',
      colourSecondary: '#5d7997',
      colourTertiary: '#4a647f'
    },
    math_blocks: {
      colourPrimary: '#9585c7',
      colourSecondary: '#8373b4',
      colourTertiary: '#6f5fa0'
    },
    motor_blocks: {
      colourPrimary: '#a764d8',
      colourSecondary: '#9451c4',
      colourTertiary: '#7d3ca8'
    },
    iot_blocks: {
      colourPrimary: '#38bdf8',
      colourSecondary: '#0284c7',
      colourTertiary: '#0369a1'
    },
    display_blocks: {
      colourPrimary: '#8b5cf6',
      colourSecondary: '#7c3aed',
      colourTertiary: '#6d28d9'
    },
    variable_blocks: {
      colourPrimary: '#f472b6',
      colourSecondary: '#db2777',
      colourTertiary: '#9d174d'
    },
    procedure_blocks: {
      colourPrimary: '#a855f7',
      colourSecondary: '#9333ea',
      colourTertiary: '#6b21a8'
    },
    machine_blocks: {
      colourPrimary: '#6366f1',
      colourSecondary: '#4f46e5',
      colourTertiary: '#3730a3'
    },
    file_blocks: {
      colourPrimary: '#60a5fa',
      colourSecondary: '#3b82f6',
      colourTertiary: '#1d4ed8'
    }
  },
  categoryStyles: {
    titan_category: { colour: '#38bdf8' },
    motors_category: { colour: '#a855f7' },
    iot_category: { colour: '#0ea5e9' },
    display_category: { colour: '#8b5cf6' },
    logic_category: { colour: '#64748b' },
    loops_category: { colour: '#22c55e' },
    math_category: { colour: '#8b5cf6' },
    text_category: { colour: '#14b8a6' },
    lists_category: { colour: '#8b5cf6' },
    variables_category: { colour: '#ec4899' },
    functions_category: { colour: '#8b5cf6' },
    timing_category: { colour: '#0284c7' },
    machine_category: { colour: '#6366f1' },
    files_category: { colour: '#3b82f6' },
    network_category: { colour: '#2563eb' }
  },
  componentStyles: {
    workspaceBackgroundColour: '#F8FAFC',
    toolboxBackgroundColour: '#FFFFFF',
    toolboxForegroundColour: '#475569',
    flyoutBackgroundColour: '#FFFFFF',
    flyoutOpacity: 0.96,
    scrollbarColour: '#CBD5E1',
    scrollbarOpacity: 0.7,
    insertionMarkerColour: '#38BDF8',
    insertionMarkerOpacity: 0.6,
    cursorColour: '#38BDF8'
  },
  fontStyle: {
    family: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
    weight: '600',
    size: 13
  }
});
