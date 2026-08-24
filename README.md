# SubPulse: The Subscription Tracker & Renewal Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green.svg)](https://vitest.dev/)

> **Mission**: A modern personal finance dashboard that aggregates recurring SaaS applications and streaming subscriptions, tracks renewal dates, normalizes varying billing cycles down to a monthly cash-flow burn rate, and delivers real-time active/paused savings simulations (**The Vibe Check**).

---

## 🌟 Key Features & Problem Statement Implementation

### 1. 📊 The Metrics Row
- **Total Monthly Burn Rate Card**: Digital high-impact metric displaying the normalized active monthly cash-flow burn in **₹ INR**.
- **Upcoming Renewals Alert Card**: Real-time counter and amber alert indicator for all subscriptions renewing within **7 calendar days**.
- **Real-Time Savings Simulator**: Live badge computing cash-flow savings unlocked by paused subscriptions (`+₹.../mo saved via paused subs`).

### 2. 📝 The Entry Form
- **Service Name**: Text input with popular quick-select presets (Netflix, Spotify, ChatGPT Plus, GitHub Copilot, AWS, Figma, Notion).
- **Currency Field**: Dedicated numeric input in **₹ INR** with step and positive value validation.
- **Billing Cycle Selector**: Dropdown supporting `Monthly` and `Yearly` billing schedules.
- **Visual Calendar Date-Picker**: Visual date selector for the `Next Renewal Date`.
- **Live Uniformity Preview**: Displays the exact normalized monthly rate calculated before submission (e.g. `₹9,600/yr` normalized to `₹800.00/mo`).

### 3. 📋 The Subscription Grid Table
- Structured table rendering service names, raw billing plans, normalized monthly rates, renewal dates, and status.
- **Amber Caution Badge (`Renewing Soon`)**: Automatically flags subscriptions whose renewal falls within 7 days of the reference calendar date.
- **Search, Filter & Sort**: Real-time search by service or category; filter tabs (`All`, `Active`, `Renewing Soon`, `Paused`); sort by soonest renewal date, cost, or name.

### 4. ⚡ "The Vibe Check" Simulation
- Clicking the interactive **Active / Paused** toggle switch does **not** delete the item.
- Switching to **Paused** instantly **greys out** that table row visually and synchronizes state with the backend engine to exclude its normalized cost from the top Monthly Burn Rate metric.
- Switching back to **Active** re-illuminates the row and restores its cost to the active burn rate.

### 5. 🧠 Backend Logic & State Management
- **Cost Uniformity Engine**: Normalizes annual and monthly frequencies (`monthly = cost`, `yearly = cost / 12`) to ensure mathematically sound metric calculations.
- **Date Intersect Calculator**: Evaluates calendar dates against midnight reference dates to compute remaining days and flag urgent renewal windows (`0 <= daysRemaining <= 7`).
- **RESTful API**: Clean Express endpoints for CRUD operations, status toggling, and metric recalculations.

---

## 🏗️ Project Architecture

```
Quantiphi/
├── package.json                   # Root package orchestrating npm workspaces
├── .gitignore                     # Git ignore rules
├── server/                        # Express Backend API & Calculation Engine
│   ├── src/
│   │   ├── types/
│   │   │   └── subscription.ts    # Server TypeScript interfaces
│   │   ├── services/
│   │   │   ├── costEngine.ts      # Cost Uniformity Engine
│   │   │   ├── dateCalculator.ts  # Date Intersect Calculator
│   │   │   └── __tests__/         # Vitest unit test suite
│   │   │       ├── costEngine.test.ts
│   │   │       └── dateCalculator.test.ts
│   │   ├── data/
│   │   │   └── subscriptionStore.ts # State store with rich seed data
│   │   ├── routes/
│   │   │   └── subscriptions.ts   # REST API endpoints
│   │   └── index.ts               # Express server entry point
│   ├── tsconfig.json
│   └── package.json
└── client/                        # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx           # Navbar with live calendar date & reset button
    │   │   ├── MetricsRow.tsx       # Top KPI digital summary cards
    │   │   ├── SubscriptionForm.tsx # Subscription onboarding form
    │   │   └── SubscriptionGrid.tsx # Table grid with Vibe Check & amber badges
    │   ├── services/
    │   │   └── api.ts               # Typed REST API client
    │   ├── types/
    │   │   └── subscription.ts      # Client TypeScript interfaces
    │   ├── utils/
    │   │   └── formatters.ts        # Currency (₹ INR) & date formatters
    │   ├── App.tsx                  # Main Dashboard view
    │   ├── index.css                # Tailwind CSS styling
    │   └── main.tsx                 # React DOM mount point
    ├── vite.config.ts               # Vite proxy to backend port 5000
    ├── tailwind.config.js           # Tailwind theme configuration
    ├── tsconfig.json
    └── package.json
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; v22 supported)
- [npm](https://www.npmjs.com/) (v9 or higher)

### 1. Installation
Install all dependencies for root, server, and client with a single command:
```bash
npm install
```

### 2. Run the Fullstack Application
Run both the Express backend and Vite frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🛠️ Individual Commands

| Command | Description |
|---|---|
| `npm run dev` | Runs backend (`5000`) and frontend (`5173`) concurrently |
| `npm run dev:server` | Starts Express backend in watch mode |
| `npm run dev:client` | Starts Vite React frontend development server |
| `npm test` | Executes Vitest unit tests for the calculation engines |
| `npm run build` | Builds TypeScript and bundles client & server for production |

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/subscriptions` | Retrieve all subscriptions enriched with normalized monthly cost & days remaining |
| `GET` | `/api/subscriptions/metrics` | Retrieve calculated summary metrics (Burn Rate, Savings, Alert Count) |
| `POST` | `/api/subscriptions` | Create a new subscription (validates name, cost, cycle, renewal date) |
| `PATCH` | `/api/subscriptions/:id/toggle` | **The Vibe Check**: Toggle between `active` and `paused` status |
| `PUT` | `/api/subscriptions/:id` | Update existing subscription details |
| `DELETE` | `/api/subscriptions/:id` | Remove a subscription from the dashboard |
| `POST` | `/api/subscriptions/reset` | Reset state to initial sample subscription dataset |
| `GET` | `/api/health` | Service health status check |

---

## 🧪 Unit Tests

Run the backend test suite:
```bash
npm test
```

### Test Coverage Highlights:
- **Cost Uniformity**: Verifies exact division and rounding for monthly and yearly subscriptions (e.g. ₹9,600/yr -> ₹800.00/mo, ₹8,400/yr -> ₹700.00/mo).
- **Date Intersect**: Validates 0 days (today), 1 day (tomorrow), exact 7-day cutoff boundaries, overdue negative days, and month rollover.
- **Financial Aggregation**: Verifies active burn rate exclusion and paused savings simulation.
