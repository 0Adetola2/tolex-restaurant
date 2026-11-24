$gitExe = "C:\Users\Acer\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if (-not (Test-Path $gitExe)) {
    $gitExe = "C:\Users\Acer\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"
}
if (-not (Test-Path $gitExe)) {
    $gitExe = "git"
}

Set-Location "C:\Users\Acer\.gemini\antigravity\scratch\tolex-restaurant"

Write-Host "Configuring remote..." -ForegroundColor Cyan
& $gitExe remote set-url origin "https://github.com/0Adetola2/tolex-restaurant.git"

Write-Host "Remote URL:" -ForegroundColor Yellow
& $gitExe remote -v

Write-Host "Staging and committing files..." -ForegroundColor Cyan
& $gitExe add -A
& $gitExe commit -m "feat: complete luxury restaurant website for TOLEX RESTAURANT"

Write-Host "Pushing to GitHub..." -ForegroundColor Green
& $gitExe push -u origin main
