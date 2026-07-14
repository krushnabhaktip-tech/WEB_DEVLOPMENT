export interface Profile {
  id: string;
  display_name: string;
  avatar: string;
  coins: number;
  theme: string;
  background: string;
  music_on: boolean;
  sfx_on: boolean;
  music_volume: number;
  sfx_volume: number;
  daily_tasks: DailyTask[];
  daily_reset_at: string | null;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  game: string;
  title: string;
  description: string;
  icon: string;
  coin_reward: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface GameStat {
  id: string;
  user_id: string;
  game: string;
  wins: number;
  losses: number;
  draws: number;
  best_score: number | null;
  plays: number;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  label: string;
  game: string;
  target: number;
  progress: number;
  reward: number;
  done: boolean;
}

export type GameId = 'tictactoe' | 'memory' | 'rps' | 'numberguess';
