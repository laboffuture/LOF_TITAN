#!/usr/bin/env bash
# LOF TITAN Firmware Build Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FIRMWARE_DIR="${ROOT_DIR}/firmware"
MPY_DIR="${FIRMWARE_DIR}/micropython"
ESP32_PORT_DIR="${MPY_DIR}/ports/esp32"
DIST_DIR="${ROOT_DIR}/dist"

echo "=============================================="
echo " Building LOF TITAN ESP32-S3 N16R8 Firmware   "
echo "=============================================="

mkdir -p "${DIST_DIR}"

# Check ESP-IDF environment
if ! command -v idf.py >/dev/null 2>&1; then
    if [ -n "${IDF_PATH}" ] && [ -f "${IDF_PATH}/export.sh" ]; then
        echo "Sourcing ESP-IDF from ${IDF_PATH}..."
        . "${IDF_PATH}/export.sh"
    else
        echo "Error: idf.py not found in PATH and IDF_PATH not set."
        echo "Please run your ESP-IDF export script first (e.g. . $HOME/esp/esp-idf/export.sh)."
        exit 1
    fi
fi

# Ensure board definition is synchronized
BOARD_DIR="${ESP32_PORT_DIR}/boards/LOF_TITAN"
mkdir -p "${BOARD_DIR}"
cp -rf "${FIRMWARE_DIR}/board/LOF_TITAN/"* "${BOARD_DIR}/"
cp -f "${FIRMWARE_DIR}/partitions/partitions.csv" "${BOARD_DIR}/"

# Build MicroPython ESP32 port with LOF_TITAN board
cd "${ESP32_PORT_DIR}"
echo "[BUILD] Compiling MicroPython for BOARD=LOF_TITAN..."
make BOARD=LOF_TITAN -j$(nproc 2>/dev/null || echo 4)

BUILD_OUT="${ESP32_PORT_DIR}/build-LOF_TITAN"

echo "[STAGE] Copying build artifacts to dist/..."
cp -f "${BUILD_OUT}/bootloader/bootloader.bin" "${DIST_DIR}/bootloader.bin"
cp -f "${BUILD_OUT}/partition_table/partition-table.bin" "${DIST_DIR}/partitions.bin"
cp -f "${BUILD_OUT}/micropython.bin" "${DIST_DIR}/micropython.bin"

echo "[MERGE] Creating combined flash image LOF_TITAN_firmware.bin..."
python3 -m esptool --chip esp32s3 merge_bin \
    -o "${DIST_DIR}/LOF_TITAN_firmware.bin" \
    --flash_mode dio \
    --flash_freq 80m \
    --flash_size 16MB \
    0x0 "${DIST_DIR}/bootloader.bin" \
    0x8000 "${DIST_DIR}/partitions.bin" \
    0x20000 "${DIST_DIR}/micropython.bin"

echo "[INFO] Generating flash_args.txt and checksums.txt..."
cat << EOF > "${DIST_DIR}/flash_args.txt"
--chip esp32s3
--port (AUTO/COM)
--baud 460800
--before default_reset
--after hard_reset write_flash
-z
--flash_mode dio
--flash_freq 80m
--flash_size 16MB
0x0 bootloader.bin
0x8000 partitions.bin
0x20000 micropython.bin
EOF

cat << EOF > "${DIST_DIR}/VERSION.txt"
LOF TITAN ESP32-S3 N16R8 Custom Firmware
Version: 1.0.0
Target: ESP32-S3
Flash: 16 MB
PSRAM: 8 MB Octal (OPI)
Build Date: $(date -u +"%Y-%m-%d %H:%M:%SZ")
EOF

cd "${DIST_DIR}"
if command -v sha256sum >/dev/null 2>&1; then
    sha256sum *.bin > checksums.txt
elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 *.bin > checksums.txt
fi

echo "=============================================="
echo " BUILD SUCCESSFUL!"
echo " Flashable deliverables staged in: dist/"
echo " - dist/LOF_TITAN_firmware.bin (Combined binary for 0x0)"
echo " - dist/bootloader.bin (0x0)"
echo " - dist/partitions.bin (0x8000)"
echo " - dist/micropython.bin (0x20000)"
echo "=============================================="
