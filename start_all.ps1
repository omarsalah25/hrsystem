# HRSystem Enterprise Suite Orchestrator (PowerShell)
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "   HRSystem Multi-Tenant Cloud HCM (Egypt & Saudi Arabia / GCC)     " -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan

# 1. Start Laravel Backend API
Write-Host "[1/4] Starting Laravel 11 REST API on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; php artisan serve --port=8000"

# 2. Start Next.js Frontend App
Write-Host "[2/4] Starting Next.js 15 Frontend on http://localhost:3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

# 3. Start Biometric ADMS Hardware Bridge
Write-Host "[3/4] Starting Fastify ADMS Push Bridge on Port 8081..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\bridge'; npm run start"

# 4. Start BullMQ Background Workers
Write-Host "[4/4] Starting BullMQ & Puppeteer Workers..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\workers'; npm run start"

Write-Host "`nAll HRSystem services launched successfully!" -ForegroundColor Yellow
Write-Host "Web Application URL:   http://localhost:3000" -ForegroundColor White
Write-Host "Backend API Base URL:  http://127.0.0.1:8000/api/v1" -ForegroundColor White
Write-Host "ADMS Biometric Bridge: http://127.0.0.1:8081/iclock/cdata" -ForegroundColor White
