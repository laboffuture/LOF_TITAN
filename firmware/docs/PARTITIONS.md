# LOF TITAN ESP32-S3 Flash Partitioning

The LOF TITAN uses a 16MB Flash memory. The layout is optimized to provide a robust OTA-free boot environment with maximum user storage.

| Name | Type | Subtype | Offset | Size | Purpose |
|------|------|---------|--------|------|---------|
| `nvs` | data | `nvs` | `0x9000` | 24 KB (`0x6000`) | Non-volatile storage for system/MicroPython parameters |
| `phy_init` | data | `phy` | `0xF000` | 4 KB (`0x1000`) | Physical layer (PHY) calibration data |
| `factory` | app | `factory` | `0x10000` | 4 MB (`0x400000`) | Primary MicroPython firmware application |
| `vfs` | data | `fat` | `0x410000` | ~11.9 MB (`0xBF0000`) | User filesystem for scripts, assets, and libraries |
