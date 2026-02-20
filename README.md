# HUJI Run 🏃🏁

Official team application for the **HUJI Run** club. A premium, high-performance web app designed to connect runners, track progress via Strava, and foster team spirit within the Hebrew University community.

---

## 🌟 Key Features

### 🎨 Premium UI/UX
- **"Glass Pill" Interface:** Clean, modern design featuring backdrop-blur effects, high-contrast typography, and a "Soft-Premium" aesthetic.
- **Micro-Interactions:** Smooth transitions and tactile button responses (scale-down effects).
- **SVG Branding:** Ultra-lightweight assets for lightning-fast loads.

### 👥 Squad Dynamics
- **Team Feed:** Real-time social feed of activities with deep Strava integration.
- **Intelligent Onboarding:** Seamless flow from unauthenticated -> onboarding -> pending review -> dashboard.
- **verified Access:** Invitation-only signup using the `HUJI2026` join code.

### 🛡️ Secure & Robust
- **Role-Based Access:** Dedicated views for Coaches and Athletes.
- **Cascading Deletions:** Complete account purging for security and privacy (user-led or coach-led).
- **Admin-Client Overrides:** Robust server actions ensure security rules never block legitimate user setup.

---

## 🛠️ The Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router + React 19)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL + Realtime)
- **Auth**: Supabase SSR (Email/Google)
- **Styling**: Tailwind CSS v4
- **API**: Strava V3 (Webhooks + OAuth)

---

## 📖 Documentation

The project documentation has been consolidated for clarity:

- [**System Design**](./docs/SYSTEM_DESIGN.md) — Architecture, Data Model, and Permission logic.
- [**Development Roadmap**](./docs/roadmap.md) — Phased progress and future milestones.
- [**Setup Checklist**](./docs/setup-checklist.md) — 5-minute guide to local development.
- [**Deployment Guide**](./docs/vercel-deployment.md) — Vercel & Supabase production setup.

---

## 🚀 Quick Start

1. **Clone & Install**:
   ```bash
   git clone https://github.com/galcesana/huji-run.git
   cd huji-run
   npm install
   ```

2. **Configure**:
   Follow the [Setup Checklist](./docs/setup-checklist.md) to add your `.env.local` keys.

3. **Run**:
   ```bash
   npm run dev
   ```

---

## 📈 Recent Wins
- [x] **Consolidated Documentation**: Merged legacy docs into a clean, maintainable system.
- [x] **Secure Deletion Flow**: Implemented cascading removal of all user data.
- [x] **Premium Onboarding**: Redesigned onboarding and pending pages with glassmorphism.
- [x] **Verified Coach Panel**: Upgraded coach visibility and approval actions.
