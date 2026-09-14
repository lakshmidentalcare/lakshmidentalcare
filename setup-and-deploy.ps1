# Lakshmi Dental Care — Automated Deployment Script
# This script installs Node.js, PostgreSQL (using Winget), configures the DB, seeds the schema, and starts the clinic servers.

Write-Host "=============================================" -ForegroundColor Purple
Write-Host "  LAKSHMI DENTAL CARE — LOCAL SETUP SYSTEM" -ForegroundColor Purple
Write-Host "=============================================" -ForegroundColor Purple
Write-Host ""

# 1. Check & Install Node.js
try {
    $nodeVer = node -v 2>$null
    Write-Host "[✓] Node.js is already installed ($nodeVer)" -ForegroundColor Green
} catch {
    Write-Host "[!] Node.js not detected. Installing via Windows Package Manager..." -ForegroundColor Yellow
    Start-Process winget -ArgumentList "install --id OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements" -Wait
    Write-Host "[✓] Node.js installer launched. Please restart this terminal after installation completes." -ForegroundColor Green
}

# 2. Check & Install PostgreSQL
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    Write-Host "[✓] PostgreSQL database service detected." -ForegroundColor Green
} else {
    Write-Host "[!] PostgreSQL service not detected. Installing via Windows Package Manager..." -ForegroundColor Yellow
    Write-Host "[*] This will launch the official PostgreSQL installer. Set your password to 'postgres' when prompted." -ForegroundColor White
    Start-Process winget -ArgumentList "install --id PostgreSQL.PostgreSQL --accept-source-agreements" -Wait
    Write-Host "[✓] PostgreSQL installer launched." -ForegroundColor Green
}

# 3. Initialize Environment Variables Configuration
Write-Host ""
Write-Host "[*] Setting up environment configuration files..." -ForegroundColor White

$dbUrl = 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lakshmi_dental_db?schema=public"'
$jwtSec = 'JWT_SECRET="LDC_SuperSecureEnterpriseClinicKey7739!"'
$apiUrl = 'NEXT_PUBLIC_API_URL="http://localhost:3000"'

# Backend config
$backendPath = Join-Path $PSScriptRoot "backend"
$backendEnv = Join-Path $backendPath ".env"
if (-not (Test-Path $backendEnv)) {
    Write-Host "Creating backend .env file..."
    $dbUrl | Out-File -FilePath $backendEnv -Encoding utf8
    $jwtSec | Out-File -FilePath $backendEnv -Append -Encoding utf8
    Write-Host "[✓] Created backend/.env" -ForegroundColor Green
} else {
    Write-Host "[✓] Backend/.env already exists." -ForegroundColor Gray
}

# Frontend config
$frontendPath = Join-Path $PSScriptRoot "frontend"
$frontendEnv = Join-Path $frontendPath ".env.local"
if (-not (Test-Path $frontendEnv)) {
    Write-Host "Creating frontend .env.local file..."
    $apiUrl | Out-File -FilePath $frontendEnv -Encoding utf8
    Write-Host "[✓] Created frontend/.env.local" -ForegroundColor Green
} else {
    Write-Host "[✓] Frontend/.env.local already exists." -ForegroundColor Gray
}

# 4. Bootstrap and Build
Write-Host ""
Write-Host "=============================================" -ForegroundColor Purple
Write-Host "  BOOTSTRAPPING DATABASE & SERVERS" -ForegroundColor Purple
Write-Host "=============================================" -ForegroundColor Purple

Write-Host "[*] To complete installation once Node.js finishes installing, run these commands in order:" -ForegroundColor Cyan
Write-Host "  1. cd backend" -ForegroundColor Yellow
Write-Host "  2. npm install" -ForegroundColor Yellow
Write-Host "  3. npx prisma migrate dev --name init" -ForegroundColor Yellow
Write-Host "  4. npx prisma db seed" -ForegroundColor Yellow
Write-Host "  5. npm run start:dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  (In a separate terminal tab:)" -ForegroundColor Cyan
Write-Host "  1. cd frontend" -ForegroundColor Yellow
Write-Host "  2. npm install" -ForegroundColor Yellow
Write-Host "  3. npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "=============================================" -ForegroundColor Purple
Write-Host "Local Setup configuration files complete!" -ForegroundColor Green
