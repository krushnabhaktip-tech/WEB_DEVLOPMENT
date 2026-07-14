export interface ThemeConfig {
  id: string;
  name: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryFg: string;
  accent: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}

export const themes: ThemeConfig[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    bg: 'bg-slate-950',
    surface: 'bg-slate-900',
    surfaceAlt: 'bg-slate-800',
    primary: 'bg-sky-500',
    primaryFg: 'text-sky-400',
    accent: 'bg-cyan-400',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    border: 'border-slate-700',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: 'bg-emerald-950',
    surface: 'bg-emerald-900',
    surfaceAlt: 'bg-emerald-800',
    primary: 'bg-emerald-500',
    primaryFg: 'text-emerald-400',
    accent: 'bg-lime-400',
    text: 'text-emerald-50',
    textMuted: 'text-emerald-300/70',
    border: 'border-emerald-700',
    success: 'text-lime-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
  },
  {
    id: 'sunset',
    name: 'Sunset',
    bg: 'bg-orange-950',
    surface: 'bg-stone-900',
    surfaceAlt: 'bg-stone-800',
    primary: 'bg-orange-500',
    primaryFg: 'text-orange-400',
    accent: 'bg-amber-400',
    text: 'text-orange-50',
    textMuted: 'text-orange-200/60',
    border: 'border-stone-700',
    success: 'text-lime-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    bg: 'bg-blue-950',
    surface: 'bg-blue-900',
    surfaceAlt: 'bg-blue-800',
    primary: 'bg-blue-500',
    primaryFg: 'text-blue-400',
    accent: 'bg-teal-400',
    text: 'text-blue-50',
    textMuted: 'text-blue-200/60',
    border: 'border-blue-800',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
  },
  {
    id: 'rose',
    name: 'Rose',
    bg: 'bg-rose-950',
    surface: 'bg-rose-900/60',
    surfaceAlt: 'bg-rose-800',
    primary: 'bg-rose-500',
    primaryFg: 'text-rose-400',
    accent: 'bg-pink-400',
    text: 'text-rose-50',
    textMuted: 'text-rose-200/60',
    border: 'border-rose-800',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
  },
  {
    id: 'light',
    name: 'Daylight',
    bg: 'bg-slate-100',
    surface: 'bg-white',
    surfaceAlt: 'bg-slate-200',
    primary: 'bg-indigo-500',
    primaryFg: 'text-indigo-600',
    accent: 'bg-violet-500',
    text: 'text-slate-800',
    textMuted: 'text-slate-500',
    border: 'border-slate-300',
    success: 'text-emerald-600',
    warning: 'text-amber-600',
    error: 'text-rose-600',
  },
];

export interface BackgroundConfig {
  id: string;
  name: string;
  // CSS classes applied to the app root for the animated background
  className: string;
}

export const backgrounds: BackgroundConfig[] = [
  { id: 'aurora', name: 'Aurora', className: 'bg-aurora' },
  { id: 'stars', name: 'Starfield', className: 'bg-stars' },
  { id: 'mesh', name: 'Mesh', className: 'bg-mesh' },
  { id: 'plain', name: 'Plain', className: 'bg-plain' },
];

export function getTheme(id: string): ThemeConfig {
  return themes.find((t) => t.id === id) || themes[0];
}

export function getBackground(id: string): BackgroundConfig {
  return backgrounds.find((b) => b.id === id) || backgrounds[0];
}
