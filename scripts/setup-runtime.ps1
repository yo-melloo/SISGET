# Setup Runtime Script for Satélite Norte project
# This script downloads and extracts portable Node.js and JDK 17

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Get-Item (Join-Path $ScriptDir "..")
$RuntimeDir = Join-Path $ProjectRoot.FullName "runtime"
$TempDir = Join-Path $ProjectRoot.FullName ".tmp_downloads"


# URLs
$NodeUrl = "https://nodejs.org/dist/v20.12.2/node-v20.12.2-win-x64.zip"
$JdkUrl = "https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10+7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip"
$PythonUrl = "https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip"

# Create directories
if (-not (Test-Path $RuntimeDir)) { New-Item -ItemType Directory -Path $RuntimeDir | Out-Null }
if (-not (Test-Path $TempDir)) { New-Item -ItemType Directory -Path $TempDir | Out-Null }

function Download-And-Extract {
    param(
        [string]$Url,
        [string]$Name,
        [string]$TargetSubDir,
        [switch]$IsPython
    )
    
    $OutputFile = Join-Path $TempDir "$Name.zip"
    $ExtractPathBase = Join-Path $TempDir $Name
    $FinalPath = Join-Path $RuntimeDir $TargetSubDir

    if (Test-Path $FinalPath) {
        Write-Host "[*] $TargetSubDir already exists. Skipping download." -ForegroundColor Cyan
        return
    }

    Write-Host "[>] Downloading $Name..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $Url -OutFile $OutputFile

    Write-Host "[>] Extracting $Name..." -ForegroundColor Yellow
    if ($IsPython) {
        # Python embed package doesn't have a nested folder, extract directly to final path
        if (-not (Test-Path $FinalPath)) { New-Item -ItemType Directory -Path $FinalPath | Out-Null }
        Expand-Archive -Path $OutputFile -DestinationPath $FinalPath -Force
        
        # HACK: Enable site-packages in the embed package
        $PthFile = Get-ChildItem -Path $FinalPath -Filter "*._pth" | Select-Object -First 1
        if ($PthFile) {
            (Get-Content $PthFile.FullName) -replace '#import site', 'import site' | Set-Content $PthFile.FullName
        }
    } else {
        Expand-Archive -Path $OutputFile -DestinationPath $ExtractPathBase -Force
        $ExtractedFolder = Get-ChildItem -Path $ExtractPathBase | Where-Object { $_.PSIsContainer } | Select-Object -First 1
        if ($ExtractedFolder) {
            Write-Host "[>] Moving to $FinalPath..." -ForegroundColor Green
            Move-Item -Path $ExtractedFolder.FullName -Destination $FinalPath
        }
    }

    Remove-Item -Path $OutputFile -Force
    if (Test-Path $ExtractPathBase) { Remove-Item -Path $ExtractPathBase -Recurse -Force }
}

# Process Node.js
Download-And-Extract -Url $NodeUrl -Name "node-js-portable" -TargetSubDir "node-js"

# Process JDK
Download-And-Extract -Url $JdkUrl -Name "jdk-portable" -TargetSubDir "java"

# Process Python
Download-And-Extract -Url $PythonUrl -Name "python-portable" -TargetSubDir "python" -IsPython


# Cleanup
if (Test-Path $TempDir) { Remove-Item -Path $TempDir -Recurse -Force }

Write-Host "`n[SUCCESS] Runtime environment setup completed!" -ForegroundColor Green
Write-Host "Use 'scripts/activate-env.ps1' to load the environment in your terminal session." -ForegroundColor Cyan
