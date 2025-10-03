# MAAD System Optimizer
Write-Host "MAAD System Optimizer Starting..." -ForegroundColor Cyan

# Clean npm cache
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null
Write-Host "Done" -ForegroundColor Green

# Check disk space
Write-Host "Checking disk space..." -ForegroundColor Yellow
$drive = Get-PSDrive C
$freeGB = [math]::Round($drive.Free / 1GB, 2)
$percentFree = [math]::Round(($drive.Free / ($drive.Free + $drive.Used)) * 100, 2)
Write-Host "Free space: $freeGB GB ($percentFree%)" -ForegroundColor Cyan

# Check Node processes
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Node processes running: $($nodeProcesses.Count)" -ForegroundColor Green
}

# Check ports
Write-Host "Checking ports..." -ForegroundColor Yellow
$port3000 = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
$port1337 = Test-NetConnection -ComputerName localhost -Port 1337 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue

if ($port3000.TcpTestSucceeded) { Write-Host "React app (3000): Running" -ForegroundColor Green }
else { Write-Host "React app (3000): Not running" -ForegroundColor Yellow }

if ($port1337.TcpTestSucceeded) { Write-Host "Webhook server (1337): Running" -ForegroundColor Green }
else { Write-Host "Webhook server (1337): Not running" -ForegroundColor Yellow }

Write-Host "Optimization complete!" -ForegroundColor Green