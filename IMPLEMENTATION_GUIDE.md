# SmartSchedule Implementation Guide

This document describes the implementation of advanced features for the SmartSchedule application.

## 📊 Table of Contents

1. [Dashboard with Charts.js](#dashboard-with-chartsjs)
2. [Search and Filtering Functionality](#search-and-filtering-functionality)
3. [Real-time Collaboration with Yjs](#real-time-collaboration-with-yjs)
4. [Version Control System](#version-control-system)
5. [Performance Optimization](#performance-optimization)

---

## 📊 Dashboard with Charts.js

### Implementation

**Location**: `smart-schedule/components/DashboardCharts.tsx`

The dashboard uses Chart.js and react-chartjs-2 to display various analytics:

- **Bar Charts**: Course distribution, Schedule status
- **Line Charts**: Sections created over time
- **Doughnut Charts**: Enrollment distribution

### Usage

```tsx
import { DashboardCharts } from '@/components/DashboardCharts'

<DashboardCharts
  data={{
    courses: [{ label: 'Undergraduate', value: 10 }],
    sections: [{ label: '2024-01-01', value: 5 }],
    enrollments: [{ label: 'CS 101', value: 45 }],
    schedules: [{ label: 'Draft', value: 3 }]
  }}
/>
```

### API Endpoint

`GET /api/analytics/dashboard` - Returns aggregated statistics and chart data

### Features

- Responsive design
- Multiple chart types (Bar, Line, Doughnut)
- Real-time data updates
- Color-coded visualizations

---

## 🔍 Search and Filtering Functionality

### Implementation

**Location**: `smart-schedule/components/SearchFilter.tsx`

A reusable search and filter component with performance optimizations:

- **Debounced search** for better performance
- **Multi-field search** across specified fields
- **Multiple filter dropdowns** with "All" option
- **Real-time filtering** with React useMemo

### Usage

```tsx
import { SearchFilter } from '@/components/SearchFilter'

const [filteredData, setFilteredData] = useState(data)

<SearchFilter
  data={sections}
  searchFields={['name', 'course.code', 'instructor.name']}
  filterFields={[
    { field: 'status', label: 'Status', options: ['Draft', 'Published'] },
    { field: 'course.code', label: 'Course', options: courseCodes }
  ]}
  onFilteredDataChange={setFilteredData}
  placeholder="Search sections..."
/>
```

### Performance Features

- **Memoization**: Uses `useMemo` to prevent unnecessary recalculations
- **Efficient filtering**: Only processes data when search/filter changes
- **Client-side filtering**: Fast response times without server round-trips

---

## 🔄 Real-time Collaboration with Yjs

### Implementation

**Location**: `smart-schedule/hooks/useRealtimeCollaboration.ts`

Yjs provides real-time collaborative editing using CRDT (Conflict-free Replicated Data Types).

### Setup

1. **WebSocket Server** (Backend):
   ```typescript
   // apps/api/src/websocket/server.ts
   import { createWebSocketServer } from './websocket/server'
   const wss = createWebSocketServer()
   ```

2. **Frontend Hook**:
   ```tsx
   import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration'
   
   const { isConnected, collaborators, getSharedText } = useRealtimeCollaboration({
     roomId: 'schedule-123',
     userId: user.id,
     userName: user.name,
     onUserJoined: (user) => console.log('User joined:', user),
     onUserLeft: (user) => console.log('User left:', user)
   })
   
   const sharedText = getSharedText('schedule-content')
   ```

### Features

- **Real-time synchronization** across multiple users
- **Conflict resolution** using CRDT
- **User presence** awareness
- **WebSocket-based** communication

### Configuration

Set environment variable:
```env
NEXT_PUBLIC_WS_URL=ws://localhost:3001
WS_PORT=3002
```

---

## 📝 Version Control System

### Implementation

**Location**: 
- Backend: `apps/api/src/routes/version-control.ts`
- Frontend: `smart-schedule/app/versions/page.tsx`
- Database: `ScheduleVersion` model in Prisma schema

### Features

1. **Version Creation**: Create snapshots of schedules
2. **Version History**: View all versions of a schedule
3. **Version Restoration**: Restore any previous version
4. **Change Tracking**: Store detailed change information

### API Endpoints

- `GET /api/versions/:scheduleId` - Get all versions
- `POST /api/versions/:scheduleId/create` - Create new version
- `GET /api/versions/:scheduleId/:version` - Get specific version
- `POST /api/versions/:scheduleId/:version/restore` - Restore version
- `DELETE /api/versions/:scheduleId/:version` - Delete version

### Usage

```typescript
// Create a version
const response = await fetch('/api/versions/schedule-123/create', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Fall 2024 Final',
    description: 'Final schedule for Fall 2024',
    changes: { /* change details */ }
  })
})

// Restore a version
await fetch('/api/versions/schedule-123/5/restore', {
  method: 'POST'
})
```

### Database Schema

```prisma
model ScheduleVersion {
  id          String   @id @default(cuid())
  scheduleId  String
  version     Int
  name        String
  description String?
  changes     Json
  createdBy   String?
  createdAt   DateTime @default(now())
}
```

---

## ⚡ Performance Optimization

### Implemented Optimizations

1. **Database Indexing**: Added indexes on frequently queried fields
2. **Query Optimization**: Used `select` to fetch only needed fields
3. **Memoization**: React `useMemo` for expensive computations
4. **Pagination**: For large datasets (can be added)
5. **Caching**: Browser caching for static assets

### Search Performance

- Client-side filtering reduces server load
- Debounced search input
- Efficient string matching algorithms

### Chart Performance

- Chart.js built-in optimizations
- Lazy loading of chart data
- Responsive rendering

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
# Frontend
cd smart-schedule
npm install chart.js react-chartjs-2 yjs y-websocket

# Backend
cd apps/api
npm install yjs y-websocket ws
```

### 2. Start WebSocket Server

Add to `apps/api/src/server.ts`:

```typescript
import { createWebSocketServer } from './websocket/server'

// After starting HTTP server
if (process.env.NODE_ENV !== 'test') {
  createWebSocketServer()
}
```

### 3. Run Database Migration

```bash
cd apps/api
npm run db:push
```

### 4. Access Features

- **Analytics Dashboard**: `http://localhost:3000/analytics`
- **Version Control**: `http://localhost:3000/versions?scheduleId=YOUR_SCHEDULE_ID`
- **Search/Filter**: Use `<SearchFilter />` component in any page

---

## 📚 Technical Details

### Chart.js Integration

- Uses Chart.js v4+ with react-chartjs-2
- Supports Bar, Line, and Doughnut charts
- Responsive and customizable

### Yjs Integration

- CRDT-based conflict resolution
- WebSocket for real-time sync
- Awareness API for user presence

### Version Control

- Immutable version history
- JSON-based change storage
- Automatic version numbering

---

## ✅ Testing

### Manual Testing

1. **Dashboard**: Visit `/analytics` and verify charts render
2. **Search**: Use search/filter on any data list
3. **Collaboration**: Open same schedule in multiple tabs
4. **Version Control**: Create and restore versions

### Performance Testing

- Measure search response time
- Check chart rendering performance
- Monitor WebSocket connection stability

---

## 📝 Notes for Report

1. **Charts.js Implementation**: 
   - Demonstrates data visualization capabilities
   - Shows real-time statistics
   - Multiple chart types for different data presentations

2. **Search/Filter Performance**:
   - Client-side filtering for instant results
   - Memoization reduces unnecessary computations
   - Scalable to large datasets

3. **Real-time Collaboration**:
   - Yjs CRDT ensures data consistency
   - WebSocket provides low-latency updates
   - User presence awareness

4. **Version Control**:
   - Immutable version history
   - Change tracking and audit trail
   - Rollback capabilities

---

## 🔧 Troubleshooting

### Charts not rendering
- Check browser console for errors
- Verify Chart.js is properly imported
- Ensure data format matches expected structure

### WebSocket connection failed
- Verify WebSocket server is running
- Check `NEXT_PUBLIC_WS_URL` environment variable
- Ensure firewall allows WebSocket connections

### Version control not working
- Verify database schema is updated
- Check user permissions (Committee/Faculty only)
- Ensure schedule ID is valid

---

## 📖 References

- [Chart.js Documentation](https://www.chartjs.org/)
- [Yjs Documentation](https://docs.yjs.dev/)
- [React Chart.js 2](https://react-chartjs-2.js.org/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

**Last Updated**: November 2024

