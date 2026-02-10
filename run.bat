@echo off
title Trial Monitor App
echo Starting Trial Monitor...
echo.

:: Navigate to the script's directory (project root)
cd /d "%~dp0"

:: Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

:: Optional: Update dependencies (uncomment if desired)
:: echo Checking for updates...
:: call npm update

echo.
echo Starting application...
echo The app will open in your default browser.
echo Close this window to stop the app.
echo.

:: Launch the PowerShell manager minimized and exit this CMD window
start "" /min PowerShell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
exit
