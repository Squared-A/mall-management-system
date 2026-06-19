# 🏬 Mall Management System — Frontend

A production-ready, enterprise-grade SaaS frontend for managing mall operations, built with **React 18 + Vite + Tailwind CSS**.

---

## 📐 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| State Management | Redux Toolkit + React Context API |
| Routing | React Router v6 |
| HTTP Client | Axios (with interceptors + token refresh) |
| Charts | Recharts |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Date Utils | date-fns |

---

## 📂 Project Structure

```
src/
├── api/                    # Axios client + per-entity API modules
│   ├── axiosClient.js      # Base client with interceptors & token refresh
│   ├── authApi.js
│   ├── mallApi.js
│   ├── shopApi.js
│   ├── tenantApi.js
│   ├── leaseApi.js
│   ├── paymentApi.js
│   ├── maintenanceApi.js
│   ├── staffApi.js
│   ├── reportApi.js
│   └── announcementApi.js
│
├── services/               # Business logic wrappers over API layer
│   ├── authService.js
│   ├── mallService.js
│   ├── shopService.js
│   ├── tenantService.js
│   ├── leaseService.js
│   ├── paymentService.js
│   ├── maintenanceService.js
│   └── miscServices.js     # staff, reports, announcements, dashboard
│
├── store/                  # Redux Toolkit
│   ├── store.js
│   └── slices/
│       ├── uiSlice.js      # Sidebar, modal state
│       ├── mallsSlice.js
│       ├── shopsSlice.js
│       ├── tenantsSlice.js
│       ├── leasesSlice.js
│       ├── paymentsSlice.js
│       ├── maintenanceSlice.js
│       └── createCrudSlice.js  # Generic CRUD slice factory
│
├── context/
│   ├── AuthContext.jsx     # Auth state, login/logout
│   ├── ThemeContext.jsx    # Dark/light mode toggle
│   └── NotificationContext.jsx  # In-app notification panel
│
├── hooks/
│   ├── useAuth.js
│   ├── useDebounce.js
│   ├── useFetch.js
│   ├── useForm.js
│   └── usePagination.js
│
├── components/
│   ├── common/
│   │   ├── Avatar.jsx
│   │   ├── Badge.jsx
│   │   ├── Breadcrumbs.jsx
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ErrorMessage.jsx    # ErrorMessage + EmptyState
│   │   ├── FilterDropdown.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   ├── PageHeader.jsx
│   │   ├── Pagination.jsx
│   │   └── SearchInput.jsx
│   │
│   ├── forms/
│   │   ├── Checkbox.jsx        # Checkbox + Switch
│   │   ├── FileUpload.jsx
│   │   ├── SelectInput.jsx
│   │   ├── TextArea.jsx
│   │   └── TextInput.jsx
│   │
│   ├── tables/
│   │   ├── DataTable.jsx       # Generic sortable + paginated table
│   │   └── TableActions.jsx    # View / Edit / Delete row actions
│   │
│   ├── charts/
│   │   ├── RevenueChart.jsx    # Area chart (revenue vs expenses)
│   │   ├── OccupancyChart.jsx  # Donut chart
│   │   └── SimpleBarChart.jsx
│   │
│   └── layout/
│       ├── Navbar.jsx          # Top bar with notifications & user menu
│       └── Sidebar.jsx         # Collapsible sidebar with role filtering
│
├── layouts/
│   ├── AuthLayout.jsx          # Split-panel auth page layout
│   └── DashboardLayout.jsx     # Sidebar + navbar + main content area
│
├── pages/
│   ├── auth/                   # Login, Register, ForgotPassword, ResetPassword
│   ├── dashboard/              # Dashboard, StatCard, mockData
│   ├── malls/                  # MallList, MallForm, MallDetails
│   ├── shops/                  # ShopList, Add/Edit/Details
│   ├── tenants/                # TenantList, Add/Edit/Details
│   ├── leases/                 # LeaseList, CreateLease, LeaseDetails
│   ├── payments/               # PaymentList, CreatePayment, History, Invoice
│   ├── maintenance/            # MaintenanceList, Create, Tracking
│   ├── staff/                  # StaffList, Add/Edit
│   ├── reports/                # Revenue, Occupancy, Expense reports
│   ├── announcements/          # AnnouncementList, CreateAnnouncement
│   └── ErrorPages.jsx          # NotFound (404), Unauthorized (403)
│
├── routes/
│   ├── AppRouter.jsx           # Central route map
│   ├── navConfig.js            # Sidebar navigation config with role guards
│   ├── ProtectedRoute.jsx      # Redirects unauthenticated users
│   └── RoleBasedRoute.jsx      # Redirects unauthorized roles
│
├── constants/
│   ├── index.js                # App-wide constants, status enums
│   ├── roles.js                # Role definitions and role groups
│   └── routes.js               # Route path constants
│
├── utils/
│   ├── formatters.js           # Currency, date, number formatters
│   ├── validators.js           # Form validation helpers
│   └── storage.js              # localStorage wrapper
│
└── styles/
    └── index.css               # Tailwind directives + global component classes
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18.x
- npm ≥ 9.x (or pnpm / yarn)

### Installation

```bash
# 1. Clone / unzip the project
cd mall-management-system

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set VITE_API_BASE_URL to your backend URL

