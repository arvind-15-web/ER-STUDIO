@echo off
echo ===================================================
echo             STARTING ER STUDIO SERVERS
echo ===================================================
echo.

echo [1/2] Booting up the Node.js Backend Server...
start "ER Studio Backend" cmd /k "cd backend && npm run dev"

echo [2/2] Booting up the React Vite Frontend...
start "ER Studio Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo Both servers have been launched in separate windows!
echo Your browser should automatically open the app shortly.
echo You can safely close this launcher window.
echo ===================================================
pause
