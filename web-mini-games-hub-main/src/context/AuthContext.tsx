import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, DailyTask } from '../types';
import { generateDailyTasks, shouldResetDaily, nextResetTime } from '../lib/dailyTasks';
import { getTheme, getBackground } from '../lib/themes';
import { initAudio, setMasterVolumes, startMusic, stopMusic, playSfx } from '../lib/sound';
import type { GameId } from '../types';

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  addCoins: (amount: number) => Promise<void>;
  recordGameResult: (game: GameId, result: 'win' | 'lose' | 'draw', score?: number) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<boolean>;
  recordDailyTaskProgress: (game: GameId, won: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

const GUEST_KEY = 'gameshub_guest_profile';

function createGuestProfile(): Profile {
  return {
    id: 'guest-' + Math.random().toString(36).slice(2),
    display_name: 'Guest Player',
    avatar: '🎮',
    coins: 100,
    theme: 'midnight',
    background: 'aurora',
    music_on: true,
    sfx_on: true,
    music_volume: 0.4,
    sfx_volume: 0.6,
    daily_tasks: generateDailyTasks(),
    daily_reset_at: nextResetTime(),
    is_guest: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile load error:', error);
      return;
    }

    if (!data) {
      // Create profile on first login
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          display_name: 'Player',
          daily_tasks: generateDailyTasks(),
          daily_reset_at: nextResetTime(),
        })
        .select()
        .single();
      if (insertError) {
        console.error('Profile create error:', insertError);
        return;
      }
      setProfile(newProfile as Profile);
    } else {
      let p = data as Profile;
      if (shouldResetDaily(p.daily_reset_at)) {
        const { error: updErr } = await supabase
          .from('profiles')
          .update({ daily_tasks: generateDailyTasks(), daily_reset_at: nextResetTime() })
          .eq('id', userId);
        if (!updErr) {
          p = { ...p, daily_tasks: generateDailyTasks(), daily_reset_at: nextResetTime() };
        }
      }
      setProfile(p);
    }
  }, []);

  useEffect(() => {
    initAudio();

    // Check for guest profile in localStorage
    const storedGuest = localStorage.getItem(GUEST_KEY);
    if (storedGuest) {
      try {
        const gp = JSON.parse(storedGuest) as Profile;
        if (shouldResetDaily(gp.daily_reset_at)) {
          gp.daily_tasks = generateDailyTasks();
          gp.daily_reset_at = nextResetTime();
        }
        setProfile(gp);
        setIsGuest(true);
        setLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Clear guest state when a real user signs in
          localStorage.removeItem(GUEST_KEY);
          setIsGuest(false);
          await loadProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setIsGuest(false);
        }
      })();
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  // Apply theme + background + sound settings whenever profile changes
  useEffect(() => {
    if (!profile) return;
    const theme = getTheme(profile.theme);
    const bg = getBackground(profile.background);
    const root = document.documentElement;
    root.className = `${theme.bg} ${theme.text}`;
    const appBg = document.getElementById('app-bg');
    if (appBg) appBg.className = `fixed inset-0 -z-10 ${bg.className}`;
    setMasterVolumes(profile.music_volume, profile.sfx_volume, profile.music_on, profile.sfx_on);
    if (profile.music_on) startMusic();
    else stopMusic();
  }, [profile?.theme, profile?.background, profile?.music_on, profile?.sfx_on, profile?.music_volume, profile?.sfx_volume]);

  const persistGuest = (p: Profile) => {
    localStorage.setItem(GUEST_KEY, JSON.stringify(p));
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
        daily_tasks: generateDailyTasks(),
        daily_reset_at: nextResetTime(),
      });
    }
    return { error: null };
  };

  const signInAsGuest = () => {
    const gp = createGuestProfile();
    setProfile(gp);
    setIsGuest(true);
    persistGuest(gp);
  };

  const signOut = async () => {
    if (isGuest) {
      localStorage.removeItem(GUEST_KEY);
      setProfile(null);
      setIsGuest(false);
    } else {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates, updated_at: new Date().toISOString() };
    setProfile(updated);
    if (isGuest) {
      persistGuest(updated);
    } else {
      const { id, created_at, updated_at, is_guest, ...dbUpdates } = updated;
      void is_guest;
      await supabase.from('profiles').update(dbUpdates).eq('id', profile.id);
    }
  };

  const addCoins = async (amount: number) => {
    if (!profile) return;
    await updateProfile({ coins: profile.coins + amount });
  };

  const recordGameResult = async (game: GameId, result: 'win' | 'lose' | 'draw', score?: number) => {
    if (!profile) return;
    if (isGuest) {
      // Track in guest profile (simplified)
      return;
    }
    const { data: existing } = await supabase
      .from('game_stats')
      .select('*')
      .eq('user_id', profile.id)
      .eq('game', game)
      .maybeSingle();

    if (existing) {
      const updates: Record<string, number | string | null> = {
        plays: existing.plays + 1,
        wins: existing.wins + (result === 'win' ? 1 : 0),
        losses: existing.losses + (result === 'lose' ? 1 : 0),
        draws: existing.draws + (result === 'draw' ? 1 : 0),
        updated_at: new Date().toISOString(),
      };
      if (score !== undefined) {
        if (existing.best_score === null || score > existing.best_score) {
          updates.best_score = score;
        }
      }
      await supabase.from('game_stats').update(updates).eq('id', existing.id);
    } else {
      await supabase.from('game_stats').insert({
        user_id: profile.id,
        game,
        plays: 1,
        wins: result === 'win' ? 1 : 0,
        losses: result === 'lose' ? 1 : 0,
        draws: result === 'draw' ? 1 : 0,
        best_score: score ?? null,
      });
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!profile || isGuest) return false;
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', profile.id)
      .eq('achievement_id', achievementId)
      .maybeSingle();
    if (existing) return false;

    const { data: ach } = await supabase
      .from('achievements')
      .select('coin_reward')
      .eq('id', achievementId)
      .maybeSingle();

    await supabase.from('user_achievements').insert({
      user_id: profile.id,
      achievement_id: achievementId,
    });

    if (ach) {
      await addCoins(ach.coin_reward);
    }
    playSfx('achievement');
    return true;
  };

  const recordDailyTaskProgress = async (game: GameId, won: boolean) => {
    if (!profile) return;
    let tasks: DailyTask[] = profile.daily_tasks.map((t) => ({ ...t }));
    let changed = false;
    for (const t of tasks) {
      if (t.game === game && !t.done) {
        t.progress += 1;
        if (t.label.toLowerCase().includes('win') && !won) continue;
        if (t.progress >= t.target) {
          t.done = true;
          await addCoins(t.reward);
          playSfx('coin');
        }
        changed = true;
      }
    }
    if (changed) {
      await updateProfile({ daily_tasks: tasks });
    }
  };

  const refreshProfile = async () => {
    if (!profile || isGuest) return;
    await loadProfile(profile.id);
  };

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        isGuest,
        signIn,
        signUp,
        signInAsGuest,
        signOut,
        updateProfile,
        addCoins,
        recordGameResult,
        unlockAchievement,
        recordDailyTaskProgress,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
