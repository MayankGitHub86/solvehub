@echo off
echo ========================================
echo Setting up Local MongoDB Database
echo ========================================
echo.

echo Step 1: Checking if MongoDB is installed...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] MongoDB is not installed!
    echo.
    echo Please install MongoDB Community Edition:
    echo https://www.mongodb.com/try/download/community
    echo.
    pause
    exit /b 1
)

echo [OK] MongoDB is installed
echo.

echo Step 2: Checking if MongoDB service is running...
sc query MongoDB | find "RUNNING" >nul
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB service is not running
    echo Starting MongoDB service...
    net start MongoDB
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start MongoDB service
        echo Please start it manually from Services
        pause
        exit /b 1
    )
)

echo [OK] MongoDB service is running
echo.

echo Step 3: Pushing Prisma schema to local database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo [ERROR] Failed to push schema
    pause
    exit /b 1
)

echo [OK] Schema pushed successfully
echo.

echo Step 4: Seeding database with test data...
call node prisma/seed-indian.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed users and questions
    pause
    exit /b 1
)

echo [OK] Users and questions seeded
echo.

echo Step 5: Seeding badges...
call node prisma/seed-badges.js
if %errorlevel% neq 0 (
    echo [ERROR] Failed to seed badges
    pause
    exit /b 1
)

echo [OK] Badges seeded
echo.

echo Step 6: Testing database connection...
call node quick-db-test.js
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your local MongoDB is ready to use.
echo Backend will automatically use local database.
echo.
pause
