import type { DailyTask, GameId } from '../types';

// Daily task templates — one is picked per game each day.
const taskTemplates: Record<GameId, { label: string; target: number; reward: number }[]> = {
  tictactoe: [
    { label: 'Play 2 Tic Tac Toe games', target: 2, reward: 20 },
    { label: 'Win 1 Tic Tac Toe game', target: 1, reward: 30 },
  ],
  memory: [
    { label: 'Play 2 Memory games', target: 2, reward: 20 },
    { label: 'Complete a Memory game', target: 1, reward: 25 },
  ],
  rps: [
    { label: 'Play 3 Rock Paper Scissors rounds', target: 3, reward: 20 },
    { label: 'Win 2 RPS rounds', target: 2, reward: 30 },
  ],
  numberguess: [
    { label: 'Play 2 Number Guess games', target: 2, reward: 20 },
    { label: 'Win 1 Number Guess game', target: 1, reward: 35 },
  ],
};

export function generateDailyTasks(): DailyTask[] {
  const games: GameId[] = ['tictactoe', 'memory', 'rps', 'numberguess'];
  const tasks: DailyTask[] = [];
  games.forEach((game, i) => {
    const templates = taskTemplates[game];
    const tpl = templates[i % templates.length];
    tasks.push({
      id: `daily_${game}_${Date.now()}_${i}`,
      label: tpl.label,
      game,
      target: tpl.target,
      progress: 0,
      reward: tpl.reward,
      done: false,
    });
  });
  return tasks;
}

export function shouldResetDaily(resetAt: string | null): boolean {
  if (!resetAt) return true;
  return new Date() >= new Date(resetAt);
}

export function nextResetTime(): string {
  const next = new Date();
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
}
