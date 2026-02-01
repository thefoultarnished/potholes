import { writable, derived } from 'svelte/store';

// App state stores
export const darkMode = writable(true);
export const soundEnabled = writable(true);
export const reports = writable<Report[]>([]);
export const loading = writable(true);
export const showUpload = writable(false);
export const showMap = writable(false);
export const showMobileMenu = writable(false);
export const selectedPothole = writable<Report | null>(null);

// Types
export interface Report {
  id: string;
  image_url: string;
  location: string | { lat: number; lng: number; name?: string };
  severity: number;
  votes: number;
  created_at: string;
  isLocal?: boolean;
}

// Derived stores
export const top3 = derived(reports, ($reports) => 
  [...$reports].sort((a, b) => b.votes - a.votes).slice(0, 3)
);

// Severity configuration
export const SIZES = [
  { level: 1, label: 'Mild', title: 'Coffee Spiller', color: 'bg-cyan-400', textColor: 'text-cyan-400', icon: 'Coffee' },
  { level: 2, label: 'Moderate', title: 'Ankle Breaker', color: 'bg-sky-500', textColor: 'text-sky-500', icon: 'Activity' },
  { level: 3, label: 'Serious', title: 'Spine Adjuster', color: 'bg-blue-500', textColor: 'text-blue-500', icon: 'Zap' },
  { level: 4, label: 'Severe', title: 'Rim Reaper', color: 'bg-indigo-500', textColor: 'text-indigo-500', icon: 'Cog' },
  { level: 5, label: 'Critical', title: 'Suspension Assassin', color: 'bg-violet-500', textColor: 'text-violet-500', icon: 'Skull' },
  { level: 6, label: 'Extreme', title: 'Swimming Pool', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-500', icon: 'Waves' },
  { level: 7, label: 'Catastrophic', title: 'Pedestrian Abyss', color: 'bg-rose-500', textColor: 'text-rose-500', icon: 'AlertTriangle' },
  { level: 8, label: 'Apocalyptic', title: 'Black Hole', color: 'bg-red-600', textColor: 'text-red-600', icon: 'Circle' }
];

export function getSizeFromSeverity(sev: number) {
  return SIZES.find(s => s.level === Number(sev)) || SIZES[0];
}

export function getAuraByRank(rank: number) {
  if (rank === 1) return { label: 'Pyro Aura', className: 'element-label-fire', frameClass: 'fire-frame' };
  if (rank === 2) return { label: 'Electro Aura', className: 'element-label-electric', frameClass: 'electric-frame' };
  if (rank === 3) return { label: 'Hydro Aura', className: 'element-label-water', frameClass: 'water-frame' };
  return null;
}

export function getDisplayLocation(loc: string | { lat: number; lng: number; name?: string } | null): string {
  if (!loc) return 'Somewhere on Earth';
  if (typeof loc === 'object' && !Array.isArray(loc)) {
    return loc.name || 'Unknown Location';
  }
  if (typeof loc === 'string') {
    if (loc === 'Unknown Location' || loc.startsWith('GPS:')) return 'Somewhere on Earth';
    if (loc.includes(' (GPS:')) return loc.split(' (GPS:')[0];
    return loc.split(',')[0].trim();
  }
  return 'Somewhere on Earth';
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

// Audio
const VOTE_SOUND_B64 = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA";
let cachedAudio: HTMLAudioElement | null = null;

export function playPopSound(enabled: boolean) {
  if (!enabled) return;
  try {
    if (!cachedAudio) {
      cachedAudio = new Audio(VOTE_SOUND_B64);
      cachedAudio.volume = 0.4;
    }
    cachedAudio.currentTime = 0;
    cachedAudio.play().catch(e => console.warn('Audio play failed', e));
  } catch (e) {
    console.warn('Audio context failed', e);
  }
}

// Environment variables
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
