import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Tiny pop sound (~1KB) - much smaller than original 88KB
const VOTE_SOUND_B64 = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA";

// Dynamic confetti import to reduce initial bundle size
let confetti = null;
const loadConfetti = async () => {
  if (!confetti) {
    const module = await import('canvas-confetti');
    confetti = module.default;
  }
  return confetti;
};
import { 
  Camera, 
  MapPin, 
  X, 
  Megaphone,
  Flame,
  Upload,
  Loader2,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  Maximize,
  Minimize,
  Sun,
  Moon,
  ChevronUp,
  Trophy
} from 'lucide-react';

// --- CONFIG & UTILS ---
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const SIZES = [
  { level: 1, label: 'Small', title: 'Pavement Pimple', color: 'bg-sky-400', textColor: 'text-sky-400' },
  { level: 2, label: 'Medium', title: 'Suspension Stresser', color: 'bg-cyan-400', textColor: 'text-cyan-400' },
  { level: 3, label: 'Large', title: 'Rim Reaper', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
  { level: 4, label: 'Mega', title: 'Chassis Challenger', color: 'bg-fuchsia-600', textColor: 'text-fuchsia-600' }
];

const getSizeFromSeverity = (sev) => SIZES.find(s => s.level === (sev || 1)) || SIZES[0];

const getDisplayLocation = (loc) => {
  if (!loc || loc === 'Unknown Location' || loc.startsWith('GPS:')) return 'Somewhere on Earth';
  // If it's "Name (GPS: ...)", show only the name
  if (loc.includes(' (GPS:')) return loc.split(' (GPS:')[0];
  return loc.split(',')[0].trim();
};

// Safe date formatting to prevent crashes from null/undefined dates
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown date';
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return 'Unknown date';
  }
};

// SeverityIcon removed - was unused

const ShameIcon = ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 1800 1800" fill="currentColor" width={size} height={size} className={className}>
    <path d="M803.722,820.892l-247.878-247.87l71.705-71.702l247.875,247.871l40.808-40.802L655.949,448.104l74.925-74.921c0.596-0.596,1.147-1.216,1.682-1.86c0.592-0.499,1.175-1.006,1.735-1.562l135.512-135.512c11.126-11.12,11.292-29.106,0.366-40.43l-1.538-1.606c-1.284-1.349-2.572-2.693-3.893-4.018C796.995,120.454,709.056,80.01,629.497,80.01c-53.655,0-99.814,17.796-133.483,51.468c-0.733,0.73-1.409,1.503-2.053,2.3c-0.443,0.388-0.89,0.765-1.309,1.183L185.294,442.324c-11.267,11.271-11.267,29.539,0,40.81l45.403,45.399l-37.493,37.493l-45.403-45.408c-5.414-5.41-12.752-8.453-20.405-8.453c-7.652,0-14.99,3.043-20.404,8.453L12.869,614.75c-11.268,11.271-11.268,29.538,0,40.802l197.415,197.416c5.414,5.41,12.752,8.454,20.404,8.454c7.653,0,14.995-3.043,20.405-8.454l94.115-94.13c11.268-11.264,11.268-29.531,0-40.802l-45.395-45.399l37.493-37.493l45.395,45.399c5.636,5.636,13.019,8.446,20.405,8.446c7.383,0,14.77-2.818,20.401-8.446l79.124-79.124l260.285,260.285L803.722,820.892z M629.497,137.719c58.812,0,124.33,28.287,178.733,76.497l-94.34,94.334L559.981,154.64C579.485,143.503,603.046,137.719,629.497,137.719z M230.688,791.756L74.079,635.15l53.317-53.321l156.602,156.605L230.688,791.756z M261.089,629.749l-24.999-24.999l35.408-35.408l24.998,24.998L261.089,629.749z M403.106,619.331L246.505,462.725L513.058,196.17l156.609,156.612L403.106,619.331z"/>
    <path d="M1763.996,1556.146l-593.695-593.688l-40.803,40.801l573.296,573.296l-71.701,71.709l-573.303-573.303l-40.803,40.81l593.704,593.705c5.41,5.408,12.752,8.452,20.401,8.452c7.657,0,14.999-3.044,20.409-8.452l112.502-112.521C1775.268,1585.686,1775.268,1567.418,1763.996,1556.146z"/>
    <path d="M1780.444,264.271c-3.269-9.372-11.135-16.4-20.812-18.614c-9.67-2.206-19.806,0.708-26.825,7.729l-116.585,116.576l-109.307-109.315l116.585-116.57c7.02-7.021,9.942-17.156,7.729-26.833c-2.214-9.679-9.243-17.541-18.614-20.814c-29.071-10.149-59.48-15.298-90.379-15.298c-73.062,0-141.743,28.449-193.397,80.104c-51.671,51.66-80.123,120.344-80.123,193.406c0,35.343,6.723,69.648,19.442,101.514l-736.242,736.236c-31.861-12.721-66.158-19.435-101.497-19.435c-73.058,0-141.744,28.452-193.407,80.115c-73.802,73.801-99.243,185.193-64.809,283.775c3.272,9.372,11.134,16.4,20.812,18.614c9.673,2.206,19.809-0.7,26.833-7.72l116.581-116.586l109.315,109.299l-116.585,116.586c-7.021,7.02-9.938,17.155-7.729,26.833c2.214,9.677,9.242,17.534,18.613,20.812c29.064,10.152,59.468,15.296,90.372,15.304c0.008,0,0.008,0,0.016,0c73.042,0,141.728-28.46,193.39-80.122c79.559-79.566,99.726-196.352,60.563-294.822l736.347-736.333c31.865,12.728,66.162,19.443,101.506,19.443c0.008,0,0,0,0.008,0c73.046,0,141.736-28.444,193.391-80.106C1789.438,474.246,1814.878,362.854,1780.444,264.271z M583.011,1599.065c-40.762,40.763-94.948,63.216-152.58,63.216c0,0-0.012,0-0.016,0c-7.915-0.008-15.792-0.436-23.602-1.28l100.137-100.138c5.414-5.417,8.454-12.752,8.454-20.408c0-7.648-3.04-14.99-8.454-20.4L356.83,1369.946c-11.263-11.264-29.535-11.264-40.806,0l-100.072,100.072c-6.835-64.134,15.333-129.603,61.871-176.146c40.762-40.762,94.952-63.207,152.597-63.207c57.64,0,111.83,22.445,152.588,63.215C667.146,1378.013,667.146,1514.926,583.011,1599.065z M659.282,1288.535l-70.945-70.951l702.501-702.488l70.953,70.944L659.282,1288.535z M1674.832,507.246c-40.761,40.753-94.951,63.199-152.596,63.199S1410.394,548,1369.632,507.238c-40.753-40.762-63.207-94.953-63.207-152.597s22.454-111.834,63.216-152.598c40.753-40.758,94.951-63.204,152.596-63.204c7.922,0,15.796,0.429,23.605,1.28l-100.137,100.127c-5.411,5.41-8.453,12.752-8.453,20.4c0,7.657,3.042,14.991,8.453,20.401l150.108,150.117c11.271,11.271,29.547,11.271,40.81,0.008l100.072-100.073C1743.531,395.234,1721.367,460.704,1674.832,507.246z"/>
  </svg>
);

