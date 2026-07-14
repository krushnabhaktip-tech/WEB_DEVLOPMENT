import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { themes, backgrounds } from '../lib/themes';
import { playSfx, stopMusic, startMusic } from '../lib/sound';
import { Coins, Volume2, VolumeX, Palette, Music, Settings, LogOut, Home, User, X } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="w-5 h-5" /> },
  { id: 'tictactoe', label: 'Tic Tac Toe', icon: <span className="text-lg">⭕</span> },
  { id: 'memory', label: 'Memory', icon: <span className="text-lg">🧠</span> },
  { id: 'rps', label: 'RPS', icon: <span className="text-lg">✊</span> },
  { id: 'numberguess', label: 'Number Guess', icon: <span className="text-lg">🔢</span> },
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
];

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export default function Layout({ currentView, onNavigate, children }: Props) {
  const { profile, isGuest, signOut, updateProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  if (!profile) return null;

  const handleNav = (id: string) => {
    playSfx('click');
    onNavigate(id);
    setMobileNav(false);
  };

  const toggleMusic = () => {
    const newMusicOn = !profile.music_on;
    updateProfile({ music_on: newMusicOn });
    if (newMusicOn) startMusic();
    else stopMusic();
    playSfx('click');
  };

  const toggleSfx = () => {
    updateProfile({ sfx_on: !profile.sfx_on });
    playSfx('click');
  };

  const handleThemeChange = (themeId: string) => {
    updateProfile({ theme: themeId });
    playSfx('select');
  };

  const handleBgChange = (bgId: string) => {
    updateProfile({ background: bgId });
    playSfx('select');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNav(!mobileNav)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span className="text-xl">☰</span>
            </button>
            <button onClick={() => handleNav('home')} className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <span className="font-bold text-lg hidden sm:block">Games Hub</span>
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Coins */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-amber-300 text-sm tabular-nums">{profile.coins}</span>
            </div>

            {/* Sound toggles */}
            <button
              onClick={toggleMusic}
              className={`p-2 rounded-lg transition-colors ${profile.music_on ? 'text-sky-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-800'}`}
              title="Toggle music"
            >
              {profile.music_on ? <Music className="w-5 h-5" /> : <Music className="w-5 h-5 opacity-40" />}
            </button>
            <button
              onClick={toggleSfx}
              className={`p-2 rounded-lg transition-colors ${profile.sfx_on ? 'text-sky-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-800'}`}
              title="Toggle sound effects"
            >
              {profile.sfx_on ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Settings */}
            <button
              onClick={() => { setShowSettings(true); playSfx('click'); }}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Avatar */}
            <button onClick={() => handleNav('profile')} className="flex items-center gap-2 pl-1">
              <span className="text-2xl">{profile.avatar}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-slate-700/50 p-4 gap-1 sticky top-16 self-start h-[calc(100vh-4rem)]">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                currentView === item.id
                  ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          <div className="mt-auto">
            <button
              onClick={() => { playSfx('click'); signOut(); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all w-full"
            >
              <LogOut className="w-5 h-5" />
              {isGuest ? 'Exit Guest' : 'Sign Out'}
            </button>
          </div>
        </aside>

        {/* Mobile nav */}
        {mobileNav && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNav(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-700 p-4 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-bold">Menu</span>
                <button onClick={() => setMobileNav(false)} className="p-1"><X className="w-5 h-5" /></button>
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                    currentView === item.id ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => { playSfx('click'); signOut(); }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all mt-auto"
              >
                <LogOut className="w-5 h-5" />
                {isGuest ? 'Exit Guest' : 'Sign Out'}
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">{children}</main>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 pop-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><Palette className="w-5 h-5 text-sky-400" /> Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-2 rounded-lg hover:bg-slate-800"><X className="w-5 h-5" /></button>
            </div>

            {/* Theme */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">UI Theme</h3>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                      profile.theme === t.id ? 'border-sky-500 ' + t.surface : 'border-transparent ' + t.surfaceAlt
                    } ${t.text}`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">Background</h3>
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBgChange(b.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ${
                      profile.background === b.id ? 'border-sky-500 bg-slate-800' : 'border-transparent bg-slate-800/50 hover:bg-slate-800'
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Volume sliders */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-2 block">Music Volume: {Math.round(profile.music_volume * 100)}%</label>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={profile.music_volume}
                  onChange={(e) => updateProfile({ music_volume: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-400 mb-2 block">SFX Volume: {Math.round(profile.sfx_volume * 100)}%</label>
                <input
                  type="range" min={0} max={1} step={0.05}
                  value={profile.sfx_volume}
                  onChange={(e) => updateProfile({ sfx_volume: parseFloat(e.target.value) })}
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { navItems };
export type { NavItem };
