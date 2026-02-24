# HUJI Run — System Architecture

> Single source of truth. Last updated: 2026-02-22.

---

## 1. High-Level System Overview

### 1.1 Product Purpose

HUJI Run is an internal team management app for the Hebrew University Running Club. It provides coaches with tools to manage athletes, publish training plans, schedule events, and broadcast announcements — and gives athletes a unified schedule, social feed, and Strava integration.

### 1.2 Core User Roles

| Role | Access |
|------|--------|
| **COACH** | Full admin: manage roster, approve/reject joins, create plans/events/broadcasts, remove athletes |
| **CO_COACH** | Same as COACH (identical permissions in RLS + UI) |
| **MEMBER** | View published plans, RSVP to events, interact with feed (like/comment), view roster |
| **PENDING** | Can see `/pending` page only. Lacks `team_id` assignment until approved |

### 1.3 Auth & Onboarding Flow

```
Signup (email/password) → Verify Email → Onboarding (enter join code)
→ Join Request created (PENDING) → Coach approves → Status = ACTIVE → Dashboard
```

### 1.4 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| React | React 19 | 19.2.3 |
| Styling | Tailwind CSS 4 + PostCSS | 4.2.0 |
| Animation | Framer Motion | 12.34.2 |
| Icons | Lucide React | 0.575.0 |
| Database / Auth | Supabase (Postgres + GoTrue) | 2.97.0 |
| SSR Auth | @supabase/ssr | 0.8.0 |
| Deployment | Vercel | — |
| Compiler | React Compiler (babel plugin) | 1.0.0 |

### 1.5 Runtime Environments

| Env | URL | Notes |
|-----|-----|-------|
| Local | `localhost:3000` | `npm run dev` |
| Production | Vercel | Auto-deploy from `main` branch |

> **Missing**: No staging/preview environment or branch preview setup.

---

## 2. Engineering Specifications

### 2.1 Frontend

#### Framework & Routing

- Next.js 16 App Router (file-based routing).
- All pages under `src/app/`. Server Components by default, `'use client'` added explicitly.

#### Route Map

```
/                        → Landing page (public)
/login                   → Email/password login
/signup                  → Email/password signup
/verify-email            → Post-signup verification prompt
/onboarding              → Enter team join code
/pending                 → Waiting for coach approval

/dashboard               → Main dashboard (plan widget, Strava link, roster link)
/dashboard/feed          → Team feed (posts, likes, comments)
/dashboard/schedule      → Unified schedule viewer (plans + events)
/dashboard/team          → Team roster
/dashboard/settings      → Strava, logout, delete account
/dashboard/calendar      → Redirect → /dashboard/schedule
/dashboard/training      → Redirect → /dashboard/schedule

/admin                   → Coach Panel hub (stats + nav cards)
/admin/training          → Training plan builder + plans list
/admin/team              → Join requests + athlete roster management
/admin/announce          → Broadcast message form
/admin/events            → Event scheduling form
```

#### Data Fetching Strategy

- **Server Components** (RSC): All page-level data fetching happens in `async` Server Components using the Supabase server client.
- **React `cache()`**: `getUser()` and `getProfile()` in `lib/supabase/data.ts` are wrapped in React's `cache()` for per-request deduplication. Multiple components calling `getProfile()` in the same render only hit the DB once.
- **Server Actions** (`'use server'`): All mutations go through server actions with `revalidatePath()` for cache invalidation.
- **No client-side data fetching**: No `useEffect`-based fetching. No SWR/React Query. All data comes from the server.

#### State Management

- **No global state library.**
- Local `useState` in client components (e.g., expanded items, form inputs, RSVP toggles).
- `useTransition` for pending states in server action calls (PlansList publish/unpublish/delete).
- `useActionState` for form submissions with error handling (signup, login).

#### Component Structure

