import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { playSfx } from '../lib/sound';
import { Coins, Trophy, Calendar, Save, Check } from 'lucide-react';
import type { Achievement, UserAchievement, GameStat } from '../types';

const avatars = ['🎮', '🦊', '🐱', '🐼', '🦉', '🐲', '🦄', '👾', '🤖', '🌟', '🔥', '⚡'];

export default function Profile() {
  const { profile, isGuest, updateProfile } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<GameStat[]>([]);
  const [editName, setEditName] = useState(profile?.display_name || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '🎮');
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!profile || isGuest) return;
    (async () => {
      const [{ data: achs }, { data: ua }, { data: gs }] = await Promise.all([
        supabase.from('achievements').select('*'),
        supabase.from('user_achievements').select('*').eq('user_id', profile.id),
        supabase.from('game_stats').select('*').eq('user_id', profile.id),
      ]);
      if (achs) setAchievements(achs as Achievement[]);
      if (ua) setUnlocked(new Set((ua as UserAchievement[]).map((u) => u.achievement_id)));
      if (gs) setStats(gs as GameStat[]);
    })();
  }, [profile?.id, isGuest]);

  if (!profile) return null;

  const handleSave = async () => {
    await updateProfile({ display_name: editName, avatar: editAvatar });
    setEditing(false);
    setSaved(true);
    playSfx('coin');
    setTimeout(() => setSaved(false), 2000);
  };

  const gameNames: Record<string, string> = {
    tictactoe: 'Tic Tac Toe',
    memory: 'Memory',
    rps: 'Rock Paper Scissors',
    numberguess: 'Number Guess',
    general: 'General',
  };

  return (
    <div className="space-y-8 fade-in max-w-4xl mx-auto">
      {/* Profile card */}
      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="text-6xl sm:text-7xl">{profile.avatar}</div>
          <div className="flex-1 w-full">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Display Name</label>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 focus:border-sky-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {avatars.map((a) => (
                      <button
                        key={a}
                        onClick={() => { setEditAvatar(a); playSfx('hover'); }}
                        className={`text-2xl w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                          editAvatar === a ? 'bg-sky-500/20 border-2 border-sky-500' : 'bg-slate-800/60 border-2 border-transparent hover:bg-slate-700'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium transition-colors"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    onClick={() => { setEditing(false); setEditName(profile.display_name); setEditAvatar(profile.avatar); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold">{profile.display_name}</h1>
                  {isGuest && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Guest
                    </span>
                  )}
                  {saved && <span className="text-emerald-400 text-sm flex items-center gap-1"><Check className="w-4 h-4" /> Saved</span>}
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{profile.coins} coins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold">{unlocked.size}/{achievements.length} achievements</span>
                  </div>
                </div>
                {!isGuest && (
                  <button
                    onClick={() => { setEditing(true); playSfx('click'); }}
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 border border-slate-700 text-sm font-medium transition-colors"
                  >
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game stats */}
      {!isGuest && stats.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Game Stats</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.id} className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <h3 className="font-semibold mb-2">{gameNames[s.game] || s.game}</h3>
                <div className="space-y-1 text-sm text-slate-400">
                  <div className="flex justify-between"><span>Plays</span><span className="text-slate-200 font-medium">{s.plays}</span></div>
                  <div className="flex justify-between"><span>Wins</span><span className="text-emerald-400 font-medium">{s.wins}</span></div>
                  <div className="flex justify-between"><span>Losses</span><span className="text-rose-400 font-medium">{s.losses}</span></div>
                  {s.best_score !== null && <div className="flex justify-between"><span>Best</span><span className="text-sky-400 font-medium">{s.best_score}</span></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily tasks */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-sky-400" /> Daily Tasks</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {profile.daily_tasks.map((task) => (
            <div
              key={task.id}
              className={`rounded-xl border p-4 ${task.done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-700/50 bg-slate-900/50'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{task.label}</p>
                <span className="text-xs text-amber-400 font-semibold">+{task.reward} 🪙</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${task.done ? 'bg-emerald-500' : 'bg-sky-500'}`}
                    style={{ width: `${Math.min(100, (task.progress / task.target) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">
                  {task.done ? '✓' : `${task.progress}/${task.target}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-amber-400" /> Achievements</h2>
        {isGuest ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-6 text-center text-slate-400">
            Sign up to track and unlock achievements across all games!
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((a) => {
              const isUnlocked = unlocked.has(a.id);
              return (
                <div
                  key={a.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isUnlocked
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-slate-700/50 bg-slate-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`text-3xl ${isUnlocked ? '' : 'grayscale opacity-50'}`}>{a.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{a.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-amber-400 font-semibold">+{a.coin_reward} 🪙</span>
                        {isUnlocked && <span className="text-xs text-emerald-400">✓ Unlocked</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
