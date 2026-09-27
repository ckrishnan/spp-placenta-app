@echo off
REM ---------------------------------------------------------------
REM  Placenta App - local dev server on http://localhost:5000
REM  Usage: double-click this file, or run "run-dev.bat" in a terminal
REM ---------------------------------------------------------------

cd /d "%~dp0"

echo ===============================================
echo   Placenta App - Local Dev Server
echo   URL: http://localhost:5000
echo   Press Ctrl+C to stop
echo ===============================================
echo.

REM Install dependencies on first run
if not exist "node_modules" (
    echo [setup] node_modules not found - running npm install...
    call npm install
    if errorlevel 1 (
        echo [error] npm install failed.
        pause
        exit /b 1
    )
    echo.
)

echo [run] starting Next.js dev server on localhost:5000 ...
echo.
call npx next dev -p 5000 -H localhost

echo.
echo [info] dev server stopped.
pause
