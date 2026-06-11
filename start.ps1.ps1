# Start Prode Mundial 2026 dev server
$nodePath = "C:\nodejs\node-v20.18.0-win-x64"
$env:PATH = "$nodePath;" + $env:PATH
Set-Location $PSScriptRoot
Write-Host "Starting Prode Mundial 2026 at http://localhost:3000" -ForegroundColor Green
npm run dev
