
## 1. **Dashboard/Overview Page** (`/dashboard`)
**Purpose**: Main landing page with real-time system status
**Backend Connections**:
- `GET /api/runs?status=running` - Active runs
- `GET /api/modules` - Module status overview  
- `GET /health` - System health
- Socket.IO `/ws` - Real-time updates
- Daily metrics for charts

**Key Components**:
- Active runs counter
- Module status grid (active/maintenance/offline)
- Today's waste processed / products created
- Recent alerts
- Real-time progress bars for running processes

## 2. **Processing Runs Page** (`/runs`)
**Purpose**: Manage all processing operations
**Backend Connections**:
- `GET /api/runs` - List all runs with filters
- `POST /api/runs` - Create new run
- `GET /api/runs/:id` - Run details
- `POST /api/runs/:id/cancel` - Cancel run
- `POST /api/runs/:id/retry` - Retry failed run
- Socket.IO - Real-time progress updates

**Sub-pages**:
- `/runs/new` - Create run form
- `/runs/:id` - Run detail view with logs

## 3. **Waste Inventory Page** (`/inventory/waste`)
**Purpose**: View and manage available waste materials
**Backend Connections**:
- `GET /api/waste-inventory` - List waste inventory
- `GET /api/waste-inventory/summary` - Aggregated view
- `GET /api/waste-inventory/expiring` - Items expiring soon

**Features**:
- Filter by waste type, location, quality grade
- Sort by quantity, expiry date
- Waste type breakdown charts

## 4. **Product Inventory Page** (`/inventory/products`)
**Purpose**: View produced items and manage reservations
**Backend Connections**:
- `GET /api/products` - List products
- `GET /api/products/:id` - Product details
- `PUT /api/products/:id/reserve` - Reserve products
- `PUT /api/products/:id/consume` - Mark as used

**Features**:
- Product type filters
- Available vs reserved quantities
- Production run traceability

## 5. **Equipment/Modules Page** (`/equipment`)
**Purpose**: Monitor and manage processing equipment
**Backend Connections**:
- `GET /api/modules` - List all modules
- `GET /api/modules/:id` - Module details
- `PATCH /api/modules/:id` - Update module
- `POST /api/modules/:id/maintenance` - Schedule maintenance
- `POST /api/modules/:id/reserve` - Reserve module

**Sub-pages**:
- `/equipment/:id` - Module detail/control panel
- `/equipment/maintenance` - Maintenance schedule

## 6. **Recipes Page** (`/recipes`)
**Purpose**: View and manage processing recipes
**Backend Connections**:
- Recipe endpoints (you'll need to implement these)
- `GET /api/recipes` - List recipes
- `POST /api/recipes` - Create recipe
- `GET /api/recipes/:id` - Recipe details

**Features**:
- Recipe library
- Input/output material mappings
- Efficiency ratings

## 7. **Alerts & Notifications** (`/alerts`)
**Purpose**: System notifications and issue management
**Backend Connections**:
- Alert endpoints (you'll need to implement these)
- `GET /api/alerts` - List alerts
- `POST /api/alerts/:id/resolve` - Mark resolved
- Socket.IO - Real-time alert notifications

## 8. **Analytics Dashboard** (`/analytics`)
**Purpose**: Performance metrics and reporting
**Backend Connections**:
- `GET /api/resources/daily-summary` - Daily metrics
- `GET /api/resources/usage` - Resource consumption
- Daily metrics table for historical data

**Charts/Widgets**:
- Waste processing trends
- Energy consumption
- Product output efficiency
- Module uptime statistics

## 9. **User Management** (`/users`) - Admin Only
**Purpose**: Manage system users and permissions
**Backend Connections**:
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- Role-based access control

## 10. **Authentication Pages**
- `/login` - Login form
- `/logout` - Logout handler
- Protected route wrapper component

## Page Navigation Flow:

```
Dashboard (Overview)
├── Runs → Create New Run → Run Details
├── Inventory
│   ├── Waste Materials
│   └── Products
├── Equipment → Module Details → Schedule Maintenance
├── Recipes → Recipe Details
├── Alerts → Alert Details
├── Analytics (Charts/Reports)
└── Users (Admin only)
```

## Real-time Features (Socket.IO Integration):

**Global Components** (appear on multiple pages):
- **Toast Notifications**: New alerts, run completions
- **Progress Indicators**: Run progress bars
- **Status Badges**: Module status changes

**Page-specific Real-time**:
- **Dashboard**: Live counters, status updates
- **Runs Page**: Progress updates, status changes
- **Equipment**: Module status, maintenance alerts

## Recommended Implementation Priority:

### Phase 1 (Core Demo):
1. Dashboard - System overview
2. Runs page - Create and monitor runs
3. Basic authentication

### Phase 2 (Hackathon Complete):
4. Inventory pages - Waste and products
5. Equipment management
6. Real-time Socket.IO integration

### Phase 3 (Polish):
7. Analytics dashboard
8. Alerts management
9. User management

