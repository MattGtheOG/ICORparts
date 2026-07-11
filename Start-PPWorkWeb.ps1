param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8765,
    [string]$HostAddress = "127.0.0.1",
    [string]$DataDir = "",
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$CounterFlowLauncher = Join-Path $PSScriptRoot "Start-CounterFlow.ps1"

if (-not (Test-Path -LiteralPath $CounterFlowLauncher)) {
    throw "Start-CounterFlow.ps1 was not found next to this legacy launcher."
}

& $CounterFlowLauncher -Port $Port -HostAddress $HostAddress -DataDir $DataDir -NoBrowser:$NoBrowser
exit $LASTEXITCODE
