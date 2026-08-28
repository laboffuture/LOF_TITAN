# LOF TITAN Firmware Build Script (PowerShell) - Baseline
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Building MicroPython Baseline (ESP32-S3)     " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$FirmwareDir = Join-Path $RootDir "firmware"
$MpyDir = Join-Path $FirmwareDir "micropython"
$Esp32PortDir = Join-Path $MpyDir "ports\esp32"
$DistDir = Join-Path $RootDir "dist\baseline"

if (-not (Test-Path $DistDir)) {
    New-Item -ItemType Directory -Path $DistDir -Force | Out-Null
}

# 1. Activate ESP-IDF v5.5.1
$IdfPath = "C:\Espressif\v5.5.1\esp-idf"
$ExportScript = Join-Path $IdfPath "export.ps1"
if (-not (Test-Path $ExportScript)) {
    Write-Error "ESP-IDF v5.5.1 not found at $IdfPath"
    exit 1
}

Write-Host "[BUILD] Activating ESP-IDF environment..." -ForegroundColor Yellow
. $ExportScript

# 2. Print required build environment info
Write-Host "--- BUILD ENVIRONMENT ---"
Write-Host "IDF_PATH: $env:IDF_PATH"
python "$env:IDF_PATH\tools\idf.py" --version
python --version
cmake --version
ninja --version
xtensa-esp32s3-elf-gcc --version
Write-Host "-------------------------"

# 3. Setup mpy-cross
# We use the prebuilt pip package 'mpy-cross' because we verified it matches v1.28.0 and v6.3 bytecode format.
$env:MICROPY_MPYCROSS = "mpy-cross"
$mpyCrossCheck = Get-Command mpy-cross -ErrorAction SilentlyContinue
if (-not $mpyCrossCheck) {
    Write-Error "mpy-cross not found in PATH! Run 'pip install mpy-cross'."
    exit 1
}

Write-Host "[BUILD] Verifying mpy-cross..." -ForegroundColor Yellow
$mpy_version = mpy-cross --version
Write-Host $mpy_version
if ($mpy_version -notmatch "v1\.28\.0" -or $mpy_version -notmatch "v6\.3") {
    Write-Error "mpy-cross version mismatch! Expected v1.28.0 emitting mpy v6.3."
    exit 1
}


# 4. Build Stock Firmware
Write-Host "[BUILD] Compiling ESP32_GENERIC_S3 (SPIRAM_OCT)..." -ForegroundColor Yellow
Push-Location $Esp32PortDir

# Clean previous build artifacts
if (Test-Path "build-ESP32_GENERIC_S3") {
    Remove-Item -Recurse -Force "build-ESP32_GENERIC_S3"
}

# Execute idf.py build
$PythonPath = (Get-Command python).Source
$BuildCmd = "idf.py -B build-ESP32_GENERIC_S3 -D MICROPY_BOARD=ESP32_GENERIC_S3 -D MICROPY_BOARD_VARIANT=SPIRAM_OCT -D Python3_EXECUTABLE=`"$PythonPath`" build"
Invoke-Expression $BuildCmd

if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Error "Build failed with exit code $LASTEXITCODE"
    exit 1
}

$BuildOutDir = Join-Path $Esp32PortDir "build-ESP32_GENERIC_S3"
Pop-Location

# 5. Verify Outputs
$Bootloader = Join-Path $BuildOutDir "bootloader\bootloader.bin"
$PartitionTable = Join-Path $BuildOutDir "partition_table\partition-table.bin"
$AppBin = Join-Path $BuildOutDir "micropython.bin"
$FirmwareBin = Join-Path $BuildOutDir "firmware.bin"

$Files = @($Bootloader, $PartitionTable, $AppBin, $FirmwareBin)
foreach ($file in $Files) {
    if (-not (Test-Path $file)) {
        Write-Error "Missing required build output: $file"
        exit 1
    }
    $size = (Get-Item $file).Length
    if ($size -eq 0) {
        Write-Error "Build output file is empty (0 bytes): $file"
        exit 1
    }
}

# 6. Copy to dist/baseline/
Write-Host "[BUILD] Staging files to dist/baseline/..." -ForegroundColor Yellow
Copy-Item $Bootloader -Destination $DistDir -Force
Copy-Item $PartitionTable -Destination $DistDir -Force
Copy-Item $AppBin -Destination $DistDir -Force
Copy-Item $FirmwareBin -Destination $DistDir -Force

# 7. Generate flash_args.txt
@"
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
0x8000 partition-table.bin
0x10000 micropython.bin
"@ | Out-File -FilePath (Join-Path $DistDir "flash_args.txt") -Encoding ascii

# 8. Generate checksums.txt
Write-Host "[BUILD] Generating SHA-256 checksums..." -ForegroundColor Yellow
$ChecksumsFile = Join-Path $DistDir "checksums.txt"
if (Test-Path $ChecksumsFile) { Remove-Item $ChecksumsFile }

foreach ($file in $Files) {
    $basename = Split-Path $file -Leaf
    $hash = (Get-FileHash -Path $file -Algorithm SHA256).Hash
    "$hash  $basename" | Out-File -FilePath $ChecksumsFile -Append -Encoding ascii
}

# 9. Verify with esptool
Write-Host "[BUILD] Verifying images with esptool..." -ForegroundColor Yellow
esptool.py --chip esp32s3 image_info $FirmwareBin | Out-Host

# 10. Generate build_info.txt
@"
MICROPYTHON VERSION: v1.28.0
ESP-IDF VERSION: v5.5.1
TARGET: ESP32-S3
BOARD: ESP32_GENERIC_S3
VARIANT: SPIRAM_OCT
BUILD RESULT: SUCCESS
MPY-CROSS VERSION: 1.28.0
MPY FORMAT VERSION: 6.3
BOOTLOADER SIZE: $((Get-Item $Bootloader).Length) bytes
PARTITION TABLE SIZE: $((Get-Item $PartitionTable).Length) bytes
MICROPYTHON APP SIZE: $((Get-Item $AppBin).Length) bytes
MERGED FIRMWARE SIZE: $((Get-Item $FirmwareBin).Length) bytes
SHA256: $((Get-FileHash -Path $FirmwareBin -Algorithm SHA256).Hash)
OUTPUT PATH: $DistDir
"@ | Out-File -FilePath (Join-Path $DistDir "build_info.txt") -Encoding ascii

Write-Host "==============================================" -ForegroundColor Green
Write-Host " Baseline build complete! Outputs in dist/baseline/" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
