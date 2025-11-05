# SmartSchedule Backend Environment Setup Script
# This script creates a .env file for local development

$envContent = @"
# Database
# For local PostgreSQL (default port 5432)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartschedule?schema=public"

# If using Docker database (docker-compose up database):
# DATABASE_URL="postgresql://smartschedule:smartschedule_secure_password@localhost:5432/smartschedule?schema=public"

# JWT Security
JWT_SECRET="dev-jwt-secret-key-change-in-production-$(Get-Random -Minimum 1000 -Maximum 9999)"
JWT_REFRESH_SECRET="dev-refresh-secret-key-change-in-production-$(Get-Random -Minimum 1000 -Maximum 9999)"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
JWT_ISSUER="smartschedule-api"
JWT_AUDIENCE="smartschedule-client"

# Server
PORT=3001
NODE_ENV="development"

# CORS & Security
FRONTEND_URL="http://localhost:3000"
ALLOWED_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security Headers
HSTS_MAX_AGE=31536000
CSP_REPORT_URI="https://yourdomain.com/csp-report"

# File Upload
MAX_FILE_SIZE="5mb"
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf,text/plain"

# Admin IP Whitelist (comma-separated)
ADMIN_IP_WHITELIST="127.0.0.1,::1"

# Logging
LOG_LEVEL="info"
SECURITY_LOG_RETENTION_DAYS="90"
"@

# Check if .env already exists
if (Test-Path ".env") {
    Write-Host "⚠️  .env file already exists. Backing up to .env.backup..." -ForegroundColor Yellow
    Copy-Item ".env" ".env.backup"
}

# Create .env file
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✅ Created .env file" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update DATABASE_URL in .env with your PostgreSQL credentials" -ForegroundColor White
Write-Host '2. Run: npm run db:generate' -ForegroundColor White
Write-Host '3. Run: npm run db:push' -ForegroundColor White
Write-Host ""
Write-Host '💡 Tip: To use Docker database, run docker-compose up -d database first' -ForegroundColor Yellow

