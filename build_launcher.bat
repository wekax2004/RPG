@echo off
title Retro RPG Auto-Builder
echo ==========================================
echo      Retro RPG - Update & Build Tool
echo ==========================================

echo [1/4] Pulling latest changes from Git...
git pull
if %errorlevel% neq 0 (
    echo [ERROR] Git pull failed. Please check your internet or git status.
    pause
    exit /b
)

echo.
echo [2/4] Updating Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] NPM Install failed.
    pause
    exit /b
)

echo.
echo [3/4] Building Game Executable...
REM Using 'call' to ensure batch continues after npm script works
call npm run electron:build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check the logs above.
    pause
    exit /b
)

echo.
echo [4/4] Launching Game...
if exist "release\win-unpacked\Retro RPG.exe" (
    start "" "release\win-unpacked\Retro RPG.exe"
) else (
    echo [ERROR] Executable not found at release\win-unpacked\Retro RPG.exe
    pause
)

echo Done.