# 4. Start the dev server
npm run dev
```

The app opens at `http://localhost:5173`.

### Build for production

```bash
npm run build
# Output in /dist
```

---

## 🔐 Authentication Flow

1. User submits credentials → `authService.login()` → stores `accessToken` + `refreshToken` in localStorage.
2. `axiosClient` interceptor attaches the token to every request.
3. On 401 responses, the interceptor automatically tries to refresh the token. If refresh fails, the user is redirected to `/login`.
4. `AuthContext` exposes `user`, `isAuthenticated`, `role`, `login`, `logout`.
5. `ProtectedRoute` wraps all dashboard routes — unauthenticated users are sent to `/login`.
6. `RoleBasedRoute` guards individual routes — unauthorized roles are sent to `/unauthorized`.

---

## 👤 Roles & Permissions

| Role | Label | Dashboard | Malls | Shops | Tenants | Leases | Payments | Staff | Reports |
|------|-------|:---------:|:-----:|:-----:|:-------:|:------:|:--------:|:-----:|:-------:|
| `super_admin` | Super Admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mall_owner` | Mall Owner | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `mall_manager` | Mall Manager | ✅ | View | ✅ | ✅ | ✅ | View | ❌ | ❌ |
| `accountant` | Accountant | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| `tenant` | Tenant | ✅ | ❌ | ❌ | ❌ | Own | Own | ❌ | ❌ |

---

## 🌙 Dark Mode

Dark mode is toggled via the moon/sun icon in the navbar. Preference is persisted to `localStorage`. Tailwind's `darkMode: 'class'` strategy is used — the `dark` class is toggled on `<html>`.

---

## 📡 Backend Integration

The frontend is pre-configured to proxy API calls to `http://localhost:5000` in dev mode (via `vite.config.js`). For production, set `VITE_API_BASE_URL` in your `.env`.

Expected backend: **Node.js + Express + MongoDB** with REST API at `/api/v1/`.

All API modules in `src/api/` map directly to backend controllers. The seed data in each page's component allows the frontend to function standalone (without backend) for development and demo purposes.

---

## 🔧 Key Patterns

- **Generic CRUD slice factory** (`createCrudSlice.js`) — eliminates boilerplate across entity slices.
- **`useFetch` hook** — generic data fetching with loading/error/refetch state.
- **`useForm` hook** — form state + validation + submit handler in one hook.
- **`DataTable` component** — plug-in columns array, it handles sorting, empty state, loading, and pagination.
- **Service layer** — thin wrappers over API modules allow swapping the HTTP client or adding caching later.

---

## 📦 npm Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Production build → `/dist` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## 📄 License

MIT — free to use, modify, and distribute.
