/*
# Web Mini Games Hub — Core Schema

## Overview
Creates the full backend for a multi-game hub with user profiles, achievements,
daily tasks, and per-game stats. Auth uses Supabase email/password (plus a
guest mode that is handled client-side only — guests get a local profile that
migrates to a real account on signup).

## New Tables
1. `profiles` — one row per authenticated user. Stores display name, avatar
   emoji, coins, theme/sound/background preferences, and daily-task state.
2. `achievements` — catalog of all unlockable achievements (id, game, title,
   description, icon, coin_reward). Seeded by the app, written by any client.
3. `user_achievements` — junction: which achievements each user has unlocked
   and when. Owned by the user.
4. `game_stats` — per-user, per-game aggregate stats (wins, losses, draws,
   best_score, plays). Owned by the user.

## Security
- RLS enabled on every table.
- `profiles`, `user_achievements`, `game_stats` are owner-scoped
  (`TO authenticated`, `auth.uid() = user_id`). `profiles.id` equals
  `auth.uid()` so its policies use `auth.uid() = id`.
- `achievements` is a shared catalog readable by `anon, authenticated` and
  writable by `authenticated` (so the app can seed new achievements). This is
  intentional shared reference data, documented here.
- All owner columns default to `auth.uid()` so inserts that omit `user_id`
  still satisfy `WITH CHECK`.

## Notes
- `profiles` is created in a separate migration from `auth.users` — there is no
  FK to `auth.users` to avoid coupling profile lifecycle to auth events; the
  app creates a profile row on first sign-in.
- `daily_reset_at` stores the timestamp of the next daily-task reset; the app
  computes/reset tasks when now > daily_reset_at.
*/

-- ===== profiles =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Player',
  avatar text NOT NULL DEFAULT '🎮',
  coins integer NOT NULL DEFAULT 100,
  theme text NOT NULL DEFAULT 'midnight',
  background text NOT NULL DEFAULT 'aurora',
  music_on boolean NOT NULL DEFAULT true,
  sfx_on boolean NOT NULL DEFAULT true,
  music_volume real NOT NULL DEFAULT 0.4,
  sfx_volume real NOT NULL DEFAULT 0.6,
  daily_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  daily_reset_at timestamptz,
  is_guest boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ===== achievements (shared catalog) =====
CREATE TABLE IF NOT EXISTS achievements (
  id text PRIMARY KEY,
  game text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏆',
  coin_reward integer NOT NULL DEFAULT 10
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "achievements_read_all" ON achievements;
CREATE POLICY "achievements_read_all" ON achievements FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "achievements_insert_auth" ON achievements;
CREATE POLICY "achievements_insert_auth" ON achievements FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "achievements_update_auth" ON achievements;
CREATE POLICY "achievements_update_auth" ON achievements FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- ===== user_achievements =====
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id text NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ua_select_own" ON user_achievements;
CREATE POLICY "ua_select_own" ON user_achievements FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "ua_insert_own" ON user_achievements;
CREATE POLICY "ua_insert_own" ON user_achievements FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "ua_delete_own" ON user_achievements;
CREATE POLICY "ua_delete_own" ON user_achievements FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ===== game_stats =====
CREATE TABLE IF NOT EXISTS game_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game text NOT NULL,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  draws integer NOT NULL DEFAULT 0,
  best_score integer,
  plays integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game)
);

ALTER TABLE game_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gs_select_own" ON game_stats;
CREATE POLICY "gs_select_own" ON game_stats FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "gs_insert_own" ON game_stats;
CREATE POLICY "gs_insert_own" ON game_stats FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "gs_update_own" ON game_stats;
CREATE POLICY "gs_update_own" ON game_stats FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "gs_delete_own" ON game_stats;
CREATE POLICY "gs_delete_own" ON game_stats FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_game_stats_user ON game_stats(user_id);
