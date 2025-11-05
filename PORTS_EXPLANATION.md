# SmartSchedule - Ports and Services Explanation

## 🔌 Port Architecture

Your SmartSchedule application uses **different ports for different services**:

### Port 3001 - **Backend API Server** (Express.js)
- **What it is**: Your Node.js/Express backend API
- **Purpose**: Handles HTTP requests from the frontend
- **Command to start**: `cd apps/api && npm run dev`
- **Verify it's running**: Open `http://localhost:3001` in browser
- **What you should see**: JSON with API information

### Port 5432 - **PostgreSQL Database** (Database Server)
- **What it is**: Your PostgreSQL database server
- **Purpose**: Stores all your data (users, courses, schedules, etc.)
- **How it runs**: Usually via Docker or installed PostgreSQL service
- **Command to check**: Database should already be running (via Docker Compose)
- **Connection**: Backend connects to it, NOT the frontend

### Port 3000 - **Frontend** (Next.js)
- **What it is**: Your React/Next.js frontend application
- **Purpose**: User interface that users interact with
- **Command to start**: `cd smart-schedule && npm run dev`

### Port 3002 - **WebSocket Server** (Real-time Collaboration)
- **What it is**: WebSocket server for Yjs real-time collaboration
- **Purpose**: Handles real-time updates for collaborative editing
- **How it starts**: Automatically starts with backend server

---

## 🔄 How They Work Together

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Frontend      │         │   Backend API    │         │   Database      │
│   Port 3000     │────────▶│   Port 3001      │────────▶│   Port 5432     │
│   (Next.js)     │  HTTP   │   (Express.js)   │  SQL    │   (PostgreSQL)  │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                    │
                                    │ WebSocket
                                    ▼
                           ┌──────────────────┐
                           │  WebSocket       │
                           │  Port 3002       │
                           │  (Yjs Server)    │
                           └──────────────────┘
```

### Flow:
1. **User** interacts with **Frontend (3000)**
2. **Frontend** makes HTTP requests to **Backend API (3001)**
3. **Backend API** queries/updates **Database (5432)**
4. **Backend API** returns response to **Frontend**
5. **Frontend** displays data to user

---

## ❌ Error Message Explanation

When you see:
> "Cannot connect to server. Please make sure the backend server is running on http://localhost:3001"

**This means**:
- The **Backend API server** (port 3001) is not running
- It does NOT mean the database (port 5432) has a problem
- The database can be running fine, but if the backend API isn't running, the frontend can't connect

---

## ✅ How to Check Each Service

### 1. Check Backend API (Port 3001)
```bash
# Method 1: Browser
Open: http://localhost:3001
# Should see: {"message": "SmartSchedule API", ...}

# Method 2: Terminal
cd apps/api
npm run dev
# Should see: "🚀 Server running on port 3001"
```

### 2. Check Database (Port 5432)
```bash
# Method 1: Docker (if using Docker)
docker ps
# Should see PostgreSQL container running

# Method 2: Check if port is listening
netstat -ano | findstr :5432
# Should show PostgreSQL process

# Method 3: Try connecting
psql -h localhost -p 5432 -U smartschedule -d smartschedule
```

### 3. Check Frontend (Port 3000)
```bash
# Browser
Open: http://localhost:3000
# Should see: Login page or dashboard
```

### 4. Check WebSocket (Port 3002)
```bash
# This starts automatically with backend
# Check backend terminal for: "🚀 WebSocket server running on port 3002"
```

---

## 🐛 Troubleshooting

### "Failed to fetch" Error

**This error means**: Frontend (3000) cannot reach Backend API (3001)

**NOT**: Database (5432) problem

**Solution**:
1. ✅ Start backend: `cd apps/api && npm run dev`
2. ✅ Verify backend is running: Check terminal for "Server running on port 3001"
3. ✅ Test backend: Open `http://localhost:3001` in browser
4. ✅ Try login again

### Database Connection Errors

**If backend shows database errors**:
- Check if PostgreSQL is running (port 5432)
- Check `apps/api/.env` has correct `DATABASE_URL`
- Verify Docker container is running (if using Docker)

---

## 📝 Summary

| Service | Port | What It Is | Who Connects To It |
|---------|------|------------|-------------------|
| Frontend | 3000 | Next.js App | Browser (user) |
| Backend API | 3001 | Express.js Server | Frontend (port 3000) |
| Database | 5432 | PostgreSQL | Backend API (port 3001) |
| WebSocket | 3002 | Yjs Server | Frontend (for real-time) |

**Key Point**: 
- Frontend → Backend API (3001) → Database (5432)
- The error about "port 3001" is about the **Backend API**, not the database
- Database on 5432 is separate and should already be running

---

**Last Updated**: November 2024

