Write-Host "🚀 Polymarket Tracker Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit .env file with your database credentials" -ForegroundColor Yellow
    Write-Host "   Required: DATABASE_URL" -ForegroundColor Yellow
    Read-Host "Press enter to continue after editing .env"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Green
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Green
npm run prisma:generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Green
npm run prisma:migrate

# Ask about seeding
$seed = Read-Host "Would you like to seed sample data? (y/n)"
if ($seed -eq "y") {
    Write-Host "🌱 Seeding database..." -ForegroundColor Green
    npm run prisma:seed
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the development server:"
Write-Host "  npm run dev"
Write-Host ""
Write-Host "The app will be available at http://localhost:5000"
Write-Host ""
Write-Host "API endpoints are available at http://localhost:5000/api/*"
Write-Host "Health check: http://localhost:5000/health"
