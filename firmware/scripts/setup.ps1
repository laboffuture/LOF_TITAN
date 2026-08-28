# LOF TITAN Firmware Build Environment Setup Script (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Setting up LOF TITAN Firmware Build Toolchain" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$FirmwareDir = Join-Path $RootDir "firmware"
$MpyDir = Join-Path $FirmwareDir "micropython"

$MpyTag = "v1.24.1"

Write-Host "[1/4] Checking Python and Git..." -ForegroundColor Yellow
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    throw "Python is required but not found in PATH."
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is required but not found in PATH."
}

Write-Host "[2/4] Fetching MicroPython ($MpyTag)..." -ForegroundColor Yellow
if (-not (Test-Path $MpyDir)) {
    git clone --depth 1 --branch $MpyTag https://github.com/micropython/micropython.git $MpyDir
    Push-Location $MpyDir
    git submodule update --init lib/berkeley-db-1.xx
    git submodule update --init lib/micropython-lib
    Pop-Location
} else {
    Write-Host "MicroPython source directory already exists."
}

Write-Host "[3/4] Linking LOF TITAN board definition..." -ForegroundColor Yellow
$BoardTargetDir = Join-Path $MpyDir "ports\esp32\boards\LOF_TITAN"
if (-not (Test-Path $BoardTargetDir)) {
    New-Item -ItemType Directory -Path $BoardTargetDir -Force | Out-Null
}
Copy-Item -Path (Join-Path $FirmwareDir "board\LOF_TITAN\*") -Destination $BoardTargetDir -Recurse -Force
Copy-Item -Path (Join-Path $FirmwareDir "partitions\partitions.csv") -Destination $BoardTargetDir -Force

Write-Host "==============================================" -ForegroundColor Green
Write-Host " Setup complete! Ready to build firmware." -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
