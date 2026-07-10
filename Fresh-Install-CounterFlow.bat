@echo off
title CounterFlow Fresh Install
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Reset-CounterFlowFreshInstall.ps1" %*
if errorlevel 1 (
  echo.
  echo CounterFlow was not reset.
  pause
)
