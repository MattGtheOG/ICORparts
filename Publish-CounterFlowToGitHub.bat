@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0Publish-CounterFlowToGitHub.ps1" %*
pause
