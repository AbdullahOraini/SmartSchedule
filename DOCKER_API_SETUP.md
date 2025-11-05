# Docker Setup for Backend API (Port 3001)

## 📋 Overview

The backend API server is now configured to run in Docker, similar to the database. This provides:
- Consistent environment across different machines
- Easy deployment and scaling
- Isolation from host system
- Automatic startup with database

---

## 🚀 Quick Start

### Start Everything (Database + API)

```bash
# Start both database and backend API
docker-compose up -d

# Or start only database and backend (without frontend)
docker-compose up -d database backend
```

### Check Status

```bash
# See running containers
docker ps

# Check logs
docker-compose logs backend
docker-compose logs database

# Follow logs in real-time
docker-compose logs -f backend
```

---

## 🔧 Configuration

### Ports

- **Backend API**: Port 3001 (HTTP)
- **WebSocket**: Port 3002 (Real-time collaboration)
- **Database**: Port 5432 (PostgreSQL)

### Environment Variables

The backend API uses environment variables from `apps/api/.env` or docker-compose.yml:

```env
DATABASE_URL=postgresql://smartschedule:smartschedule_secure_password@database:5432/smartschedule?schema=public
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
WS_PORT=3002
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

---

## 📁 File Structure

```
SmartSchedule/
├── docker-compose.yml          # Main Docker Compose config
├── docker-compose.dev.yml      # Development config
└── apps/api/
    ├── Dockerfile              # Backend API Docker image
    ├── .env                    # Environment variables
    └── src/
        └── server.ts           # API server entry point
```

---

## 🐳 Docker Services

### 1. Database Service
- **Container**: `smartschedule-db`
- **Image**: `postgres:16-alpine`
- **Port**: 5432
- **Volume**: `postgres_data`

### 2. Backend API Service
- **Container**: `smartschedule-backend`
- **Image**: Built from `apps/api/Dockerfile`
- **Ports**: 3001 (HTTP), 3002 (WebSocket)
- **Depends on**: Database service
- **Volume**: `backend_logs`

---

## 🔄 Common Commands

### Start Services

```bash
# Start all services
docker-compose up -d

# Start only backend and database
docker-compose up -d database backend

# Start with logs visible
docker-compose up
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

### Restart Services

```bash
# Restart backend
docker-compose restart backend

# Restart everything
docker-compose restart
```

### View Logs

```bash
# Backend logs
docker-compose logs backend

# Database logs
docker-compose logs database

# All logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f backend
```

### Rebuild After Code Changes

```bash
# Rebuild backend image
docker-compose build backend

# Rebuild and restart
docker-compose up -d --build backend
```

---

## 🔍 Troubleshooting

### Backend Not Starting

1. **Check logs**:
   ```bash
   docker-compose logs backend
   ```

2. **Check database connection**:
   ```bash
   docker-compose logs database
   ```

3. **Verify environment variables**:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

### Port Already in Use

If port 3001 is already in use:
```bash
# Find what's using the port
netstat -ano | findstr :3001

# Or change port in docker-compose.yml
ports:
  - "3002:3001"  # External:Internal
```

### Database Connection Issues

If backend can't connect to database:
1. Ensure database container is running: `docker ps`
2. Check database is healthy: `docker-compose ps`
3. Verify DATABASE_URL in docker-compose.yml

### Rebuild from Scratch

```bash
# Stop and remove everything
docker-compose down -v

# Rebuild images
docker-compose build --no-cache

# Start fresh
docker-compose up -d
```

---

## 📊 Health Checks

### Check Backend Health

```bash
# Via Docker
docker-compose ps

# Via HTTP
curl http://localhost:3001/api/health

# Via browser
# Open: http://localhost:3001/api/health
```

### Check Database Health

```bash
# Via Docker
docker-compose exec database pg_isready -U smartschedule

# Connect to database
docker-compose exec database psql -U smartschedule -d smartschedule
```

---

## 🔐 Security Notes

1. **Change JWT_SECRET** in production
2. **Use strong passwords** for database
3. **Limit exposed ports** in production
4. **Use Docker secrets** for sensitive data
5. **Regularly update** Docker images

---

## 📝 Development vs Production

### Development
```bash
# Use docker-compose.dev.yml for hot-reload
docker-compose -f docker-compose.dev.yml up
```

### Production
```bash
# Use docker-compose.yml (no hot-reload)
docker-compose up -d
```

---

## ✅ Verification

After starting, verify everything works:

1. **Database**: `docker ps` shows `smartschedule-db` running
2. **Backend**: `docker ps` shows `smartschedule-backend` running
3. **API**: `http://localhost:3001` shows API info
4. **Health**: `http://localhost:3001/api/health` returns success

---

**Last Updated**: November 2024

