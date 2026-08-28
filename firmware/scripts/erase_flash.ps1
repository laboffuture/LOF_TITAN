param (
    [Parameter(Mandatory=$true)]
    [string]$Port,

    [Parameter(Mandatory=$false)]
    [int]$Baud = 460800
)

$ErrorActionPreference = "Stop"

Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " Erasing Flash on $Port " -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

esptool.py --chip esp32s3 -p $Port -b $Baud erase_flash

if ($LASTEXITCODE -eq 0) {
    Write-Host "Erase complete!" -ForegroundColor Green
} else {
    Write-Error "Erase failed."
    exit 1
}
