# SubPulse: The Subscription Tracker & Renewal Dashboard

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0-green.svg)](https://vitest.dev/)

> **Mission**: A personal finance dashboard that aggregates recurring SaaS applications and streaming subscriptions, tracks renewal dates, normalizes varying billing cycles down to a monthly cash-flow burn rate in **₹ INR**, provides interactive active/paused savings simulations (**The Vibe Check**), and guarantees full disk persistence.

---

## 🌟 Key Features & Implementation

### 1. 📊 The Metrics Row
- **Total Monthly Burn Rate Card**: Digital high-impact metric displaying the normalized active monthly cash-flow burn in **₹ INR**.
- **Upcoming Renewals Alert Card**: Real-time counter and amber alert indicator for all subscriptions renewing within **7 calendar days**.
- **Real-Time Savings Simulator**: Live calculation of monthly cash-flow savings unlocked by paused subscriptions (`+₹.../mo saved via paused subs`).

### 2. 📝 The Entry Form
- **Service Name**: Text input with popular quick-select presets (Netflix, Spotify, ChatGPT Plus, GitHub Copilot, AWS, Figma, Notion).
- **Currency Field**: Dedicated numeric input in **₹ INR** with step and positive value validation.
- **Billing Cycle Selector**: Dropdown supporting `Monthly` and `Yearly` billing schedules.
- **Visual Calendar Date-Picker**: Visual date selector for the `Next Renewal Date`.
- **Live Uniformity Preview**: Displays the exact normalized monthly rate calculated before submission (e.g. `₹9,600/yr` normalized to `₹800.00/mo`).

### 3. 📋 The Subscription Grid Table & Edit Modal
- Structured table rendering service names, raw billing plans, normalized monthly rates, renewal dates, and status.
- **Amber Caution Badge (`Renewing Soon`)**: Automatically flags subscriptions whose renewal falls within 7 days of the reference calendar date.
- **Edit Subscription Modal**: Modify service names, pricing, cycles, and renewal dates with live Cost Uniformity recalculation.
- **Search, Filter & Sort**: Real-time search by service or category; filter tabs (`All`, `Active`, `Renewing Soon`, `Paused`); sort by soonest renewal date, cost, or name.

### 4. ⚡ "The Vibe Check" Simulation
- Clicking the interactive **Active / Paused** toggle switch does **not** delete the item.
- Switching to **Paused** instantly **greys out** that table row visually and synchronizes state with the backend engine to exclude its normalized cost from the top Monthly Burn Rate metric.
- Switching back to **Active** re-illuminates the row and restores its cost to the active burn rate.

### 5. 💾 Disk Persistence & Robust Backend
- **JSON File-Based Store** (`server/data/subscriptions.json`): Retains all additions, edits, toggles, and deletions across server restarts.
- **Cost Uniformity Engine**: Normalizes annual and monthly frequencies (`monthly = cost`, `yearly = cost / 12`).
- **Date Intersect Calculator**: Evaluates calendar dates against midnight reference dates to compute remaining days and flag urgent renewal windows (`0 <= daysRemaining <= 7`).

---

## 🏗️ Project Architecture

```
Quantiphi/
├── package.json                   # Root package orchestrating npm workspaces
├── server/                        # Express Backend API & Calculation Engine
│   ├── data/                      # Persistent storage directory
│   │   └── subscriptions.json     # Auto-persisted JSON database
│   ├── src/
│   │   ├── types/
│   │   │   └── subscription.ts    # Server TypeScript interfaces
│   │   ├── services/
│   │   │   ├── costEngine.ts      # Cost Uniformity Engine
│   │   │   ├── dateCalculator.ts  # Date Intersect Calculator
│   │   │   └── __tests__/         # Backend unit tests
│   │   │       ├── costEngine.test.ts
│   │   │       └── dateCalculator.test.ts
│   │   ├── data/
│   │   │   └── subscriptionStore.ts # Persistent file-backed store
│   │   ├── routes/
│   │   │   └── subscriptions.ts   # REST API endpoints
│   │   └── index.ts               # Express server entry point
│   ├── tsconfig.json
│   └── package.json
└── client/                        # React + Vite + Tailwind CSS Frontend
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx               # Navbar with live calendar date & reset button
    │   │   ├── MetricsRow.tsx           # Top KPI digital summary cards
    │   │   ├── SubscriptionForm.tsx     # Subscription onboarding form
    │   │   ├── SubscriptionGrid.tsx     # Table grid with Vibe Check & amber badges
    │   │   ├── EditSubscriptionModal.tsx# Interactive edit dialog
    │   │   └── __tests__/               # Frontend component tests
    │   │       ├── SubscriptionGrid.test.tsx
    │   │       └── MetricsRow.test.tsx
    │   ├── services/
    │   │   └── api.ts                   # Typed REST API client
    │   ├── types/
    │   │   └── subscription.ts          # Client TypeScript interfaces
    │   ├── utils/
    │   │   └── formatters.ts            # Currency (₹ INR) & date formatters
    │   ├── App.tsx                      # Main Dashboard view
    │   ├── index.css                    # Tailwind CSS & theme styling
    │   ├── setupTests.ts                # Test setup with jest-dom
    │   └── main.tsx                     # React DOM mount point
    ├── vite.config.ts                   # Vite proxy + Vitest config
    ├── tailwind.config.js               # Tailwind theme configuration
    ├── tsconfig.json
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Installation
```bash
npm install
```

### 2. Run Fullstack Application
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Automated Test Suite

Run all 23 unit and component tests across server and client:
```bash
npm test
```

- **Backend Tests (14 passed)**: Cost Uniformity normalization, annual burn rate, 7-day date intersection, overdue renewals, timezone boundaries.
- **Frontend Tests (9 passed)**: Vibe Check toggle row muting & strikethrough, amber "Renewing Soon" badge rendering, Edit modal triggering, and ₹ currency formatting.

---

## 🛠️ Individual Commands

| Command | Description |
|---|---|
| `npm run dev` | Runs backend (`5000`) and frontend (`5173`) concurrently |
| `npm run dev:server` | Starts Express backend in watch mode |
| `npm run dev:client` | Starts Vite React frontend development server |
| `npm test` | Executes Vitest tests for both server and client |
| `npm run build` | Builds TypeScript and bundles client & server for production |
