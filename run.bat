@echo off
echo =========================================
echo   Starting ER Studio (MERN Stack)
echo =========================================

echo.
echo Starting the Express Backend server...
start "ER Studio - Backend" cmd /k "cd backend && npm run dev"

echo.
echo Starting the React Frontend server...
start "ER Studio - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Waiting a few seconds for servers to boot up...
timeout /t 5 /nobreak >nul

echo.
echo Opening your browser to localhost:5173...
start http://localhost:5173/

echo.
echo All done! You can close this window. The servers will keep running in the new command prompt windows that just opened.
pause