```
src/components/
├── admin/          → Coach-only: TrainingPlanBuilder, PlansList, BroadcastForm,
│                     EventForm, RemoveAthleteButton
├── calendar/       → CalendarRSVP (legacy, now used within ScheduleViewer)
├── dashboard/      → ThisWeekPlan
├── feed/           → FeedCard, LikeButton, CommentSection
├── layout/         → Navigation, ServerNavigation, NavigationSkeleton, ScrollToTop
├── onboarding/     → OnboardingForm
├── schedule/       → ScheduleViewer
├── settings/       → DeleteAccountButton
├── training/       → TrainingViewer (legacy, unused)
└── ui/             → Card, Button, LoadingSpinner (design system primitives)
```

#### Performance Considerations

- `Card` component uses `framer-motion` for every card render (fade+slide animation). This creates motion wrappers around virtually every UI element. At scale with many cards (feed, roster), this could impact performance.
- No `Suspense` boundaries beyond the Navigation wrapper. Pages load atomically.
- No image optimization for user avatars (raw URLs from Strava/Google passed as `<img>` tags, not `<Image>`).
- `ScrollToTop` component triggers `window.scrollTo(0,0)` on every pathname change.

---

### 2.2 Backend / Supabase

#### Database Schema

**15 tables** across 3 migration files:

| Table | Source | Purpose |
|-------|--------|---------|
| `teams` | schema.sql | Team identity + join code |
| `profiles` | schema.sql | User profile, role, status, team_id (FK to auth.users) |
| `join_requests` | schema.sql | PENDING/APPROVED/REJECTED join requests |
| `strava_accounts` | schema.sql | OAuth tokens, athlete_id (sensitive) |
| `activities` | schema.sql | Strava activity data mirror |
| `posts` | schema.sql + feed_rls | Feed posts (coach broadcasts, activity auto-posts) |
| `comments` | schema.sql + feed_rls | Post comments |
| `likes` | schema.sql + feed_rls | Post likes (composite PK + unique index) |
| `meetups` | schema.sql | **LEGACY** — replaced by `events`, still in schema |
| `meetup_rsvps` | schema.sql | **LEGACY** — replaced by `event_rsvps`, still in schema |
| `training_plans` | coach_features.sql | Weekly plans with status (DRAFT/PUBLISHED) |
| `workouts` | coach_features.sql | Individual day workouts within a plan |
| `events` | coach_features.sql | Practices, races, socials |
| `event_rsvps` | coach_features.sql | GOING/NOT_GOING responses |
| `event_attendance` | coach_features.sql | Coach-marked attendance (PRESENT/ABSENT/EXCUSED) |

#### Key Constraints

- `training_plans`: `UNIQUE (team_id, week_start_date)` — one plan per week per team.
- `event_rsvps`: `UNIQUE (event_id, user_id)` — one RSVP per user.
- `likes`: Composite PK `(post_id, user_id)` + unique index — one like per user.
- `profiles.role`: `CHECK (role in ('COACH', 'CO_COACH', 'MEMBER'))`.
- `profiles.status`: `CHECK (status in ('PENDING', 'ACTIVE', 'REJECTED', 'BANNED'))`.

#### RLS Model

Two helper functions power the RLS policies:

```sql
is_team_coach(team_id)  -- Returns true if auth.uid() is COACH/CO_COACH + ACTIVE in team
is_team_member(team_id) -- Returns true if auth.uid() is ACTIVE member of team
```

**Policy Philosophy:**

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public (all) ⚠️ | Trigger-based | Own only | Cascade |
| teams | Public (all) ⚠️ | — | — | — |
| posts | Team members (published), coaches (all) | Coaches only | Coaches | Coaches |
| comments | Team members on published posts | Team members | Own only | Own + coaches |
| likes | Team members on published posts | Team members (own) | Own | Own |
| training_plans | Members (published), coaches (all) | Coaches | Coaches | Coaches |
| workouts | Members (via published plan), coaches (all) | Coaches | Coaches | Coaches |
| events | Team members | Coaches | Coaches | Coaches |
| event_rsvps | Team members + coaches | Members (own) | Own | Own |
| strava_accounts | Owner only | Owner | Owner | Owner |

