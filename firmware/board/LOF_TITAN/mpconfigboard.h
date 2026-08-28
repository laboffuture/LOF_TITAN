#ifndef MICROPY_INCLUDED_ESP32_LOF_TITAN_MPCONFIGBOARD_H
#define MICROPY_INCLUDED_ESP32_LOF_TITAN_MPCONFIGBOARD_H

#define MICROPY_HW_BOARD_NAME               "LOF TITAN ESP32-S3 N16R8"
#define MICROPY_HW_MCU_NAME                 "ESP32-S3"

// Flash and Octal PSRAM Configuration
#define MICROPY_HW_ENABLE_OCTAL_SPIRAM      (1)

// USB Serial and JTAG support
#define MICROPY_HW_ENABLE_USBDEV            (0)
#define MICROPY_HW_ENABLE_UART_REPL         (1)
#define MICROPY_PY_OS_DUPTERM               (2)

// Status LEDs
#define MICROPY_HW_LED_RED                  (47)
#define MICROPY_HW_LED_GREEN                (48)

// Buzzer
#define MICROPY_HW_BUZZER_PIN               (20)

// Default I2C
#define MICROPY_HW_I2C0_SDA                 (7)
#define MICROPY_HW_I2C0_SCL                 (8)


// Default UART
#define MICROPY_HW_UART1_TX                 (17)
#define MICROPY_HW_UART1_RX                 (18)

#endif // MICROPY_INCLUDED_ESP32_LOF_TITAN_MPCONFIGBOARD_H
