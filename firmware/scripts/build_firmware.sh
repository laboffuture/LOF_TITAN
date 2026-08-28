#!/bin/bash
set -e

# Setup paths and environment
cd ~/projects/lof-titan

# Sync Windows workspace to WSL build directory
echo "=== SYNCING FILES FROM WINDOWS ==="
cp -r /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/firmware/board/LOF_TITAN/* ~/projects/lof-titan/firmware/micropython/ports/esp32/boards/LOF_TITAN/

source ~/esp/esp-idf/export.sh

echo "=== ENVIRONMENT INFO ===" > build_info.txt
cd ~/projects/lof-titan/firmware/micropython
git describe --tags --always | tee -a ../../build_info.txt
git status | tee -a ../../build_info.txt
echo "IDF_PATH: $IDF_PATH" | tee -a ../../build_info.txt
idf.py --version | tee -a ../../build_info.txt
python --version | tee -a ../../build_info.txt
cmake --version | tee -a ../../build_info.txt
ninja --version | tee -a ../../build_info.txt
xtensa-esp32s3-elf-gcc --version | tee -a ../../build_info.txt

echo "=== BUILDING MPY-CROSS ==="
make -C mpy-cross -j$(nproc)
mpy-cross/build/mpy-cross --version | tee -a ../../build_info.txt

echo "=== BUILDING MICROPYTHON ==="
cd ports/esp32
make submodules
make BOARD=LOF_TITAN -j$(nproc) 2>&1 | tee ../../../../build_success.log

echo "=== VERIFYING BINARIES ==="
cd build-LOF_TITAN
# Run esptool image_info
python $IDF_PATH/components/esptool_py/esptool/esptool.py image_info firmware.bin | tee ../../../../../image_info.log

# Calculate SHA256
sha256sum bootloader/bootloader.bin partition_table/partition-table.bin micropython.bin firmware.bin > ../../../../../checksums.txt

echo "=== PREPARING DIST ==="
mkdir -p ~/projects/lof-titan/dist/baseline
cp bootloader/bootloader.bin ~/projects/lof-titan/dist/baseline/
cp partition_table/partition-table.bin ~/projects/lof-titan/dist/baseline/partitions.bin
cp micropython.bin ~/projects/lof-titan/dist/baseline/
cp firmware.bin ~/projects/lof-titan/dist/baseline/
cp flash_args ~/projects/lof-titan/dist/baseline/flash_args.txt
cp ../../../../../checksums.txt ~/projects/lof-titan/dist/baseline/
cp ../../../../../build_info.txt ~/projects/lof-titan/dist/baseline/
cp ../../../../../build_success.log ~/projects/lof-titan/dist/baseline/
cp ../../../../../image_info.log ~/projects/lof-titan/dist/baseline/

# Also copy dist to the Windows workspace
cp -r ~/projects/lof-titan/dist/baseline /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/dist/
# Also mirror files to dist/ root so flash commands work from both dist/ and dist/baseline/
cp ~/projects/lof-titan/dist/baseline/bootloader.bin /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/dist/
cp ~/projects/lof-titan/dist/baseline/partitions.bin /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/dist/
cp ~/projects/lof-titan/dist/baseline/micropython.bin /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/dist/
cp ~/projects/lof-titan/dist/baseline/firmware.bin /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/dist/
cp -r ~/projects/lof-titan/dist/baseline/* /mnt/c/Users/TRG-LOF-112-106/Desktop/Lof\ titan\ Firmware/webapp/public/firmware/

echo "Build and dist preparation complete."