> ⚠️ `profiles` and `teams` SELECT policies are `USING (true)` — any authenticated user can read ALL profiles and ALL teams across the system. This is a multi-tenancy risk.

#### Storage

- No Supabase Storage buckets configured.
- `posts.image_url` exists in schema but no upload pipeline is built.
- Avatars come from Strava OAuth profile pictures.

#### Triggers

- `on_auth_user_created`: Creates a `profiles` row on signup with email + full_name from metadata.
- `set_updated_at`: Auto-updates `updated_at` on: training_plans, workouts, events, event_rsvps, event_attendance, posts.

---

### 2.3 API & Data Flow

#### Server Actions (15 total across 4 files)

| File | Functions | Purpose |
|------|-----------|---------|
| `auth/actions.ts` | `login`, `signup`, `deleteAccount` | Auth mutations |
| `admin/actions.ts` | `checkCoach`, `approveRequest`, `rejectRequest`, `removeAthlete`, `createBroadcast`, `createEvent`, `createTrainingPlan`, `publishPlan`, `unpublishPlan`, `deletePlan` | All coach operations |
| `dashboard/feed/actions.ts` | `toggleLike`, `addComment` | Feed interactions |
| `dashboard/calendar/actions.ts` | `submitRsvp` | Event RSVPs |
| `onboarding/actions.ts` | `joinTeam` | Team join flow |

#### Data Flow Pattern

```
Browser → Server Component (RSC)
  → createClient() [anon key, user cookies]
  → Supabase query (RLS enforced)
  → Props → Client Component (render)

User Action → Server Action ('use server')
  → createClient() or createAdminClient()
  → Supabase mutation
  → revalidatePath() → Page re-renders with fresh data
```

#### Auth Flow

1. **Middleware** (`src/middleware.ts`): Runs on every request. Calls `supabase.auth.getUser()` to refresh session cookies.
2. **Page-level guards**: Each protected page calls `getUser()` / `getProfile()` and redirects to `/login` if unauthenticated.

> ⚠️ **Critical**: The middleware's redirect guard is **broken**. Line 45: `!request.nextUrl.pathname.startsWith('/')` — this matches **nothing** since every path starts with `/`. All route protection is handled at the page level only. The middleware only refreshes cookies.

#### Admin Client Usage

`createAdminClient()` uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS). Used in:
- `approveRequest` (update profile status + join request)
- `rejectRequest` (update profile status + join request)
- `removeAthlete` (delete profile + auth user)
- `joinTeam` (create join request + update profile)
- `deleteAccount` (cascade delete all user data + auth user)
- Admin page (fetch join requests across teams)

#### Strava Integration

```
/api/auth/strava            → Redirect to Strava OAuth
/api/auth/strava/callback   → Exchange code, save tokens
/api/webhooks/strava        → Receive activity webhook (push sync)
```

Token refresh is handled in `lib/strava.ts` with a 5-minute buffer before expiry.

---

### 2.4 Security

#### Auth Model

- Email/password only (Supabase GoTrue).
- No OAuth providers (Google removed).
- No MFA / 2FA.
- No rate limiting on login/signup.
- No CSRF protection beyond Next.js defaults.

#### RLS Guarantees

- ✅ Coach operations are gated by `is_team_coach()` function.
- ✅ Strava tokens are owner-only access.
- ✅ Likes/comments check team membership.
- ⚠️ `profiles` and `teams` are publicly readable (any authenticated user sees all).
- ⚠️ `join_requests` has RLS enabled but **no policies defined in the migration files**. Reads may fail silently.
- ⚠️ `activities` has RLS enabled but **no policies defined**. The table is essentially inaccessible via the anon client.

#### Trust Boundaries

| Boundary | Mechanism |
|----------|-----------|
| Unauthenticated → App | Page-level redirect (not middleware) |
| Member → Coach actions | `checkCoach()` in server actions + RLS |
| Cross-team data | RLS helper functions check `team_id` matching |
| Client → Server | Server actions only, no direct DB access from client |

#### Sensitive Operations

