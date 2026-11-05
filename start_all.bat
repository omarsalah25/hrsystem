@echo off
TITLE HRSystem Enterprise Suite Orchestrator
echo =====================================================================
echo    HRSystem Multi-Tenant Cloud HCM (Egypt & Saudi Arabia / GCC)     
echo =====================================================================
echo Starting services...

start "1. Laravel API (Port 8000)" cmd /k "cd backend && php artisan serve --port=8000"
start "2. Next.js Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"
start "3. ADMS Biometric Bridge (Port 8081)" cmd /k "cd bridge && npm run start"
start "4. BullMQ & Puppeteer Workers" cmd /k "cd workers && npm run start"

echo.
echo All HRSystem services launched in dedicated consoles!
echo Web Portal:       http://localhost:3000
echo Laravel REST API: http://127.0.0.1:8000/api/v1
echo ADMS Push Bridge: http://127.0.0.1:8081/iclock/cdata
echo.
pause