// Cached audio instance to prevent memory leaks
let cachedAudio = null;
const playPopSound = (enabled) => {
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
};

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">🚧</div>
            <h1 className="text-2xl font-bold text-white mb-4">Something went wrong</h1>
            <p className="text-zinc-400 mb-6">The app encountered an unexpected error. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-cyan-500 text-white font-bold rounded-xl hover:bg-cyan-400 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- COMPONENTS ---

const UpvoteButton = ({ onVote, votes = 0, size = "md", darkMode = true, soundEnabled = true }) => {
  const sizes = {
    sm: { height: "h-8", padding: "px-3", icon: 12, text: "text-[11px]" },
    md: { height: "h-9", padding: "px-3.5", icon: 14, text: "text-xs" },
  };
  
  const s = sizes[size] || sizes.md;
  const controls = useAnimation();
  const [burstKey, setBurstKey] = React.useState(0);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    playPopSound(soundEnabled);
    
    controls.stop();
    controls.start({
      scale: [1, 1.1, 1],
      transition: { duration: 0.25, ease: "easeOut" }
    });
    
    setBurstKey(prev => prev + 1);
    onVote();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={controls}
      onClick={handleClick}
      className={`relative ${s.height} ${s.padding} rounded-full font-bold ${s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${
        darkMode 
          ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-[#323d5e] hover:to-[#252f4e]' 
          : 'bg-white text-cyan-600 shadow-[0_2px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
      }`}
    >
      {/* Upvote Icon */}
      <motion.svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        width={s.icon} 
        height={s.icon}
        animate={burstKey > 0 ? { 
          rotate: [0, -12, 12, 0],
          scale: [1, 1.15, 1] 
        } : {}}
        key={`svg-${burstKey}`}
        transition={{ duration: 0.3 }}
        className={darkMode ? 'text-cyan-400' : 'text-cyan-500'}
      >
        <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
      </motion.svg>
      
      {/* Vote Count */}
      <div className="relative overflow-hidden h-[1.2em] flex items-center min-w-[1.2em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={votes}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="inline-block font-black tracking-wide"
          >
            {votes}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Particle Burst */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          <motion.div
            key={burstKey}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {burstKey > 0 && [...Array(6)].map((_, i) => (
              <motion.div
                key={`${burstKey}-${i}`}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 60 * Math.PI / 180) * 35,
                  y: Math.sin(i * 60 * Math.PI / 180) * 35
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_6px_#22d3ee]"
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  );
};


const ModeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <div className={`relative h-11 rounded-full flex items-center p-1 transition-all duration-300 ${ 
      darkMode 
        ? 'bg-[#1a2038]/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3),0_1px_0_rgba(255,255,255,0.05)]' 
        : 'bg-slate-200/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_1px_0_rgba(255,255,255,0.8)]'
    }`}>
      {/* Sliding Active Indicator */}
      <motion.div
        className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full z-0 ${
          darkMode 
            ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]' 
            : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]'
        }`}
        initial={false}
        animate={{ x: darkMode ? 'calc(100% + 4px)' : 0 }}
        style={{ left: 4 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
      
      {/* Light Option */}
      <button 
        onClick={() => setDarkMode(false)}
        className={`relative z-10 h-full px-5 rounded-full text-[11px] font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${
          !darkMode ? 'text-slate-800' : 'text-slate-400'
        }`}
      >
        {!darkMode && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-[0_0_6px_#fb7185]" 
          />
        )}
        <Sun size={14} strokeWidth={2.5} className={!darkMode ? 'text-amber-500' : 'opacity-50'} />
        <span className="tracking-wide">Light</span>
      </button>

      {/* Dark Option */}
      <button 
        onClick={() => setDarkMode(true)}
        className={`relative z-10 h-full px-5 rounded-full text-[11px] font-bold flex items-center justify-center gap-2 transition-colors duration-200 ${
          darkMode 
            ? 'text-white' 
            : 'text-slate-400'
        }`}
      >
        {darkMode && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" 
          />
        )}
        <Moon size={14} strokeWidth={2.5} className={darkMode ? 'text-cyan-400' : 'opacity-50'} />
        <span className="tracking-wide">Dark</span>
      </button>
    </div>
  );
};

const SoundToggle = ({ soundEnabled, setSoundEnabled, darkMode }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setSoundEnabled(!soundEnabled)}
      aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
        darkMode 
          ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]' 
          : 'bg-white text-slate-500 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]'
      }`}
    >
      {soundEnabled ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M11 5L6 9H2V15H6L11 19V5Z" fill="currentColor" />
          <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M11 5L6 9H2V15H6L11 19V5Z" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
    </motion.button>
  );
};

