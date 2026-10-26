@echo off
setlocal EnableDelayedExpansion
title Dulhaniya - Luxury Salon and Bridal Studio at Home

echo =====================================================================
echo       DULHANIYA - LUXURY SALON AND BRIDAL STUDIO AT HOME
echo =====================================================================
echo.
echo [Step 1] Detecting runtime environment...

set RUNTIME_TYPE=none
set RUNTIME_EXEC=

REM 1. Check uv executable
if exist "%USERPROFILE%\.local\bin\uv.exe" (
    "%USERPROFILE%\.local\bin\uv.exe" run python -c "import sys; sys.exit(0)" >nul 2>&1
    if !ERRORLEVEL! EQU 0 (
        set RUNTIME_TYPE=uv
        set RUNTIME_EXEC="%USERPROFILE%\.local\bin\uv.exe" run python
        goto :FOUND_RUNTIME
    )
)

REM 2. Check direct uv python 3.12
if exist "%APPDATA%\uv\python\cpython-3.12-windows-x86_64-none\python.exe" (
    set RUNTIME_TYPE=python
    set RUNTIME_EXEC="%APPDATA%\uv\python\cpython-3.12-windows-x86_64-none\python.exe"
    goto :FOUND_RUNTIME
)

REM 3. Check second uv python path
if exist "%APPDATA%\uv\python\cpython-3.12.12-windows-x86_64-none\python.exe" (
    set RUNTIME_TYPE=python
    set RUNTIME_EXEC="%APPDATA%\uv\python\cpython-3.12.12-windows-x86_64-none\python.exe"
    goto :FOUND_RUNTIME
)

REM 4. Check official Windows Python paths in LocalAppData
for %%V in (Python313 Python312 Python311 Python310) do (
    if exist "%LOCALAPPDATA%\Programs\Python\%%V\python.exe" (
        set RUNTIME_TYPE=python
        set RUNTIME_EXEC="%LOCALAPPDATA%\Programs\Python\%%V\python.exe"
        goto :FOUND_RUNTIME
    )
)

REM 5. Check root Python directories
for %%D in (C:\Python312 C:\Python311 C:\Python310 "C:\Program Files\Python312" "C:\Program Files\Python311") do (
    if exist "%%~D\python.exe" (
        set RUNTIME_TYPE=python
        set RUNTIME_EXEC="%%~D\python.exe"
        goto :FOUND_RUNTIME
    )
)

REM 6. Check official py launcher
py -3 -c "import sys; sys.exit(0)" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    set RUNTIME_TYPE=python
    set RUNTIME_EXEC=py -3
    goto :FOUND_RUNTIME
)

REM 7. Check Cursor Node executable
if exist "%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe" (
    set RUNTIME_TYPE=node
    set RUNTIME_EXEC="%LOCALAPPDATA%\Programs\cursor\resources\app\resources\helpers\node.exe"
    goto :FOUND_RUNTIME
)
if exist "%LOCALAPPDATA%\Programs\cursor\_\resources\app\resources\helpers\node.exe" (
    set RUNTIME_TYPE=node
    set RUNTIME_EXEC="%LOCALAPPDATA%\Programs\cursor\_\resources\app\resources\helpers\node.exe"
    goto :FOUND_RUNTIME
)

REM 8. Check standard Node.js installations
for %%N in ("%ProgramFiles%\nodejs\node.exe" "%ProgramFiles(x86)%\nodejs\node.exe" "%LOCALAPPDATA%\Programs\node\node.exe" "%APPDATA%\npm\node.exe") do (
    if exist "%%~N" (
        set RUNTIME_TYPE=node
        set RUNTIME_EXEC="%%~N"
        goto :FOUND_RUNTIME
    )
)

REM 9. Test real system python (validates against 0-byte Windows Store alias)
python -c "import sys; sys.exit(0)" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    set RUNTIME_TYPE=python
    set RUNTIME_EXEC=python
    goto :FOUND_RUNTIME
)

REM 10. Test system node
node -e "process.exit(0)" >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    set RUNTIME_TYPE=node
    set RUNTIME_EXEC=node
    goto :FOUND_RUNTIME
)

:FOUND_RUNTIME
if "%RUNTIME_TYPE%"=="none" (
    echo [NOTICE] Running in Client Mode without local server.
    echo Opening Dulhaniya directly in your default browser...
    start "" "%~dp0public\index.html"
    pause
    exit /b 0
)

echo [Step 2] Verified active runtime: %RUNTIME_TYPE%
echo Starting Dulhaniya REST API and Web Application...
echo.

REM Clean up any old port file
if exist "%~dp0dulhaniya_port.txt" del "%~dp0dulhaniya_port.txt" >nul 2>&1

REM Launch server in foreground (server will automatically bind and launch browser)
echo [Step 3] Dulhaniya Server is starting...
echo ---------------------------------------------------------------------
echo Keep this command window open while using Dulhaniya.
echo To stop the application, press Ctrl+C or close this window.
echo ---------------------------------------------------------------------
echo.

if "%RUNTIME_TYPE%"=="node" (
    %RUNTIME_EXEC% "%~dp0server.js"
) else (
    %RUNTIME_EXEC% "%~dp0server.py"
)

if !ERRORLEVEL! NEQ 0 (
    echo.
    echo [FALLBACK] Local port binding was blocked or terminated.
    echo Launching Dulhaniya directly in your browser with offline engine...
    start "" "%~dp0public\index.html"
)

pause
