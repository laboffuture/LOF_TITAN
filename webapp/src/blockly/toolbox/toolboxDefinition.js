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
        { kind: "block", type: "titan_qmc5883l_read" },
        { kind: "block", type: "titan_mpu6050_init" },
        { kind: "block", type: "titan_mpu6050_read_accel" },
        { kind: "block", type: "titan_mpu6050_read_angle" },
        { kind: "block", type: "titan_mpu6050_gesture" },
        { kind: "block", type: "titan_mq135_read" },
        { kind: "block", type: "titan_mq135_gas_detected" },
        { kind: "block", type: "titan_dht_read" },
        { kind: "block", type: "titan_dht_compare" },
        { kind: "block", type: "titan_ds18b20_read" },
        { kind: "block", type: "titan_ds18b20_compare" },
        { kind: "block", type: "titan_vl53l0x_init" },
        { kind: "block", type: "titan_vl53l0x_set_offset" },
        { kind: "block", type: "titan_vl53l0x_read_distance" },
        { kind: "block", type: "titan_vl53l0x_compare" },
        { kind: "block", type: "titan_vl53l0x_target_in_range" },
        { kind: "block", type: "titan_vl53l0x_set_mode" },
        { kind: "block", type: "titan_amg8833_read" },
        { kind: "block", type: "titan_amg8833_heat_detected" },
        { kind: "block", type: "titan_as5600_init" },
        { kind: "block", type: "titan_as5600_read_angle" },
        { kind: "block", type: "titan_as5600_read_rotations" },
        { kind: "block", type: "titan_as5600_reset_zero" },
        { kind: "block", type: "titan_as5600_magnet_status" },
        { kind: "block", type: "titan_pulse_oled_ecg" },
        { kind: "block", type: "titan_lcd1602_init" },
        { kind: "block", type: "titan_lcd1602_print" },
        { kind: "block", type: "titan_i2c_scan" },
        { kind: "block", type: "titan_sensor_compare" },
        { kind: "block", type: "titan_digital_sensor_check" },
        { kind: "block", type: "titan_ultrasonic_compare" },
        { kind: "block", type: "titan_wait_for_button" },
        { kind: "block", type: "titan_motor_dual_drive" },
        { kind: "block", type: "titan_motor_control" },
        { kind: "block", type: "titan_onboard_led" },
        { kind: "block", type: "titan_onboard_buzzer_tone" },
        { kind: "block", type: "titan_dfplayer_init" },
        { kind: "block", type: "titan_dfplayer_play_track" },
        { kind: "block", type: "titan_dfplayer_control" },
        { kind: "block", type: "titan_dfplayer_set_volume" },
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
        { kind: "block", type: "titan_vl53l0x_init" },
        { kind: "block", type: "titan_vl53l0x_set_offset" },
        { kind: "block", type: "titan_vl53l0x_read_distance" },
        { kind: "block", type: "titan_vl53l0x_compare" },
        { kind: "block", type: "titan_vl53l0x_target_in_range" },
        { kind: "block", type: "titan_vl53l0x_set_mode" },
        { kind: "block", type: "titan_button_is_pressed" },
        { kind: "block", type: "titan_wait_for_button" },
        { kind: "block", type: "titan_as5600_init" },
        { kind: "block", type: "titan_as5600_read_angle" },
        { kind: "block", type: "titan_as5600_read_rotations" },
        { kind: "block", type: "titan_as5600_reset_zero" },
        { kind: "block", type: "titan_as5600_magnet_status" },
        { kind: "block", type: "titan_as5600_compare" },
        { kind: "block", type: "titan_pulse_sensor_init" },
        { kind: "block", type: "titan_pulse_sensor_read" },
        { kind: "block", type: "titan_pulse_finger_detected" },
        { kind: "block", type: "titan_pulse_oled_ecg" },
        { kind: "block", type: "titan_qmc5883l_init" },
        { kind: "block", type: "titan_qmc5883l_read" },
        { kind: "block", type: "titan_qmc5883l_heading" },
        { kind: "block", type: "titan_qmc5883l_direction" },
        { kind: "block", type: "titan_mpu6050_init" },
        { kind: "block", type: "titan_mpu6050_read_accel" },
        { kind: "block", type: "titan_mpu6050_read_gyro" },
        { kind: "block", type: "titan_mpu6050_read_angle" },
        { kind: "block", type: "titan_mpu6050_read_temp" },
        { kind: "block", type: "titan_mpu6050_gesture" },
        { kind: "block", type: "titan_mq135_read" },
        { kind: "block", type: "titan_mq135_quality_status" },
        { kind: "block", type: "titan_mq135_gas_detected" },
        { kind: "block", type: "titan_mq135_calibrate" },
        { kind: "block", type: "titan_dht_read" },
        { kind: "block", type: "titan_dht_compare" },
        { kind: "block", type: "titan_ds18b20_read" },
        { kind: "block", type: "titan_ds18b20_compare" },
        { kind: "block", type: "titan_amg8833_init" },
        { kind: "block", type: "titan_amg8833_read" },
        { kind: "block", type: "titan_amg8833_read_pixel" },
        { kind: "block", type: "titan_amg8833_heat_detected" },
        { kind: "block", type: "titan_amg8833_oled_heatmap" },
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
        { kind: "block", type: "titan_wifi_status" },
        { kind: "block", type: "titan_wifi_ap" },
        { kind: "block", type: "titan_http_get" },
        { kind: "block", type: "titan_http_post" },
        { kind: "block", type: "titan_mqtt_connect" },
        { kind: "block", type: "titan_mqtt_publish" },
        { kind: "block", type: "titan_mqtt_subscribe" }
      ]
    },
    {
      kind: "category",
      name: "Display",
      colour: "#ec4899",
      customId: "display",
      contents: [
        { kind: "block", type: "titan_oled_init" },
        { kind: "block", type: "titan_oled_spi_init" },
        { kind: "block", type: "titan_oled_print" },
        { kind: "block", type: "titan_oled_print_custom" },
        { kind: "block", type: "titan_oled_clear" },
        { kind: "block", type: "titan_oled_draw_line" },
        { kind: "block", type: "titan_oled_draw_rect" },
        { kind: "block", type: "titan_oled_draw_circle" },
        { kind: "block", type: "titan_oled_contrast" },
        { kind: "block", type: "titan_oled_invert" },
        { kind: "block", type: "titan_oled_show" },
        { kind: "block", type: "titan_amg8833_oled_heatmap" },
        { kind: "block", type: "titan_pulse_oled_ecg" },
        { kind: "block", type: "titan_lcd1602_init" },
        { kind: "block", type: "titan_lcd1602_print" },
        { kind: "block", type: "titan_lcd1602_print_lines" },
        { kind: "block", type: "titan_lcd1602_clear" },
        { kind: "block", type: "titan_lcd1602_backlight" },
        { kind: "block", type: "titan_lcd1602_set_cursor" },
        { kind: "block", type: "titan_lcd1602_scroll" },
        { kind: "block", type: "titan_lcd1602_show_sensor" }
      ]
    },
    {
      kind: "category",
      name: "Audio",
      colour: "#f59e0b",
      customId: "audio",
      contents: [
        { kind: "block", type: "titan_onboard_buzzer_tone" },
        { kind: "block", type: "titan_onboard_buzzer_melody" },
        { kind: "block", type: "titan_onboard_buzzer_sound_effect" },
        { kind: "block", type: "titan_onboard_buzzer_freq" },
        { kind: "block", type: "titan_onboard_buzzer_stop" },
        { kind: "block", type: "titan_dfplayer_init" },
        { kind: "block", type: "titan_dfplayer_play_track" },
        { kind: "block", type: "titan_dfplayer_play_folder" },
        { kind: "block", type: "titan_dfplayer_play_mp3" },
        { kind: "block", type: "titan_dfplayer_play_wait" },
        { kind: "block", type: "titan_dfplayer_control" },
        { kind: "block", type: "titan_dfplayer_set_volume" },
        { kind: "block", type: "titan_dfplayer_step_volume" },
        { kind: "block", type: "titan_dfplayer_set_eq" },
        { kind: "block", type: "titan_dfplayer_loop" },
        { kind: "block", type: "titan_dfplayer_is_busy" }
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
        { kind: "block", type: "titan_vl53l0x_compare" },
        { kind: "block", type: "titan_vl53l0x_target_in_range" },
        { kind: "block", type: "titan_mpu6050_gesture" },
        { kind: "block", type: "titan_as5600_compare" },
        { kind: "block", type: "titan_mq135_gas_detected" },
        { kind: "block", type: "titan_dht_compare" },
        { kind: "block", type: "titan_ds18b20_compare" },
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
        {
          kind: "block",
          type: "titan_repeat_while",
          inputs: {
            BOOL: {
              shadow: {
                type: "logic_boolean",
                fields: {
                  BOOL: "TRUE"
                }
              }
            }
          }
        },
        {
          kind: "block",
          type: "controls_repeat_ext",
          inputs: {
            TIMES: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 10
                }
              }
            }
          }
        },

        {
          kind: "block",
          type: "controls_for",
          inputs: {
            FROM: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 1
                }
              }
            },
            TO: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 10
                }
              }
            },
            BY: {
              shadow: {
                type: "math_number",
                fields: {
                  NUM: 1
                }
              }
            }
          }
        },
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
        { kind: "block", type: "titan_mpu6050_init" },
        { kind: "block", type: "titan_mpu6050_read_accel" },
        { kind: "block", type: "titan_mpu6050_read_angle" },
        { kind: "block", type: "titan_mpu6050_gesture" },
        { kind: "block", type: "titan_mq135_read" },
        { kind: "block", type: "titan_mq135_gas_detected" },
        { kind: "block", type: "titan_dht_read" },
        { kind: "block", type: "titan_dht_compare" },
        { kind: "block", type: "titan_onboard_led" },
        { kind: "block", type: "titan_onboard_buzzer_tone" },
        { kind: "block", type: "titan_onboard_buzzer_freq" },
        { kind: "block", type: "titan_onboard_buzzer_stop" },
        { kind: "block", type: "titan_dfplayer_init" },
        { kind: "block", type: "titan_dfplayer_play_track" },
        { kind: "block", type: "titan_dfplayer_control" },
        { kind: "block", type: "titan_dfplayer_set_volume" }
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
