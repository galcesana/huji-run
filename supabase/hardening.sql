-- =============================================================
-- HARDENING MIGRATION — Phase 1: Security
-- Run this AFTER schema.sql + coach_features.sql + feed_rls_update.sql
-- =============================================================

-- ────────────────────────────────────────────────────────
-- 1. FIX PROFILES SELECT: restrict to self + same team
-- ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view own profile and teammates"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_team_member(team_id)
  );

-- ────────────────────────────────────────────────────────
-- 2. FIX TEAMS SELECT: restrict to own team only
-- ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Teams viewable by members" ON teams;

CREATE POLICY "Members can view own team"
  ON teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM profiles WHERE id = auth.uid())
  );

-- ────────────────────────────────────────────────────────
-- 3. ADD MISSING join_requests SELECT POLICY
-- ────────────────────────────────────────────────────────
CREATE POLICY "Coaches can view join requests"
  ON join_requests FOR SELECT
  USING (public.is_team_coach(team_id));

-- ────────────────────────────────────────────────────────
-- 4. ADD MISSING activities POLICIES
-- ────────────────────────────────────────────────────────
CREATE POLICY "Team members can view activities"
  ON activities FOR SELECT
  USING (public.is_team_member(team_id));

CREATE POLICY "Users can insert own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own activities"
  ON activities FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);


-- =============================================================
-- HARDENING MIGRATION — Phase 2: Data Integrity
-- =============================================================

-- ────────────────────────────────────────────────────────
-- 5. PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_team_status
  ON profiles(team_id, status);

CREATE INDEX IF NOT EXISTS idx_posts_team_status
  ON posts(team_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_events_team_starts
  ON events(team_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_training_plans_team_week
  ON training_plans(team_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_activities_user_team
  ON activities(user_id, team_id);

CREATE INDEX IF NOT EXISTS idx_activities_start_date
  ON activities(start_date);

-- ────────────────────────────────────────────────────────
-- 6. DROP LEGACY TABLES (replaced by events/event_rsvps)
-- ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS meetup_rsvps;
DROP TABLE IF EXISTS meetups;

-- ────────────────────────────────────────────────────────
-- 7. ADD updated_at TRIGGER ON PROFILES
-- ────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone
    DEFAULT timezone('utc'::text, now()) NOT NULL;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
