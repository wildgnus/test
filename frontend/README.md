# Construction Platform — Frontend

React + TypeScript + Tailwind CSS SPA for construction project management.

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend running on http://localhost:8000

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Default `.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

### 3. Start the development server

```bash
npm start
```

App runs at **http://localhost:3000**

### 4. Build for production

```bash
npm run build
```

---

## Project Structure

```
frontend/src/
├── components/
│   ├── Layout/
│   │   ├── Layout.tsx       # Page shell (Navbar + Sidebar + content)
│   │   ├── Navbar.tsx       # Top bar with user info and logout
│   │   └── Sidebar.tsx      # Navigation links
│   └── ProtectedRoute.tsx   # Auth-gated wrapper
├── contexts/
│   └── AuthContext.tsx      # Global auth state (login/logout/register)
├── hooks/
│   ├── useProjects.ts       # Projects data fetching hook
│   └── useTasks.ts          # Tasks data fetching hook
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Dashboard.tsx        # Overview: stats, recent projects, tasks
│   ├── ProjectList.tsx      # All projects with search
│   ├── ProjectDetails.tsx   # Tasks, costs, budget, team
│   ├── CreateProject.tsx    # Create / edit project form
│   ├── TaskList.tsx         # All tasks with filter
│   ├── TaskDetails.tsx      # Task detail + status + photo upload
│   ├── CreateTask.tsx       # New task form
│   ├── UploadReceipt.tsx    # AI receipt upload + OCR result
│   └── BudgetOverview.tsx   # Budget vs actual per project
├── services/
│   └── api.ts               # Axios instance + typed API calls
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── utils/
│   └── helpers.ts           # Currency, date, badge helpers
├── App.tsx                  # Router + routes
└── index.tsx
```

## User Roles

| Feature | Manager | Builder |
|---------|---------|---------|
| View projects | ✅ All | ✅ Assigned only |
| Create / edit / delete projects | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| View tasks | ✅ All | ✅ Assigned only |
| Update task status | ✅ | ✅ Own tasks |
| Upload receipt | ✅ | ✅ |
| View budget | ✅ | ✅ |
| Assign users to project | ✅ | ❌ |

## Key Pages

- **`/dashboard`** — stats, budget progress bar, quick links
- **`/projects`** — card grid with search, delete confirmation
- **`/projects/:id`** — budget bar, tasks, costs table, assign team
- **`/tasks`** — table with status/priority filters
- **`/tasks/:id`** — status toggle, photo attach
- **`/receipts/upload`** — drag-to-upload, OCR extraction result
- **`/budget`** — per-project budget bars + clickable cost breakdowns
