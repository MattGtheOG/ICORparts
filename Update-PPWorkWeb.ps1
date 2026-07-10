param(
    [Parameter(Mandatory = $true)]
    [string]$PackagePath,
    [switch]$Preview
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackupDir = Join-Path $AppDir "backups"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

$ResolvedPackage = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($PackagePath)
if (-not (Test-Path -LiteralPath $ResolvedPackage)) {
    throw "Package path was not found: $ResolvedPackage"
}

$TempDir = $null
$SourceDir = $ResolvedPackage
if (-not (Test-Path -LiteralPath $ResolvedPackage -PathType Container)) {
    if ([IO.Path]::GetExtension($ResolvedPackage).ToLowerInvariant() -ne ".zip") {
        throw "PackagePath must be a CounterFlow application folder or .zip file."
    }
    $TempDir = Join-Path ([IO.Path]::GetTempPath()) ("PPWorkWebUpdate-" + [Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Force -Path $TempDir | Out-Null
    Expand-Archive -LiteralPath $ResolvedPackage -DestinationPath $TempDir -Force
    $Candidate = Get-ChildItem -LiteralPath $TempDir -Recurse -Filter server.py | Select-Object -First 1
    if (-not $Candidate) {
        throw "The update zip does not contain server.py."
    }
    $SourceDir = Split-Path -Parent $Candidate.FullName
}

if (-not (Test-Path -LiteralPath (Join-Path $SourceDir "server.py"))) {
    throw "The update source does not look like a CounterFlow app folder."
}
if (-not (Test-Path -LiteralPath (Join-Path $SourceDir "static"))) {
    throw "The update source is missing the static folder."
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$BackupPath = Join-Path $BackupDir "app-before-update-$Stamp.zip"
$PreserveNames = @("parts.db", "service.db", "backups", "logs", "__pycache__", ".git", ".codex")
$CopyItems = Get-ChildItem -LiteralPath $SourceDir -Force | Where-Object { $PreserveNames -notcontains $_.Name }

Write-Host "Update source: $SourceDir"
Write-Host "App folder: $AppDir"
Write-Host "Preserving local databases, backups, and logs."

if ($Preview) {
    Write-Host "Preview only. Files that would be copied:"
    $CopyItems | ForEach-Object { Write-Host " - $($_.Name)" }
    if ($TempDir) { Remove-Item -LiteralPath $TempDir -Recurse -Force }
    return
}

$BackupItems = Get-ChildItem -LiteralPath $AppDir -Force | Where-Object { $PreserveNames -notcontains $_.Name }
if ($BackupItems) {
    Compress-Archive -Path $BackupItems.FullName -DestinationPath $BackupPath -Force
    Write-Host "Backup saved: $BackupPath"
}

foreach ($Item in $CopyItems) {
    $Destination = Join-Path $AppDir $Item.Name
    Copy-Item -LiteralPath $Item.FullName -Destination $Destination -Recurse -Force
}

if ($TempDir) {
    Remove-Item -LiteralPath $TempDir -Recurse -Force
}

Write-Host "Update copied. Restart CounterFlow to use the new version."
