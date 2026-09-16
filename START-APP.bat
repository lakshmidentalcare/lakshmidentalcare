@echo off
:: ===================================================
:: LAKSHMI DENTAL CARE — START ALL CLINIC SERVICES
:: ===================================================
echo.
echo  Starting Lakshmi Dental Care Backend & Frontend...
echo.

start "LDC Backend Server" /D "%~dp0backend" cmd /k "npm run start:dev"
timeout /t 5 /nobreak >nul

start "LDC Frontend Dashboard" /D "%~dp0frontend" cmd /k "npm run dev"
timeout /t 5 /nobreak >nul

echo  Launching Public Tunnel...
call "%~dp0START-TUNNEL.bat"
