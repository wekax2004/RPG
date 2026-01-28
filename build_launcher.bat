@echo off
title Retro RPG Auto-Builder
echo ==========================================
echo      Retro RPG - Update and Build Tool
echo ==========================================

REM Check if we are inside the repo
if exist ".git" goto :UPDATE
if exist "package.json" goto :UPDATE

echo [!] Not in a git repository. Checking for subfolder...
if exist "retro-rpg" (
    echo [*] Found 'retro-rpg' folder. Entering...
    cd retro-rpg
    goto :UPDATE
)

echo [!] No existing installation found.
echo [*] Cloning from GitHub (https://github.com/wekax2004/RPG)...
git clone https://github.com/wekax2004/RPG.git retro-rpg
if %errorlevel% neq 0 (
    echo [ERROR] Git clone failed.
    pause
    exit /b
)
cd retro-rpg

:UPDATE
echo.
echo [1/4] Pulling latest changes from Git...
git pull
if %errorlevel% neq 0 (
    echo [WARNING] Git pull failed. You might be offline or have local changes.
    echo [*] Continuing with local files...
)

echo.
echo [2/4] Updating Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] NPM Install failed. Ensure Node.js is installed.
    pause
    exit /b
)

echo.
echo [3/4] Building Game Executable...
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
pause
