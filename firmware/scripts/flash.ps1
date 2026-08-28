param (
    [Parameter(Mandatory=$true)]
    [string]$Port,

    [Parameter(Mandatory=$false)]
    [int]$Baud = 460800
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$DistDir = Join-Path $RootDir "dist\baseline"

$Bootloader = Join-Path $DistDir "bootloader.bin"
$PartitionTable = Join-Path $DistDir "partition-table.bin"
$AppBin = Join-Path $DistDir "micropython.bin"

if (-not (Test-Path $Bootloader)) {
    Write-Error "Bootloader not found! Run build.ps1 first."
    exit 1
}

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Flashing LOF TITAN Firmware to $Port " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

esptool.py --chip esp32s3 -p $Port -b $Baud --before default_reset --after hard_reset write_flash -z --flash_mode dio --flash_freq 80m --flash_size 16MB 0x0 $Bootloader 0x8000 $PartitionTable 0x10000 $AppBin

if ($LASTEXITCODE -eq 0) {
    Write-Host "Flash complete!" -ForegroundColor Green
} else {
    Write-Error "Flash failed."
    exit 1
}
