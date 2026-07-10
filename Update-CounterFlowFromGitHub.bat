@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0Update-CounterFlowFromGitHub.ps1" %*
pause
