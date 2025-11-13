# PowerShell helper to install dependencies and start the frontend (React)
# Usage: Right-click -> Run with PowerShell or `./start-frontend.ps1` from PowerShell

param(
    [switch]$InstallOnly
)

$ErrorActionPreference = 'Stop'

Push-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)

if (-not (Test-Path node_modules)) {
    Write-Host "Installing frontend dependencies..."
    npm install
}

if ($InstallOnly) {
    Write-Host "Dependencies installed. Exiting as requested (--InstallOnly)."
    Pop-Location
    return
}

Write-Host "Starting frontend (npm start)..."
npm start

Pop-Location
