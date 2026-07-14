/*
# Seed Achievements Catalog

Populates the `achievements` table with all unlockable achievements across
every game. Idempotent: uses ON CONFLICT to skip already-existing rows so it
is safe to re-run. This is shared reference data readable by all clients.
*/

INSERT INTO achievements (id, game, title, description, icon, coin_reward) VALUES
  -- General
  ('first_game', 'general', 'First Steps', 'Play any game for the first time', '🎯', 10),
  ('daily_complete', 'general', 'Daily Grind', 'Complete all 3 daily tasks', '📅', 50),
  ('daily_streak_3', 'general', 'On Fire', 'Complete daily tasks 3 days in a row', '🔥', 100),
  ('coin_500', 'general', 'Coin Collector', 'Accumulate 500 coins', '💰', 50),
  ('coin_1000', 'general', 'Wealthy', 'Accumulate 1000 coins', '💎', 100),

  -- Tic Tac Toe
  ('ttt_first_win', 'tictactoe', 'Tic Tac Toe Rookie', 'Win your first Tic Tac Toe game', '⭕', 20),
  ('ttt_disappear_win', 'tictactoe', 'Vanishing Act', 'Win a Disappearing mode game', '👻', 30),
  ('ttt_ultimate_win', 'tictactoe', 'Ultimate Champion', 'Win an Ultimate Tic Tac Toe game', '👑', 50),
  ('ttt_5_wins', 'tictactoe', 'Tic Tac Master', 'Win 5 Tic Tac Toe games', '🎖️', 40),

  -- Memory
  ('mem_first_win', 'memory', 'Memory Starter', 'Complete your first Memory game', '🧠', 20),
  ('mem_5x5_win', 'memory', 'Big Brain', 'Complete a 5x5 Memory grid', '🐘', 40),
  ('mem_advanced_win', 'memory', 'Shuffle Survivor', 'Win an Advanced Memory game', '🌀', 50),
  ('mem_perfect', 'memory', 'Flawless', 'Complete Memory with zero mistakes', '✨', 60),

  -- Rock Paper Scissors
  ('rps_first_win', 'rps', 'First Strike', 'Win your first RPS round', '✊', 15),
  ('rps_extended_win', 'rps', 'Extended Warrior', 'Win an Extended RPS game', '🗡️', 30),
  ('rps_5_wins', 'rps', 'Hand Master', 'Win 5 RPS games', '🤚', 40),

  -- Number Guessing
  ('num_first_win', 'numberguess', 'Lucky Guess', 'Win your first Number Guess game', '🍀', 15),
  ('num_no_hints', 'numberguess', 'No Help Needed', 'Win without using any hints', '🧮', 40),
  ('num_range_1000', 'numberguess', 'Big Range Hunter', 'Win on the 1-1000 range', '🌌', 50),
  ('num_5_wins', 'numberguess', 'Number Whisperer', 'Win 5 Number Guess games', '🔢', 40)
ON CONFLICT (id) DO NOTHING;
