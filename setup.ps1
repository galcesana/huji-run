# setup.ps1 - HUJI Run Initialization Script

Write-Host "Starting HUJI Run PWA Setup..." -ForegroundColor Cyan

# 1. Handle Conflicting Files (Backup)
if (Test-Path "README.md") {
    Write-Host "Backing up README.md..." -ForegroundColor Yellow
    Rename-Item "README.md" "README_backup.md" -Force
}
if (Test-Path ".gitignore") {
    Write-Host "Backing up .gitignore..." -ForegroundColor Yellow
    Rename-Item ".gitignore" ".gitignore_backup" -Force
}

# 2. visual separation
Write-Host "------------------------------------------------"
Write-Host "Initializing Next.js Project (App Router)..." -ForegroundColor Green
Write-Host "------------------------------------------------"

# 3. Create Next.js App (Non-Interactive)
# Using `call` or direct execution for npx in PowerShell
cmd /c "npx create-next-app@latest . --typescript --eslint --no-tailwind --src-dir --app --import-alias ""@/*"" --use-npm"

# 4. Install Additional Dependencies
Write-Host "------------------------------------------------"
Write-Host "Installing Supabase & UI Libraries..." -ForegroundColor Green
Write-Host "------------------------------------------------"
npm install @supabase/supabase-js @supabase/ssr framer-motion lucide-react clsx

# 5. Restore Backup Files (Optional - merged manually later)
Write-Host "------------------------------------------------"
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "Review README_backup.md and merge content if needed."
