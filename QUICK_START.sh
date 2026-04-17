#!/bin/bash

# CareerGuide Platform - Quick Start Script
# This script helps you get the platform running quickly

echo "🚀 CareerGuide Platform - Quick Start"
echo "======================================"
echo ""

# Check if XAMPP MySQL is running
echo "📋 Checking prerequisites..."
echo ""

# Function to check if MySQL is running
check_mysql() {
    if command -v mysql &> /dev/null; then
        if mysql -u root -e "SELECT 1" &> /dev/null; then
            echo "✅ MySQL is running"
            return 0
        else
            echo "❌ MySQL is not running. Please start XAMPP MySQL."
            return 1
        fi
    else
        echo "❌ MySQL command not found. Please install XAMPP."
        return 1
    fi
}

# Function to check if database exists
check_database() {
    if mysql -u root -e "USE careerguide" &> /dev/null; then
        echo "✅ Database 'careerguide' exists"
        return 0
    else
        echo "⚠️  Database 'careerguide' does not exist"
        return 1
    fi
}

# Check MySQL
if ! check_mysql; then
    echo ""
    echo "Please start XAMPP MySQL and run this script again."
    exit 1
fi

echo ""

# Check/Create database
if ! check_database; then
    echo ""
    read -p "Would you like to create the database now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating database..."
        mysql -u root -e "CREATE DATABASE careerguide"
        echo "✅ Database created"
    else
        echo "Please create the database manually and run this script again."
        exit 1
    fi
fi

echo ""
echo "📦 Running database migrations..."
echo ""

# Run migrations
echo "1/4 Running base schema..."
mysql -u root careerguide < backend/database/schema.sql
echo "✅ Base schema complete"

echo "2/4 Running admin content migration..."
mysql -u root careerguide < backend/database/admin_content_migration.sql
echo "✅ Admin content tables created"

echo "3/4 Seeding roadmaps..."
mysql -u root careerguide < backend/database/seed_roadmaps.sql
echo "✅ Roadmaps seeded"

echo "4/4 Adding teacher profile fields..."
mysql -u root careerguide < backend/database/teacher_profile_migration.sql
echo "✅ Teacher profiles ready"

echo ""
echo "✅ All migrations complete!"
echo ""

# Check if backend dependencies are installed
if [ ! -d "backend/vendor" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    composer install
    cd ..
    echo "✅ Backend dependencies installed"
    echo ""
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    echo "✅ Frontend dependencies installed"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend/public"
echo "   C:\\xampp\\php\\php.exe -S localhost:8000"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo ""
echo "4. Default admin credentials:"
echo "   Email: admin@careerguide.com"
echo "   Password: password"
echo ""
echo "📚 For more information, check:"
echo "   - TESTING_GUIDE.md"
echo "   - ALL_FEATURES_COMPLETE.md"
echo "   - ADMIN_QUICK_REFERENCE.md"
echo ""
echo "Happy coding! 🚀"
