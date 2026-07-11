param(
    [string]$RepositoryUrl = "https://github.com/MattGtheOG/ICORparts.git",
    [string]$Branch = "main",
    [string]$PublishDir = "$env:TEMP\CounterFlowPublish",
    [string]$CommitMessage = "Publish CounterFlow update"
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path

function Assert-InPath {
    param(
        [Parameter(Mandatory = $true)][string]$Child,
        [Parameter(Mandatory = $true)][string]$Parent
    )
    $ResolvedChild = [IO.Path]::GetFullPath($Child)
    $ResolvedParent = [IO.Path]::GetFullPath($Parent)
    if (-not $ResolvedChild.StartsWith($ResolvedParent, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to operate outside publish folder: $ResolvedChild"
    }
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    throw "Git is not installed or is not on PATH."
}

$PublishDir = [IO.Path]::GetFullPath($PublishDir)
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $PublishDir) | Out-Null

if (Test-Path -LiteralPath (Join-Path $PublishDir ".git")) {
    git -C $PublishDir fetch origin
    git -C $PublishDir checkout $Branch
    git -C $PublishDir reset --hard "origin/$Branch"
} else {
    if (Test-Path -LiteralPath $PublishDir) {
        Assert-InPath -Child $PublishDir -Parent ([IO.Path]::GetTempPath())
        Remove-Item -LiteralPath $PublishDir -Recurse -Force
    }
    git clone $RepositoryUrl $PublishDir
    git -C $PublishDir checkout $Branch
}

Get-ChildItem -LiteralPath $PublishDir -Force | Where-Object { $_.Name -ne ".git" } | ForEach-Object {
    Assert-InPath -Child $_.FullName -Parent $PublishDir
    Remove-Item -LiteralPath $_.FullName -Recurse -Force
}

$ExcludeDirs = @(
    ".git",
    "backups",
    "logs",
    "updates",
    "__pycache__",
    ".pytest_cache",
    ".venv",
    "venv",
    "env",
    "website"
)
$ExcludeFiles = @(
    "parts.db",
    "service.db",
    "*.db",
    "*.db-shm",
    "*.db-wal",
    ".counterflow-empty-install",
    ".env"
)

$RobocopyArgs = @(
    $AppDir,
    $PublishDir,
    "/E",
    "/XD"
) + $ExcludeDirs + @(
    "/XF"
) + $ExcludeFiles + @(
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS",
    "/NP"
)

robocopy @RobocopyArgs | Out-Null
if ($LASTEXITCODE -ge 8) {
    throw "Robocopy failed with exit code $LASTEXITCODE."
}

foreach ($RelativePath in ($ExcludeDirs + $ExcludeFiles)) {
    if ($RelativePath -eq ".git" -or $RelativePath.Contains("*")) {
        continue
    }
    $Path = Join-Path $PublishDir $RelativePath
    if (Test-Path -LiteralPath $Path) {
        Assert-InPath -Child $Path -Parent $PublishDir
        Remove-Item -LiteralPath $Path -Recurse -Force
    }
}

git -C $PublishDir add -A
$Status = git -C $PublishDir status --porcelain
if (-not $Status) {
    Write-Host "No source changes to publish."
    return
}

$UserName = git -C $PublishDir config user.name
if (-not $UserName) {
    git -C $PublishDir config user.name "MattGtheOG"
}
$UserEmail = git -C $PublishDir config user.email
if (-not $UserEmail) {
    git -C $PublishDir config user.email "1351882+MattGtheOG@users.noreply.github.com"
}

git -C $PublishDir commit -m $CommitMessage
git -C $PublishDir push origin $Branch

Write-Host "Published CounterFlow to $RepositoryUrl on $Branch."
