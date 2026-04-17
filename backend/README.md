# CareerGuide PHP Backend API

RESTful API backend for the CareerGuide application built with PHP.

## 📋 Requirements

- PHP 8.0 or higher
- MySQL 5.7+ or MariaDB 10.3+
- Composer
- Apache/Nginx web server

## 🚀 Installation

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and configure your settings:
- Database credentials
- JWT secret key
- Gemini API key
- OAuth credentials (optional)

### 3. Setup Database

```bash
# Create database and import schema
mysql -u root -p < database/schema.sql
```

Or manually:
```sql
CREATE DATABASE careerguide;
USE careerguide;
SOURCE database/schema.sql;
```

### 4. Configure Web Server

#### Apache

Make sure `.htaccess` is enabled and `mod_rewrite` is active.

```apache
<VirtualHost *:80>
    ServerName api.careerguide.local
    DocumentRoot /path/to/backend/public
    
    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name api.careerguide.local;
    root /path/to/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### 5. Start Development Server

For quick testing, use PHP's built-in server:

```bash
cd public
php -S localhost:8000
```

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@bit.bdu.edu.et",
  "password": "password123",
  "academic_year": "3rd Year"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@bit.bdu.edu.et",
  "password": "password123"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@bit.bdu.edu.et",
    "role": "student"
  }
}
```

### Protected Endpoints

All protected endpoints require the JWT token in the Authorization header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get User Profile
```http
GET /api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get User Stats
```http
GET /api/users/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Get All Courses
```http
GET /api/courses
```

#### Generate Course (AI)
```http
POST /api/courses/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "role": "Frontend Developer"
}
```

#### Enroll in Course
```http
POST /api/courses/123/enroll
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Generate Roadmap (AI)
```http
POST /api/roadmaps/generate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "role": "DevOps Engineer"
}
```

#### Save Roadmap
```http
POST /api/roadmaps
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "DevOps Learning Path",
  "role": "DevOps Engineer",
  "phases": [...]
}
```

## 🔧 Configuration

### CORS Settings

CORS is enabled by default in `public/index.php`. Modify if needed:

```php
header('Access-Control-Allow-Origin: http://localhost:5173');
```

### JWT Configuration

Set a strong secret key in `.env`:

```env
JWT_SECRET=your_very_strong_secret_key_here
JWT_EXPIRY=86400
```

### Gemini AI Integration

Add your Gemini API key to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── Controllers/      # Request handlers
│   ├── Models/           # Database models
│   ├── Services/         # Business logic (AI, etc.)
│   └── Helpers/          # Utility functions
├── config/
│   └── database.php      # Database connection
├── database/
│   └── schema.sql        # Database schema
├── public/
│   └── index.php         # Entry point
├── routes/
│   └── api.php           # Route definitions
├── .env.example          # Environment template
├── .htaccess             # Apache rewrite rules
├── composer.json         # PHP dependencies
└── README.md
```

## 🧪 Testing

Test the API using curl:

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@bit.bdu.edu.et","password":"test123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bit.bdu.edu.et","password":"test123"}'

# Get profile (replace TOKEN)
curl -X GET http://localhost:8000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- SQL injection prevention with prepared statements
- CORS configured for frontend origin
- Input validation on all endpoints

## 🐛 Troubleshooting

### "Route not found" error
- Check `.htaccess` is working
- Verify `mod_rewrite` is enabled
- Check file permissions

### Database connection error
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database exists

### JWT errors
- Verify JWT_SECRET is set in `.env`
- Check token format in Authorization header
- Ensure token hasn't expired

## 📝 License

MIT License
