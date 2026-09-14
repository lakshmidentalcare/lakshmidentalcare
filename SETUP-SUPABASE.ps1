########################################################
# Lakshmi Dental Care — Supabase Setup Script
# Run this AFTER updating .env with your Supabase URLs
########################################################

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Lakshmi Dental Care — Supabase Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ─── Check .env ─────────────────────────────────────────────
$envPath = Join-Path $PSScriptRoot "backend\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "ERROR: .env file not found at $envPath" -ForegroundColor Red
    Write-Host "Copy backend\.env.example to backend\.env and fill in your Supabase credentials." -ForegroundColor Yellow
    exit 1
}

$envContent = Get-Content $envPath -Raw
if ($envContent -match "YOUR-PASSWORD" -or $envContent -match "YOUR-PROJECT-REF") {
    Write-Host "ERROR: .env still contains placeholder values." -ForegroundColor Red
    Write-Host "Please replace [YOUR-PASSWORD] and [YOUR-PROJECT-REF] with your actual Supabase credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ .env file found and configured" -ForegroundColor Green

# ─── Navigate to backend ─────────────────────────────────────
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location $backendPath

# ─── Validate Prisma Schema ──────────────────────────────────
Write-Host ""
Write-Host "Validating Prisma schema..." -ForegroundColor Yellow
node node_modules\prisma\build\index.js validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Schema validation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Schema valid" -ForegroundColor Green

# ─── Push Schema to Supabase ─────────────────────────────────
Write-Host ""
Write-Host "Pushing schema to Supabase [this may take 30-60 seconds]..." -ForegroundColor Yellow
node node_modules\prisma\build\index.js db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "Schema push failed! Check your DATABASE_URL and DIRECT_URL in .env" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Schema pushed to Supabase" -ForegroundColor Green

# ─── Generate Prisma Client ──────────────────────────────────
Write-Host ""
Write-Host "Generating Prisma client..." -ForegroundColor Yellow
node node_modules\prisma\build\index.js generate
Write-Host "✓ Prisma client generated" -ForegroundColor Green

# ─── Seed Database ──────────────────────────────────────────
Write-Host ""
Write-Host "Seeding database with default data..." -ForegroundColor Yellow
Write-Host "Users, Services, Chairs, Sample Patients, Inventory, Labs" -ForegroundColor Gray
node -r ts-node/register prisma/seed.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Seeding failed! Check your connection and try again." -ForegroundColor Red
    exit 1
}
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Supabase setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your online database is ready." -ForegroundColor White
Write-Host "Login: admin@lakshmidental.com / Admin@1234" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next: Open Supabase → Table Editor to browse your data" -ForegroundColor Gray
Write-Host "URL: https://supabase.com/dashboard" -ForegroundColor Gray
Write-Host ""
