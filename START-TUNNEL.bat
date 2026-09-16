@echo off
:: ===================================================
:: LAKSHMI DENTAL CARE — START PUBLIC ACCESS TUNNEL
:: ===================================================
:: Double-click this file to make the dashboard
:: accessible from ANY device, ANY WiFi, ANY location
:: ===================================================
echo.
echo  Starting Lakshmi Dental Care Public Server...
echo  Please wait ~10 seconds for the public URL to appear.
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0START-TUNNEL.ps1"
