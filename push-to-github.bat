@echo off
setlocal enabledelayedexpansion
title Push TOLEX RESTAURANT to GitHub

set "GIT_EXE=C:\Users\Acer\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if not exist "%GIT_EXE%" (
    set "GIT_EXE=C:\Users\Acer\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
)
if not exist "%GIT_EXE%" (
    set "GIT_EXE=git"
)

set "REPO_URL=https://github.com/praizstudio74-coder/tolex-restaurant.git"

echo ========================================================
echo        TOLEX RESTAURANT - PUSH TO GITHUB
echo ========================================================
echo.
echo Target Repository: %REPO_URL%
echo.

cd /d "C:\Users\Acer\.gemini\antigravity\scratch\tolex-restaurant"

echo [*] Staging all files...
"%GIT_EXE%" add -A

echo [*] Committing changes...
"%GIT_EXE%" commit -m "feat: complete luxury restaurant website for TOLEX RESTAURANT" 2>nul

echo [*] Setting branch to main...
"%GIT_EXE%" branch -M main

echo [*] Configuring remote origin...
"%GIT_EXE%" remote set-url origin "%REPO_URL%" 2>nul || "%GIT_EXE%" remote add origin "%REPO_URL%"

echo [*] Pushing to GitHub (origin main)...
echo If a GitHub sign-in prompt or browser authentication window appears, please authorize.
echo.
"%GIT_EXE%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Website is now live on GitHub:
    echo  https://github.com/praizstudio74-coder/tolex-restaurant
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo  PUSH NOTICE:
    echo ========================================================
    echo  If the repository does not exist on your GitHub yet:
    echo  1. Open https://github.com/new in your browser
    echo  2. Enter Repository name: tolex-restaurant
    echo  3. Leave "Initialize with README" UNCHECKED
    echo  4. Click "Create repository"
    echo  5. Re-run this script to push immediately!
    echo.
    echo  Alternatively, if using a GitHub Personal Access Token (PAT):
    echo  "%GIT_EXE%" push https://YOUR_TOKEN@github.com/praizstudio74-coder/tolex-restaurant.git main
    echo ========================================================
)

echo.
pause
