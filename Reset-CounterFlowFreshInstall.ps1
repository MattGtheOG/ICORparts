param(
    [int]$Port = 8765,
    [string]$HostAddress = "127.0.0.1",
    [string]$DataDir = "",
    [switch]$NoBrowser,
    [switch]$NoStart,
    [string]$Confirmation = ""
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ResolvedDataDir = if ([string]::IsNullOrWhiteSpace($DataDir)) {
    [IO.Path]::GetFullPath($AppDir)
}
elseif ([IO.Path]::IsPathRooted($DataDir)) {
    [IO.Path]::GetFullPath($DataDir)
}
else {
    [IO.Path]::GetFullPath((Join-Path $AppDir $DataDir))
}

New-Item -ItemType Directory -Path $ResolvedDataDir -Force | Out-Null

$Listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($Listener) {
    throw "CounterFlow appears to be running on port $Port. Close it before starting a fresh install."
}

Write-Host ""
Write-Host "COUNTERFLOW FRESH INSTALL" -ForegroundColor Yellow
Write-Host "This will remove all brands, parts, employees, favorites, settings, and activity from:"
Write-Host $ResolvedDataDir -ForegroundColor Cyan
Write-Host "A timestamped safety backup will be created first."
Write-Host ""

if ([string]::IsNullOrWhiteSpace($Confirmation)) {
    $Confirmation = Read-Host "Type FRESH START to continue"
}
if ($Confirmation -cne "FRESH START") {
    Write-Host "Confirmation did not match. Nothing was changed." -ForegroundColor Yellow
    exit 1
}

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupDir = Join-Path $ResolvedDataDir ("backups\before-fresh-install-" + $Timestamp)
$DatabaseNames = @("parts.db", "service.db")
$DatabaseFiles = foreach ($Name in $DatabaseNames) {
    Join-Path $ResolvedDataDir $Name
}

New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
foreach ($DatabasePath in $DatabaseFiles) {
    if (Test-Path -LiteralPath $DatabasePath) {
        Copy-Item -LiteralPath $DatabasePath -Destination $BackupDir -Force
    }
    foreach ($Suffix in @("-wal", "-shm")) {
        $Sidecar = $DatabasePath + $Suffix
        if (Test-Path -LiteralPath $Sidecar) {
            Copy-Item -LiteralPath $Sidecar -Destination $BackupDir -Force
        }
    }
}

foreach ($DatabasePath in $DatabaseFiles) {
    foreach ($Target in @($DatabasePath, $DatabasePath + "-wal", $DatabasePath + "-shm")) {
        if (Test-Path -LiteralPath $Target) {
            Remove-Item -LiteralPath $Target -Force
        }
    }
}

$MarkerPath = Join-Path $ResolvedDataDir ".counterflow-empty-install"
Set-Content -LiteralPath $MarkerPath -Value ("Blank CounterFlow installation created " + (Get-Date).ToString("o")) -Encoding ASCII

Write-Host ""
Write-Host "Fresh CounterFlow data is ready." -ForegroundColor Green
Write-Host "Safety backup: $BackupDir"
Write-Host "The first browser opening will create empty databases and request a new admin account."

if (-not $NoStart) {
    & (Join-Path $AppDir "Start-CounterFlow.ps1") -Port $Port -HostAddress $HostAddress -DataDir $ResolvedDataDir -NoBrowser:$NoBrowser
}
