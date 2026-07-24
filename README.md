# MessMate – Know Your Meal Before You Eat It 🥗

A startup-grade, investor-ready hostel meal management & nutrition transparency web application built with **React 18**, **Vite**, **Tailwind CSS**, **Lucide Icons**, and **Recharts**.

Designed specifically for university hostels (ABES EC & ABESBS Naina Caters), empowering students with real-time mess menu visibility, Gym Mode protein tracking, restaurant discount vouchers, and dish replacement voting, while offering wardens and mess committees rich analytics and menu governance tools.

---

## ⚡ Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- [npm](https://www.npmjs.com/) v9.0 or higher

### Local Installation & Development

1. Clone or extract the project directory:
   ```bash
   cd messmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🚀 One-Click Deployment to Vercel

This repository is pre-configured for instant zero-config deployment on **Vercel**:

1. Push this project folder to your **GitHub** repository.
2. Log into [Vercel](https://vercel.com/) and click **New Project**.
3. Import your GitHub repository.
4. Keep framework preset as **Vite**.
5. Click **Deploy**!

---

## 🏗️ Project Architecture & Directory Structure

```
messmate/
├── index.html                 # Main HTML Entry Point
├── package.json               # Package Manifest & Scripts
├── vite.config.js             # Vite Bundler Configuration
├── tailwind.config.js         # Custom Tailwind CSS Theme & Colors
├── postcss.config.js          # PostCSS Plugins Setup
├── .gitignore                 # Git Exclusions
├── .env.example               # Environment Variables Template
├── README.md                  # Developer & Deployment Documentation
├── public/                    # Static Assets
└── src/                       # Application Source Code
    ├── main.jsx               # React Mount Entry Point
    ├── App.jsx                # Main Application Shell & Router
    ├── index.css              # Global Glassmorphism CSS & Utilities
    ├── context/
    │   └── AppContext.jsx     # Global Context, Real-Time Day Auto-detection & LocalStorage Persistence
    ├── data/
    │   └── mockData.js        # ABES Boys' Hostel Naina Caters Menu, Dish Photos & Voucher Data
    ├── components/            # Reusable UI Components
    │   ├── Navbar.jsx
    │   ├── RoleSwitcherBar.jsx
    │   ├── Footer.jsx
    │   ├── NotificationDrawer.jsx
    │   ├── SearchModal.jsx
    │   ├── MealDetailModal.jsx
    │   ├── RewardClaimModal.jsx
    │   └── AddEditMealModal.jsx
    └── pages/                 # Role Dashboards & Pages
        ├── StudentDashboard.jsx
        ├── MusclePassPage.jsx
        ├── HealthyRewardsPage.jsx
        ├── VotingPage.jsx
        ├── MessCommitteeDashboard.jsx
        ├── WardenDashboard.jsx
        ├── AnalyticsPage.jsx
        ├── ReportsPage.jsx
        ├── LoginPage.jsx
        ├── LandingPage.jsx
        ├── AboutPage.jsx
        └── ContactPage.jsx
```

---

## 🌟 Key Features

1. **Today's Mess Menu (ABES Boys' Hostel)**:
   - Dynamic real-time date detection (`Today: Friday, July 24, 2026`).
   - Official Naina Caters Revision 2 Weekly Menu dataset.
   - Filterable meal categories (Breakfast, Lunch, Snacks, Dinner).
   - High-definition real food imagery for every dish.
   - 1-5 Star interactive dish rating system with LocalStorage persistence.

2. **MUSCLE PASS (Gym & Student Profile Hub)**:
   - Daily protein goal calculator (e.g. 120g target).
   - Consumed vs remaining protein gauge.
   - 1-click mess meal protein loggers (`+ Paneer`, `+ Sprouts`, `+ Rajma`, `+ Soya`).
   - Device image uploader (`<input type="file" />`) allowing students to upload custom profile photos directly from their computer or mobile device.

3. **Healthy Restaurant Vouchers**:
   - Redeem earned health points for exclusive promo discount coupons at partner healthy restaurants (EatFit 50% OFF, Cult.fit 40% OFF, ProteinZone ₹150 OFF, Free Juice Vouchers).

4. **Dish Replacement Voting Poll**:
   - Automated 24-hour voting poll triggered when a dish drops below 2.5 stars, displaying real-time vote percentage meters.

5. **Mess Committee Menu Studio**:
   - Select any day of the week (Monday through Sunday) to add, edit, or delete mess menu items live.

6. **Warden Executive Portal**:
   - Quality Index metrics, food waste trend analytics, Recharts visualizations, and 1-click weekly menu approvals.

---

## 🛠️ Build Commands

- `npm run dev` - Launches Vite dev server at `http://localhost:3000`
- `npm run build` - Compiles production-ready minified bundle into `dist/`
- `npm run preview` - Previews production build locally

---

© 2026 MessMate Inc. All rights reserved.
