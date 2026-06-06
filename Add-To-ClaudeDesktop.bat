@echo off
setlocal
title Add The AI Counsel to Claude Desktop

echo ============================================
echo   Adding The AI Counsel MCP to Claude Desktop
echo ============================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ErrorActionPreference='Stop';" ^
  "$cfgDir = Join-Path $env:APPDATA 'Claude';" ^
  "$cfg = Join-Path $cfgDir 'claude_desktop_config.json';" ^
  "if(-not (Test-Path $cfgDir)){ New-Item -ItemType Directory -Force -Path $cfgDir | Out-Null }" ^
  ";" ^
  "if(Test-Path $cfg){" ^
  "  Copy-Item $cfg ($cfg + '.bak') -Force;" ^
  "  Write-Host ('Backed up existing config to: ' + $cfg + '.bak');" ^
  "  try { $json = Get-Content $cfg -Raw | ConvertFrom-Json } catch { Write-Host 'WARNING: existing config was not valid JSON. Starting fresh (old file kept as .bak).'; $json = [pscustomobject]@{} }" ^
  "} else {" ^
  "  Write-Host 'No existing config found - creating a new one.';" ^
  "  $json = [pscustomobject]@{}" ^
  "}" ^
  ";" ^
  "if(-not ($json.PSObject.Properties.Name -contains 'mcpServers')){ $json | Add-Member -NotePropertyName 'mcpServers' -NotePropertyValue ([pscustomobject]@{}) }" ^
  ";" ^
  "$entry = [pscustomobject]@{ url = 'http://localhost:8001/mcp/sse' };" ^
  "if($json.mcpServers.PSObject.Properties.Name -contains 'the-ai-counsel'){ $json.mcpServers.'the-ai-counsel' = $entry } else { $json.mcpServers | Add-Member -NotePropertyName 'the-ai-counsel' -NotePropertyValue $entry }" ^
  ";" ^
  "$json | ConvertTo-Json -Depth 20 | Set-Content $cfg -Encoding UTF8;" ^
  "Write-Host '';" ^
  "Write-Host 'Done. the-ai-counsel added to Claude Desktop config.';" ^
  "Write-Host ('Config file: ' + $cfg);" ^
  "Write-Host '';" ^
  "Write-Host '--- current config ---';" ^
  "Get-Content $cfg -Raw | Write-Host"

echo.
echo ============================================
echo   IMPORTANT: Fully quit Claude Desktop and
echo   reopen it for the change to take effect.
echo   (Make sure the backend is running too.)
echo ============================================
echo.
pause
endlocal
