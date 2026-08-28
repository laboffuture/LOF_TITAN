export const toolboxDefinition = {
  kind: "categoryToolbox",
  contents: [
    {
      kind: "category",
      name: "LOF TITAN",
      colour: "#38bdf8",
      customId: "titan",
      contents: [
        { kind: "block", type: "titan_start" },
        { kind: "block", type: "project_info" },
        { kind: "block", type: "titan_print_sensor_monitor" },
        { kind: "block", type: "titan_print_labeled" },
        { kind: "block", type: "titan_sensor_read_analog" },
        { kind: "block", type: "titan_sensor_read_digital" },
        { kind: "block", type: "titan_ultrasonic_distance" },
        { kind: "block", type: "titan_button_is_pressed" },
        { kind: "block", type: "titan_i2c_scan" },
        { kind: "block", type: "titan_sensor_compare" },
        { kind: "block", type: "titan_digital_sensor_check" },
        { kind: "block", type: "titan_ultrasonic_compare" },
        { kind: "block", type: "titan_wait_for_button" },
        { kind: "block", type: "titan_motor_dual_drive" },
        { kind: "block", type: "titan_motor_control" },
        { kind: "block", type: "titan_onboard_led" },
        { kind: "block", type: "titan_onboard_buzzer_tone" },
        { kind: "block", type: "titan_wait" },
        { kind: "block", type: "titan_print" }
      ]
    },
    {
      kind: "category",
      name: "Sensors",
      colour: "#06b6d4",
      customId: "sensors",
      contents: [
        { kind: "block", type: "titan_print_sensor_monitor" },
        { kind: "block", type: "titan_print_labeled" },
        { kind: "block", type: "titan_sensor_read_analog" },
        { kind: "block", type: "titan_sensor_read_digital" },
        { kind: "block", type: "titan_sensor_write_digital" },
        { kind: "block", type: "titan_sensor_compare" },
        { kind: "block", type: "titan_digital_sensor_check" },
        { kind: "block", type: "titan_motion_sensor_check" },
        { kind: "block", type: "titan_ultrasonic_distance" },
        { kind: "block", type: "titan_ultrasonic_compare" },
        { kind: "block", type: "titan_button_is_pressed" },
        { kind: "block", type: "titan_wait_for_button" },
        { kind: "block", type: "titan_pulse_sensor_init" },
        { kind: "block", type: "titan_pulse_sensor_read" },
        { kind: "block", type: "titan_pulse_finger_detected" },
        { kind: "block", type: "titan_i2c_scan" },
        { kind: "block", type: "titan_i2c_read_byte" },
        { kind: "block", type: "titan_i2c_write_byte" }
      ]
    },
    {
      kind: "category",
      name: "Motors",
      colour: "#a855f7",
      customId: "motors",
      contents: [
        { kind: "block", type: "titan_motor_control" },
        { kind: "block", type: "titan_motor_speed_var" },
        { kind: "block", type: "titan_motor_custom_pins" },
        { kind: "block", type: "titan_motor_dual_drive" },
        { kind: "block", type: "titan_motor_stop" },
        { kind: "block", type: "titan_servo_angle" }
      ]
    },
    {
      kind: "category",
      name: "IOT",
      colour: "#0ea5e9",
      customId: "iot",
      contents: [
        { kind: "block", type: "titan_wifi_connect" },
        { kind: "block", type: "titan_wifi_ap" },
        { kind: "block", type: "titan_ble_send" },
        { kind: "block", type: "titan_uart_send" }
      ]
    },
    {
      kind: "category",
      name: "Display",
      colour: "#8b5cf6",
      customId: "display",
      contents: [
        { kind: "block", type: "titan_oled_init" },
        { kind: "block", type: "titan_oled_text" },
        { kind: "block", type: "titan_oled_show_sensor" },
        { kind: "block", type: "titan_oled_clear" },
        { kind: "block", type: "titan_oled_show" }
      ]
    },
    {
      kind: "category",
      name: "Logic",
      colour: "#64748b",
      customId: "logic",
      contents: [
        { kind: "block", type: "controls_if" },
        { kind: "block", type: "titan_sensor_compare" },
        { kind: "block", type: "titan_digital_sensor_check" },
        { kind: "block", type: "titan_ultrasonic_compare" },
        { kind: "block", type: "titan_button_is_pressed" },
        { kind: "block", type: "logic_compare" },
        { kind: "block", type: "logic_operation" },
        { kind: "block", type: "logic_negate" },
        { kind: "block", type: "logic_boolean" },
        { kind: "block", type: "logic_null" },
        { kind: "block", type: "logic_ternary" }
      ]
    },
    {
      kind: "category",
      name: "Loops",
      colour: "#22c55e",
      customId: "loops",
      contents: [
        { kind: "block", type: "titan_repeat_while" },
        { kind: "block", type: "controls_repeat_ext" },
        { kind: "block", type: "controls_whileUntil" },
        { kind: "block", type: "controls_for" },
        { kind: "block", type: "controls_flow_statements" }
      ]
    },
    {
      kind: "category",
      name: "Math",
      colour: "#8b5cf6",
      customId: "math",
      contents: [
        { kind: "block", type: "titan_number" },
        { kind: "block", type: "math_arithmetic" },
        { kind: "block", type: "math_single" },
        { kind: "block", type: "math_random_int" }
      ]
    },
    {
      kind: "category",
      name: "Text",
      colour: "#14b8a6",
      customId: "text",
      contents: [
        { kind: "block", type: "titan_text" },
        { kind: "block", type: "titan_print" },
        { kind: "block", type: "titan_print_labeled" },
        { kind: "block", type: "titan_print_sensor_monitor" },
        { kind: "block", type: "text_join" },
        { kind: "block", type: "text_length" }
      ]
    },
    {
      kind: "category",
      name: "Lists",
      colour: "#8b5cf6",
      customId: "lists",
      contents: [
        { kind: "block", type: "lists_create_with" },
        { kind: "block", type: "lists_repeat" },
        { kind: "block", type: "lists_length" }
      ]
    },
    {
      kind: "category",
      name: "Variables",
      colour: "#ec4899",
      custom: "VARIABLE",
      customId: "variables"
    },
    {
      kind: "category",
      name: "Functions",
      colour: "#8b5cf6",
      custom: "PROCEDURE",
      customId: "functions"
    },
    {
      kind: "category",
      name: "Timing",
      colour: "#0284c7",
      customId: "timing",
      contents: [
        { kind: "block", type: "titan_wait" }
      ]
    },
    {
      kind: "category",
      name: "Machine",
      colour: "#6366f1",
      customId: "machine",
      contents: [
        { kind: "block", type: "titan_sensor_compare" },
        { kind: "block", type: "titan_digital_sensor_check" },
        { kind: "block", type: "titan_ultrasonic_compare" },
        { kind: "block", type: "titan_sensor_read_analog" },
        { kind: "block", type: "titan_sensor_read_digital" },
        { kind: "block", type: "titan_sensor_write_digital" },
        { kind: "block", type: "titan_ultrasonic_distance" },
        { kind: "block", type: "titan_onboard_led" },
        { kind: "block", type: "titan_onboard_buzzer_tone" },
        { kind: "block", type: "titan_onboard_buzzer_freq" },
        { kind: "block", type: "titan_onboard_buzzer_stop" }
      ]
    },
    {
      kind: "category",
      name: "Files",
      colour: "#3b82f6",
      customId: "files",
      contents: [
        { kind: "block", type: "titan_text" },
        { kind: "block", type: "titan_print" }
      ]
    },
    {
      kind: "category",
      name: "Network and Internet",
      colour: "#2563eb",
      customId: "network",
      contents: [
        { kind: "block", type: "titan_wifi_connect" },
        { kind: "block", type: "titan_wifi_ap" },
        { kind: "block", type: "titan_ble_send" },
        { kind: "block", type: "titan_uart_send" }
      ]
    }
  ]
};
