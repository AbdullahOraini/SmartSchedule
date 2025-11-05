# Quick Start Guide - Advanced Features

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Frontend
cd smart-schedule
npm install chart.js react-chartjs-2 yjs y-websocket

# Backend (already done)
cd apps/api
# Dependencies already installed
```

### 2. Start Services

```bash
# Terminal 1: Start Backend API
cd apps/api
npm run dev

# Terminal 2: Start Frontend
cd smart-schedule
npm run dev

# WebSocket server starts automatically with backend
```

### 3. Access Features

- **Analytics Dashboard**: http://localhost:3000/analytics
- **Version Control**: http://localhost:3000/versions?scheduleId=YOUR_SCHEDULE_ID
- **Search/Filter**: Use `<SearchFilter />` component in any page

---

## 📊 Features Overview

### ✅ Dashboard with Chart.js
- **Location**: `/analytics`
- **Features**: Bar charts, Line charts, Doughnut charts
- **Data**: Real-time statistics from API

### ✅ Search & Filtering
- **Component**: `<SearchFilter />`
- **Features**: Multi-field search, multiple filters
- **Performance**: Client-side filtering with memoization

### ✅ Real-time Collaboration
- **Technology**: Yjs + WebSocket
- **Port**: 3002
- **Features**: Real-time sync, user presence

### ✅ Version Control
- **Location**: `/versions?scheduleId=XXX`
- **Features**: Create, view, restore versions
- **Permissions**: Committee & Faculty only

---

## 🔧 Configuration

### Environment Variables

**Frontend** (`smart-schedule/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3002
```

**Backend** (`apps/api/.env`):
```env
WS_PORT=3002
PORT=3001
```

---

## 📝 Usage Examples

### Add Search to a Page

```tsx
import { SearchFilter } from '@/components/SearchFilter'

const [filteredData, setFilteredData] = useState(data)

<SearchFilter
  data={data}
  searchFields={['name', 'code']}
  filterFields={[
    { field: 'status', label: 'Status', options: ['Draft', 'Published'] }
  ]}
  onFilteredDataChange={setFilteredData}
/>
```

### Use Real-time Collaboration

```tsx
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration'

const { isConnected, collaborators, getSharedText } = useRealtimeCollaboration({
  roomId: 'schedule-123',
  userId: user.id,
  userName: user.name
})
```

### Create a Version

```typescript
await fetch('/api/versions/schedule-123/create', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Version 1.0',
    description: 'Initial version'
  })
})
```

---

## 📚 Documentation

- **Full Guide**: See `IMPLEMENTATION_GUIDE.md`
- **Report Guide**: See `FEATURES_IMPLEMENTATION.md`

---

## ✅ Testing Checklist

- [ ] Dashboard loads and shows charts
- [ ] Search filters work correctly
- [ ] WebSocket connects (check console)
- [ ] Version creation works
- [ ] Version restoration works

---

**Last Updated**: November 2024

