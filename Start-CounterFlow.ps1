param(
    [int]$Port = 8765,
    [string]$HostAddress = "127.0.0.1",
    [string]$DataDir = "",
    [switch]$NoBrowser
)

$LegacyLauncher = Join-Path $PSScriptRoot "Start-PPWorkWeb.ps1"
& $LegacyLauncher -Port $Port -HostAddress $HostAddress -DataDir $DataDir -NoBrowser:$NoBrowser
