# MAAD App - GitHub Pages Deployment Script
# Run this in PowerShell

Write-Host "🚀 MAAD App - GitHub Pages Deployment" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if git is initialized
if (!(Test-Path ".git")) {
    Write-Host "📁 Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Build the app
Write-Host "🔨 Building production app..." -ForegroundColor Yellow
npm run build

# Add all files
Write-Host "📦 Adding files to git..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy MAAD app with Base44 integration"

# Instructions for user
Write-Host ""
Write-Host "✅ Your app is ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a GitHub repository at https://github.com/new" -ForegroundColor White
Write-Host "2. Name it 'maad-app' (or your preferred name)" -ForegroundColor White
Write-Host "3. Run this command (replace YOUR_USERNAME):" -ForegroundColor White
Write-Host ""
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/maad-app.git" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Go to your repo → Settings → Pages → Source: GitHub Actions" -ForegroundColor White
Write-Host "5. Add these secrets in Settings → Secrets and variables:" -ForegroundColor White
Write-Host "   - VITE_FACEBOOK_PAGE_ID: 820172544505737" -ForegroundColor Gray
Write-Host "   - VITE_FACEBOOK_ACCESS_TOKEN: [your token]" -ForegroundColor Gray
Write-Host "   - VITE_BASE44_BASE_URL: https://manaboutadog.base44.app" -ForegroundColor Gray
Write-Host "   - VITE_BASE44_AGENT_NAME: MAAD" -ForegroundColor Gray
Write-Host "   - VITE_BASE44_API_KEY: d4c9f08499e944ef99621b19d45e9df3" -ForegroundColor Gray
Write-Host ""
Write-Host "Your app will be live at: https://YOUR_USERNAME.github.io/maad-app/" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Base44 integration will work automatically!" -ForegroundColor Magenta