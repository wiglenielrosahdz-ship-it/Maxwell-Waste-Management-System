@echo off
echo ========================================
echo Maxwell Waste Tracker - GitHub Push
echo (Foundation + Specifications)
echo ========================================
echo.

cd /d "%~dp0"

echo Checking git configuration...
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Git user.name not configured
    echo Please run these commands first:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your@email.com"
    echo.
    pause
    exit /b 1
)

git config user.email >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Git user.email not configured
    echo Please run these commands first:
    echo   git config --global user.name "Your Name"
    echo   git config --global user.email "your@email.com"
    echo.
    pause
    exit /b 1
)

echo Git configured: %USERNAME%
echo.

echo Step 1: Checking for existing git repository...
if exist ".git" (
    echo Found existing .git directory
) else (
    echo Initializing new git repository...
    git init
    if %errorlevel% neq 0 (
        echo ERROR: Failed to initialize git
        pause
        exit /b 1
    )
)
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

echo Step 3: Creating commit...
git commit -m "feat: implement Maxwell Waste Tracker foundation + specifications" -m "Foundation Implementation (Spec 1 - COMPLETE):" -m "- Monorepo structure with npm workspaces" -m "- Prisma schema with 6 models" -m "- Docker Compose with PostgreSQL" -m "- Demo seed with narrative data" -m "- Backend health endpoint" -m "- Frontend skeleton with React + Vite + Tailwind" -m "" -m "Specifications (Ready for Implementation):" -m "- 6 technical specs with 166 EARS requirements" -m "- Detailed implementation guides" -m "- Ready for specs 2-6: Auth, Logging, Analytics, Dashboard, Demo"
if %errorlevel% neq 0 (
    echo.
    echo Note: If error says "nothing to commit", files are already committed
    echo Continuing...
    echo.
)
echo.

echo Step 4: Checking remote repository...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding remote repository...
    git remote add origin https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System.git
    if %errorlevel% neq 0 (
        echo ERROR: Failed to add remote
        pause
        exit /b 1
    )
) else (
    echo Remote already configured
)
echo.

echo Step 5: Renaming branch to main...
git branch -M main
echo.

echo Step 6: Pushing to GitHub...
echo.
echo NOTE: You will need to authenticate with GitHub
echo Use your Personal Access Token as the password
echo.
pause
echo.

git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo PUSH FAILED
    echo ========================================
    echo.
    echo Common reasons:
    echo 1. Need to create Personal Access Token
    echo    Visit: https://github.com/settings/tokens/new
    echo.
    echo 2. Repository doesn't exist or you don't have permission
    echo    Ask your friend to add you as collaborator
    echo.
    echo 3. Repository already has content
    echo    Try: git pull origin main --allow-unrelated-histories
    echo    Then: git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! 🎉
echo ========================================
echo.
echo Your code has been pushed to:
echo https://github.com/wiglenielrosahdz-ship-it/Maxwell-Waste-Management-System
echo.
echo What you uploaded:
echo - ✅ Complete foundation implementation
echo - ✅ Database schema and demo data
echo - ✅ 6 technical specifications
echo - ✅ Implementation guides
echo.
echo Next steps:
echo 1. Visit the repository URL above
echo 2. Verify README displays correctly
echo 3. Check that all files are present
echo 4. Continue with specs 2-6 or deploy to AWS
echo.
echo See STATUS_SUMMARY.md for detailed progress!
echo.
pause
