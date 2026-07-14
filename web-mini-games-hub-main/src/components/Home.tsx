import { useAuth } from '../context/AuthContext';
import { playSfx } from '../lib/sound';
import { Coins, Trophy, Calendar, Gamepad2, ChevronRight, Flame } from 'lucide-react';

interface Props {
  onNavigate: (view: string) => void;
}

const games = [
  { id: 'tictactoe', title: 'Tic Tac Toe', desc: 'Classic, Disappearing & Ultimate modes', emoji: '⭕', gradient: 'from-sky-500/20 to-blue-500/10', accent: 'text-sky-400' },
  { id: 'memory', title: 'Memory Cards', desc: 'Match pairs in 4x4, 5x5 & Advanced shuffle', emoji: '🧠', gradient: 'from-emerald-500/20 to-teal-500/10', accent: 'text-emerald-400' },
  { id: 'rps', title: 'Rock Paper Scissors', desc: 'Classic & Extended with Lizard, Spock & more', emoji: '✊', gradient: 'from-amber-500/20 to-orange-500/10', accent: 'text-amber-400' },
  { id: 'numberguess', title: 'Number Guessing', desc: 'Guess the number with hints & coins', emoji: '🔢', gradient: 'from-rose-500/20 to-pink-500/10', accent: 'text-rose-400' },
];

export default function Home({ onNavigate }: Props) {
  const { profile } = useAuth();
  if (!profile) return null;

  const completedTasks = profile.daily_tasks.filter((t) => t.done).length;
  const totalTasks = profile.daily_tasks.length;

  return (
    <div className="space-y-8 fade-in">
      {/* Hero */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Welcome back, <span className="text-sky-400">{profile.display_name}</span> {profile.avatar}
          </h1>
          <p className="text-slate-400 mb-6">Pick a game and start earning coins!</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-amber-300">{profile.coins} coins</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
              <Calendar className="w-5 h-5 text-sky-400" />
              <span className="font-semibold">{completedTasks}/{totalTasks} daily tasks</span>
            </div>
            <button
              onClick={() => { playSfx('click'); onNavigate('profile'); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-sky-500/50 transition-colors"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="font-semibold">Achievements</span>
            </button>
          </div>
        </div>
      </div>

      {/* Daily tasks preview */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold">Daily Tasks</h2>
          <span className="text-sm text-slate-500">Resets at midnight</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {profile.daily_tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-4 transition-all ${
                task.done
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-slate-700/50 bg-slate-900/50'
              }`}
            >
              <p className="text-sm font-medium mb-2">{task.label}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {task.done ? '✓ Done' : `${task.progress}/${task.target}`}
                </span>
                <span className="text-xs text-amber-400 font-semibold">+{task.reward} 🪙</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${task.done ? 'bg-emerald-500' : 'bg-sky-500'}`}
                  style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Games grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Gamepad2 className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold">Games</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {games.map((g) => (
            <button
              key={g.id}
              onClick={() => { playSfx('select'); onNavigate(g.id); }}
              className={`game-card group text-left rounded-2xl border border-slate-700/50 bg-gradient-to-br ${g.gradient} p-6 hover:border-slate-600 hover:shadow-xl`}
            >
              <div className="flex items-start justify-between">
                <div className="text-5xl mb-4">{g.emoji}</div>
                <ChevronRight className={`w-5 h-5 ${g.accent} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all`} />
              </div>
              <h3 className="text-xl font-bold mb-1">{g.title}</h3>
              <p className="text-sm text-slate-400">{g.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
