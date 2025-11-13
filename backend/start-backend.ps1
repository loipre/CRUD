# PowerShell helper to create virtualenv, install requirements and run the FastAPI backend
# Usage: Run this from PowerShell: `./start-backend.ps1`

param(
    [switch]$InstallOnly
)

$ErrorActionPreference = 'Stop'

Push-Location -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)

if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv .venv
}

# Activate venv
$activate = Join-Path -Path (Get-Location) -ChildPath ".venv\Scripts\Activate.ps1"
. $activate

if (-not (Test-Path "./.venv/Lib/site-packages/uvicorn")) {
    Write-Host "Installing backend requirements..."
    pip install -r requirements.txt
}

if ($InstallOnly) {
    Write-Host "Dependencies installed. Exiting as requested (--InstallOnly)."
    Pop-Location
    return
}

# Ensure .env exists
if (-not (Test-Path "./.env")) {
    Write-Host ".env not found — copy .env.example to .env and update MONGO_URL, DB_NAME, SECRET_KEY before running."
    Pop-Location
    exit 1
}

Write-Host "Starting backend via uvicorn..."
# Run uvicorn on port 5000
uvicorn server:app --reload --host 0.0.0.0 --port 5000

Pop-Location
