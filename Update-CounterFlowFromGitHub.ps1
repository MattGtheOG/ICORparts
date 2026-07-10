param(
    [string]$Repository = "MattGtheOG/ICORparts",
    [string]$Branch = "main",
    [switch]$Preview,
    [switch]$AllowSameVersion
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LocalServer = Join-Path $AppDir "server.py"
$LocalUpdater = Join-Path $AppDir "Update-PPWorkWeb.ps1"

function Read-AppVersion {
    param([Parameter(Mandatory = $true)][string]$ServerPath)

    if (-not (Test-Path -LiteralPath $ServerPath)) {
        return "unknown"
    }

    $Match = Select-String -LiteralPath $ServerPath -Pattern 'APP_VERSION\s*=\s*"([^"]+)"' | Select-Object -First 1
    if ($Match -and $Match.Matches.Count -gt 0) {
        return $Match.Matches[0].Groups[1].Value
    }
    return "unknown"
}

function Compare-VersionText {
    param(
        [Parameter(Mandatory = $true)][string]$Left,
        [Parameter(Mandatory = $true)][string]$Right
    )

    try {
        return ([version]$Left).CompareTo([version]$Right)
    } catch {
        return [string]::Compare($Left, $Right, $true)
    }
}

if (-not (Test-Path -LiteralPath $LocalUpdater)) {
    throw "Update-PPWorkWeb.ps1 was not found in $AppDir."
}

$LocalVersion = Read-AppVersion -ServerPath $LocalServer
$TempDir = Join-Path ([IO.Path]::GetTempPath()) ("CounterFlowGitHubUpdate-" + [Guid]::NewGuid().ToString("N"))
$ZipPath = Join-Path $TempDir "counterflow-$Branch.zip"
$ExtractDir = Join-Path $TempDir "extract"

New-Item -ItemType Directory -Force -Path $TempDir, $ExtractDir | Out-Null

try {
    $ArchiveUrl = "https://github.com/$Repository/archive/refs/heads/$Branch.zip"
    Write-Host "CounterFlow GitHub Updater"
    Write-Host "Repository: $Repository"
    Write-Host "Branch: $Branch"
    Write-Host "Local version: $LocalVersion"
    Write-Host "Downloading update package..."
    Invoke-WebRequest -Uri $ArchiveUrl -OutFile $ZipPath -UseBasicParsing

    Expand-Archive -LiteralPath $ZipPath -DestinationPath $ExtractDir -Force
    $Candidate = Get-ChildItem -LiteralPath $ExtractDir -Recurse -Filter server.py | Select-Object -First 1
    if (-not $Candidate) {
        throw "The downloaded GitHub archive did not contain server.py."
    }

    $SourceDir = Split-Path -Parent $Candidate.FullName
    if (-not (Test-Path -LiteralPath (Join-Path $SourceDir "static"))) {
        throw "The downloaded GitHub archive does not look like a CounterFlow app folder."
    }

    $IncomingVersion = Read-AppVersion -ServerPath $Candidate.FullName
    Write-Host "GitHub version: $IncomingVersion"

    if (-not $AllowSameVersion -and $LocalVersion -ne "unknown" -and $IncomingVersion -ne "unknown") {
        $Comparison = Compare-VersionText -Left $IncomingVersion -Right $LocalVersion
        if ($Comparison -le 0) {
            Write-Host "No newer version was found. Use -AllowSameVersion to reinstall from GitHub anyway."
            return
        }
    }

    if ($Preview) {
        & $LocalUpdater -PackagePath $SourceDir -Preview
    } else {
        & $LocalUpdater -PackagePath $SourceDir
    }

    Write-Host "Done. Restart CounterFlow after the updater closes."
} finally {
    if (Test-Path -LiteralPath $TempDir) {
        Remove-Item -LiteralPath $TempDir -Recurse -Force
    }
}
