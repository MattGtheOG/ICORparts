@echo off
setlocal

cd /d "%~dp0"

set "COUNTERFLOW_HOST_ARG=-HostAddress 0.0.0.0"
set "COUNTERFLOW_PORT_ARG=-Port 8765"

for %%A in (%*) do (
    if /I "%%~A"=="-HostAddress" set "COUNTERFLOW_HOST_ARG="
    if /I "%%~A"=="-Port" set "COUNTERFLOW_PORT_ARG="
)

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-CounterFlow.ps1" %COUNTERFLOW_HOST_ARG% %COUNTERFLOW_PORT_ARG% %*
set "COUNTERFLOW_EXIT=%ERRORLEVEL%"

if not "%COUNTERFLOW_EXIT%"=="0" (
    echo.
    echo CounterFlow did not start. Review the message above.
    pause
)

endlocal & exit /b %COUNTERFLOW_EXIT%
