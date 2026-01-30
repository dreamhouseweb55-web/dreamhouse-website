# Dream House CMS - Cloudflare Worker Setup Script
# ================================================

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   Dream House CMS OAuth Setup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
$wranglerInstalled = Get-Command wrangler -ErrorAction SilentlyContinue

if (-not $wranglerInstalled) {
    Write-Host "[1/5] Installing Wrangler CLI..." -ForegroundColor Yellow
    npm install -g wrangler
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to install Wrangler. Please run: npm install -g wrangler" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[1/5] Wrangler CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Logging in to Cloudflare..." -ForegroundColor Yellow
Write-Host "A browser window will open. Please log in to your Cloudflare account." -ForegroundColor Gray
wrangler login

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login. Please try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/5] Deploying Worker..." -ForegroundColor Yellow
wrangler deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to deploy worker." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/5] Adding GitHub Client ID..." -ForegroundColor Yellow
Write-Host "Paste your GitHub OAuth App CLIENT ID and press Enter:" -ForegroundColor Cyan
wrangler secret put GITHUB_CLIENT_ID

Write-Host ""
Write-Host "[5/5] Adding GitHub Client Secret..." -ForegroundColor Yellow
Write-Host "Paste your GitHub OAuth App CLIENT SECRET and press Enter:" -ForegroundColor Cyan
wrangler secret put GITHUB_CLIENT_SECRET

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Push your code to GitHub" -ForegroundColor Gray
Write-Host "2. Go to: https://dreamhouseweb55-web.github.io/dreamhouse-website/admin/" -ForegroundColor Gray
Write-Host "3. Click 'Login with GitHub'" -ForegroundColor Gray
Write-Host ""
