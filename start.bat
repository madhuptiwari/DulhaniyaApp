@echo off
title Dulhaniya Web Application
echo ============================================================
echo   Starting Dulhaniya - Luxury Salon & Bridal Studio at Home
echo ============================================================
echo.

REM Detect Python executable
set PYTHON_CMD=python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
        set PYTHON_CMD="%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
    ) else if exist "%APPDATA%\uv\python\cpython-3.12-windows-x86_64-none\python.exe" (
        set PYTHON_CMD="%APPDATA%\uv\python\cpython-3.12-windows-x86_64-none\python.exe"
    ) else (
        echo [INFO] Python not found in standard PATH, opening index.html directly...
        start public\index.html
        exit /b 0
    )
)

echo Starting Dulhaniya REST API & Web Server on port 8000...
start "" http://127.0.0.1:8000
%PYTHON_CMD% server.py

pause
