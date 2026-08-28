# LOF TITAN — ESP32-S3 N16R8 Custom MicroPython Firmware & BLE System

Production-ready custom MicroPython firmware and Web Bluetooth IDE for the **LOF TITAN** board featuring an **ESP32-S3 N16R8** MCU (16 MB Flash, 8 MB Octal PSRAM).

---

## Quick-Start Guide

1. **Build Firmware**:
   ```bash
   ./scripts/setup.sh
   ./scripts/build.sh
   ```
   *(Or on Windows PowerShell: `.\scripts\setup.ps1` followed by `.\scripts\build.ps1`)*

2. **Connect LOF TITAN Board** to USB.

3. **Erase Flash**:
   ```powershell
   .\scripts\erase_flash.ps1 -Port COM3
   ```

4. **Flash Combined Firmware**:
   ```powershell
   .\scripts\flash.ps1 -Port COM3
   ```

5. **Restart Board** and listen for the melodic startup tone.

6. **Scan Bluetooth** on your device $\rightarrow$ look for `LOF_TITAN_XXXX` *(where `XXXX` is derived from the board's Bluetooth MAC)*.

7. **Open Web IDE** by opening `webapp/index.html` in Chrome/Edge.

8. Click **Connect BLE**, select your `LOF_TITAN_XXXX`, and start programming!

---

## How `LOF_TITAN_XXXX` is Derived
Every board automatically derives its unique BLE identity at boot time from the hardware Bluetooth MAC:
- Example MAC: `A0:FE:12:34:56:78`
- First 2 bytes: `0xA0`, `0xFE` $\rightarrow$ Uppercase Hex: `A0FE`
- Generated BLE Name: `LOF_TITAN_A0FE`
- **Universal Image**: One firmware binary works on any board without recompiling or manual configuration.

---

## System Pinout

| Function | Pin | Notes |
| :--- | :--- | :--- |
| **Red Status LED** | `GPIO47` | Disconnected (ON) / Error (Blink) |
| **Green Status LED** | `GPIO48` | Connected (ON) / Programming (Blink) |
| **Buzzer** | `GPIO20` | Boot tone $\rightarrow$ instantly released for student PWM scripts |
| **I2C SDA / SCL** | `GPIO7` / `GPIO8` | I2C peripheral |
| **Sensor Ports S1..S5** | `GPIO2, 1, 3, 4, 5` | ADC & Digital IO |
| **Ultrasonic S1 / S2** | `GPIO6` / `GPIO19` | Trigger / Echo |
| **UART RX / TX** | `GPIO18` / `GPIO17` | Hardware UART |
| **SPI SCK / MOSI / MISO / CS** | `GPIO35, 36, 37, 38` | Hardware SPI |
| **Motor Ports M5, M6, M2, M4**| `GPIO9..16` | Dual H-bridge driver channels |

---

## Directory Structure

```
├── firmware/
│   ├── board/LOF_TITAN/      # Custom board definition (mpconfigboard.h/cmake, sdkconfig.board)
│   ├── supervisor/           # Immutable BLE supervisor, state machine & program runner
│   ├── frozen/               # Frozen boot hook (_boot.py)
│   └── partitions/           # 16 MB flash layout (partitions.csv)
├── webapp/                   # Modern Web Bluetooth Companion IDE (Dark Mode, Editor, Console)
├── scripts/                  # Cross-platform build and flash automation (sh / ps1)
├── tests/                    # Python unit and validation test suite
├── docs/                     # Full technical documentation suite
└── dist/                     # Release deliverables & flash args
```

---

## Documentation
* [System Architecture](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/ARCHITECTURE.md)
* [BLE Protocol Specification](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/BLE_PROTOCOL.md)
* [Hardware Pinout Guide](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/PINOUT.md)
* [16 MB Partition Map](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/PARTITIONS.md)
* [Build Guide](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/BUILD.md)
* [Flashing Guide](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/FLASHING.md)
* [Verification & Test Matrix](file:///c:/Users/TRG-LOF-112-123.TOPROCKGLOBAL/Lof%20titan%20Firmware/docs/TESTING.md)