// --- LOADING SCREEN ---
const LoadingScreen = ({ darkMode }) => (
  <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 ${
    darkMode ? 'bg-[#0a1628]' : 'bg-[#e4e4e7]'
  }`}>
    {/* Multi-orb background for loading screen to match main app */}
    <div className={`absolute inset-0 ${
      darkMode 
        ? 'bg-[#0a1628]' 
        : 'bg-gradient-to-br from-[#e4e4e7] via-[#f1f5f9] to-[#e2e8f0]'
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[100px] ${darkMode ? 'bg-cyan-400/80' : 'bg-cyan-300/70'}`} />
        <div className={`absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] ${darkMode ? 'bg-violet-500/80' : 'bg-purple-300/70'}`} />
        <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[100px] ${darkMode ? 'bg-purple-500/90' : 'bg-purple-300/80'}`} />
      </div>
    </div>
    
    {/* Loading content */}
    <div className="relative z-10 flex flex-col items-center">
      {/* Animated logo/icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8"
      >
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          darkMode ? 'bg-cyan-400' : 'bg-purple-500'
        }`} style={{ animationDuration: '2s' }} />
        
        {/* Main loader container */}
        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl ${
          darkMode 
            ? 'bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.3)]' 
            : 'bg-white/70 border border-white/50 shadow-[0_0_60px_rgba(168,85,247,0.2)]'
        }`}>
          {/* Rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2"
          >
            <div className={`w-full h-full rounded-full border-2 border-transparent ${
              darkMode ? 'border-t-cyan-400 border-r-purple-500' : 'border-t-purple-500 border-r-pink-400'
            }`} />
          </motion.div>
          
          {/* Center icon */}
          <MapPin size={32} className={darkMode ? 'text-cyan-400' : 'text-purple-500'} />
        </div>
      </motion.div>
      
      {/* Loading text */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <h2 className={`text-xl font-bold tracking-tight mb-2 ${
          darkMode ? 'text-white' : 'text-slate-700'
        }`}>
          Loading Reports
        </h2>
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className={`w-2 h-2 rounded-full ${
                darkMode ? 'bg-cyan-400' : 'bg-purple-500'
              }`}
            />
          ))}
        </div>
      </motion.div>
      
      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={`mt-4 text-sm ${
          darkMode ? 'text-zinc-500' : 'text-slate-400'
        }`}
      >
        Scanning the roads...
      </motion.p>
    </div>
  </div>
);

// --- MAIN APP ---

const App = () => {
  const [reports, setReports] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadPotholes();
    const interval = setInterval(loadPotholes, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll locking with proper cleanup
  useEffect(() => {
    if (showUpload || selectedPothole) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showUpload, selectedPothole]);

  const loadPotholes = async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/potholes?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(prev => {
          // Keep local items that haven't been synced to server yet
          // And merge votes from local state for existing items
          const serverIds = new Set(data.map(p => p.id));
          const localOnly = prev.filter(p => !serverIds.has(p.id) && p.isLocal);
          
          const localVotes = new Map(prev.map(p => [p.id, p.votes]));
          const mergedServerData = data.map(serverItem => ({
            ...serverItem,
            votes: Math.max(serverItem.votes, localVotes.get(serverItem.id) || 0)
          }));

          return [...localOnly, ...mergedServerData];
        });
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id) => {
    const report = reports.find(p => p.id === id);
    if (!report) return;
    
    const newVotes = report.votes + 1;
    
    // Celebrate milestones with dynamically loaded confetti
    if (newVotes % 10 === 0 && newVotes > 0) {
      loadConfetti().then(confettiFn => {
        confettiFn({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 },
          zIndex: 9999,
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#facc15']
        });
      });
    }

    // Optimistic update
    setReports(prev => prev.map(p => p.id === id ? { ...p, votes: newVotes } : p));
    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => ({ ...prev, votes: newVotes }));
    }

    // Sync to server using the pre-calculated newVotes (not stale)
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/potholes?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ votes: newVotes })
      });
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  const handleCreate = (newReport) => {
    setReports([newReport, ...reports]);
    setShowUpload(false);
  };

  const sortedByVotes = [...reports].sort((a, b) => b.votes - a.votes);
  const top3 = sortedByVotes.slice(0, 3);

  return (
    <div className={`min-h-screen transition-colors duration-300 noise-overlay ${
      darkMode 
        ? 'bg-[#0f1219] text-white' 
        : 'bg-[#e4e4e7] text-slate-700'
    }`}>
      {/* PROFESSIONAL GRADIENT BACKGROUND - Fixed for glass scroll effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base dark gradient */}
        <div className={`absolute inset-0 ${
          darkMode 
            ? 'bg-[#070b14]' 
            : 'bg-slate-50'
        }`} />
        
        {/* Primary cyan glow - top left */}
        <div 
          className={`absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] ${
            darkMode 
              ? 'bg-cyan-500/30' 
              : 'bg-cyan-400/20'
          }`}
        />
        
        {/* Secondary cyan glow - bottom right */}
        <div 
          className={`absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] ${
            darkMode 
              ? 'bg-cyan-600/25' 
              : 'bg-cyan-500/15'
          }`}
        />
        
        {/* Subtle blue accent - center */}
        <div 
          className={`absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full blur-[100px] ${
            darkMode 
              ? 'bg-blue-600/20' 
              : 'bg-blue-400/10'
          }`}
        />
        
        {/* Subtle noise texture */}
        <div className={`absolute inset-0 ${darkMode ? 'opacity-[0.03]' : 'opacity-[0.02]'}`} 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* LOADING SCREEN OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <LoadingScreen darkMode={darkMode} />
          </motion.div>
        )}
      </AnimatePresence>

      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        darkMode 
          ? 'bg-[#0f1219]/80 backdrop-blur-xl border-b border-white/5' 
          : 'bg-[#e4e4e7]/90 backdrop-blur-xl border-b border-black/5'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* LOGO */}
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${
              darkMode 
                ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_2px_8px_rgba(0,0,0,0.4)]' 
                : 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
            }`}>
              <Megaphone className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} size={18} />
            </div>
            <div className="hidden sm:block">
              <h1 className={`font-bold text-lg tracking-tight leading-none ${darkMode ? 'text-white' : 'text-slate-600'}`}>
                Mark<span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>My</span>Report
              </h1>
            </div>
          </div>

          {/* INLINE STATS - Center */}
          <div className={`hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur-md ${
            darkMode ? 'bg-white/5 border border-white/10' : 'bg-white/80 shadow-md'
          }`}>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>{reports.length}</span>
            <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Reports</span>
            <span className={`mx-2 text-xs ${darkMode ? 'text-zinc-600' : 'text-slate-300'}`}>•</span>
            <span className={`text-sm font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{reports.reduce((s, r) => s + r.votes, 0).toLocaleString()}</span>
            <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Votes</span>
          </div>
          
          {/* RIGHT CONTROLS */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUpload(true)}
              className={`h-10 px-4 rounded-full font-bold text-sm flex items-center gap-2 transition-all duration-200 ${
                darkMode 
                  ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-[0_4px_12px_rgba(6,182,212,0.4)]' 
                  : 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-[0_4px_12px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Camera size={16} />
              <span className="hidden sm:inline">Report</span>
            </motion.button>
            <SoundToggle soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} darkMode={darkMode} />
            <ModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="pt-24 pb-20 relative z-10">
        {/* LEGENDARY POTHOLES - Vertical title layout */}
        <section className="mb-16 max-w-7xl mx-auto px-4">
          <div className="flex items-stretch gap-6">
            {/* Vertical Title on Left */}
            <div className="hidden md:flex flex-col items-center justify-center py-4">
              <div className={`p-2.5 rounded-2xl mb-4 ${
                darkMode 
                  ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                  : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}>
                <Trophy size={20} className={darkMode ? 'text-amber-400' : 'text-amber-500'} />
              </div>
              <div className="writing-vertical transform -rotate-180" style={{ writingMode: 'vertical-rl' }}>
                <h2 className={`text-lg font-bold tracking-tight whitespace-nowrap ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                  Legendary Potholes
                </h2>
                <p className={`text-[10px] font-semibold tracking-wider mt-2 ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>
                  🏆 HALL OF INFAMY
                </p>
              </div>
            </div>

            {/* Mobile Title (horizontal) */}
            <div className="md:hidden flex items-center gap-3 mb-4 w-full">
              <div className={`p-2.5 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                  : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}>
                <Trophy size={20} className={darkMode ? 'text-amber-400' : 'text-amber-500'} />
              </div>
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-700'}`}>Legendary Potholes</h2>
                <p className={`text-xs font-semibold tracking-wider ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>🏆 HALL OF INFAMY</p>
              </div>
            </div>

            {/* Smaller 3-card grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {top3.map((p, i) => {
                const sizeInfo = getSizeFromSeverity(p.severity);
                const rank = i + 1;
                
                // Element Frame Logic
                let frameClass = '';
                if (p.votes >= 700) frameClass = 'electric-frame';
                else if (p.votes >= 600) frameClass = 'water-frame';
                else if (p.votes >= 500) frameClass = 'fire-frame';
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedPothole(p)}
                    className={`relative rounded-2xl overflow-hidden cursor-pointer backdrop-blur-xl border transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${frameClass} ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.3)]' 
                        : 'bg-white/10 border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    {/* Rank Badge - smaller */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className={`font-bold w-8 h-8 rounded-lg flex items-center justify-center text-xs backdrop-blur-md ${
                        rank === 1 
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-black shadow-[0_4px_12px_rgba(251,191,36,0.4)]' 
                          : rank === 2
                            ? 'bg-gradient-to-b from-slate-300 to-slate-400 text-slate-700'
                            : 'bg-gradient-to-b from-amber-600 to-amber-700 text-amber-100'
                      }`}>
                        #{rank}
                      </div>
                    </div>
                    
                    {/* Image - smaller aspect ratio */}
                    <div className="aspect-[4/3] relative overflow-hidden cursor-pointer">
                      <img src={p.image_url} alt={p.location} className="w-full h-full object-cover" />
                      {/* Severity badge */}
                      <div className={`absolute top-2 right-2 text-white text-[8px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                        darkMode ? 'bg-white/10' : 'bg-black/20'
                      }`}>
                        {sizeInfo.label}
                      </div>
                    </div>
                    
                    {/* Info section - compact */}
                    <div className={`p-3 ${darkMode ? 'bg-black/10' : 'bg-white/10'}`}>
                      <h4 className={`text-xs font-bold truncate mb-1.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{getDisplayLocation(p.location)}</h4>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{formatDate(p.created_at)}</span>
                        <UpvoteButton 
                          onVote={() => handleVote(p.id)} 
                          votes={p.votes} 
                          size="sm" 
                          darkMode={darkMode} 
                          soundEnabled={soundEnabled} 
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Vertical Stats Pill on Right */}
            <div className={`hidden md:flex flex-col items-center justify-center px-4 py-6 rounded-full backdrop-blur-xl ${
              darkMode 
                ? 'bg-white/5 border border-white/10' 
                : 'bg-white/10 border border-white/20'
            }`}>
              {/* Total Reports */}
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-medium tracking-wider ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  REPORTS
                </span>
                <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>
                  {reports.length}
                </span>
              </div>
              
              {/* Divider */}
              <div className={`w-6 h-px my-4 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
              
              {/* Total Votes */}
              <div className="flex flex-col items-center">
                <span className={`text-[9px] font-medium tracking-wider ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  VOTES
                </span>
                <span className={`text-lg font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>
                  {reports.reduce((s, r) => s + r.votes, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE FEED */}
        <section className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}>
              <Flame size={20} className={darkMode ? 'text-orange-400' : 'text-orange-500'} />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-700'}`}>Live Feed</h2>
              <p className={`text-xs font-semibold tracking-wider ${darkMode ? 'text-orange-400/70' : 'text-orange-600'}`}>🔥 FRESH FROM THE STREETS</p>
            </div>
          </div>
          
          {loading ? (
            <div className={`text-center py-16 rounded-3xl ${
              darkMode ? 'bg-white/5' : 'bg-white/10'
            }`}>
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  className={`w-12 h-12 rounded-full border-2 border-transparent mb-4 ${
                    darkMode ? 'border-t-cyan-400 border-r-purple-500' : 'border-t-purple-500 border-r-pink-400'
                  }`}
                />
                <p className={`font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>Loading reports...</p>
              </div>
            </div>
          ) : reports.length === 0 ? (
            <div className={`text-center py-16 rounded-3xl ${
              darkMode 
                ? 'bg-white/5' 
                : 'bg-white/10'
            }`}>
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? 'bg-white/5' : 'bg-slate-100'
              }`}>
                <Camera size={28} className={darkMode ? 'text-zinc-500' : 'text-slate-400'} />
              </div>
              <p className={`font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>No reports yet</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>Be the first to report a pothole!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {reports.map((p, i) => (
                  <ReportCard key={p.id} data={p} index={i} onVote={() => handleVote(p.id)} onSelect={setSelectedPothole} darkMode={darkMode} soundEnabled={soundEnabled} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <footer className={`relative z-10 py-12 text-center border-t ${
        darkMode 
          ? 'border-white/5' 
          : 'border-black/5'
      }`}>
        <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
          Built with 💙 using <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>React</span> & <span className={darkMode ? 'text-sky-400' : 'text-sky-600'}>Tailwind</span> by <span className={darkMode ? 'text-indigo-400' : 'text-indigo-600'}>d.veloper</span>
        </p>
        <p className={`text-[10px] mt-4 max-w-sm mx-auto leading-relaxed font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
          Disclaimer: This platform displays user-generated content. We do not assume responsibility for the accuracy or authenticity of reports submitted by the community.
        </p>
      </footer>

      {/* MODALS */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onCreate={handleCreate} darkMode={darkMode} />}
        {selectedPothole && (
          <PotholeDetailModal 
            data={selectedPothole} 
            onClose={() => setSelectedPothole(null)} 
            onVote={() => handleVote(selectedPothole.id)} 
            darkMode={darkMode} 
            soundEnabled={soundEnabled}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// StatCard component removed - was unused

const ReportCard = ({ data, index, onVote, onSelect, darkMode, soundEnabled }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);

  // Element Tier Logic (Mini Version for Feed)
  let frameClass = '';
  if (data.votes >= 700) frameClass = 'electric-frame';
  else if (data.votes >= 600) frameClass = 'water-frame';
  else if (data.votes >= 500) frameClass = 'fire-frame';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-3xl overflow-hidden backdrop-blur-xl border ${frameClass} ${
        darkMode 
          ? 'bg-white/5 border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.3)]' 
          : 'bg-white/10 border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.05)]'
      }`}
    >
      {/* Image with fallback */}
      <div className="aspect-square relative overflow-hidden cursor-pointer group" onClick={() => onSelect(data)}>
        <img 
          src={data.image_url} 
          alt={getDisplayLocation(data.location)} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="%23374151" width="400" height="400"/><text fill="%239ca3af" font-family="sans-serif" font-size="24" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Image Not Available</text></svg>';
          }}
        />
        <div className={`absolute top-3 left-3 text-white text-[9px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md ${
          darkMode ? 'bg-white/10' : 'bg-black/20'
        }`}>
          {sizeInfo.label}
        </div>
      </div>
      {/* Info section - semi-transparent */}
      <div className={`p-4 ${darkMode ? 'bg-black/10' : 'bg-white/10'}`}>
        <h4 className={`text-sm font-bold truncate mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{getDisplayLocation(data.location)}</h4>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>{formatDate(data.created_at)}</span>
          <UpvoteButton onVote={onVote} votes={data.votes} size="sm" darkMode={darkMode} soundEnabled={soundEnabled} />
        </div>
      </div>
    </motion.div>
  );
};

const PotholeDetailModal = ({ data, onClose, onVote, darkMode, soundEnabled }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const controls = useAnimation();
  const containerRef = useRef(null);

  const handleZoom = (delta) => {
    const nextZoom = Math.min(Math.max(zoom + delta, 1), 5);
    setZoom(nextZoom);
    controls.start({ scale: nextZoom });
    if (nextZoom === 1) controls.start({ x: 0, y: 0 });
    playPopSound(soundEnabled);
  };

  const resetZoom = () => {
    setZoom(1);
    controls.start({ scale: 1, x: 0, y: 0, transition: { type: 'spring', damping: 25 } });
    playPopSound(soundEnabled);
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
    resetZoom();
    playPopSound(soundEnabled);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl ${fullScreen ? 'z-[60]' : ''} ${
        darkMode ? 'bg-[#1a1d2e]/95' : 'bg-[#e4e4e7]/95'
      }`}
    >
      <motion.div 
        layout
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className={`w-full max-w-5xl rounded-[2rem] overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${
          darkMode 
            ? 'bg-[#1e2235] shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-[#e8e8ec] shadow-[12px_12px_40px_#c8c8cc,-12px_-12px_40px_#ffffff,inset_0_1px_0_rgba(255,255,255,0.7)]'
        } ${fullScreen ? 'fixed inset-0 max-w-none rounded-none h-screen' : ''}`}
      >
        {/* IMAGE INSPECTOR */}
        <div ref={containerRef} className={`relative flex-1 overflow-hidden group cursor-crosshair ${darkMode ? 'bg-black/30' : 'bg-slate-300/50'} ${fullScreen ? 'h-full' : 'aspect-square md:aspect-auto'}`}>
          <motion.div 
            className="w-full h-full flex items-center justify-center"
            animate={controls}
            initial={{ scale: 1, x: 0, y: 0 }}
            drag={zoom > 1}
            dragConstraints={{
              left: -zoom * 200,
              right: zoom * 200,
              top: -zoom * 200,
              bottom: zoom * 200
            }}
            dragElastic={0.1}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
          >
            <img 
              src={data.image_url} 
              className={`w-full h-full object-contain select-none pointer-events-none transition-transform duration-200 ${isDragging ? 'scale-[1.01]' : ''}`} 
              alt="Pothole Inspection" 
            />
          </motion.div>

          {/* HUD CONTROLS */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl z-50">
            <button onClick={() => handleZoom(0.5)} className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Zoom In"><ZoomIn size={18} /></button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={() => handleZoom(-0.5)} className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Zoom Out"><ZoomOut size={18} /></button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={resetZoom} className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title="Reset Camera"><RotateCcw size={18} /></button>
            <div className="w-px h-6 bg-white/10" />
            <button onClick={toggleFullScreen} className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors" title={fullScreen ? "Exit Full Screen" : "Enter Full Screen"}>
              {fullScreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>

          <div className={`absolute top-6 left-6 text-[10px] font-bold px-4 py-2 rounded-full flex items-center gap-2 z-50 ${
            darkMode 
              ? 'bg-white/10 text-white backdrop-blur-md' 
              : 'bg-black/10 text-slate-700 backdrop-blur-md'
          }`}>
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            {fullScreen ? 'Cinematic Mode' : `${sizeInfo.label} Damage`}
          </div>

          {fullScreen && (
            <button 
              onClick={toggleFullScreen}
              className={`absolute top-6 right-6 p-4 rounded-full backdrop-blur-md transition-all z-50 ${
                darkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-black/10 hover:bg-black/20 text-slate-700'
              }`}
            >
              <X size={24} />
            </button>
          )}
        </div>
        
        {!fullScreen && (
          <div className="w-full md:w-96 p-8 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className={`p-3 rounded-2xl ${
                darkMode 
                  ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                  : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}>
                <ShameIcon size={24} className={darkMode ? 'text-amber-400' : 'text-amber-600'} />
              </div>
              <button onClick={onClose} className={`p-2.5 rounded-full transition-all ${
                darkMode ? 'bg-white/5 hover:bg-white/10 text-zinc-400' : 'bg-black/5 hover:bg-black/10 text-slate-500'
              }`}>
                <X size={20} />
              </button>
            </div>
            
            <h2 className={`text-2xl font-bold tracking-tight mb-1 ${darkMode ? 'text-white' : 'text-slate-700'}`}>{sizeInfo.title}</h2>
            <p className={`text-sm flex items-center gap-1.5 mb-8 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              <MapPin size={14} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} /> {getDisplayLocation(data.location)}
            </p>
            
            <div className={`p-6 rounded-2xl mb-8 ${
              darkMode 
                ? 'bg-black/20 shadow-inner' 
                : 'bg-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]'
            }`}>
              <label className={`text-[10px] font-medium tracking-wider block mb-4 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>THREAT LEVEL</label>
              <UpvoteButton onVote={onVote} votes={data.votes} size="md" darkMode={darkMode} soundEnabled={soundEnabled} />
              <p className={`text-[10px] mt-4 leading-relaxed ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>Higher votes increase repair priority.</p>
            </div>
            
            <div className={`mt-auto pt-6 border-t flex items-center gap-3 ${darkMode ? 'border-white/5' : 'border-black/5'}`}>
              <div className={`p-2 rounded-xl ${
                darkMode 
                  ? 'bg-white/5' 
                  : 'bg-black/5'
              }`}>
                <Calendar size={14} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
              </div>
              <span className={`text-xs font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Reported {formatDate(data.created_at)}</span>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const UploadModal = ({ onClose, onCreate, darkMode }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [severity, setSeverity] = useState(1);
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [model, setModel] = useState(null);
  const [isPothole, setIsPothole] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const initAI = async () => {
      if (window.tmImage) {
        try {
          const m = await window.tmImage.load('/pothole_model/model.json', '/pothole_model/metadata.json');
          setModel(m);
        } catch (e) {
          console.error("AI Model Load Failed", e);
        }
      }
    };
    initAI();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      
      try {
        // Use free Nominatim API (OpenStreetMap) for reverse geocoding
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        
        // Extract the most relevant name (road, suburb, or city)
        const name = data.address.road || data.address.suburb || data.address.city || data.address.neighborhood;
        const coords = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        
        if (name) {
          setLocation(name);
        } else {
          // Fallback to city/town/village name if street is missing
          const fallbackName = data.address.city || data.address.town || data.address.village || data.address.state || 'Somewhere on Earth';
          setLocation(fallbackName);
        }
      } catch (err) {
        console.warn("Reverse geocoding failed, falling back to raw GPS", err);
        setLocation(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      } finally {
        setIsLocating(false);
        playPopSound(true);
      }
    }, () => {
      alert("Unable to retrieve your location. Check your browser permissions.");
      setIsLocating(false);
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  };

  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    
    setFile(f);
    const previewUrl = URL.createObjectURL(f);
    setPreview(previewUrl);
    
    if (!model) return;
    
    setScanning(true);
    setIsPothole(false);
    setAiStatus('AI SCANNING...');
    
    try {
      // 1. Visual Delay for scanning feel
      await new Promise(r => setTimeout(r, 1200));

      // 2. Real AI Prediction with error handling
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      const predictions = await model.predict(img);
      const potholeScore = predictions.find(p => p.className === 'Pothole')?.probability || 0;

      if (potholeScore < 0.5) {
        setAiStatus('NO POTHOLE DETECTED ❌');
        setIsPothole(false);
        await new Promise(r => setTimeout(r, 2500));
        setAiStatus('');
        setFile(null);
        setPreview(null);
      } else {
        setAiStatus(`MATCH: ${(potholeScore * 100).toFixed(0)}% ✅`);
        setIsPothole(true);
        await new Promise(r => setTimeout(r, 1000));
        setAiStatus('');
      }
    } catch (err) {
      console.error("Detection Error:", err);
    } finally {
      setScanning(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !location || !isPothole) return;
    setUploading(true);
    setAiStatus('UPLOADING TO SUPABASE...');
    
    try {
      // Convert image to base64 for persistence
      const reader = new FileReader();
      const base64Promise = new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      const base64Image = await base64Promise;

      const reportData = {
        image_url: base64Image,
        location,
        severity,
        votes: 0,
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/potholes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(reportData)
      });

      if (!response.ok) throw new Error('Failed to save to database');
      const savedData = await response.json();
      const finalReport = savedData[0] || { ...reportData, id: Math.random().toString(), isLocal: true };

      setUploadSuccess(true);
      setUploading(false);
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10001,
        colors: ['#06b6d4', '#22d3ee', '#ffffff']
      });

      setTimeout(() => {
        onCreate(finalReport);
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setAiStatus('UPLOAD FAILED ❌');
      setUploading(false);
      alert('Failed to save report to database. Please check your connection.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl ${
        darkMode ? 'bg-[#1a1d2e]/90' : 'bg-[#e4e4e7]/90'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-md rounded-[2rem] p-8 transition-all duration-300 ${
          darkMode 
            ? 'bg-[#1e2235] shadow-[0_24px_80px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-[#e8e8ec] shadow-[12px_12px_40px_#c8c8cc,-12px_-12px_40px_#ffffff,inset_0_1px_0_rgba(255,255,255,0.7)]'
        }`}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}>
              <Camera size={20} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
            </div>
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-700'}`}>Report Pothole</h2>
          </div>
          <button onClick={onClose} className={`p-2.5 rounded-full transition-all ${
            darkMode 
              ? 'bg-white/5 hover:bg-white/10 text-zinc-400' 
              : 'bg-black/5 hover:bg-black/10 text-slate-500'
          }`}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {uploadSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  darkMode 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-green-500/10 text-green-600'
                }`}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <Trophy size={40} />
                  </motion.div>
                </div>
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-700'}`}>Report Submitted!</h3>
                  <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>You just earned +10 respect</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-5" exit={{ opacity: 0, x: -20 }}>
                {/* Image Upload Area */}
                <div 
                  onClick={() => !scanning && !uploading && document.getElementById('pothole-file').click()}
                  className={`cursor-pointer aspect-video rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all group ${
                    darkMode 
                      ? 'bg-black/20 shadow-inner hover:bg-black/30' 
                      : 'bg-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] hover:bg-white/70'
                  } ${scanning || uploading ? 'cursor-wait opacity-80' : ''}`}
                >
                  {preview ? (
                    <div className="relative w-full h-full">
                      <img src={preview} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                      {scanning && (
                        <>
                          <motion.div 
                            initial={{ top: '-10%' }}
                            animate={{ top: '110%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_12px_#22d3ee] z-10"
                          />
                          <div className="absolute inset-0 bg-cyan-500/5" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`backdrop-blur-md px-4 py-2 rounded-full ${
                              darkMode ? 'bg-black/50 border border-white/10' : 'bg-white/80 border border-black/5'
                            }`}>
                              <span className={`font-bold text-[10px] tracking-wider animate-pulse ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{aiStatus}</span>
                            </div>
                          </div>
                        </>
                      )}
                      {!scanning && isPothole && (
                         <div className={`absolute top-3 right-3 p-1.5 rounded-full ${
                           darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-600'
                         }`}>
                            <Trophy size={12} />
                         </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className={`p-4 rounded-2xl mb-3 transition-all ${
                        darkMode 
                          ? 'bg-white/5 group-hover:bg-cyan-500/10' 
                          : 'bg-black/5 group-hover:bg-cyan-500/5'
                      }`}>
                        <Upload size={24} className={`transition-colors ${darkMode ? 'text-zinc-500 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-600'}`} />
                      </div>
                      <span className={`text-sm font-medium transition-colors ${darkMode ? 'text-zinc-500 group-hover:text-cyan-400' : 'text-slate-400 group-hover:text-cyan-600'}`}>Click to upload photo</span>
                      <span className={`text-[10px] mt-1 ${darkMode ? 'text-zinc-600' : 'text-slate-300'}`}>JPG, PNG up to 10MB</span>
                    </>
                  )}
                  <input id="pothole-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={scanning || uploading} />
                </div>

                <div>
                  <label className={`text-[10px] font-medium tracking-wider block mb-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>LOCATION</label>
                  <div className={`relative flex items-center p-1.5 rounded-2xl transition-all ${
                    darkMode 
                      ? 'bg-black/20 shadow-inner' 
                      : 'bg-white/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]'
                  } focus-within:ring-2 focus-within:ring-cyan-400/30`}>
                    <input 
                      type="text" 
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Baker Street Park"
                      className={`flex-1 bg-transparent p-3 font-medium outline-none text-sm ${
                        darkMode ? 'text-white placeholder-zinc-600' : 'text-slate-700 placeholder-slate-300'
                      }`}
                    />
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={detectLocation}
                      disabled={isLocating}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        darkMode 
                          ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' 
                          : 'bg-white text-cyan-600 shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
                      } ${isLocating ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {isLocating ? <Loader2 size={14} className="animate-spin" /> : <LocateFixed size={14} />}
                      <span>{isLocating ? 'Finding...' : 'Detect'}</span>
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className={`text-[10px] font-medium tracking-wider block mb-2 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>SEVERITY</label>
                  <div className="flex gap-2">
                    {SIZES.map(s => (
                      <button 
                        key={s.level}
                        onClick={() => setSeverity(s.level)}
                        className={`flex-1 py-3 rounded-xl transition-all font-bold text-xs ${
                          severity === s.level 
                            ? `${s.color} text-white shadow-lg` 
                            : darkMode 
                              ? 'bg-black/20 text-zinc-500 hover:bg-black/30 shadow-inner' 
                              : 'bg-white/50 text-slate-400 hover:bg-white/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={handleUpload}
                  disabled={uploading || scanning || !file || !location || !isPothole}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                    darkMode 
                      ? 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-[0_8px_24px_rgba(6,182,212,0.3)]' 
                      : 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white shadow-[0_8px_24px_rgba(6,182,212,0.2)]'
                  }`}
                >
                  {uploading ? 'Analyzing Metadata...' : 'Submit Report'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Wrap App with ErrorBoundary for graceful error handling
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
