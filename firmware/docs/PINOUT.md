# LOF TITAN PCB Pinout Guide

## 1. System Indicators & Audio
* **Red Status LED**: `GPIO47` (ON when disconnected/advertising or system error)
* **Green Status LED**: `GPIO48` (ON when BLE connected; blinks during programming)
* **Buzzer**: `GPIO20` (Transitively used by firmware; released immediately for user PWM scripts)

---

## 2. Communication Buses
* **I2C Bus**:
  * `SDA`: `GPIO7`
  * `SCL`: `GPIO8`
* **SPI Bus**:
  * `SCK`: `GPIO35`
  * `MOSI`: `GPIO36`
  * `MISO`: `GPIO37`
  * `CS`: `GPIO38`
* **UART**:
  * `TX`: `GPIO17`
  * `RX`: `GPIO18`

---

## 3. Sensors & Peripherals
* **Sensor Ports**:
  * `S1`: `GPIO2` (ADC capable)
  * `S2`: `GPIO1` (ADC capable)
  * `S3`: `GPIO3` (ADC capable)
  * `S4`: `GPIO4` (ADC capable)
  * `S5`: `GPIO5` (ADC capable)
* **Ultrasonic Distance Port**:
  * `S1` (Trigger/Echo): `GPIO6`
  * `S2` (Echo/Trigger): `GPIO19`

---

## 4. Motor Driver Ports
* **Motor Port M5**: `GPIO9`, `GPIO10`
* **Motor Port M6**: `GPIO11`, `GPIO12`
* **Motor Port M2**: `GPIO13`, `GPIO14`
* **Motor Port M4**: `GPIO15`, `GPIO16`
