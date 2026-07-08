param(
    [int]$Port = 8765,
    [string]$HostAddress = "0.0.0.0",
    [string]$DataDir = "",
    [string]$TaskName = "PPWork Web",
    [switch]$RunNow
)

$ErrorActionPreference = "Stop"
$AppDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Launcher = Join-Path $AppDir "Start-PPWorkWeb.ps1"

if (-not (Test-Path -LiteralPath $Launcher)) {
    throw "Start-PPWorkWeb.ps1 was not found next to this installer."
}

$Arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "`"$Launcher`"",
    "-HostAddress", $HostAddress,
    "-Port", $Port,
    "-NoBrowser"
)

if ($DataDir) {
    $ResolvedDataDir = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($DataDir)
    New-Item -ItemType Directory -Force -Path $ResolvedDataDir | Out-Null
    $Arguments += @("-DataDir", "`"$ResolvedDataDir`"")
}

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument ($Arguments -join " ")
$Trigger = New-ScheduledTaskTrigger -AtLogOn
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive
$Description = "Starts PPWork Web when this Windows user signs in."

Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Principal $Principal -Description $Description -Force | Out-Null

if ($RunNow) {
    Start-ScheduledTask -TaskName $TaskName
}

Write-Host "Installed scheduled startup task '$TaskName'."
Write-Host "The app will listen on http://$HostAddress`:$Port/ after sign-in."