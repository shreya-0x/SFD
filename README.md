# SFD - Student Financial Dashboard 💸🎯

A modern, responsive, and aesthetic financial, habit, and goal tracking application built for students.

---

## 🚀 Features

- **Auth System**:
  - Register, Login, and Forgot Password (reset).
  - User-scoped `localStorage` data persistence (each user gets their own finance records, habits, and goals).
  - Password visibility toggle (👁 / 🙈).
  
- **Landing Page**:
  - Interactive background particle physics animation with dynamic connections.
  - Live local date & clock indicators.
  - Smooth scroll & CTA transitions.

- **Home Dashboard**:
  - Unified student hub with quick navigation to all modules.
  - Dynamic motivational quotes carousel with dots navigation and 5s rotation.
  - Visual "How SFD Works" flow diagram.

- **Finance Dashboard**:
  - Real-time Income & Expense tracker with custom descriptions, categories, and dates.
  - Live balance, total income, and total expense calculation.
  - 14-day income vs. expense area chart (powered by Chart.js).
  - Categorized expense doughnut chart with breakdown percentages.
  - Recent transactions list with 1-click deletion.

- **Habit Tracker**:
  - Custom habits with custom emoji and color theme tagging.
  - Interactive 14-day completion grid with day/month pill toggles.
  - Daily progress bar and completion rate indicators.
  - Automatic streak calculation (`🔥 Nd`).
  - 14-day habit consistency line charts.

- **Goal Streak Tracker**:
  - Financial, Personal, and Purchase goals with target amounts, notes, and deadlines.
  - Circular SVG progress indicators and overdue/due soon deadline alerts.
  - Streak counters and celebration milestone popups (`🏆`, `🔥`, `💎`, `🚀`).
  - Custom amount addition and quick add buttons (+₹100, +₹500, +₹1,000, +1, +5).
  - Streak leaderboard and progress overview bar charts.

- **Real-Time Analytics & Reminders**:
  - Unified multi-chart view (Finance, Habits, Goals).
  - **PDF Export**: Generates a high-resolution, multi-page dark theme report using `jsPDF` (Cover page, Finance breakdown, Habits calendar, Goals progress & streak leaderboard).
  - **Browser Reminders**: Configurable notifications for daily habit check-ins and 3-day goal updates using the browser Notification API.

- **Theming & Aesthetics**:
  - One-click Dark Mode / Light Mode toggle persisted across sessions.
  - High-glow Gen-Z accents, neon gradients, and responsive layouts.

---

## 📁 Project Architecture & File Organization

The project has been separated from a single monolith into clean, modular files:

```
SFD/
├── index.html              # Main HTML markup and structure
├── README.md               # Documentation
│
├── css/
│   ├── variables.css       # Theme variables, color palettes, reset & base styles
│   ├── layout.css          # Fixed navbar, live clock, page containers & responsive queries
│   ├── components.css      # Reusable cards, buttons, modals, toasts, progress bars
│   ├── sections.css        # Page-specific styling (Landing, Home, Finance, Habits, Goals, Analytics)
│   └── auth.css            # Auth overlay, glassmorphism card, tabs & form fields
│
└── js/
    ├── state.js            # Global state (D), localStorage keys, date/time helpers
    ├── theme.js            # Dark/light theme switcher and chart theme color bindings
    ├── notifications.js    # Toasts, milestone modal & Web Notifications scheduling loop
    ├── particles.js        # Interactive HTML5 Canvas particle animation
    ├── quotes.js           # Motivation quotes rotator and dots carousel
    ├── auth.js             # Authentication (login, register, reset, user-scoped data)
    ├── finance.js          # Finance transactions, balance calculations & finance charts
    ├── habits.js           # Habit tracking, streak computation, 14-day calendar & charts
    ├── goals.js            # Goals CRUD, circular SVG rings, progress updates & charts
    ├── analytics.js        # Real-time multi-chart analytics dashboard
    ├── pdf-export.js       # Multi-page dark-themed PDF export generator via jsPDF
    └── app.js              # Application router, live clock updater & initialization
```

---

## 🛠️ How to Run

1. Simply double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve it via any local web server (e.g., VS Code Live Server, `npx serve`, or Python's `python -m http.server 8000`).
