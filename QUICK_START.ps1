# CareerGuide Platform - Quick Start Script (PowerShell)
# This script helps you get the platform running quickly on Windows

Write-Host "🚀 CareerGuide Platform - Quick Start" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Check if XAMPP MySQL is running
Write-Host "📋 Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Function to check if MySQL is running
function Test-MySQL {
    try {
        $result = & "C:\xampp\mysql\bin\mysql.exe" -u root -e "SELECT 1" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MySQL is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ MySQL is not running. Please start XAMPP MySQL." -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ MySQL not found. Please install XAMPP." -ForegroundColor Red
        return $false
    }
}

# Function to check if database exists
function Test-Database {
    try {
        $result = & "C:\xampp\mysql\bin\mysql.exe" -u root -e "USE careerguide" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database 'careerguide' exists" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  Database 'careerguide' does not exist" -ForegroundColor Yellow
            return $false
        }
    } catch {
        return $false
    }
}

# Check MySQL
if (-not (Test-MySQL)) {
    Write-Host ""
    Write-Host "Please start XAMPP MySQL and run this script again." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check/Create database
if (-not (Test-Database)) {
    Write-Host ""
    $response = Read-Host "Would you like to create the database now? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        Write-Host "Creating database..." -ForegroundColor Yellow
        & "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE careerguide"
        Write-Host "✅ Database created" -ForegroundColor Green
    } else {
        Write-Host "Please create the database manually and run this script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
Write-Host ""

# Run migrations
Write-Host "1/4 Running base schema..." -ForegroundColor Cyan
Get-Content backend\database\schema.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root careerguide
Write-Host "✅ Base schema complete" -ForegroundColor Green

Write-Host "2/4 Running admin content migration..." -ForegroundColor Cyan
Get-Content backend\database\admin_content_migration.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root careerguide
Write-Host "✅ Admin content tables created" -ForegroundColor Green

Write-Host "3/4 Seeding roadmaps..." -ForegroundColor Cyan
Get-Content backend\database\seed_roadmaps.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root careerguide
Write-Host "✅ Roadmaps seeded" -ForegroundColor Green

Write-Host "4/4 Adding teacher profile fields..." -ForegroundColor Cyan
Get-Content backend\database\teacher_profile_migration.sql | & "C:\xampp\mysql\bin\mysql.exe" -u root careerguide
Write-Host "✅ Teacher profiles ready" -ForegroundColor Green

Write-Host ""
Write-Host "✅ All migrations complete!" -ForegroundColor Green
Write-Host ""

# Check if backend dependencies are installed
if (-not (Test-Path "backend\vendor")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Push-Location backend
    composer install
    Pop-Location
    Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

# Check if frontend dependencies are installed
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host "✅ Frontend dependencies installed" -ForegroundColor Green
    Write-Host ""
}

Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend\public" -ForegroundColor Gray
Write-Host "   C:\xampp\php\php.exe -S localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the application:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend API: http://localhost:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Default admin credentials:" -ForegroundColor White
Write-Host "   Email: admin@careerguide.com" -ForegroundColor Gray
Write-Host "   Password: password" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 For more information, check:" -ForegroundColor Cyan
Write-Host "   - TESTING_GUIDE.md" -ForegroundColor Gray
Write-Host "   - ALL_FEATURES_COMPLETE.md" -ForegroundColor Gray
Write-Host "   - ADMIN_QUICK_REFERENCE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Magenta
