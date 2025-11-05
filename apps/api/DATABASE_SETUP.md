# Database Setup Guide

## ✅ Fixed Issues

1. **Root Route (GET /)** - ✅ Fixed
   - The API now responds to `http://localhost:3001/` with API information

2. **Database Connection** - ⚠️ Needs Setup
   - PostgreSQL database needs to be running

## 🗄️ Database Setup Options

### Option 1: Using Docker (Recommended)

1. **Start Docker Desktop** (if not already running)

2. **Start PostgreSQL database:**
   ```powershell
   docker-compose up -d database
   ```

3. **Verify database is running:**
   ```powershell
   docker ps
   ```

4. **Push database schema:**
   ```powershell
   cd apps\api
   npm run db:push
   ```

### Option 2: Local PostgreSQL Installation

1. **Install PostgreSQL** (if not installed):
   - Download from: https://www.postgresql.org/download/windows/
   - Default port: 5432

2. **Create database:**
   ```sql
   CREATE DATABASE smartschedule;
   ```

3. **Update `.env` file** in `apps/api/.env`:
   ```
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/smartschedule?schema=public"
   ```

4. **Push database schema:**
   ```powershell
   cd apps\api
   npm run db:push
   ```

## 🔧 Current Configuration

The `.env` file is configured for Docker database with:
- **User:** smartschedule
- **Password:** smartschedule_secure_password
- **Database:** smartschedule
- **Port:** 5432

## ✅ Testing

1. **Test root route:**
   ```powershell
   curl http://localhost:3001/
   ```
   Should return: `{"message":"SmartSchedule API",...}`

2. **Test health endpoint:**
   ```powershell
   curl http://localhost:3001/api/health
   ```
   Should return health status (database will show as disconnected until PostgreSQL is running)

3. **Test database connection:**
   After starting PostgreSQL, the health endpoint should show:
   ```json
   {
     "status": "healthy",
     "services": {
       "database": {
         "success": true,
         "message": "Database connected successfully"
       }
     }
   }
   ```

## 🚀 Next Steps

1. Start Docker Desktop (if using Docker)
2. Run `docker-compose up -d database` (if using Docker)
3. Or install and start PostgreSQL locally
4. Run `cd apps\api && npm run db:push` to create database tables
5. Restart the dev server: `npm run dev`

