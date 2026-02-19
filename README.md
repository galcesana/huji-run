# HUJI Run 🏃🏁

Official team application for the **HUJI Run** club. A premium, high-performance web app designed to connect runners, track progress via Strava, and foster team spirit.

## 🌟 Key Features

### 🎨 Premium UI/UX
- **Glass Pill Navigation:** A sleek, fixed global navigation bar with backdrop-blur effects.
- **Athletic Branding:** Unified brand identity featuring high-contrast typography and custom logo lockups.
- **Soft-Premium Aesthetic:** Minimalist design with deep shadows, large border radii (`32px`), and a clean off-white palette.

### 👥 Social & Team Dynamics
- **Team Feed:** Real-time social feed of team activities with kudos and comments.
- **Automated Onboarding:** Intelligent team assignment for new runners.
- **Verified Access:** Secure invitation-based signup with dedicated email verification flows.

### ⚡ Performance-First Architecture
- **SVG Driven:** All branding assets migrated from heavy PNGs to lightweight SVGs, reducing load times by over 98%.
- **Optimized Data Layer:** Direct Supabase integration with granular SELECT queries for minimal JSON payloads.
- **Modern Stack:** Built on **Next.js 15 (App Router)**, **Supabase**, and **Tailwind CSS**.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project
- Strava API Application

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/galcesana/huji-run.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   STRAVA_CLIENT_ID=your_id
   STRAVA_CLIENT_SECRET=your_secret
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🛠️ Project Structure

- `/src/app`: Next.js App Router (Pages, Layouts, Actions)
- `/src/components`: Reusable UI components (Design System)
- `/src/lib`: Database clients and utility functions
- `/public`: Optimized SVG assets and manifest

---

## 📈 Recent Milestones
- [x] Swapped 6.5MB logo for 67KB SVG.
- [x] Implemented "Glass Pill" global navigation.
- [x] Redesigned Auth Flow (Login, Signup, Verify Email).
- [x] Optimized feed performance with partial field selection.
