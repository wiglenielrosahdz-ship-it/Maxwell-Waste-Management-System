@echo off
echo ========================================
echo Maxwell Waste Tracker - Git Upload
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Initializing Git repository...
git init
if %errorlevel% neq 0 (
    echo ERROR: Failed to initialize git
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 2: Adding all files...
git add .
if %errorlevel% neq 0 (
    echo ERROR: Failed to add files
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 3: Creating initial commit...
git commit -m "feat: add Maxwell Waste Tracker specifications - Complete specification repository for food waste tracking system - Product requirements and technical standards - 6 implementation specs with 166 EARS requirements - Foundation, Auth, Logging, Analytics, Dashboard, Demo - Detailed implementation guide - Architecture documentation - Testing requirements for 80+ coverage"
if %errorlevel% neq 0 (
    echo ERROR: Failed to commit
    pause
    exit /b 1
)
echo Done!
echo.

echo Step 4: Adding remote repository...
git remote add origin https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System.git
if %errorlevel% neq 0 (
    echo WARNING: Remote may already exist, trying to update...
    git remote set-url origin https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System.git
)
echo Done!
echo.

echo Step 5: Renaming branch to main...
git branch -M main
echo Done!
echo.

echo Step 6: Pushing to GitHub...
echo This may prompt for credentials...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to push to GitHub
    echo.
    echo Possible reasons:
    echo - Repository doesn't exist or is private
    echo - Need to authenticate with GitHub
    echo - Already has content (try: git pull origin main --allow-unrelated-histories)
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Repository uploaded!
echo ========================================
echo.
echo View at: https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System
echo.
echo Next steps:
echo 1. Visit the repository URL
echo 2. Verify README.md displays correctly
echo 3. Check that all specs are present
echo 4. Share the link to start implementation!
echo.
pause
