@echo off
setlocal
title The AI Counsel - Launcher

set "PROJECT_DIR=%~dp0"
cd /d "%PROJECT_DIR%"

REM --- Create desktop shortcut on first run (if it doesn't exist yet) ---
powershell -NoProfile -Command "$d=[Environment]::GetFolderPath('Desktop'); $lnk=Join-Path $d 'The AI Counsel.lnk'; if(-not (Test-Path $lnk)){ $w=New-Object -ComObject WScript.Shell; $s=$w.CreateShortcut($lnk); $s.TargetPath='%~f0'; $s.WorkingDirectory='%PROJECT_DIR%'; $s.WindowStyle=1; $s.Description='Start The AI Counsel'; $s.IconLocation='%SystemRoot%\System32\shell32.dll,13'; $s.Save() }" >nul 2>&1

echo ============================================
echo   The AI Counsel - Starting up
echo ============================================
echo.

REM --- Kill any previous Counsel windows/servers ---
echo [1/4] Stopping any previous servers...

REM Close previously opened Counsel terminal windows (by their titles)
taskkill /FI "WINDOWTITLE eq AI Counsel - Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq AI Counsel - Frontend*" /T /F >nul 2>&1

REM Free up the ports in case servers are still bound (8001 backend, 5173 frontend)
for %%P in (8001 5173) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%P " ^| findstr LISTENING') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

timeout /t 1 /nobreak >nul
echo       Done.
echo.

REM --- Start backend in its own window ---
echo [2/4] Starting backend (http://localhost:8001)...
start "AI Counsel - Backend" cmd /k "cd /d "%PROJECT_DIR%" && uv run python -m backend.main"

REM --- Start frontend in its own window ---
echo [3/4] Starting frontend (http://localhost:5173)...
start "AI Counsel - Frontend" cmd /k "cd /d "%PROJECT_DIR%frontend" && npm run dev"

REM --- Wait for the frontend dev server to come up, then open browser ---
echo [4/4] Waiting for servers to be ready...
set "READY="
for /l %%i in (1,1,30) do (
    if not defined READY (
        powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
        if not errorlevel 1 (
            set "READY=1"
        ) else (
            timeout /t 1 /nobreak >nul
        )
    )
)

echo.
if defined READY (
    echo Servers are up. Opening browser...
) else (
    echo Servers are taking a while - opening browser anyway...
)
start "" "http://localhost:5173"

echo.
echo ============================================
echo   The AI Counsel is running.
echo   Backend:  http://localhost:8001
echo   Frontend: http://localhost:5173
echo.
echo   Two server windows have opened. To stop the
echo   app, close them or just run this launcher
echo   again (it restarts everything cleanly).
echo ============================================
echo.
echo This window will close in 8 seconds...
timeout /t 8 /nobreak >nul
endlocal
