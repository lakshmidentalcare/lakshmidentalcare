@echo off
:: =============================================
:: LAKSHMI DENTAL CARE - Start Network Server
:: Double-click this file to start the server
:: UAC will ask for Administrator permission
:: =============================================
powershell -ExecutionPolicy Bypass -File "%~dp0serve-network.ps1"
pause
