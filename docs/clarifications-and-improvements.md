# Clarifications, Risks & Improvements

## ❓ Unclear Stages & Risks

### 1. Strava Sync Strategy & Rate Limits
-   **The Risk**: Strava's default API rate limit is **100 requests every 15 minutes** and **1,000 per day**.
-   **The Issue**: A "Periodic Sync" for 50 members running 3 times a week might seem fine, but if you have a CRON job checking *every* user every hour: `50 users * 24 hours = 1200 requests` -> **BLOCKED**.
-   **Clarification Needed**: How many initial users?
-   **Solution**:
    -   **V1**: Only sync on user login ("Pull on demand") OR use a very slow cron (once every 6 hours).
    -   **V1.5**: Implement Strava Webhooks immediately. It saves API calls because they *tell you* when to fetch. (Highly recommended to move this to V1 if possible).

### 2. "Pending" Member Experience
-   **The Issue**: The spec is strict ("NO team feed, NO members list").
-   **Clarification**: Should we hide the *navigation tabs* entirely, or show them but display a "Locked" state?
-   **Recommendation**: Show the tabs but with a "Blur/Lock" overlay. This increases FOMO (Fear Of Missing Out) and makes them want to get approved, rather than showing an empty app.

### 3. "Premium" Design vs. Tech Constraints
-   **The Constraint**: You requested **Vanilla CSS** and "Avoid Tailwind".
-   **The Challenge**: Building a "state-of-the-art", "premium", "glassmorphism" UI from scratch with Vanilla CSS is significantly slower than using modern utility frameworks or component libraries (like Shadcn/ui or Mantine).
-   **Clarification**: Are you absolutely sure about Vanilla CSS? (I will follow this, but it will impact development speed).
-   **Recommendation**: Allow **CSS Modules** (scoped CSS) + **Framer Motion** (for the "wow" animations) to keep code organized.

### 4. Notifications (PWA vs Native)
-   **The Risk**: PWA Web Push on iOS is only supported if the user *manually adds to Home Screen* and then *explicitly enables notifications* inside the app. It's high friction.
-   **Improvement**: Add **Email Notifications** (via Resend/SendGrid) for critical things like "Coach Approved Your Request" or "Meetup Tomorrow", as a fallback.

## 🚀 Suggested Improvements

### Implementation Architecture
1.  **Database**: Use **Supabase**. It gives you:
    -   Managed PostgreSQL.
    -   **Realtime subscriptions**: You can update the Feed *instantly* when a new post arrives without reloading.
    -   Easy scheduled Edge Functions (for the Cron sync).
2.  **Auth**: Use **Auth.js (NextAuth) v5**. It handles the complex session management securely.

### Feature Additions (High Value / Low Effort)
1.  **"Add to Calendar" for Meetups**:
    -   Generate `.ics` files or Google Calendar links for meetups. This drastically improves attendance.
2.  **Smart "First Post"**:
    -   When a user joins and connects Strava, auto-generate a "Member Joined!" card that highlights their "Last 4 weeks stats" to introduce them to the team.
3.  **Reaction Variety**:
    -   Instead of just "Like/Kudos", add "🔥" (Fire), "👏" (Clap), "👟" (Shoe). It makes the feed more alive.
4.  **Privacy - "Safe Zones"**:
    -   Strava has this, but if your app displays maps, you MUST respect privacy circles.
    -   **V1 Recommendation**: Do **NOT** show maps on the feed in V1. Just show summary cards (Dist/Time/Pace). It avoids a massive complexity regarding location privacy.

### User Experience (UX)
1.  **Skeleton Loading States**: Critical for a "Native App" feel. Never show a white screen.
2.  **Optimistic UI**: When clicking "Like" or "Going", update the button *instantly*, don't wait for the server.

## 📝 Updated Roadmap Suggestion

**Phase 1 Strictness**:
Prioritize the **Strava Webhook** setup earlier (Phase 2) instead of Cron. It is actually *easier* to code a webhook handler than a robust multi-user queuing cron job, and it scales better.
