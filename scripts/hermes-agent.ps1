$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$hermesExe = Join-Path $root ".venv-hermes\Scripts\hermes.exe"

if (!(Test-Path $hermesExe)) {
  Write-Error "Hermes not installed. Run: python -m venv .venv-hermes; .\.venv-hermes\Scripts\python -m pip install -e `"vendor/hermes-agent`""
}

# Load .env.local so Hermes can use the same keys as the app.
$envFile = Join-Path $root ".env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
      $parts = $line -split "=", 2
      if ($parts.Length -eq 2) {
        $name = $parts[0].Trim()
        $value = $parts[1].Trim().Trim('"')
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
      }
    }
  }
}

# Hermes expects OPENROUTER_API_KEY, while the app uses OPENROUTER_API_KEY_1.
if (-not $env:OPENROUTER_API_KEY -and $env:OPENROUTER_API_KEY_1) {
  [Environment]::SetEnvironmentVariable("OPENROUTER_API_KEY", $env:OPENROUTER_API_KEY_1, "Process")
}

& $hermesExe @args
