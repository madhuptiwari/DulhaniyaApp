@echo off
setlocal
echo ===================================================
echo   Dulhaniya Android Release Keystore Generator
echo ===================================================
echo.
set KEYSTORE_FILE=dulhaniya-release-key.jks
set ALIAS=dulhaniya_key

if exist "%KEYSTORE_FILE%" (
    echo [WARNING] Keystore "%KEYSTORE_FILE%" already exists!
    echo To regenerate, please delete or rename the existing file.
    goto end
)

echo Generating new RSA 2048-bit release keystore...
keytool -genkeypair -v -keystore "%KEYSTORE_FILE%" -alias "%ALIAS%" -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Dulhaniya Technologies, OU=Mobile App, O=Dulhaniya, L=New Delhi, ST=Delhi, C=IN" -storepass dulhaniya2026 -keypass dulhaniya2026

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Release keystore generated successfully: %KEYSTORE_FILE%
    echo Keystore Alias: %ALIAS%
    echo.
    echo Extracting SHA-256 fingerprint for Google Play Digital Asset Links:
    keytool -list -v -keystore "%KEYSTORE_FILE%" -alias "%ALIAS%" -storepass dulhaniya2026 | findstr /C:"SHA256:"
) else (
    echo.
    echo [ERROR] Failed to generate keystore. Make sure 'keytool' is available in your PATH (included with JDK).
)

:end
echo.
pause
