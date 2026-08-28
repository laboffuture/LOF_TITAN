#!/bin/bash
set -e

echo "Starting build setup..."

cd ~/projects/lof-titan/firmware
git clone https://github.com/micropython/micropython.git micropython
cd micropython
git checkout v1.28.0
git submodule update --init --recursive

echo "Setting up ESP-IDF..."
mkdir -p ~/esp
cd ~/esp
if [ ! -d "esp-idf" ]; then
    git clone -b v5.5.1 --recursive https://github.com/espressif/esp-idf.git esp-idf
fi

cd esp-idf
./install.sh esp32s3

echo "Setup build scripts done."
