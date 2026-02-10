@echo off
echo Creating 'Trial Monitor' shortcut on your Desktop...

set "SNAME=Trial Monitor"
set "TARGET=%~dp0run.bat"
set "ICON=%SystemRoot%\System32\shell32.dll,15"
set "DESKTOP=%USERPROFILE%\Desktop"

powershell -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%DESKTOP%\%SNAME%.lnk');$s.TargetPath='%TARGET%';$s.IconLocation='%ICON%';$s.Save()"

echo.
echo Shortcut created on Desktop!
echo Look for the monitor icon labeled "Trial Monitor".
echo.
pause
