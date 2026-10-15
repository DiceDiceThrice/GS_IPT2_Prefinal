# StockFlow — Inventory Management System

**A full-stack web application for small retail businesses to manage products, stock, sales, and purchases in real time.**

---

## 🎯 Purpose

StockFlow replaces manual spreadsheets and paper logs with a modern, responsive web app that gives store owners and clerks:

- **Real-time inventory visibility** — Know exactly what's in stock, what's running low, and what needs reordering
- **Automated stock movements** — Every sale, purchase, return, and adjustment updates inventory instantly
- **Complete audit trail** — Full history of who changed what, when, and why
- **Actionable insights** — Dashboard with key metrics: revenue trends, low-stock alerts, inventory value
- **Role-based access** — Admin and staff roles with appropriate permissions

Built as a **one-sprint Scrum project** for IPT102 (Integrative Programming and Technologies 2).

---

## ✨ Features

| Module | Capabilities |
|--------|--------------|
| **Authentication** | JWT-based login, protected routes, role-based access (admin/staff), session persistence |
| **Products** | Full CRUD, categories, variants (color/size/SKU), cost & selling price, search & pagination |
| **Categories** | Hierarchical organization, prevent deletion if products exist |
| **Suppliers** | Contact info, link to products/variants, purchase order integration |
| **Customers** | Contact info, sales history |
| **Stock Management** | View/adjust quantities, low-stock alerts (reorder level), movement history with filters |
| **Sales** | Multi-item cart, auto stock reduction, receipt view, returns with stock restoration |
| **Purchases** | Purchase orders (pending/received), auto stock increase on receive, cost updates |
| **Dashboard** | Total products/variants, inventory value, today's sales, 7-day revenue chart, low-stock count |
| **Reports** | Inventory valuation, transaction summaries by type |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js 22+, Express 5, ES Modules |
| **Database** | MySQL 8+ (mysql2 driver, connection pool) |
| **Auth** | bcryptjs (password hashing), jsonwebtoken (JWT, HS256) |
| **Validation** | Zod v4 (schema validation on every endpoint) |
| **Security** | Helmet (headers), CORS, express-rate-limit |
| **Frontend** | React 19, TypeScript, Vite 8 |
| **UI** | Tailwind CSS 4, @base-ui/react (headless components), lucide-react icons |
| **State/Data** | TanStack Query (React Query), Axios, React Hook Form + Zod resolvers |
| **Routing** | React Router v7 |
| **Testing** | Vitest (unit), Node.js native test runner (API) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 22
- MySQL ≥ 8.0
- Git

### 1. Clone & Install
```bash
git clone https://github.com/conan0s4/GS_IPT2_Prefinal.git
cd GS_IPT2_Prefinal

# Backend dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials and a strong JWT_SECRET
```

Required `.env` variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=stockflow
JWT_SECRET=your-64-char-random-string
CORS_ORIGIN=http://localhost:5173
```

### 3. Initialize Database
```bash
npm run db:setup
```
This creates all tables and seeds an admin user (`admin@stockflow.local` / `admin123`).

### 4. Run Development Servers
```bash
# Terminal 1: Backend (port 3000)
npm run dev

# Terminal 2: Frontend (port 5173)
npm run frontend:dev
```

Open **http://localhost:5173** — log in with the seeded admin credentials.

---

## 📁 Project Structure

```
GS_IPT2_Prefinal/
├── src/                    # Backend source
│   ├── app.js             # Express app factory, all routes
│   ├── server.js          # Entry point, starts HTTP server
│   ├── db.js              # MySQL pool + query helpers + transactions
│   └── validation.js      # Zod schemas for every request body
├── frontend/              # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI (DataTable, FormSheet, Sidebar, etc.)
│   │   ├── pages/         # Page components (Products, Sales, Dashboard, etc.)
│   │   ├── auth/          # AuthProvider, useAuth hook
│   │   ├── lib/           # Schemas, toast, utils, API client
│   │   └── routes.tsx     # Route definitions + protected routes
│   └── ...
├── sql/
│   └── schema.sql         # Complete DDL (run via db:setup)
├── scripts/
│   └── setup.js           # DB initialization + seed data
├── test/
│   └── validation.test.js # API integration tests
├── .env.example           # Environment template
└── package.json           # Backend scripts & deps
```

---

## 🔐 Default Credentials (after `db:setup`)

| Email | Password | Role |
|-------|----------|------|
| `admin@stockflow.local` | `admin123` | admin |

> **Change the password immediately** in production.

---

## 📡 API Overview

Base URL: `http://localhost:3000/api`

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Email + password → JWT token |
| `GET` | `/auth/me` | Current user profile (requires auth) |

### Core Resources (all require auth; admin-only marked 🔒)
| Resource | GET List | GET One | POST | PUT | DELETE |
|----------|----------|---------|------|-----|--------|
| Users 🔒 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Categories | ✅ | ✅ | 🔒 | 🔒 | 🔒 |
| Suppliers | ✅ | ✅ | 🔒 | 🔒 | 🔒 |
| Customers | ✅ | ✅ | ✅ | ✅ | 🔒 |
| Products | ✅ | ✅ | 🔒 | 🔒 | 🔒 |
| Variants | ✅ | ✅ | 🔒 | 🔒 | 🔒 |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/purchases` | List purchase orders |
| `POST` | `/purchases` | Create PO (pending) |
| `POST` | `/purchases/:id/receive` | Receive PO → stock +cost update |
| `GET` | `/sales` | List sales orders |
| `POST` | `/sales` | Create sale → stock reduction |
| `POST` | `/sales/:id/returns` | Process return → stock restoration |
| `POST` | `/purchases/:id/returns` | Process purchase return |

### Stock & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stock/movements` | Audit log (filter by variant) |
| `GET` | `/stock/low` | Variants at/below reorder level |
| `POST` | `/stock/adjustments` | Manual adjustment (admin) 🔒 |
| `GET` | `/reports/dashboard` | KPIs + 7-day revenue |
| `GET` | `/reports/inventory` | Full inventory valuation |

---

## 👥 Team

| Member | Role | GitHub |
|--------|------|--------|
| Alexander Sapo | Scrum Master, Backend Lead | [@conan0s4](https://github.com/conan0s4) |
| Filbert Gonzales | Product Owner, Frontend Lead | [@DiceDiceThrice](https://github.com/DiceDiceThrice) |

---

## 📄 License

Academic project — IPT102, 1st Semester AY 2026-2027
>>>>>>> Stashed changes