| Operation | Guard | Client |
|-----------|-------|--------|
| Approve/reject request | `checkCoach()` | Admin |
| Remove athlete | `checkCoach()` + admin client | Admin |
| Delete account | Auth check + admin client | Admin |
| Publish/unpublish plan | `checkCoach()` | Anon (RLS) |
| Create post | RLS: `is_team_coach()` | Anon (RLS) |

---

### 2.5 Performance & Scalability

#### Current Bottlenecks

1. **No database indexes** defined beyond primary keys and unique constraints. The `activities` table will be the first to suffer as Strava syncs grow (queries by `user_id`, `team_id`, `start_date`).
2. **Full table scans** on `events` — `/dashboard/schedule` fetches up to 200 events with no date windowing.
3. **N+1 risk in RLS**: `is_team_coach()` and `is_team_member()` are called per-row, each executing a subquery against `profiles`. On large result sets this compounds.
4. **`Card` component wraps every UI element in `framer-motion`** with mount animations, adding overhead per render.
5. **No pagination** on feed, roster, or plans list. Current `LIMIT` values (200 events, 20 plans, unlimited feed) will degrade.

#### Caching Strategy

- **No explicit caching.** All data is fetched fresh on every render.
- `revalidatePath()` invalidates Next.js full-route cache after mutations.
- React `cache()` deduplicates within a single request only.
- No HTTP caching headers set.
- No CDN-level caching configured.

#### Query Patterns

| Query | Frequency | Concern |
|-------|-----------|---------|
| `profiles WHERE id = auth.uid()` | Every page load (via `getProfile()`) | Dedup'd by `cache()` — OK |
| `training_plans WHERE team_id + status + week_start_date range` | Dashboard + Schedule | OK with index |
| `events WHERE team_id ORDER BY starts_at LIMIT 200` | Schedule page | Unbounded time range |
| `posts WITH comments, likes, profiles` | Feed page | Deep join, no pagination |

#### Recommended Indexes

```sql
CREATE INDEX idx_profiles_team_status ON profiles(team_id, status);
CREATE INDEX idx_activities_user_team ON activities(user_id, team_id);
CREATE INDEX idx_activities_start_date ON activities(start_date);
CREATE INDEX idx_posts_team_status ON posts(team_id, status, created_at);
CREATE INDEX idx_events_team_starts ON events(team_id, starts_at);
CREATE INDEX idx_training_plans_team_week ON training_plans(team_id, week_start_date);
```

---

### 2.6 Deployment & Environments

#### CI/CD Flow

- **Manual deploy**: Push to `main` → Vercel auto-builds → Production.
- No CI pipeline, no automated tests, no lint checks on push.
- No branch previews configured.

#### Environment Variables

