"""
LOF TITAN ESP32-S3 Official Pin Definitions
Central pin mapping module for hardware peripherals, motors, sensors, and buttons.
"""

# System / Indicators
PIN_LED_RED = 47
PIN_LED_GREEN = 48
PIN_BUZZER = 20
PIN_I2C_SDA = 7
PIN_I2C_SCL = 8

# Push Buttons
PIN_BUTTON_1 = 39
PIN_BUTTON_2 = 40
PIN_BUTTON_3 = 41
PIN_BUTTON_4 = 42
ALL_BUTTON_PINS = (PIN_BUTTON_1, PIN_BUTTON_2, PIN_BUTTON_3, PIN_BUTTON_4)

# Sensor Ports (S1 - S5)
PIN_SENSOR_S1 = 2
PIN_SENSOR_S2 = 1
PIN_SENSOR_S3 = 3
PIN_SENSOR_S4 = 4
PIN_SENSOR_S5 = 5
ALL_SENSOR_PINS = (PIN_SENSOR_S1, PIN_SENSOR_S2, PIN_SENSOR_S3, PIN_SENSOR_S4, PIN_SENSOR_S5)

# Ultrasonic Port
PIN_ULTRASONIC_S1 = 6   # Trigger / Echo
PIN_ULTRASONIC_S2 = 19  # Echo / Trigger

# UART Port
PIN_UART_RX = 18
PIN_UART_TX = 17

# SPI Bus
PIN_SPI_SCK = 35
PIN_SPI_MOSI = 36
PIN_SPI_MISO = 37
PIN_SPI_CS = 38

# Motor Drivers (4 Hardware Channels -> 6 Motor Connectors)
# Channel 1: M1
PIN_MOTOR_M1_A = 15
PIN_MOTOR_M1_B = 16

# Channel 2: M2
PIN_MOTOR_M2_A = 13
PIN_MOTOR_M2_B = 14

# Channel 3: M3 & M6 (Parallel Shared Driver Output)
PIN_MOTOR_M3_A = 11
PIN_MOTOR_M3_B = 12
PIN_MOTOR_M6_A = 11
PIN_MOTOR_M6_B = 12

# Channel 4: M4 & M5 (Parallel Shared Driver Output)
PIN_MOTOR_M4_A = 9
PIN_MOTOR_M4_B = 10
PIN_MOTOR_M5_A = 9
PIN_MOTOR_M5_B = 10

# All motor pins for safe shutdown
ALL_MOTOR_PINS = (
    PIN_MOTOR_M1_A, PIN_MOTOR_M1_B,
    PIN_MOTOR_M2_A, PIN_MOTOR_M2_B,
    PIN_MOTOR_M3_A, PIN_MOTOR_M3_B,
    PIN_MOTOR_M4_A, PIN_MOTOR_M4_B,
)
