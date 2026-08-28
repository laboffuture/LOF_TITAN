# LOF TITAN ESP32-S3 System Architecture

## Overview
**LOF TITAN** is a custom embedded MicroPython firmware and Bluetooth Low Energy (BLE) programming environment targeting the **ESP32-S3 N16R8** microcontroller module (16 MB Quad SPI Flash, 8 MB Octal PSRAM).

---

## 1. Hardware Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ESP32-S3 N16R8 Module                     │
│  Dual-Core LX7 @ 240 MHz • 16 MB QIO Flash • 8 MB OPI PSRAM  │
└──────┬──────────────────┬───────────────────┬──────────────┬─┘
       │                  │                   │              │
┌──────▼──────┐    ┌──────▼──────┐     ┌──────▼─────┐ ┌──────▼─────┐
│ Status LEDs │    │   Buzzer    │     │ Sensor I/O │ │Motor Drives│
│ GPIO47 (Red)│    │   GPIO20    │     │ S1..S5 ADCs│ │ M5, M6,    │
│GPIO48(Green)│    │(Auto-deinit)│     │ Ultrasonic │ │ M2, M4     │
└─────────────┘    └─────────────┘     └────────────┘ └────────────┘
```

---

## 2. Dynamic Hardware Identity (Section 5)
Every LOF TITAN board derives its unique BLE identity at runtime directly from its physical Bluetooth MAC:
1. Reads 6-byte interface MAC from hardware (`machine.unique_id()`).
2. Converts the first two bytes into four uppercase hexadecimal characters (`XXXX`).
3. Forms device name: `LOF_TITAN_XXXX`.
4. GAP advertising, GATT Device Info, and diagnostic serial console all share the exact same identifier.
5. **Universal Image**: One single firmware binary flashes onto all boards without recompilation.

---

## 3. Immutable System Supervisor
The BLE supervisor and state machine are frozen directly into the firmware binary (`_boot.py` and `supervisor/*` package):
- **Resilience**: Filesystem formats (`os.remove()`) or corrupted `/main.py` scripts cannot disable the BLE service.
- **Continuous Operation**: BLE advertising and connection handling remain active even while user code contains loops or encounters runtime exceptions.

---

## 4. Boot Sequence & 10-Second Auto-Run Window
1. Power On / Hardware Reset.
2. Initialize Flash, Octal PSRAM, MAC identity, Status LEDs, and Buzzer.
3. Play melodic startup tone on `GPIO20` and immediately release peripheral (`buzzer.deinit()`).
4. Begin BLE advertising as `LOF_TITAN_XXXX` (Red LED ON, Green LED OFF).
5. Start 10-second countdown:
   - **If Web App connects**: Auto-run is cancelled, Green LED turns ON, system enters `CONNECTED_IDLE`.
   - **If timeout expires**: If valid `/program/user.py` exists, system transitions to `RUNNING` autonomously while BLE continues advertising. If no program exists, system sounds an error tone and remains in `NO_PROGRAM` mode.

---

## 5. Safe MicroPython VM Interruption (STOP)
When the Web App sends a `STOP` command:
1. Supervisor schedules a safe interruption (`KeyboardInterrupt`) into the MicroPython virtual machine.
2. User execution safely terminates.
3. Supervisor performs safe hardware reset: all motor pins driven to `0`, buzzer de-inited.
4. System enters `STOPPED` state while BLE connection remains active and responsive.
