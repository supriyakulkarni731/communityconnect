@echo off
title Community Connect+ Local Server
echo ========================================================
echo   Starting Community Connect+ Development Server...
echo ========================================================
cd /d "%~dp0"
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python server.py encountered an issue. Falling back to http.server...
    python -m http.server 5500
)
pause

