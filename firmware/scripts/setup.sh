#!/usr/bin/env bash
# LOF TITAN Firmware Build Environment Setup Script
set -e

echo "=============================================="
echo " Setting up LOF TITAN Firmware Build Toolchain"
echo "=============================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
FIRMWARE_DIR="${ROOT_DIR}/firmware"
MPY_DIR="${FIRMWARE_DIR}/micropython"

MPY_TAG="v1.24.1"
IDF_TAG="v5.2.2"

echo "[1/4] Checking Python and Git..."
command -v python3 >/dev/null 2>&1 || { echo "Error: python3 is required."; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Error: git is required."; exit 1; }

echo "[2/4] Cloning MicroPython (${MPY_TAG})..."
if [ ! -d "${MPY_DIR}" ]; then
    git clone --depth 1 --branch "${MPY_TAG}" https://github.com/micropython/micropython.git "${MPY_DIR}"
    cd "${MPY_DIR}"
    git submodule update --init lib/berkeley-db-1.xx
    git submodule update --init lib/micropython-lib
else
    echo "MicroPython source directory already exists."
fi

echo "[3/4] Building mpy-cross host compiler..."
cd "${MPY_DIR}/mpy-cross"
make -j$(nproc 2>/dev/null || echo 4)

echo "[4/4] Linking LOF TITAN board definition..."
BOARD_TARGET_DIR="${MPY_DIR}/ports/esp32/boards/LOF_TITAN"
mkdir -p "${BOARD_TARGET_DIR}"
cp -rf "${FIRMWARE_DIR}/board/LOF_TITAN/"* "${BOARD_TARGET_DIR}/"
cp -f "${FIRMWARE_DIR}/partitions/partitions.csv" "${BOARD_TARGET_DIR}/"

echo "=============================================="
echo " Setup complete! Ready to run: ./scripts/build.sh"
echo "=============================================="
