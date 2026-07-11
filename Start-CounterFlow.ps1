param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8765,
    [string]$HostAddress = "127.0.0.1",
    [string]$DataDir = "",
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPath = Join-Path $AppDir "server.py"
$BundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

function Write-CounterFlowLine {
    param(
        [string]$Label,
        [string]$Value,
        [ConsoleColor]$ValueColor = [ConsoleColor]::White
    )

    Write-Host ("  {0,-10}" -f $Label) -NoNewline -ForegroundColor DarkGray
    Write-Host $Value -ForegroundColor $ValueColor
}

function Write-CounterFlowHeader {
    Write-Host ""
    Write-Host "  ===============================================" -ForegroundColor DarkCyan
    Write-Host "  CounterFlow Server Launcher" -ForegroundColor Cyan
    Write-Host "  Parts and Service reference board" -ForegroundColor DarkGray
    Write-Host "  ===============================================" -ForegroundColor DarkCyan
    Write-Host ""
}

function Test-Python {
    param([string]$Path)

    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
        return $false
    }

    & $Path --version *> $null
    return $LASTEXITCODE -eq 0
}

function Resolve-Python {
    $PythonCommand = Get-Command python -ErrorAction SilentlyContinue
    if ($PythonCommand -and (Test-Python $PythonCommand.Source)) {
        return $PythonCommand.Source
    }

    if (Test-Python $BundledPython) {
        return $BundledPython
    }

    throw "Python was not found. Install Python 3.12 or run this from Codex on this PC."
}

function Get-BrowserHost {
    param([string]$BindHost)

    if ($BindHost -eq "0.0.0.0" -or $BindHost -eq "::") {
        return "localhost"
    }

    return $BindHost
}

try {
    Write-CounterFlowHeader

    if (-not (Test-Path -LiteralPath $ServerPath)) {
        throw "server.py was not found next to this launcher."
    }

    $Python = Resolve-Python
    $BrowserHost = Get-BrowserHost $HostAddress
    $Url = "http://$BrowserHost`:$Port/"

    Write-CounterFlowLine "App" $AppDir
    Write-CounterFlowLine "Python" $Python
    Write-CounterFlowLine "Binding" "$HostAddress`:$Port" Cyan

    if ($DataDir) {
        $ResolvedDataDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($DataDir)
        New-Item -ItemType Directory -Force -Path $ResolvedDataDir | Out-Null
        $env:PPWORK_DATA_DIR = $ResolvedDataDir
        Write-CounterFlowLine "Data" $ResolvedDataDir
    }
    else {
        Write-CounterFlowLine "Data" "app folder databases"
    }

    Write-CounterFlowLine "Open" $Url Green

    if ($NoBrowser) {
        Write-CounterFlowLine "Browser" "not opened"
    }
    else {
        Write-CounterFlowLine "Browser" "opening default browser..."
        Start-Process $Url
    }

    Write-Host ""
    Write-Host "  CounterFlow is starting. Leave this window open while the app is running." -ForegroundColor Yellow
    Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor DarkGray
    Write-Host ""

    & $Python $ServerPath --host $HostAddress --port $Port
    exit $LASTEXITCODE
}
catch {
    Write-Host ""
    Write-Host "  CounterFlow could not start." -ForegroundColor Red
    Write-Host ("  {0}" -f $_.Exception.Message) -ForegroundColor Red
    Write-Host ""
    exit 1
}
