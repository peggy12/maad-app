# 🧹 Free Up Disk Space - Quick Fixes

## Quick Actions to Free Space on Windows

### 1. Clean npm Cache (Recommended First)
```powershell
npm cache clean --force
```

### 2. Clear Temp Files
```powershell
# Delete Windows temp files
Remove-Item -Path $env:TEMP\* -Recurse -Force -ErrorAction SilentlyContinue

# Delete npm cache
Remove-Item -Path "$env:APPDATA\npm-cache" -Recurse -Force -ErrorAction SilentlyContinue
```

### 3. Clean Old Node Modules (if safe)
```powershell
# Only if you have other Node projects
# Be careful - only run in directories you want to clean
Get-ChildItem -Path "C:\Users\gregm" -Directory -Recurse -Filter "node_modules" -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
```

### 4. Windows Disk Cleanup
1. Press `Windows + R`
2. Type: `cleanmgr`
3. Select your C: drive
4. Check all boxes
5. Click OK

### 5. Check Disk Space
```powershell
Get-PSDrive C
```

## Alternative: Use Vite Directly Without npm

Since npm cache is having issues, let's use Vite directly:

```powershell
# Start Vite directly
npx --yes vite
```

## Your MAAD App Status

✅ Webhook Server: Running with new credentials
❌ React App: Needs to start (disk space issue)

Once you free up some space, we can restart the React app!