param(
    [int]$Port = 8765,
    [string]$HostAddress = "127.0.0.1",
    [string]$DataDir = "",
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

function Test-Python($Path) {
    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    & $Path --version *> $null
    return $LASTEXITCODE -eq 0
}

$Python = $null
$PythonCommand = Get-Command python -ErrorAction SilentlyContinue
if ($PythonCommand -and (Test-Python $PythonCommand.Source)) {
    $Python = $PythonCommand.Source
}
elseif (Test-Python $BundledPython) {
    $Python = $BundledPython
}
else {
    throw "Python was not found. Install Python 3.12 or run this from Codex on this PC."
}

if ($DataDir) {
    $ResolvedDataDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($DataDir)
    New-Item -ItemType Directory -Force -Path $ResolvedDataDir | Out-Null
    $env:PPWORK_DATA_DIR = $ResolvedDataDir
    Write-Host "Using PPWork data folder: $ResolvedDataDir"
}

$Url = "http://localhost:$Port/"
if (-not $NoBrowser) {
    Start-Process $Url
}
else {
    Write-Host "PPWork Web URL: $Url"
}
& $Python (Join-Path $AppDir "server.py") --host $HostAddress --port $Port
