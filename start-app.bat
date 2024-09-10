@echo off

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js to continue.
    pause
    exit /b
)

:: Check if npm packages are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

:: Start the server
echo Starting the Spell Tracker app...
npm start
