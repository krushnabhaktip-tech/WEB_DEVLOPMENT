import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playSfx } from '../lib/sound';
import { Gamepad2, Mail, Lock, User, Sparkles } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signUp, signInAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    playSfx('click');
    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, displayName || 'Player');
    setBusy(false);
    if (result.error) {
      setError(result.error);
      playSfx('error');
    }
  };

  const handleGuest = () => {
    playSfx('select');
    signInAsGuest();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-sky-500/20 mb-4 glow">
            <Gamepad2 className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Mini Games Hub</h1>
          <p className="text-slate-400 mt-2">Play, earn coins, unlock achievements</p>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-slate-800/50">
            <button
              onClick={() => { setMode('login'); setError(null); playSfx('click'); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'login' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); playSfx('click'); }}
              className={`flex-1 py-2.5 rounded-lg font-medium transition-all ${
                mode === 'signup' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-rose-400 bg-rose-500/10 rounded-lg px-4 py-2 shake">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50"
            >
              {busy ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full py-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-200 font-medium transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            Continue as Guest
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Guest progress is saved locally. Sign up to sync across devices.
        </p>
      </div>
    </div>
  );
}
