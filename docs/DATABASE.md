# Database Reference — HUJI Run

> **For future agents:** This document describes the complete Supabase/PostgreSQL schema for the HUJI Run application. All tables live in the `public` schema. RLS (Row Level Security) is enabled on every table. The Supabase JS client is created via `@/lib/supabase/server` (server components) or `@/lib/supabase/client` (client components).

---

## Core Tables (`supabase/schema.sql`)

### `teams`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | Auto-generated |
| `name` | text | Team display name |
| `join_code` | text (UNIQUE) | Used by athletes to join a team |
| `created_at` | timestamptz | |

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | References `auth.users` — auto-created on signup via trigger |
| `email` | text | |
| `full_name` | text | |
| `avatar_url` | text | |
| `role` | text | `COACH`, `CO_COACH`, `MEMBER` |
| `status` | text | `PENDING`, `ACTIVE`, `REJECTED`, `BANNED` |
| `team_id` | uuid (FK → teams) | |
| `created_at` | timestamptz | |

### `join_requests`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → profiles) | |
| `team_id` | uuid (FK → teams) | |
| `status` | text | `PENDING`, `APPROVED`, `REJECTED` |
| `note` | text | Optional message from athlete |
| `created_at` | timestamptz | |

### `strava_accounts`
| Column | Type | Notes |
|---|---|---|
| `user_id` | uuid (PK, FK → profiles) | One account per user |
| `athlete_id` | bigint (UNIQUE) | Strava's athlete ID |
| `access_token` | text | OAuth token (sensitive) |
| `refresh_token` | text | OAuth refresh (sensitive) |
| `expires_at` | bigint | Token expiry epoch |
| `profile_picture` | text | |
| `updated_at` | timestamptz | |

### `activities`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK → profiles) | |
| `team_id` | uuid (FK → teams) | |
| `strava_id` | bigint (UNIQUE) | Strava activity ID |
| `name` | text | e.g. "Morning Run" |
| `distance` | float | **Meters** |
| `moving_time` | int | **Seconds** |
| `elapsed_time` | int | **Seconds** |
| `total_elevation_gain` | float | |
| `start_date` | timestamptz | |
| `map_polyline` | text | Encoded polyline |
| `average_speed` | float | m/s |
| `type` | text | "Run", "Ride", etc. |
| `created_at` | timestamptz | |

### `posts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `team_id` | uuid (FK → teams) | |
| `user_id` | uuid (FK → profiles) | |
| `activity_id` | uuid (FK → activities, nullable) | Links a Strava activity to a post |
| `content` | text | Post body |
| `title` | text | Added in feed update |
| `image_url` | text | For IMAGE posts |
| `post_type` | text | `UPDATE`, `IMAGE`, `TRAINING_PLAN`, `MEMBER_JOINED`, `PB` |
| `status` | text | `DRAFT`, `PUBLISHED` |
| `published_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `created_at` | timestamptz | |

### `likes`
| Column | Type | Notes |
|---|---|---|
| `post_id` | uuid (FK → posts) | Composite PK |
| `user_id` | uuid (FK → profiles) | Composite PK |
| `created_at` | timestamptz | |

### `comments`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `post_id` | uuid (FK → posts) | |
| `user_id` | uuid (FK → profiles) | |
| `content` | text | |
| `created_at` | timestamptz | |

### `meetups` *(Legacy — replaced by `events`)*
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `team_id`, `created_by`, `title`, `start_time`, `location_name`, `location_url`, `route_url`, `description` | various | Superseded by the `events` table |

### `meetup_rsvps` *(Legacy — replaced by `event_rsvps`)*

---

## Coach Features Tables (`supabase/coach_features.sql`)

### `training_plans`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `team_id` | uuid (FK → teams) | |
| `week_start_date` | date | e.g. `2024-03-18` — Monday of the training week |
| `title` | text | e.g. "Week 12 — Speed Focus" |
| `status` | text | `DRAFT`, `PUBLISHED` |
| `change_note` | text | Optional context for updates |
| `published_at` | timestamptz | Set when status changes to PUBLISHED |
| `updated_at` | timestamptz | Auto-updated via trigger |
| `created_at` | timestamptz | |
| `created_by` | uuid (FK → profiles) | Coach who created it |
| **Unique constraint** | `(team_id, week_start_date)` | One plan per team per week |

### `workouts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `plan_id` | uuid (FK → training_plans, CASCADE) | |
| `day_of_week` | int (0-6) | 0 = Sunday, 6 = Saturday |
| `title` | text | Short label, e.g. "Easy + Strides" |
| `description` | text | Free-form workout details |
| `type` | text | `EASY`, `WORKOUT`, `LONG_RUN`, `REST` |
| `distance_km` | numeric | Optional |
| `duration_min` | numeric | Optional |
| `intensity` | text | RPE or zone |
| `target_pace` | text | e.g. "5:30/km" |
| `structure` | jsonb | Interval blocks (see spec) |
| `workout_source` | text | `MANUAL`, `AI_GENERATED` |
| `updated_at` | timestamptz | Auto-updated via trigger |
| `created_at` | timestamptz | |

### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `team_id` | uuid (FK → teams) | |
| `title` | text | |
| `description` | text | |
| `starts_at` | timestamptz | |
| `ends_at` | timestamptz | |
| `location` | text | |
| `type` | text | `PRACTICE`, `RACE`, `SOCIAL` |
| `repeat_weekly` | boolean | |
| `repeat_until` | timestamptz | |
| `updated_at` | timestamptz | Auto-updated via trigger |
| `created_at` | timestamptz | |
| `created_by` | uuid (FK → profiles) | |

### `event_rsvps`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `event_id` | uuid (FK → events) | |
| `user_id` | uuid (FK → profiles) | |
| `status` | text | `GOING`, `NOT_GOING` — no row = Pending |
| `response_note` | text | |
| `updated_at` | timestamptz | |
| `created_at` | timestamptz | |
| **Unique constraint** | `(event_id, user_id)` | |

### `event_attendance`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `event_id` | uuid (FK → events) | |
| `user_id` | uuid (FK → profiles) | |
| `status` | text | `PRESENT`, `ABSENT`, `EXCUSED` |
| `checked_by` | uuid (FK → profiles) | Coach who marked it |
| `checked_at` | timestamptz | |
| `updated_at` | timestamptz | |
| **Unique constraint** | `(event_id, user_id)` | |

---

## RLS Helper Functions

```sql
public.is_team_coach(check_team_id uuid) → boolean
-- Returns true if auth.uid() is COACH or CO_COACH in the team, and ACTIVE

public.is_team_member(check_team_id uuid) → boolean
-- Returns true if auth.uid() is any role in the team, and ACTIVE
```

## Key RLS Rules Summary

| Table | Coaches | Members |
|---|---|---|
| `training_plans` | Full CRUD (own team) | SELECT only PUBLISHED plans |
| `workouts` | Full CRUD (via plan's team) | SELECT only workouts of PUBLISHED plans |
| `events` | Full CRUD (own team) | SELECT only |
| `event_rsvps` | SELECT all in team | Full CRUD on own rows |
| `event_attendance` | Full CRUD | SELECT only |
| `posts` | Full CRUD (own team) | SELECT PUBLISHED only; can like/comment |
| `likes` / `comments` | Same as members | INSERT/SELECT own; coaches can delete any |

## Triggers

All coach feature tables have `set_updated_at()` triggers that automatically set `updated_at = now()` on every UPDATE.

## Signup Flow

A trigger on `auth.users` (`handle_new_user`) auto-creates a `profiles` row with the user's email, name, and avatar from auth metadata. Status defaults to `PENDING`.
