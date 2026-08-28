# LOF TITAN Firmware Flashing Guide

## 1. Quick Flashing

### Using PowerShell (Windows):
```powershell
# Flash combined binary to COM port
.\scripts\flash.ps1 -Port COM3

# Erase flash before flashing (recommended for clean setup)
.\scripts\erase_flash.ps1 -Port COM3
```

### Using Bash (Linux / macOS):
```bash
# Flash combined binary
./scripts/flash.sh /dev/ttyACM0

# Erase entire flash
./scripts/erase_flash.sh /dev/ttyACM0
```

---

## 2. Direct `esptool.py` Commands

### Combined Image (Single Command):
```bash
esptool.py --chip esp32s3 --port COM3 --baud 460800 \
    --before default_reset --after hard_reset write_flash -z \
    --flash_mode dio --flash_freq 80m --flash_size 16MB \
    0x0 dist/LOF_TITAN_firmware.bin
```

### Individual Binaries:
```bash
esptool.py --chip esp32s3 --port COM3 --baud 460800 \
    --before default_reset --after hard_reset write_flash -z \
    --flash_mode dio --flash_freq 80m --flash_size 16MB \
    0x0 dist/bootloader.bin \
    0x8000 dist/partitions.bin \
    0x20000 dist/micropython.bin
```
