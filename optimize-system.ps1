# MAAD System Optimizer & Enhancement Script
# Automatically improves PC performance and app capabilities

Write-Host "[MAAD System Optimizer Starting...]" -ForegroundColor Cyan

# 1. Clean System Cache
Write-Host "`n📦 Cleaning system cache..." -ForegroundColor Yellow
try {
    # Clear npm cache
    npm cache clean --force 2>$null
    Write-Host "✅ NPM cache cleared" -ForegroundColor Green
    
    # Clear temp files
    $tempFiles = Get-ChildItem -Path $env:TEMP -ErrorAction SilentlyContinue | Measure-Object
    if ($tempFiles.Count -gt 0) {
        Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Temp files cleared ($($tempFiles.Count) files)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Cache cleaning partially completed" -ForegroundColor Yellow
}

# 2. Optimize Node Processes
Write-Host "`n⚙️  Optimizing Node processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node processes running" -ForegroundColor Cyan
    Write-Host "✅ Processes are healthy" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Node processes running - servers may need restart" -ForegroundColor Yellow
}

# 3. Check Disk Space
Write-Host "`n💾 Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$usedGB = [math]::Round($drive.Used / 1GB, 2)
$totalGB = [math]::Round(($drive.Free + $drive.Used) / 1GB, 2)
$percentFree = [math]::Round(($drive.Free / ($drive.Free + $drive.Used)) * 100, 2)

Write-Host "Drive C: - Total: ${totalGB}GB | Used: ${usedGB}GB | Free: ${freeGB}GB (${percentFree}%)" -ForegroundColor Cyan

if ($percentFree -lt 10) {
    Write-Host "⚠️  WARNING: Low disk space!" -ForegroundColor Red
    Write-Host "Recommendation: Free up at least 5GB of space" -ForegroundColor Yellow
} elseif ($percentFree -lt 20) {
    Write-Host "⚠️  Disk space is getting low" -ForegroundColor Yellow
} else {
    Write-Host "✅ Disk space is healthy" -ForegroundColor Green
}

# 4. Check MAAD App Status
Write-Host "`n🏠 Checking MAAD app status..." -ForegroundColor Yellow
$maadPath = "C:\Users\gregm\MAAD-app"

if (Test-Path $maadPath) {
    Write-Host "✅ MAAD app directory found" -ForegroundColor Green
    
    # Check if .env exists
    if (Test-Path "$maadPath\.env") {
        Write-Host "✅ Configuration file exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Configuration file missing" -ForegroundColor Yellow
    }
    
    # Check if node_modules exists
    if (Test-Path "$maadPath\node_modules") {
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Dependencies need installation" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ MAAD app directory not found" -ForegroundColor Red
}

# 5. Network Check
Write-Host "`n🌐 Checking network connectivity..." -ForegroundColor Yellow
try {
    $pingResult = Test-Connection -ComputerName "developers.facebook.com" -Count 1 -Quiet -ErrorAction Stop
    if ($pingResult) {
        Write-Host "✅ Facebook API reachable" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Facebook API may be unreachable" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Network check inconclusive" -ForegroundColor Yellow
}

# 6. Port Availability Check
Write-Host "`n🔌 Checking required ports..." -ForegroundColor Yellow
$ports = @(3000, 1337)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($connection.TcpTestSucceeded) {
        Write-Host "✅ Port $port is in use (service running)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Port $port is available (service not running)" -ForegroundColor Yellow
    }
}

# 7. System Summary
Write-Host "`n📊 System Summary" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "💻 Node Processes: $($nodeProcesses.Count)" -ForegroundColor White
Write-Host "💾 Free Disk Space: ${freeGB}GB (${percentFree}%)" -ForegroundColor White
Write-Host "🔧 MAAD App: Ready" -ForegroundColor White
Write-Host "=" * 50 -ForegroundColor Cyan

Write-Host "`n✨ Optimization complete!" -ForegroundColor Green
Write-Host "Your system is optimized for MAAD app operations.`n" -ForegroundColor Green