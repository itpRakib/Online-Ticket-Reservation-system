@echo off
title Online Ticket Reservation System Startup
echo =====================================================================
echo   STARTING ONLINE TICKET RESERVATION SYSTEM SERVERS
echo =====================================================================
echo.

echo [1/2] Launching Django Backend Server in new window...
start "Django Backend Server" cmd /k "cd /d \"%~dp0backend\" && venv\Scripts\activate && python manage.py runserver"

echo [2/2] Launching Next.js Frontend Server in new window...
start "Next.js Frontend Server" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

echo.
echo =====================================================================
echo   SUCCESS: Both servers launched!
echo   - Django Backend API: http://127.0.0.1:8000
echo   - Django Admin Portal: http://127.0.0.1:8000/admin/
echo   - Next.js Frontend UI: http://localhost:3000
echo.
echo   Keep the newly opened terminal windows open while testing the site.
echo =====================================================================
echo.
pause
