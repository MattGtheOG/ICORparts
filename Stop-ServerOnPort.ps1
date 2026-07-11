<#
.SYNOPSIS
Stops local server processes or Windows services that are listening on a TCP port.

.EXAMPLE
.\Stop-ServerOnPort.ps1 -Port 8765

.EXAMPLE
.\Stop-ServerOnPort.ps1 -Port 8765 -Force -Confirm:$false
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = "High")]
param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8765,
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$listeners = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)

if (-not $listeners) {
    Write-Host "No listening process was found on TCP port $Port."
    return
}

$processIds = @($listeners | Select-Object -ExpandProperty OwningProcess -Unique)
foreach ($processId in $processIds) {
    $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
    $processName = if ($processInfo) { $processInfo.Name } else { "PID $processId" }
    $services = @(Get-CimInstance Win32_Service -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue |
        Where-Object { $_.State -eq "Running" })

    if ($services.Count -gt 0) {
        foreach ($service in $services) {
            $target = "$($service.DisplayName) ($($service.Name))"
            if (-not $PSCmdlet.ShouldProcess($target, "Stop Windows service listening on TCP port $Port")) {
                continue
            }
            try {
                $stopArgs = @{ Name = $service.Name; ErrorAction = "Stop" }
                if ($Force) {
                    $stopArgs.Force = $true
                }
                Stop-Service @stopArgs
                Write-Host "Stop requested for service: $target"
            } catch {
                Write-Warning "Could not stop service $target. $($_.Exception.Message)"
            }
        }
        continue
    }

    $target = "$processName (PID $processId)"
    if (-not $PSCmdlet.ShouldProcess($target, "Stop process listening on TCP port $Port")) {
        continue
    }
    try {
        $stopArgs = @{ Id = $processId; ErrorAction = "Stop" }
        if ($Force) {
            $stopArgs.Force = $true
        }
        Stop-Process @stopArgs
        Write-Host "Stopped process: $target"
    } catch {
        Write-Warning "Could not stop process $target. $($_.Exception.Message)"
    }
}

Start-Sleep -Milliseconds 300
$remaining = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($remaining) {
    Write-Warning "TCP port $Port is still listening. Run this script as Administrator or use -Force if appropriate."
} else {
    Write-Host "TCP port $Port is clear."
}
