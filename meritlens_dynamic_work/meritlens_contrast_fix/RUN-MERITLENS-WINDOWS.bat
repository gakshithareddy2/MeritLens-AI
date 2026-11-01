@echo off
setlocal
cd /d "%~dp0"
echo Installing MeritLens AI dependencies...
call npm install
if errorlevel 1 (
  echo.
  echo Dependency installation failed. Please read the error above and share it for help.
  pause
  exit /b 1
)
echo.
echo Starting MeritLens AI...
call npm run dev
pause
