# SYSTEM DESIGN — HUJI Run 🏃🏁

This document serves as the central technical reference for the HUJI Run platform, detailing the architecture, data structures, and core product logic.

---

## 🏗️ 1. Architecture Overview

HUJI Run is a high-performance, mobile-first Web Application built for team-based athletic tracking.

- **Frontend**: Next.js 15 (App Router) with React 19.
- **Styling**: Tailwind CSS v4 using the "Glass Pill" design system.
- **Backend**: Next.js Server Actions & API Routes.
- **Database**: PostgreSQL via Supabase.
- **Auth**: Supabase SSR (Email/Password & Google OAuth).
- **Integration**: Strava API V3 (Webhooks & REST).

---

## 👥 2. User Roles & Permission Model

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Coach** | **Admin** | Approve/Reject athletes, manage the squad, create meetups. |
| **Athlete** | **Member** | Sync Strava activities, interact with Feed, RSVP to meetups. |
| **Pending** | **Restricted** | Authenticated but locked until a Coach reviews their Team Code. |

### 🚨 Specialized Logic: "Soft Rejection"
To maintain a high-quality team roster, if a Coach **rejects** a join request, the app automatically performs a **cascading account deletion** for that user to keep the database lean and secure.

---

## 💾 3. Data Model

### `profiles` (User Profiles)
Extends Supabase Auth users.
- `id`: UUID (Primary Key, matches `auth.users`)
- `full_name`: String
- `avatar_url`: String
- `role`: Enum (`COACH`, `CO_COACH`, `USER`)
- `status`: Enum (`PENDING`, `ACTIVE`)
- `team_id`: UUID (FK -> `teams.id`)

### `teams`
- `id`: UUID (Primary Key)
- `name`: String
- `join_code`: String (Unique) — *Current primary code: `HUJI2026`*

### `join_requests`
- `user_id`: UUID (FK -> `profiles.id`)
- `team_id`: UUID (FK -> `teams.id`)
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `note`: Text (Optional note for coach)

### `activities` (Runs)
- `user_id`: UUID (FK -> `profiles.id`)
- `strava_id`: BigInt (Unique)
- `name`: String
- `distance`: Float (meters)
- `moving_time`: Int (seconds)
- `map_polyline`: Text (SVG path for route preview)
- `type`: String (e.g., "Run")

### `posts` (Social Feed)
- `user_id`: UUID (FK -> `profiles.id`)
- `activity_id`: UUID (FK -> `activities.id`, Nullable)
- `content`: Text

---

## 🔄 4. Critical Flows

### **A. Intelligent Onboarding**
1. **Signup**: User creates account via Email or Google.
2. **Detection**: Middleware/Layout checks `team_id`.
3. **Redirect**:
   - No `team_id` -> `/onboarding`
   - `status: PENDING` -> `/pending`
   - `status: ACTIVE` -> `/dashboard`

### **B. Strava Integration**
1. **OAuth**: User authorizes via Strava.
2. **Tokens**: Encrypted tokens stored via Supabase.
3. **Webhook**: Strava sends `POST` to `/api/webhooks/strava` on new activity.
4. **Automation**: App fetches activity -> inserts into `activities` -> generates `posts`.

### **C. Account Deletion (Danger Zone)**
- **User-led**: Users can delete their own account from Settings.
- **Coach-led**: Coaches can remove athletes from the Coach Panel.
- **Cascading**: Both actions trigger a deep cleanup of `posts`, `activities`, `join_requests`, and finally `auth.users`.

---

## 🎨 5. Design System
- **Palette**: Slate-900 (Text), Orange-600 (Action), White (Surface).
- **Surface**: `bg-white/80` with `backdrop-blur-xl` and `shadow-xl`.
- **Tactility**: Buttons use `active:scale-95` and `rounded-[22px]`.
- **Typography**: Inter/Inter Tight with aggressive 900-weight headings.
