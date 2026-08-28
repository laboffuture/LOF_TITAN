@echo off
title LOF TITAN Dashboard Local Server
echo ========================================================
echo        LOF TITAN DASHBOARD - LOCAL NETWORK SERVER
echo ========================================================
echo.
echo Your Local Wi-Fi IP Address: 10.79.23.140
echo.
echo - Access on this PC:             http://localhost:8080
echo - Access on OTHER PCs / Devices:  http://10.79.23.140:8080
echo.
echo ========================================================
echo Server is LIVE on Port 8080. Close this window to stop.
echo ========================================================
echo.

python -m http.server 8080 --bind 0.0.0.0 --directory "%~dp0webapp\dist"
pause
