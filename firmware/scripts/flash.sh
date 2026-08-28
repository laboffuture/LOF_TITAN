#!/usr/bin/env bash
# LOF TITAN Firmware Flashing Script
# Usage: ./scripts/flash.sh [/dev/ttyUSB0 or /dev/ttyACM0]
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"

PORT="${1:-/dev/ttyACM0}"
BAUD="${2:-460800}"

echo "=============================================="
echo " Flashing LOF TITAN Firmware to ${PORT}"
echo "=============================================="

if [ -f "${DIST_DIR}/LOF_TITAN_firmware.bin" ]; then
    echo "Flashing combined binary at offset 0x0..."
    python3 -m esptool --chip esp32s3 --port "${PORT}" --baud "${BAUD}" \
        --before default_reset --after hard_reset write_flash -z \
        --flash_mode dio --flash_freq 80m --flash_size 16MB \
        0x0 "${DIST_DIR}/LOF_TITAN_firmware.bin"
else
    echo "Combined binary not found. Flashing individual components..."
    python3 -m esptool --chip esp32s3 --port "${PORT}" --baud "${BAUD}" \
        --before default_reset --after hard_reset write_flash -z \
        --flash_mode dio --flash_freq 80m --flash_size 16MB \
        0x0 "${DIST_DIR}/bootloader.bin" \
        0x8000 "${DIST_DIR}/partitions.bin" \
        0x20000 "${DIST_DIR}/micropython.bin"
fi

echo "=============================================="
echo " Flashing Complete! Reset board to start."
echo "=============================================="
