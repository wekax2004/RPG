@echo off
echo Starting Retro RPG Server and Client...
echo Please wait...
call npm run start:electron
if %errorlevel% neq 0 (
    echo.
    echo Error starting game! Make sure you have run 'npm install' first.
    pause
)
