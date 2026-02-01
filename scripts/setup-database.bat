@echo off
REM CivicLens Database Setup Script for Windows CMD
REM This script automates PostgreSQL database creation and initialization

setlocal enabledelayedexpansion

REM Configuration
set DB_NAME=civiclens_db
set DB_USER=civiclens_user
set DB_PASSWORD=password123
set DB_HOST=localhost
set DB_PORT=5432

echo.
echo ============================================================
echo          CivicLens Database Setup Script
echo ============================================================
echo.
echo Configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo.

REM Step 1: Check PostgreSQL Installation
echo Step 1: Checking PostgreSQL Installation...
echo ============================================================
psql --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)
echo [OK] PostgreSQL found
echo.

REM Step 2: Test PostgreSQL Connection
echo Step 2: Testing PostgreSQL Connection...
echo ============================================================
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to PostgreSQL
    echo Make sure PostgreSQL is running on %DB_HOST%:%DB_PORT%
    pause
    exit /b 1
)
echo [OK] PostgreSQL connection successful
echo.

REM Step 3: Create Database
echo Step 3: Creating Database...
echo ============================================================
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database creation failed (may already exist)
) else (
    echo [OK] Database created
)
echo.

REM Step 4: Create Database User
echo Step 4: Creating Database User...
echo ============================================================
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] User creation failed (may already exist)
    echo Updating password...
    psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "ALTER USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';" >nul 2>&1
) else (
    echo [OK] User created
)
echo.

REM Step 5: Grant Privileges
echo Step 5: Granting Privileges...
echo ============================================================
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;" >nul 2>&1
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "ALTER DATABASE %DB_NAME% OWNER TO %DB_USER%;" >nul 2>&1
echo [OK] Privileges granted
echo.

REM Step 6: Install PostGIS Extension
echo Step 6: Installing PostGIS Extension...
echo ============================================================
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "CREATE EXTENSION IF NOT EXISTS postgis;" >nul 2>&1
if errorlevel 1 (
    echo [WARNING] PostGIS installation failed (may not be installed)
) else (
    echo [OK] PostGIS extension created
)
echo.

REM Step 7: Update .env File
echo Step 7: Updating Environment Configuration...
echo ============================================================
if exist "..\civiclens-backend\.env" (
    echo [OK] .env file found
    echo Note: Please manually update DATABASE_URL in ..\civiclens-backend\.env if needed
    echo DATABASE_URL=postgresql+asyncpg://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
) else (
    echo [WARNING] .env file not found
)
echo.

REM Summary
echo.
echo ============================================================
echo              Database Setup Complete!
echo ============================================================
echo.
echo Database Information:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo.
echo Next Steps:
echo   1. Start the backend:
echo      cd civiclens-backend
echo      .venv\Scripts\activate.bat
echo      uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
echo   2. Start the admin dashboard:
echo      cd civiclens-admin
echo      npm run dev
echo.
echo   3. Start the client app:
echo      cd civiclens-client
echo      npm run dev
echo.
echo Documentation:
echo   - Setup Guide: SETUP_DATABASE.md
echo   - Quick Start: QUICK-START.md
echo   - API Docs: http://localhost:8000/docs
echo.
echo Happy coding!
echo.
pause