| Variable | Context | Used In |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | All Supabase clients |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Anon client (RLS-enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Admin client (bypasses RLS) |
| `NEXT_PUBLIC_STRAVA_CLIENT_ID` | Public | Strava OAuth redirect |
| `STRAVA_CLIENT_SECRET` | Server only | Strava token exchange |

> ⚠️ `NEXT_PUBLIC_STRAVA_CLIENT_ID` is public but non-sensitive. `STRAVA_CLIENT_SECRET` is correctly server-only.

#### Migration Strategy

- **No migration tooling.** SQL files in `supabase/` are run manually against the Supabase dashboard.
- No version tracking, no up/down migrations.
- Schema changes require manual coordination.

#### Rollback Strategy

- **None.** No database snapshots, no migration rollbacks, no deployment rollback automation.

---

## 3. Feature Architecture

### 3.1 Team Feed

| Aspect | Detail |
|--------|--------|
| **Purpose** | Coach-to-team communication + social interactions |
| **Data model** | `posts` → `comments`, `likes` (1:N, N:M) |
| **Write access** | Coaches only (create/edit/delete posts) |
| **Read access** | Team members see PUBLISHED; coaches see all |
| **UI entry points** | `/dashboard/feed`, broadcast from `/admin/announce` |
| **Dependencies** | `profiles` (author info), `is_team_coach` / `is_team_member` |
| **Scalability concerns** | No pagination, no infinite scroll. Full feed loaded on every visit. `image_url` column exists but no upload pipeline. |

### 3.2 Training Plans

| Aspect | Detail |
|--------|--------|
| **Purpose** | Coach creates weekly workout plans, athletes view on schedule |
| **Data model** | `training_plans` → `workouts` (1:N). One plan per team per week (unique constraint) |
| **Write access** | Coaches (create, publish, unpublish, delete) |
| **Read access** | Members see PUBLISHED only. Coaches see DRAFT + PUBLISHED |
| **UI entry points** | `/admin/training` (coach), `/dashboard/schedule` (athlete), `ThisWeekPlan` widget on dashboard |
| **Dependencies** | `is_team_coach` for writes, `is_team_member` for reads |
| **Scalability concerns** | Plan builder creates plan + workouts in two sequential inserts (not transactional — rollback is manual delete). No plan duplication/templating. `day_of_week` is 0-6 (Sun-Sat) — timezone-aware on client via `toLocalDateStr()`. |

### 3.3 Events & RSVPs

| Aspect | Detail |
|--------|--------|
| **Purpose** | Schedule practices, races, socials. Athletes can RSVP. |
| **Data model** | `events` → `event_rsvps` (1:N), `event_attendance` (1:N, coach-managed) |
| **Write access** | Coaches create events. Members manage own RSVPs. Coaches manage attendance. |
| **Read access** | Team members see all events. Coaches see all RSVPs. Members see RSVPs on events they can view. |
| **UI entry points** | `/admin/events` (coach), `/dashboard/schedule` (athlete, inline RSVP buttons) |
| **Dependencies** | `is_team_coach`, `is_team_member` |
| **Scalability concerns** | `repeat_weekly` flag exists but no recurrence expansion logic is implemented. Attendance marking UI not built. No event editing or deletion from UI (only creation). |

### 3.4 Team Management

| Aspect | Detail |
|--------|--------|
| **Purpose** | Coaches manage team membership: approve/reject joins, remove athletes |
| **Data model** | `join_requests` + `profiles` (status updates) |
| **Write access** | Coaches approve/reject. `removeAthlete` uses admin client to delete profile + auth user. |
| **Read access** | Coaches see pending requests for their team |
| **UI entry points** | `/admin/team` (coach), `/dashboard/team` (roster view for all) |
| **Dependencies** | Admin client for bypassing RLS on joins and removals |
| **Scalability concerns** | `removeAthlete` deletes the auth user entirely — no soft delete, no audit trail. Join requests have no RLS SELECT policy defined — reads rely on admin client. |

### 3.5 Auth & Onboarding

| Aspect | Detail |
|--------|--------|
| **Purpose** | User registration, email verification, team joining |
| **Data model** | `auth.users` → trigger → `profiles`. `join_requests` for pending flow. |
| **Write access** | Signup creates auth user (trigger creates profile). `joinTeam` creates join request + updates profile. |
| **Read access** | Own profile only for auth checks |
| **UI entry points** | `/signup`, `/login`, `/verify-email`, `/onboarding`, `/pending` |
| **Dependencies** | Supabase GoTrue, `handle_new_user` trigger |
| **Scalability concerns** | No password reset flow. No email change flow. `deleteAccount` manually cascades deletes across 4 tables + auth — should use DB cascade instead. |

---

## 4. UX & Product Structure

### 4.1 Role-Based Navigation

| Link | MEMBER | COACH/CO_COACH |
|------|--------|----------------|
| Dashboard | ✅ | ✅ |
| Team Feed | ✅ | ✅ |
| Schedule | ✅ | ✅ |
| Coach Panel | ❌ | ✅ |
| Settings | ✅ (gear icon) | ✅ (gear icon) |

Navigation is rendered server-side via `ServerNavigation` → `Navigation` (client component). Role is fetched via `getProfile()`.

### 4.2 Dashboard Responsibilities

The main dashboard (`/dashboard`) displays:
- **This week's training plan** (`ThisWeekPlan` widget) — links to full schedule
- **Strava connection** card (connect/disconnect)
- **Team Roster** link card

### 4.3 Admin Panel Structure

```
/admin (Hub)
├── Quick Stats: Athletes, Live Plans, Pending Requests
├── → /admin/training   (Training Plans)
├── → /admin/team       (Team Management)
├── → /admin/announce   (Announcements)
└── → /admin/events     (Events)
```

---

## 5. Design System

### 5.1 Layout System

- Max-width containers: `max-w-xl` (dashboard, settings), `max-w-2xl` (admin, schedule, roster)
- Page padding: `px-4 pb-12 pt-4 md:px-10 md:pb-20 md:pt-8`
- Card rounding: `rounded-[24px]` to `rounded-[32px]`
- Font: Inter (Google Fonts), loaded via `next/font`

### 5.2 Reusable UI Primitives

| Component | Purpose | Notes |
|-----------|---------|-------|
| `Card` | Animated wrapper | Uses `framer-motion` with fade+slide. All cards animate on mount. |
| `Button` | Action button | Variants: default, ghost, outline. No size variants. |
| `LoadingSpinner` | Inline spinner | Simple CSS animation |

### 5.3 Loading & Skeleton Strategy

- `dashboard/loading.tsx`: Full-page skeleton with pulsing placeholder cards.
- `admin/loading.tsx`: Admin-specific skeleton.
- No per-component skeletons.
- `NavigationSkeleton`: Shows while `ServerNavigation` loads (Suspense boundary).
- No streaming — pages render atomically.

### 5.4 Empty States

- Feed: "No posts yet" message.
- Join requests: "You're all caught up!" with icon.
- Training plan: "No plan published for this week" in widget.
- Schedule days: "No schedule" per empty day row.
- Plans list: "No training plans yet" message.

### 5.5 Form Patterns

- Server actions via `action={serverAction}` or `action={serverAction.bind(null, id)}`.
- `useActionState` for login/signup (returns `{error}` state).
- `useTransition` for optimistic-feeling publish/unpublish/delete buttons.
- No client-side validation beyond HTML `required` and `minLength`.
- No toast notifications — errors shown via `alert()` or inline error divs.

---

## 6. Known Risks / Tech Debt / Missing Foundations

### 6.1 ⚠️ Critical — Fix Before Scaling

| Risk | Severity | Detail |
|------|----------|--------|
| **Profiles/Teams publicly readable** | 🔴 HIGH | `profiles` and `teams` SELECT policy is `USING (true)`. Any authenticated user in any team can read all profiles and all teams. This is a **multi-tenancy violation**. |
| **Middleware route guard is dead code** | 🔴 HIGH | `!request.nextUrl.pathname.startsWith('/')` matches nothing. All auth protection happens at page level. If a new page forgets to check auth, it's unprotected. |
| **`join_requests` has no SELECT policy** | 🟡 MEDIUM | RLS is enabled but no SELECT policy is defined for `join_requests`. Reads only work via admin client. If any component tries to query via anon client, it silently returns empty. |
| **`activities` has no RLS policies** | 🟡 MEDIUM | Table has RLS enabled but zero policies. All reads/writes will fail via anon client. Currently unused in the UI but will block Strava activity display. |
| **No database indexes** | 🟡 MEDIUM | No custom indexes beyond PKs and unique constraints. Will degrade as data grows. |

### 6.2 ⚠️ Schema Risks

| Risk | Detail |
|------|--------|
| **Legacy tables** | `meetups` and `meetup_rsvps` still exist in schema.sql but are replaced by `events`/`event_rsvps`. Dead tables polluting the schema. |
| **No `updated_at` trigger on profiles** | Profile changes don't track when they were last modified. |
| **`deleteAccount` does manual cascade** | Deletes across 4 tables sequentially instead of relying on `ON DELETE CASCADE`. If one fails, partial data remains. The `profiles` table already has cascade from `auth.users`, making the explicit delete redundant. |
| **Plan creation is non-transactional** | Creates plan, then inserts workouts. If workout insert fails, plan is manually deleted — not a DB transaction. |

### 6.3 ⚠️ Performance Risks

| Risk | Detail |
|------|--------|
| **No pagination** | Feed, events, roster load all records. `LIMIT 200` on events and `LIMIT 20` on plans will be insufficient. |
| **RLS function calls per row** | `is_team_coach()` and `is_team_member()` execute subqueries for every row checked. |
| **`Card` animation overhead** | Every card in every list animates on mount with `framer-motion`. |
| **No image optimization** | Avatar images use raw `<img>` tags, not Next.js `<Image>`. No lazy loading, no responsive sizing. |

### 6.4 ⚠️ Over-Coupled / Missing Abstractions

| Issue | Detail |
|-------|--------|
| **Date formatting is ad-hoc** | `toLocalDateStr()` is defined in 3 separate files. Should be a shared utility. |
| **Coach check is duplicated** | Pages check `profile.role !== 'COACH' && role !== 'CO_COACH'` manually. Server actions use `checkCoach()`. No shared constant or type guard for role checks. |
| **No shared page layout** | Each admin sub-page repeats the same header + back button pattern. Should be an `admin/layout.tsx`. |
| **`Card` forces animation** | No way to render a Card without animation. Every Card mount triggers framer-motion. |
| **Inline `'use server'` functions** | Settings page has inline server actions (`disconnectStrava`, logout). These should move to a dedicated actions file. |

### 6.5 ⚠️ Scaling Blockers

| Blocker | Detail |
|---------|--------|
| **Single team assumption** | The app hardcodes "HUJI Run" in seed data and some UI text. The schema supports multi-team, but the UX assumes one team. |
| **No multi-coach permission layering** | COACH and CO_COACH have identical permissions everywhere. No granular permission system. |
| **No notification system** | No push notifications, no email notifications for join requests or new plans. |
| **No Strava webhook subscription management** | Webhook routes exist but subscription creation/verification is likely manual. |

---

## 7. Production Readiness Checklist

### 7.1 Security

- [ ] Fix `profiles` SELECT policy: restrict to same team members
- [ ] Fix `teams` SELECT policy: restrict to own team or join-code lookup
- [ ] Add SELECT policy for `join_requests` (coaches of that team)
- [ ] Add RLS policies for `activities` (team members can view)
- [ ] Fix middleware route guard (replace dead `startsWith('/')` check)
- [ ] Add rate limiting on auth endpoints (login, signup)
- [ ] Audit `SUPABASE_SERVICE_ROLE_KEY` usage — ensure it's never exposed client-side
- [ ] Validate/sanitize all user inputs in server actions (currently trusts FormData)

### 7.2 Data Integrity

- [ ] Drop legacy `meetups` and `meetup_rsvps` tables
- [ ] Add database indexes (see recommended list in §2.5)
- [ ] Add `updated_at` trigger on `profiles`
- [ ] Replace manual cascade in `deleteAccount` with DB-level cascade
- [ ] Wrap plan+workouts creation in a database transaction (or use a Postgres function)

### 7.3 Performance

- [ ] Add pagination to feed (infinite scroll or page-based)
- [ ] Add date windowing to events query (don't fetch all 200)
- [ ] Add conditional animation to `Card` (skip on lists with many items)
- [ ] Use `next/image` for avatars
- [ ] Add Suspense boundaries for progressive loading

### 7.4 Observability

- [ ] Add error tracking (Sentry or equivalent)
- [ ] Replace `console.error` calls with structured logging
- [ ] Add health check endpoint
- [ ] Monitor Supabase usage (row counts, RLS function call costs)

### 7.5 DX

- [ ] Add automated tests (at minimum: server action unit tests)
- [ ] Add lint-on-commit (husky + lint-staged)
- [ ] Set up branch preview deployments on Vercel
- [ ] Create a shared `lib/dates.ts` for `toLocalDateStr` and week helpers
- [ ] Create `admin/layout.tsx` for shared admin page chrome
- [ ] Move inline server actions from settings page to `settings/actions.ts`

---

*This document is the system's single source of truth. Update it as the architecture evolves.*
