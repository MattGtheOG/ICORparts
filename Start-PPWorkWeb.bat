@echo off
setlocal

cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-PPWorkWeb.ps1" %*
set "COUNTERFLOW_EXIT=%ERRORLEVEL%"

if not "%COUNTERFLOW_EXIT%"=="0" (
    echo.
    echo CounterFlow did not start. Review the message above.
    pause
)

endlocal & exit /b %COUNTERFLOW_EXIT%
