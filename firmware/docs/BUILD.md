# LOF TITAN Firmware Build Guide

## 1. Prerequisites
* Python 3.8+ (with `esptool`)
* Git
* CMake & Ninja
* ESP-IDF v5.2.2 (recommended for MicroPython v1.24.1)
* Xtensa ESP32-S3 GCC Toolchain (`xtensa-esp32s3-elf-gcc`)

---

## 2. Automated Setup

### On Linux / macOS:
```bash
./scripts/setup.sh
```

### On Windows PowerShell:
```powershell
.\scripts\setup.ps1
```

---

## 3. Building the Firmware

Ensure ESP-IDF environment variables are exported, then execute:

### On Linux / macOS:
```bash
./scripts/build.sh
```

### On Windows PowerShell:
```powershell
.\scripts\build.ps1
```

---

## 4. Build Outputs (`dist/`)
Upon successful compilation, build deliverables will be placed in the `dist/` directory:
* `dist/bootloader.bin`: Bootloader at `0x0`
* `dist/partitions.bin`: Custom 16 MB partition table at `0x8000`
* `dist/micropython.bin`: MicroPython application image at `0x20000`
* `dist/LOF_TITAN_firmware.bin`: Convenient combined image for flashing at `0x0`
* `dist/flash_args.txt`: Exact flash parameters and offsets
* `dist/checksums.txt`: SHA256 checksums
* `dist/VERSION.txt`: Release metadata
