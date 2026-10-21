@echo off
echo ========================================
echo Git Identity Setup
echo ========================================
echo.

echo Setting up Git user identity...
echo.

REM Replace these with your actual information
git config --global user.name "wiglenielrosahdz-ship-it"
git config --global user.email "your-email@example.com"

echo.
echo Git identity configured!
echo.
echo Verify with:
git config --global user.name
git config --global user.email
echo.

echo ========================================
echo Now you can run UPLOAD_NOW.bat again!
echo ========================================
echo.
pause
