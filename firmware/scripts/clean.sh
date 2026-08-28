#!/usr/bin/env bash
# LOF TITAN Clean Script
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "Cleaning build artifacts..."
rm -rf "${ROOT_DIR}/firmware/micropython/ports/esp32/build-LOF_TITAN"
rm -rf "${ROOT_DIR}/dist"/*
echo "Clean complete."
