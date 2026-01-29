@echo off
cd /d "%~dp0"
title Retro RPG Auto-Builder
echo ==========================================
echo      Retro RPG - Update and Build Tool
echo ==========================================

REM --- 1. PRE-CHECKS ---
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b
)

REM --- 2. REPO RECOVERY LOGIC ---
if exist ".git" goto :UPDATE
if exist "package.json" goto :UPDATE

echo [!] Not in a git repository. Checking for subfolder...
if exist "retro-rpg\package.json" (
    echo [*] Found valid 'retro-rpg' folder. Entering...
    cd retro-rpg
    goto :UPDATE
)

if exist "retro-rpg" (
    echo [!] Found 'retro-rpg' folder but it looks corrupted (missing package.json).
    echo [*] Recursively deleting broken folder...
    rmdir /s /q "retro-rpg"
    if exist "retro-rpg" (
        echo [ERROR] Failed to delete folder. Please delete 'retro-rpg' manually and try again.
        pause
        exit /b
    )
    echo [*] Deleted. Retrying clone...
)

echo [!] No existing installation found.
echo [*] Cloning from GitHub (https://github.com/wekax2004/RPG)...
git clone https://github.com/wekax2004/RPG.git retro-rpg
if %errorlevel% neq 0 (
    echo [ERROR] Git clone failed. Check your internet connection.
    pause
    exit /b
)
cd retro-rpg

:UPDATE
REM --- 3. GIT UPDATE ---
echo.
echo [1/4] Pulling latest changes from Git...
git pull
if %errorlevel% neq 0 (
    echo [WARNING] Git pull failed. You might be offline or have local changes.
    echo [*] Continuing with local files...
)

REM --- 4. NPM INSTALL ---
echo.
echo [2/4] Updating Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] NPM Install failed. Ensure Node.js is installed (https://nodejs.org/).
    pause
    exit /b
)

REM --- 5. BUILD ---
echo.
echo [3/4] Building Game Executable...
call npm run electron:build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check the logs above.
    pause
    exit /b
)

REM --- 6. LAUNCH ---
echo.
echo [4/4] Starting Server and Game...
echo [*] Starting Server (in background window)...
start "Retro RPG Server" npm run start:server

echo [*] Waiting for server to initialize...
timeout /t 5 /nobreak

echo [*] Opening Release Folder (Look for Setup.exe)...
start "" "release"

if exist "release\win-unpacked\Retro RPG.exe" (
    echo [*] Launching Client...
    start "" "release\win-unpacked\Retro RPG.exe"
) else (
    echo [ERROR] Executable not found at release\win-unpacked\Retro RPG.exe
    pause
)

echo Done. Do not close the Server window while playing!
pause
