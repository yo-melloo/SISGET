# Activate Portable Environment for Satélite Norte
# Run this as: . ./scripts/activate-env.ps1 (note the dot-source)

# Detect script location to make it folder-independent
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Get-Item (Join-Path $ScriptDir "..")
$RuntimeDir = Join-Path $ProjectRoot.FullName "runtime"


$JavaDir = Join-Path $RuntimeDir "java"
$NodeDir = Join-Path $RuntimeDir "node-js"
$PythonDir = Join-Path $RuntimeDir "python"

$EnvModified = $false

# Configure Python
if (Test-Path $PythonDir) {
    $env:PYTHON_HOME = $PythonDir
    $env:PATH = "$PythonDir;$PythonDir\Scripts;" + $env:PATH
    Write-Host "[INFO] Portable Python added to PATH: $PythonDir" -ForegroundColor Cyan
    $EnvModified = $true
}

# Configure Java
if (Test-Path $JavaDir) {
    $env:JAVA_HOME = $JavaDir
    $env:PATH = "$JavaDir\bin;" + $env:PATH
    Write-Host "[INFO] JAVA_HOME set to $JavaDir" -ForegroundColor Cyan
    $EnvModified = $true
} else {
    Write-Host "[WARN] Java runtime not found at $JavaDir. Run setup-runtime.ps1 first." -ForegroundColor Yellow
}

# Configure Node.js
if (Test-Path $NodeDir) {
    # Note: Node.js portable usually puts node.exe in the root of the extracted zip
    $env:NODE_HOME = $NodeDir
    $env:PATH = "$NodeDir;" + $env:PATH
    Write-Host "[INFO] Node.js path added: $NodeDir" -ForegroundColor Cyan
    $EnvModified = $true
} else {
    Write-Host "[WARN] Node.js runtime not found at $NodeDir. Run setup-runtime.ps1 first." -ForegroundColor Yellow
}

if ($EnvModified) {
    Write-Host "`n[SUCCESS] Portable environment activated!" -ForegroundColor Green
    Write-Host "Versions:"
    if (Get-Command java -ErrorAction SilentlyContinue) { java -version 2>&1 | Select-Object -First 1 }
    if (Get-Command node -ErrorAction SilentlyContinue) { Write-Host "node $(node -v)" }
    if (Get-Command npm -ErrorAction SilentlyContinue) { Write-Host "npm  $(npm -v)" }
}
