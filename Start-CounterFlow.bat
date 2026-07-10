@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Start-CounterFlow.ps1" %* -HostAddress 0.0.0.0 -Port 8765
