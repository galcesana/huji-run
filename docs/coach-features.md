# Coach Management Features Specification

This document outlines the planned features for the Coach role within the HUJI Run application, focusing on team management, training organization, and event coordination. It incorporates strict architectural guidelines to ensure scalability and proper data integrity.

---

## 1. Weekly Training Plans

**Objective:** Allow coaches to publish structured weekly running schedules that all team members can view, while ensuring data consistency and supporting future analytics/AI expansion.

### Coach Capabilities (Admin)
*   **Create Plan:** Draft a new training plan for a specific upcoming week (e.g., "Week of Oct 24th").
*   **Daily Assignments:** Add specific workouts to individual days.
*   **Publishing:** Save a plan as a "Draft" or "Publish" it to make it visible to the team. 
    *   *Editing Behavior:* Edits made to a plan after publishing will update immediately and timestamp a `updated_at` field, rather than requiring manual republishing.

### Athlete Experience (User)
*   **View Current Plan:** A dedicated section displaying "Today's Workout" prominently.
*   **Check-off System (Future):** Allow athletes to mark "Today's Workout" as `DONE`, tying the training plan into engagement streaks and linking plans to completed Strava activities.
*   **Workout Details:** Clear structural descriptions of paces, distances, and effort levels.

### Architecture & Data Model (Supabase)
*   **Global Team Settings:** Add `timezone` and `week_starts_on` (Monday vs Sunday) columns to a future `teams` table to contextualize week starts.
*   **`training_plans` table:** 
    *   `id`, `team_id`, `week_start_date` (Date, e.g., '2023-10-23')
    *   `title`, `status` (DRAFT, PUBLISHED)
    *   `change_note` (Text, optional context for updates)
    *   *Audit Fields:* `created_at`, `published_at`, `updated_at`, `created_by` (coach_id)
    *   *Constraint:* `UNIQUE(team_id, week_start_date)` to prevent accidental duplicate schedules.
*   **`workouts` table:**
    *   `id`, `plan_id`, `day_of_week` (0-6)
    *   `title` (String, short label e.g., "Easy + Strides")
    *   `description` (Text, free-form context serves as truth)
    *   `type` (Enum: EASY, WORKOUT, LONG_RUN, REST)
    *   *Structured Metrics:* `distance_km` (Numeric), `duration_min` (Numeric), `intensity` (RPE 1-10 or Zone), `target_pace` (String)
    *   **Advanced Structure (`structure` JSONB):** Used to store interval blocks (e.g., `[{ "repeat": 6, "distance_m": 800, "target_pace_sec_km": 200, "recovery": { "duration_sec": 120, "type": "jog" }}]`) without over-normalizing into multiple tables.
    *   `workout_source` (Enum: MANUAL, AI_GENERATED)
    *   *Audit Fields:* `created_at`, `updated_at`

---

## 2. Team Calendar & Event Management (RSVPs)

**Objective:** Centralized schedule for team practices, social events, and official races, with robust attendance tracking and timezone support.

### Coach Capabilities (Admin)
*   **Create Event:** Name, Starts At, Ends At, Location, Description, and Event Type.
*   **Manage Attendance:** View a list of athletes who have RSVP'd.
*   **Track Actual Attendance:** Distinct from RSVPs, coaches can mark who *actually* showed up to practice.
*   **Recurrence:** Support for recurring practices.
    *   *MVP:* A `repeat_weekly` boolean + `repeat_until` date.

### Athlete Experience (User)
*   **Event Feed/Calendar:** A view of all upcoming team events in local time.
*   **RSVP System:** Simple buttons to mark attendance, with an optional `response_note`. "Pending" is simply the absence of a response.

### Architecture & Data Model (Supabase)
*   **`events` table:** 
    *   `id`, `team_id`, `title`, `description`
    *   `starts_at` (Timestamptz), `ends_at` (Timestamptz)
    *   `location`, `type` (Enum)
    *   `repeat_weekly` (Boolean), `repeat_until` (Timestamptz)
    *   *Audit Fields:* `created_at`, `updated_at`, `created_by`
*   **`event_rsvps` table:** 
    *   `id`, `event_id`, `user_id`
    *   `status` (Enum: GOING, NOT_GOING) - *Note: No row = Pending.*
    *   `response_note` (Text)
    *   *Audit Fields:* `created_at`, `updated_at`
    *   *Constraint:* `UNIQUE(event_id, user_id)`
*   **`event_attendance` table:**
    *   `id`, `event_id`, `user_id`
    *   `status` (Enum: PRESENT, ABSENT, EXCUSED)
    *   `checked_by` (coach_id), `checked_at` (Timestamptz)
    *   *Constraint:* `UNIQUE(event_id, user_id)`

---

## 3. Team Feed (Coach-Only Publishing)

**Objective:** A centralized social hub where ONLY Coaches can broadcast updates, training plans, and media, while Athletes are restricted to consumption and interaction (liking/commenting).

### Coach Capabilities (Admin)
*   **Publish Content:** Ability to post text updates, images, and link published Weekly Training Plans directly into the feed.
*   **Feed Management:** Ability to delete any post or comment on the team feed to maintain a positive environment.

### Athlete Experience (User)
*   **Read-Only Feed:** Athletes view the chronological feed of Coach announcements and training plans.
*   **Interaction:** Athletes can "Like" posts and leave "Comments" on posts, but *cannot* create top-level posts themselves.

### Architecture & Data Model (Supabase)
*   **`posts` table updates:** 
    *   Ensure `user_id` is restricted to coaches only via RLS.
    *   Add `post_type` (Enum: UPDATE, IMAGE, TRAINING_PLAN).
*   **`likes` & `comments` tables:**
    *   Unchanged from v1 schema, but RLS must ensure athletes can only insert comments/likes, not top-level posts.

---

## 4. Security & Row Level Security (RLS)

To ensure strict data boundaries and enforce the "Coach-Only Publishing" architecture:
*   **Helper Functions:** `is_team_coach(team_id)` and `is_team_member(team_id)` keep policies readable.
*   **Coaches (`role = 'COACH' | 'CO_COACH'`):** 
    *   Full `INSERT`/`UPDATE`/`DELETE` access on their team's `training_plans`, `workouts`, `events`, `event_attendance`, and `posts`.
*   **Athletes (`role = 'USER'`):** 
    *   **Read-Only:** Granted `SELECT` access *only* for their `team_id` on `events`, `posts`, and published `training_plans`. 
    *   **Interactive Write:** Granted `INSERT`/`UPDATE` access strictly to their *own* rows in `event_rsvps`, `likes`, and `comments` (`user_id = auth.uid()`). 
    *   **Strict Denial:** Athletes are explicitly denied `INSERT` access to the `posts`, `events`, and `training_plans` tables.
*   **Athlete Notes (Private):** A way for coaches to attach private notes to an athlete's profile (e.g., "Recovering from shin splints, keep volume low").
*   **Attendance Tracking:** Coaches can manually check off who *actually* attended a practice versus who just RSVP'd.
