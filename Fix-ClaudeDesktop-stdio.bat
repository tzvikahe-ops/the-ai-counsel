@echo off
setlocal EnableDelayedExpansion
title Fix The AI Counsel MCP for Claude Desktop (stdio)

echo ============================================
echo   Switching The AI Counsel to stdio mode
echo   (Claude Desktop needs this - it ignores SSE url entries)
echo ============================================
echo.

REM --- Locate uv.exe ---
set "UVPATH="
for /f "delims=" %%i in ('where uv 2^>nul') do if not defined UVPATH set "UVPATH=%%i"
if not defined UVPATH (
    echo ERROR: 'uv' was not found on PATH.
    echo Install uv or tell me, and we'll use an absolute path.
    echo.
    pause
    exit /b 1
)
echo Found uv at: !UVPATH!
echo.

set "PROJDIR=%~dp0"
REM strip trailing backslash
if "%PROJDIR:~-1%"=="\" set "PROJDIR=%PROJDIR:~0,-1%"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$uv = '!UVPATH!';" ^
  "$proj = '%PROJDIR%';" ^
  "$cfgDir = Join-Path $env:APPDATA 'Claude';" ^
  "$cfg = Join-Path $cfgDir 'claude_desktop_config.json';" ^
  "if(-not (Test-Path $cfgDir)){ New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null }" ^
  ";" ^
  "if(Test-Path $cfg){ Copy-Item $cfg ($cfg + '.bak2') -Force; Write-Host ('Backed up to: ' + $cfg + '.bak2'); try { $json = Get-Content $cfg -Raw | ConvertFrom-Json } catch { $json = [pscustomobject]@{} } } else { $json = [pscustomobject]@{} }" ^
  ";" ^
  "if(-not ($json.PSObject.Properties.Name -contains 'mcpServers')){ $json | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([pscustomobject]@{}) }" ^
  ";" ^
  "$entry = [pscustomobject]@{ command = $uv; args = @('--directory', $proj, 'run', 'python', '-m', 'the_ai_counsel_mcp') };" ^
  "if($json.mcpServers.PSObject.Properties.Name -contains 'the-ai-counsel'){ $json.mcpServers.'the-ai-counsel' = $entry } else { $json.mcpServers | Add-Member -NotePropertyName 'the-ai-counsel' -NotePropertyValue $entry }" ^
  ";" ^
  "$json | ConvertTo-Json -Depth 25 | Set-Content $cfg -Encoding UTF8;" ^
  "Write-Host '';" ^
  "Write-Host 'Updated the-ai-counsel to stdio mode.';" ^
  "Write-Host '--- the-ai-counsel entry now reads ---';" ^
  "$json.mcpServers.'the-ai-counsel' | ConvertTo-Json -Depth 10 | Write-Host"

echo.
echo ============================================
echo   DONE. Now:
echo   1) Make sure dependencies are installed:
echo      open a terminal in the project folder and run:  uv sync
echo   2) Fully QUIT Claude Desktop (also from the tray)
echo      and reopen it.
echo.
echo   stdio mode launches the MCP itself, so the backend
echo   does NOT need to be running for the tools to appear.
echo ============================================
echo.
pause
endlocal
