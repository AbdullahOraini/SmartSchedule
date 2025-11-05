# Troubleshooting Guide - Login "Failed to fetch" Error

## 🔍 Common Causes and Solutions

### 1. Backend Server Not Running

**Problem**: The frontend cannot connect to the backend API.

**Solution**:
```bash
# Terminal 1: Start Backend
cd apps/api
npm run dev

# You should see:
# 🚀 Server running on port 3001
# 🚀 WebSocket server running on port 3002
```

**Verify**: Open `http://localhost:3001` in browser - should show API info.

---

### 2. Backend Server Running on Different Port

**Problem**: Backend might be running on a different port.

**Check**: Look at terminal output when starting backend.

**Solution**: Update environment variable:
```env
# smart-schedule/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

### 3. CORS Issues

**Problem**: Browser blocking cross-origin requests.

**Check**: Open browser console, look for CORS errors.

**Solution**: Backend CORS is configured in `apps/api/src/middleware/security.ts`. Ensure:
- `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Frontend is running on `http://localhost:3000`

---

### 4. Database Connection Issues

**Problem**: Backend starts but can't connect to database.

**Check**: Backend terminal for database errors.

**Solution**:
```bash
# Ensure PostgreSQL is running
# Check apps/api/.env has correct DATABASE_URL
DATABASE_URL="postgresql://smartschedule:smartschedule_secure_password@localhost:5432/smartschedule?schema=public"
```

---

### 5. Firewall or Antivirus Blocking

**Problem**: Firewall blocking localhost connections.

**Solution**: 
- Temporarily disable firewall
- Add exception for Node.js
- Check antivirus settings

---

### 6. Port Already in Use

**Problem**: Another service using port 3001.

**Check**:
```bash
# Windows
netstat -ano | findstr :3001

# Kill process if needed
taskkill /PID <PID> /F
```

**Solution**: Change port in backend `.env`:
```env
PORT=3002
```

Then update frontend:
```env
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

---

## 🔧 Step-by-Step Debugging

### Step 1: Check Backend Status

```bash
# Start backend
cd apps/api
npm run dev

# Should see:
# 🚀 Server running on port 3001
# 📊 Environment: development
```

### Step 2: Test Backend Directly

Open browser: `http://localhost:3001`

Should see:
```json
{
  "message": "SmartSchedule API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Step 3: Check Frontend Environment

```bash
# Check smart-schedule/.env.local exists
cat smart-schedule/.env.local

# Should have:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 4: Test API Endpoint

```bash
# Using curl or Postman
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Step 5: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to login
4. Check if request appears
5. Check request details:
   - Status code
   - Response headers
   - Error message

---

## ✅ Quick Fix Checklist

- [ ] Backend server is running (`npm run dev` in `apps/api`)
- [ ] Backend shows "Server running on port 3001"
- [ ] Frontend is running (`npm run dev` in `smart-schedule`)
- [ ] Database is running (PostgreSQL)
- [ ] Environment variables are set correctly
- [ ] No firewall blocking localhost
- [ ] Port 3001 is not in use by another service
- [ ] Browser console shows detailed error (check Network tab)

---

## 🐛 Error Messages Explained

### "Failed to fetch"
- **Cause**: Network error, server not running, CORS issue
- **Fix**: Ensure backend is running, check CORS config

### "NetworkError"
- **Cause**: Connection refused, server unreachable
- **Fix**: Check backend is running on correct port

### "CORS policy blocked"
- **Cause**: CORS headers not set correctly
- **Fix**: Check `strictCors` middleware in `apps/api/src/middleware/security.ts`

### "ECONNREFUSED"
- **Cause**: Backend not running or wrong port
- **Fix**: Start backend server

---

## 📞 Still Having Issues?

1. **Check Backend Logs**: Look at terminal running backend
2. **Check Frontend Logs**: Look at browser console
3. **Verify Environment Variables**: Both frontend and backend
4. **Test with Postman/curl**: Direct API call
5. **Restart Both Servers**: Stop and start again

---

**Last Updated**: November 2024

