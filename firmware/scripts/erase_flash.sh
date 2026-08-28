#!/usr/bin/env bash
# LOF TITAN Erase Flash Script
set -e

PORT="${1:-/dev/ttyACM0}"

echo "=============================================="
echo " Erasing Flash on ${PORT}..."
echo "=============================================="

python3 -m esptool --chip esp32s3 --port "${PORT}" erase_flash

echo "=============================================="
echo " Flash Erase Complete."
echo "=============================================="
