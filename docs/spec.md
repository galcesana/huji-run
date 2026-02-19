# HUJI Run — Product Specification

## 1. Purpose
A private app for one running team ("HUJI Run").
**Members:** Get a team-only feed, meetups, their stats, and "what coach expects".
**Coach:** Gets control (who’s in), meetups, announcements, and insights.
**Scope (V1):** Strava is the only data source.

## 2. Roles & Permissions

- **Coach (Admin)**: Full access + approves members.
- **Member**: Normal team user. Can see feed, stats, meetups.
- **Pending Member**: Signed up but not approved. VERY limited access:
    - Can ONLY see: "Waiting for approval", Profile Settings, Connect Strava.
    - NO access to: Feed, Members List, Stats, Meetups.
- **Rejected/Banned**: Blocked.

## 3. Critical Flows

### A) Onboarding + Approval
1. User installs PWA / Opens App.
2. User Creates Account (Email/Google).
3. User enters **Team Join Code**.
4. Account becomes **PENDING**.
5. Coach gets notification -> Reviews -> Approves/Rejects.
6. If Approved -> User becomes MEMBER.

### B) Strava Connect
1. Member clicks "Connect Strava".
2. OAuth flows to backend callback.
3. Backend stores tokens securely.
4. Imports last 30 days of activities.

### C) Activity Import
1. Webhook or Periodic Cron fetches new activities.
2. Creates Activity record in DB.
3. Creates Post in Team Feed (unless user disabled auto-post).
4. Deduplication by `source_activity_id`.

## 4. App Screens (Key Views)

### Pending State
- Status: "Waiting for coach approval"
- Action: "Connect Strava"

### Main Navigation (Members)
- **Feed**: Team-only social feed (Activities, Kudos, Comments).
- **Meetups**: Upcoming runs, RSVP ("Going", "Maybe", "Not Going").
- **Stats**: Weekly distance, 4-week trend.
- **Profile**: Settings, Strava Status.

### Coach Admin
- **Join Requests**: List pending users to Approve/Reject.
- **Team Insights**: Weekly volume, active runners, consistency leaderboard.
- **Create Meetup**: Date, Location, Route, Notes.

## 5. Data Model (High Level)

### Core Entities
- `User`: Handles auth, role, Strava tokens.
- `Team`: The container for all data.
- `Activity`: Imported run data (Distance, Time, Pace).
- `Post`: The social representation of an activity (or manual post).
- `Meetup`: Scheduled event.
- `JoinRequest`: Queue for approval.

## 6. Technical Constraints
- **PWA**: Installable on mobile.
- **Backend**: Next.js API Routes.
- **Database**: PostgreSQL.
- **Strava API**: Rate limits apply. Use Webhooks or cautious polling.
