import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Lazy load MapView to defer Leaflet bundle (~40KB) until map is opened
const MapView = lazy(() => import('./MapView'));


// A short audio clip for the vote action
const VOTE_SOUND_B64 = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACA";

// Load confetti library dynamically to improve performance
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
  Trophy,
  Award,
  Map as MapIcon,
  Menu,
  Coffee,
  Activity,
  Zap,
  Cog,
  Skull,
  Waves,
  AlertTriangle,
  Circle
} from 'lucide-react';


const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

const SIZES = [
  { level: 1, label: 'Mild', title: 'Coffee Spiller', color: 'bg-cyan-400', textColor: 'text-cyan-400', icon: Coffee },
  { level: 2, label: 'Moderate', title: 'Ankle Breaker', color: 'bg-sky-500', textColor: 'text-sky-500', icon: Activity },
  { level: 3, label: 'Serious', title: 'Spine Adjuster', color: 'bg-blue-500', textColor: 'text-blue-500', icon: Zap },
  { level: 4, label: 'Severe', title: 'Rim Reaper', color: 'bg-indigo-500', textColor: 'text-indigo-500', icon: Cog },
  { level: 5, label: 'Critical', title: 'Suspension Assassin', color: 'bg-violet-500', textColor: 'text-violet-500', icon: Skull },
  { level: 6, label: 'Extreme', title: 'Swimming Pool', color: 'bg-fuchsia-500', textColor: 'text-fuchsia-500', icon: Waves },
  { level: 7, label: 'Catastrophic', title: 'Pedestrian Abyss', color: 'bg-rose-500', textColor: 'text-rose-500', icon: AlertTriangle },
  { level: 8, label: 'Apocalyptic', title: 'Black Hole', color: 'bg-red-600', textColor: 'text-red-600', icon: Circle }
];

// Returns the size and color configuration for a given severity level
const getSizeFromSeverity = (sev) => SIZES.find(s => s.level === Number(sev)) || SIZES[0];

// Returns the aura configuration based on rank (top 3 only)
const getAuraByRank = (rank) => {
  if (rank === 1) return { label: 'Pyro Aura', className: 'element-label-fire', frameClass: 'fire-frame' };
  if (rank === 2) return { label: 'Electro Aura', className: 'element-label-electric', frameClass: 'electric-frame' };
  if (rank === 3) return { label: 'Hydro Aura', className: 'element-label-water', frameClass: 'water-frame' };
  return null;
};

// Animated blob background for dark mode
const BlobBackground = () => {
  const canvasRef = useRef(null);
  const blobsRef = useRef([]);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Deep, rich colors - mostly blues/teals/navys, very little purple, no bright whites
    const COLORS = [
      '#0f172a', // Slate 900
      '#1e3a8a', // Blue 900
      '#172554', // Blue 950
      '#0e7490', // Cyan 700
      '#155e75', // Cyan 800
      '#1e40af', // Blue 800
      '#312e81', // Indigo 900 (subtle purple)
    ];

    class BlobParticle {
      constructor() {
        // Spawn anywhere on screen
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Consistent slow drift
        this.vx = (Math.random() - 0.5) * 0.8; 
        this.vy = (Math.random() - 0.5) * 0.8;
        
        // Large, overlapping shapes to fill space
        const baseSize = Math.max(width, height) * 0.4;
        this.rx = Math.random() * baseSize + 100;
        this.ry = Math.random() * baseSize + 100;
        
        this.angle = Math.random() * Math.PI * 2;
        this.va = (Math.random() - 0.5) * 0.001;
        
        this.colorHex = COLORS[Math.floor(Math.random() * COLORS.length)];
        // Lower opacity to ensure text remains readable
        this.alpha = Math.random() * 0.3 + 0.1;
        
        this.pulseSpeed = Math.random() * 0.001 + 0.0005;
        this.pulseOffset = Math.random() * Math.PI * 2;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.angle += this.va;
        
        // Wrap around edges for infinite flow instead of bouncing/centering
        const margin = Math.max(this.rx, this.ry);
        if (this.x < -margin) this.x = width + margin;
        if (this.x > width + margin) this.x = -margin;
        if (this.y < -margin) this.y = height + margin;
        if (this.y > height + margin) this.y = -margin;
        
        const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset);
        this.currentRx = this.rx * (1 + pulse * 0.1);
        this.currentRy = this.ry * (1 + pulse * 0.1);
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const maxR = Math.max(this.currentRx, this.currentRy);
        // Soft diffuse gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, maxR);
        gradient.addColorStop(0, this.colorHex);
        gradient.addColorStop(0.5, this.colorHex); // Extend core a bit
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.currentRx, this.currentRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // Increased count to fill the "black space"
    blobsRef.current = Array.from({ length: 20 }, () => new BlobParticle());

    // Throttle to 24fps to save CPU/battery
    const targetFps = 24;
    const frameInterval = 1000 / targetFps;
    let lastFrameTime = 0;

    const animate = (currentTime) => {
      animationRef.current = requestAnimationFrame(animate);
      
      const elapsed = currentTime - lastFrameTime;
      if (elapsed < frameInterval) return;
      lastFrameTime = currentTime - (elapsed % frameInterval);

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'screen';
      blobsRef.current.forEach(blob => { blob.update(); blob.draw(ctx); });
      ctx.globalCompositeOperation = 'source-over';
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />
      {/* Vignette overlay for depth */}
      <div className="fixed inset-0 pointer-events-none" style={{ 
        zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)'
      }} />
    </>
  );
};

// Formats the location object or string into a user-friendly display string
const getDisplayLocation = (loc) => {
  if (!loc) return 'Somewhere on Earth';
  

    if (typeof loc === 'object' && !Array.isArray(loc)) {
    return loc.name || loc.address || 'Unknown Location';
  }

  if (loc === 'Unknown Location' || loc.startsWith('GPS:')) return 'Somewhere on Earth';
  if (loc.includes(' (GPS:')) return loc.split(' (GPS:')[0];
  return loc.split(',')[0].trim();
};

// Converts a date string into a relative time string (e.g. "2h ago")
const formatDate = (dateStr) => {
  if (!dateStr) return 'Unknown';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
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
};


const ShameIcon = ({ size = 24, className = '' }) => (
  <svg viewBox="0 0 1800 1800" fill="currentColor" width={size} height={size} className={className}>
    <path d="M803.722,820.892l-247.878-247.87l71.705-71.702l247.875,247.871l40.808-40.802L655.949,448.104l74.925-74.921c0.596-0.596,1.147-1.216,1.682-1.86c0.592-0.499,1.175-1.006,1.735-1.562l135.512-135.512c11.126-11.12,11.292-29.106,0.366-40.43l-1.538-1.606c-1.284-1.349-2.572-2.693-3.893-4.018C796.995,120.454,709.056,80.01,629.497,80.01c-53.655,0-99.814,17.796-133.483,51.468c-0.733,0.73-1.409,1.503-2.053,2.3c-0.443,0.388-0.89,0.765-1.309,1.183L185.294,442.324c-11.267,11.271-11.267,29.539,0,40.81l45.403,45.399l-37.493,37.493l-45.403-45.408c-5.414-5.41-12.752-8.453-20.405-8.453c-7.652,0-14.99,3.043-20.404,8.453L12.869,614.75c-11.268,11.271-11.268,29.538,0,40.802l197.415,197.416c5.414,5.41,12.752,8.454,20.404,8.454c7.653,0,14.995-3.043,20.405-8.454l94.115-94.13c11.268-11.264,11.268-29.531,0-40.802l-45.395-45.399l37.493-37.493l45.395,45.399c5.636,5.636,13.019,8.446,20.405,8.446c7.383,0,14.77-2.818,20.401-8.446l79.124-79.124l260.285,260.285L803.722,820.892z M629.497,137.719c58.812,0,124.33,28.287,178.733,76.497l-94.34,94.334L559.981,154.64C579.485,143.503,603.046,137.719,629.497,137.719z M230.688,791.756L74.079,635.15l53.317-53.321l156.602,156.605L230.688,791.756z M261.089,629.749l-24.999-24.999l35.408-35.408l24.998,24.998L261.089,629.749z M403.106,619.331L246.505,462.725L513.058,196.17l156.609,156.612L403.106,619.331z"/>
    <path d="M1763.996,1556.146l-593.695-593.688l-40.803,40.801l573.296,573.296l-71.701,71.709l-573.303-573.303l-40.803,40.81l593.704,593.705c5.41,5.408,12.752,8.452,20.401,8.452c7.657,0,14.999-3.044,20.409-8.452l112.502-112.521C1775.268,1585.686,1775.268,1567.418,1763.996,1556.146z"/>
    <path d="M1780.444,264.271c-3.269-9.372-11.135-16.4-20.812-18.614c-9.67-2.206-19.806,0.708-26.825,7.729l-116.585,116.576l-109.307-109.315l116.585-116.57c7.02-7.021,9.942-17.156,7.729-26.833c-2.214-9.679-9.243-17.541-18.614-20.814c-29.071-10.149-59.48-15.298-90.379-15.298c-73.062,0-141.743,28.449-193.397,80.104c-51.671,51.66-80.123,120.344-80.123,193.406c0,35.343,6.723,69.648,19.442,101.514l-736.242,736.236c-31.861-12.721-66.158-19.435-101.497-19.435c-73.058,0-141.744,28.452-193.407,80.115c-73.802,73.801-99.243,185.193-64.809,283.775c3.272,9.372,11.134,16.4,20.812,18.614c9.673,2.206,19.809-0.7,26.833-7.72l116.581-116.586l109.315,109.299l-116.585,116.586c-7.021,7.02-9.938,17.155-7.729,26.833c2.214,9.677,9.242,17.534,18.613,20.812c29.064,10.152,59.468,15.296,90.372,15.304c0.008,0,0.008,0,0.016,0c73.042,0,141.728-28.46,193.39-80.122c79.559-79.566,99.726-196.352,60.563-294.822l736.347-736.333c31.865,12.728,66.162,19.443,101.506,19.443c0.008,0,0,0,0.008,0c73.046,0,141.736-28.444,193.391-80.106C1789.438,474.246,1814.878,362.854,1780.444,264.271z M583.011,1599.065c-40.762,40.763-94.948,63.216-152.58,63.216c0,0-0.012,0-0.016,0c-7.915-0.008-15.792-0.436-23.602-1.28l100.137-100.138c5.414-5.417,8.454-12.752,8.454-20.408c0-7.648-3.04-14.99-8.454-20.4L356.83,1369.946c-11.263-11.264-29.535-11.264-40.806,0l-100.072,100.072c-6.835-64.134,15.333-129.603,61.871-176.146c40.762-40.762,94.952-63.207,152.597-63.207c57.64,0,111.83,22.445,152.588,63.215C667.146,1378.013,667.146,1514.926,583.011,1599.065z M659.282,1288.535l-70.945-70.951l702.501-702.488l70.953,70.944L659.282,1288.535z M1674.832,507.246c-40.761,40.753-94.951,63.199-152.596,63.199S1410.394,548,1369.632,507.238c-40.753-40.762-63.207-94.953-63.207-152.597s22.454-111.834,63.216-152.598c40.753-40.758,94.951-63.204,152.596-63.204c7.922,0,15.796,0.429,23.605,1.28l-100.137,100.127c-5.411,5.41-8.453,12.752-8.453,20.4c0,7.657,3.042,14.991,8.453,20.401l150.108,150.117c11.271,11.271,29.547,11.271,40.81,0.008l100.072-100.073C1743.531,395.234,1721.367,460.704,1674.832,507.246z"/>
  </svg>
);

// Plays a sound effect if enabled, reusing the audio object
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



// Button component that handles upvoting with animations
const UpvoteButton = ({ onVote, votes = 0, size = "md", darkMode = true, soundEnabled = true }) => {
  const sizes = {
    sm: { height: "h-8", padding: "px-3", icon: 12, text: "text-[11px]" },
    md: { height: "h-9", padding: "px-3.5", icon: 14, text: "text-xs" },
  };
  
  const s = sizes[size] || sizes.md;
  const controls = useAnimation();
  const [burstKey, setBurstKey] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    playPopSound(soundEnabled);
    setIsAnimating(true);
    
    controls.stop();
    controls.start({
      scale: [1, 1.45, 0.9, 1.1, 1],
      transition: { duration: 0.45, ease: "easeOut" }
    });
    
    setBurstKey(prev => prev + 1);
    onVote();
    
    // Reset active state after animation
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      animate={controls}
      onClick={handleClick}
      className={`relative ${s.height} ${s.padding} rounded-full font-bold ${s.text} transition-all duration-200 flex items-center gap-2 flex-shrink-0 ${
        isAnimating && darkMode
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_20px_rgba(34,211,238,0.5)]'
          : isAnimating
            ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
            : darkMode 
              ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-[#323d5e] hover:to-[#252f4e]' 
              : 'bg-white text-cyan-600 shadow-[0_2px_8px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]'
      }`}
    >

      <motion.svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        width={s.icon} 
        height={s.icon}
        animate={burstKey > 0 ? { 
          rotate: [0, -20, 20, -10, 10, 0],
          scale: [1, 1.4, 1] 
        } : {}}
        key={`svg-${burstKey}`}
        transition={{ duration: 0.5 }}
        className={isAnimating ? 'text-white' : (darkMode ? 'text-cyan-400' : 'text-cyan-500')}
      >
        <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
      </motion.svg>
      

      <div className="relative h-[1.2em] flex items-center min-w-[1.2em]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={votes}
            initial={{ y: 20, opacity: 0, scale: 0.5 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
            className={`inline-block font-bold tracking-wide ${isAnimating ? 'text-white' : ''}`}
          >
            {votes}
          </motion.span>
        </AnimatePresence>
      </div>


      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          <motion.div
            key={burstKey}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            {burstKey > 0 && [...Array(12)].map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180;
              const colors = ['#22d3ee', '#c084fc', '#f472b6', '#34d399'];
              const color = colors[i % 4];
              return (
                <motion.div
                  key={`${burstKey}-${i}`}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    x: Math.cos(angle) * (40 + Math.random() * 20),
                    y: Math.sin(angle) * (40 + Math.random() * 20),
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.button>
  );
};


// Component to toggle between light and dark themes
const ModeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setDarkMode(!darkMode)}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
        darkMode 
          ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-amber-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-[#323d5e] hover:to-[#252f4e]' 
          : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={darkMode ? 'dark' : 'light'}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
};

// Component to toggle sound effects
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


// Full screen loading indicator with animations
const LoadingScreen = ({ darkMode }) => {
  const [msg] = useState(() => [
    "Scanning Galaxy for Potholes...",
    "Calibrating suspension sensors...",
    "Locating rim benders...",
    "Loading public enemies...",
    "Preparing mental map...",
    "Searching for tire traps..."
  ][Math.floor(Math.random() * 6)]);

  return (
  <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-colors duration-300 ${
    darkMode ? 'bg-[#02040a]' : 'bg-[#e4e4e7]'
  }`}>

    <div className={`absolute inset-0 ${
      darkMode 
        ? 'bg-[#02040a]'  
        : 'bg-gradient-to-br from-[#e4e4e7] via-[#f1f5f9] to-[#e2e8f0]'
    }`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[100px] ${darkMode ? 'bg-cyan-900/40' : 'bg-cyan-300/70'}`} />
        <div className={`absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full blur-[100px] ${darkMode ? 'bg-blue-900/40' : 'bg-cyan-300/70'}`} />
        <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[100px] ${darkMode ? 'bg-indigo-900/40' : 'bg-blue-300/80'}`} />
      </div>
    </div>
    

    <div className="relative z-10 flex flex-col items-center">

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative mb-8"
      >

        <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${
          darkMode ? 'bg-cyan-400' : 'bg-cyan-500'
        }`} style={{ animationDuration: '2s' }} />
        

        <div className={`relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-xl ${
          darkMode 
            ? 'bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(6,182,212,0.3)]' 
            : 'bg-white/70 border border-white/50 shadow-[0_0_60px_rgba(6,182,212,0.2)]'
        }`}>

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2"
          >
            <div className={`w-full h-full rounded-full border-2 border-transparent ${
              darkMode ? 'border-t-cyan-400 border-r-blue-500' : 'border-t-cyan-500 border-r-blue-400'
            }`} />
          </motion.div>
          

          <div 
            className={`w-8 h-8 ${darkMode ? 'bg-cyan-400' : 'bg-cyan-500'}`}
            style={{
              maskImage: 'url(/assets/hole-emoji-smiley-svgrepo-com.svg)',
              maskSize: 'contain',
              maskRepeat: 'no-repeat',
              maskPosition: 'center',
              WebkitMaskImage: 'url(/assets/hole-emoji-smiley-svgrepo-com.svg)',
              WebkitMaskSize: 'contain',
              WebkitMaskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center'
            }}
          />
        </div>
      </motion.div>
      

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center"
      >
        <h2 className={`text-xl font-bold tracking-tight mb-2 ${
          darkMode ? 'text-white' : 'text-slate-700'
        }`}>
          Quantifying Asphalt Neglect...
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
                darkMode ? 'bg-cyan-400' : 'bg-cyan-500'
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
        {msg}
      </motion.p>

    </div>
  </div>
);
};



// Main application component containing state and routing logic
const App = () => {
  const [reports, setReports] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    loadPotholes();
    const interval = setInterval(loadPotholes, 10000);
    return () => clearInterval(interval);
  }, []);


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

  // Fetches pothole reports from the database and merges them with local data
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
          const mergedServerData = data.map(serverItem => {
            let loc = serverItem.location;
            try {

              if (typeof loc === 'string' && loc.startsWith('{')) {
                loc = JSON.parse(loc);
              }
            } catch (e) {
              console.warn('Failed to parse location', e);
            }
            return {
              ...serverItem,
              location: loc,
              votes: Math.max(serverItem.votes, localVotes.get(serverItem.id) || 0)
            };
          });

          return [...localOnly, ...mergedServerData];
        });
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handles the vote action, updates local state, and syncs with server
  const handleVote = async (id) => {
    const report = reports.find(p => p.id === id);
    if (!report) return;
    
    const newVotes = report.votes + 1;
    
    // Trigger confetti if milestone reached
    if (newVotes % 100 === 0 && newVotes > 0) {
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


    setReports(prev => prev.map(p => p.id === id ? { ...p, votes: newVotes } : p));
    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => ({ ...prev, votes: newVotes }));
    }

    // Sync to server using the pre-calculated newVotes
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

  // Adds a new report to the local list
  const handleCreate = (newReport) => {
    setReports([newReport, ...reports]);
    setShowUpload(false);
  };

  const sortedByVotes = [...reports].sort((a, b) => b.votes - a.votes);
  const top3 = sortedByVotes.slice(0, 3);

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-300 noise-overlay ${
      darkMode 
        ? 'bg-[#02040a] text-white' 
        : 'bg-[#e4e4e7] text-slate-700'
    }`}>
      {/* Animated Blob Background for both modes */}
      <BlobBackground />
      
      {/* Noise overlay */}
      <div className={`fixed inset-0 pointer-events-none ${darkMode ? 'opacity-[0.03]' : 'opacity-[0.02]'}`} 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />


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
          ? 'bg-gradient-to-r from-[#0f1219]/90 via-[#131a28]/80 to-[#0f1219]/90 backdrop-blur-xl border-b border-white/5' 
          : 'bg-white/10 backdrop-blur-xl border-b border-white/20'
      }`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div 
              className={`w-8 h-8 ${darkMode ? 'bg-cyan-400' : 'bg-cyan-600'}`}
              style={{
                maskImage: 'url(/assets/hole-emoji-smiley-svgrepo-com.svg)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                WebkitMaskImage: 'url(/assets/hole-emoji-smiley-svgrepo-com.svg)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center'
              }}
            />
            <div>
              <h1 className={`font-bold text-lg tracking-tight leading-none ${darkMode ? 'text-white' : 'text-slate-600'}`}>
                Mark<span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>My</span>Pothole
              </h1>
              <p className={`text-[10px] font-medium tracking-wide ${darkMode ? 'text-zinc-400' : 'text-slate-400'}`}>
                They ignore it, <span className="text-cyan-400 font-bold">we expose it</span>.
              </p>
            </div>
          </div>


          

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUpload(true)}
              className={`h-11 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 focus-ring ${
                darkMode 
                  ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-[#323d5e] hover:to-[#252f4e]' 
                  : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
              }`}
            >
              <Camera size={16} />
              <span>Mark</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMap(true)}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                darkMode 
                  ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] hover:from-[#323d5e] hover:to-[#252f4e]' 
                  : 'bg-white/80 border border-white/60 text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
              }`}
            >
              <MapIcon size={20} />
            </motion.button>
            <SoundToggle soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} darkMode={darkMode} />
            <ModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`sm:hidden p-2 rounded-xl transition-all ${
              darkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'
            }`}
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-x-0 top-16 z-30 p-4 border-b sm:hidden ${
              darkMode 
                ? 'bg-[#0f1219]/95 border-white/10 text-white backdrop-blur-xl' 
                : 'bg-white/95 border-black/5 text-slate-800 backdrop-blur-xl'
            }`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-2">
                <span className="font-semibold">Map View</span>
                <motion.button
                  onClick={() => { setShowMap(true); setShowMobileMenu(false); }}
                  className={`p-2 rounded-lg ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}
                >
                  <MapIcon size={20} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                </motion.button>
              </div>
              
              <div className="flex items-center justify-between p-2">
                <span className="font-semibold">Sound Effects</span>
                <SoundToggle soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} darkMode={darkMode} />
              </div>
              
              <div className="flex items-center justify-between p-2">
                <span className="font-semibold">Dark Mode</span>
                <ModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button (Mobile) */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowUpload(true)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center sm:hidden transition-all focus-ring ${
          darkMode
            ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]'
            : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-white/60'
        }`}
      >
        <Camera size={24} />
      </motion.button>


      <main className="pt-24 pb-20 relative z-10">

        <section className="mb-8 max-w-6xl mx-auto px-4">
          <div className={`p-6 rounded-[2.5rem] border backdrop-blur-md transition-all duration-300 ${
            darkMode 
              ? 'bg-white/5 border-white/10 shadow-[inner_0_0_40px_rgba(0,0,0,0.2)]' 
              : 'bg-white/10 border-white/50 shadow-xl ring-1 ring-white/50'
          }`}>

            <div className="flex flex-col items-center justify-center mb-2 text-center">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl backdrop-blur-md ${
                  darkMode 
                    ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                    : 'bg-white/80 border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                }`}>
                  <Award size={22} className={darkMode ? 'text-cyan-400' : 'text-cyan-500'} />
                </div>
                <h2 className={`text-2xl md:text-3xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Legendary Potholes
                </h2>
              </div>
              
              <div className={`flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase ${darkMode ? 'text-cyan-400/90' : 'text-cyan-600'}`}>
                <span className="w-6 h-px bg-current opacity-50"></span>
                <span>Hall of Shame</span>
                <span className="w-6 h-px bg-current opacity-50"></span>
              </div>
            </div>

            <p className={`text-center text-[11px] sm:text-xs mb-6 px-4 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
              Earned their <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>elemental aura</span> through pure destructive power
            </p>

            {/* Podium Layout - #1 in center/top, others side-by-side below on mobile */}
            <div className="flex flex-wrap sm:flex-nowrap items-end justify-center gap-3 sm:gap-6">
              {/* Reorder: show #2, #1, #3 for podium effect */}
              {[top3[1], top3[0], top3[2]].filter(Boolean).map((p, idx) => {
                if (!p) return null;
                const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3;
                const sizeInfo = getSizeFromSeverity(p.severity);
                const aura = getAuraByRank(actualRank);
                const isChampion = actualRank === 1;
                
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -4, transition: { duration: 0 } }}
                    transition={{ delay: isChampion ? 0.2 : idx * 0.1, type: 'spring', damping: 20 }}
                    onClick={() => setSelectedPothole(p)}
                    className={`relative rounded-2xl cursor-pointer backdrop-blur-sm border transition-all duration-300 hover:scale-[1.03] ${aura?.frameClass || ''} ${
                      isChampion 
                        ? 'w-full sm:w-[33%] order-1 sm:order-2 z-10 overflow-visible scale-[1.02] sm:scale-105 mb-2 sm:mb-0' 
                        : 'w-[48%] sm:w-[33%] overflow-hidden ' + (actualRank === 2 ? 'order-2 sm:order-1' : 'order-3 sm:order-3')
                    } ${
                      darkMode 
                        ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
                        : 'bg-white/20 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <div className={`font-black rounded-xl flex items-center justify-center backdrop-blur-md ${
                        isChampion 
                          ? `w-10 h-10 text-sm shadow-[0_4px_16px_rgba(6,182,212,0.4)] ${darkMode ? 'bg-gradient-to-b from-cyan-400 to-cyan-500 text-cyan-950' : 'bg-gradient-to-b from-cyan-500 to-cyan-600 text-white'}` 
                          : actualRank === 2
                            ? `w-8 h-8 text-xs ${darkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-zinc-300 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'bg-white/80 text-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.1)]'}`
                            : `w-8 h-8 text-xs ${darkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-zinc-400 shadow-[0_2px_8px_rgba(0,0,0,0.3)]' : 'bg-white/80 text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.1)]'}`
                      }`}>
                        #{actualRank}
                      </div>
                    </div>
                    

                    <div className={`relative overflow-hidden cursor-pointer ${isChampion ? 'h-52 sm:h-52 rounded-t-2xl' : 'h-48 sm:h-48'}`}>
                      <img src={p.image_url} alt={p.location} className="w-full h-full object-cover" />
                      
                      {/* Gradient overlay for champion */}
                      {isChampion && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      )}

                      <div className={`absolute top-2 right-2 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-md ${
                        isChampion ? 'text-[9px]' : 'text-[8px]'
                      } ${darkMode ? 'bg-white/10' : 'bg-black/20'}`}>
                        {sizeInfo.label}
                      </div>

                      {aura && (
                        <div className={`absolute bottom-2 left-2 text-white text-[8px] font-bold px-2.5 py-1 rounded-full shadow-lg backdrop-blur-md ${aura.className}`}>
                          {aura.label}
                        </div>
                      )}
                    </div>
                    

                    <div className={`${isChampion ? 'p-4' : 'p-3'} ${darkMode ? 'bg-black/10' : 'bg-white/10'}`}>
                      <h4 className={`font-bold mb-1.5 leading-tight line-clamp-2 ${isChampion ? 'text-sm' : 'text-xs min-h-[2.5em]'} ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                        {getDisplayLocation(p.location)}
                      </h4>
                      {isChampion && (
                        <p className={`text-[13px] italic mb-2 ${darkMode ? 'text-orange-400/80' : 'text-orange-500/80'}`}>
                          "Congrats! You've ruined more tires than a Formula 1 pit stop."
                        </p>
                      )}
                      {actualRank === 2 && (
                        <p className={`hidden sm:block text-[12px] italic mb-1.5 ${darkMode ? 'text-violet-400/70' : 'text-violet-500/70'}`}>
                          "Almost the worst. Try harder next time."
                        </p>
                      )}
                      {actualRank === 3 && (
                        <p className={`hidden sm:block text-[12px] italic mb-1.5 ${darkMode ? 'text-sky-300/70' : 'text-sky-500/70'}`}>
                          "Bronze in destruction. Still impressive."
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-medium ${isChampion ? 'text-xs' : 'text-[10px]'} ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>
                          {formatDate(p.created_at)}
                        </span>
                        <UpvoteButton 
                          onVote={() => handleVote(p.id)} 
                          votes={p.votes} 
                          size="sm" 
                          darkMode={darkMode} 
                          soundEnabled={soundEnabled}
                          className="flex-shrink-0"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>


          </div>
        </section>


        <section className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-2.5 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}>
              <div 
                className={`w-[20px] h-[20px] ${darkMode ? 'bg-cyan-400' : 'bg-cyan-500'}`}
                style={{
                  maskImage: 'url(/assets/play-stream-svgrepo-com.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: 'url(/assets/play-stream-svgrepo-com.svg)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center'
                }}
              />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-700'}`}>Live Feed</h2>
              <p className={`text-xs font-semibold tracking-wider ${darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}`}>FRESH FROM THE STREETS</p>
            </div>
          </div>
          
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(10)].map((_, i) => (
                <div 
                  key={i}
                  className={`rounded-3xl overflow-hidden backdrop-blur-xl border animate-pulse ${
                    darkMode 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/10 border-white/20'
                  }`}
                >

                  <div className={`aspect-square ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />

                  <div className={`p-4 ${darkMode ? 'bg-black/10' : 'bg-white/10'}`}>
                    <div className={`h-4 rounded-full mb-3 w-3/4 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                    <div className="flex items-center justify-between">
                      <div className={`h-3 rounded-full w-16 ${darkMode ? 'bg-white/5' : 'bg-black/5'}`} />
                      <div className={`h-7 rounded-full w-14 ${darkMode ? 'bg-white/10' : 'bg-black/10'}`} />
                    </div>
                  </div>
                </div>
              ))}
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              <AnimatePresence>
                {reports.map((p, i) => (
                  <ReportCard key={p.id} data={p} index={i} onVote={() => handleVote(p.id)} onSelect={setSelectedPothole} darkMode={darkMode} soundEnabled={soundEnabled} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>

      <footer className={`relative z-10 py-10 px-4 text-center ${
        darkMode 
          ? 'bg-gradient-to-t from-black/20 to-transparent' 
          : 'bg-gradient-to-t from-white/30 to-transparent'
      }`}>
        <div className={`max-w-4xl mx-auto px-8 py-6 rounded-2xl backdrop-blur-xl ${ darkMode 
            ? 'bg-white/5 border border-white/10' 
            : 'bg-white/50 border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]'
        }`}>
          <p className={`text-sm font-medium flex flex-wrap items-center justify-center gap-1.5 ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
            Made with <span className="text-red-500 font-bold cursor-help flex items-center gap-1" title="Lots of it">
              frustration  </span> 
              <span 
                className="h-[24px] w-[24px] inline-block relative -top-0.5 bg-current transition-colors"
                style={{
                  maskImage: 'url(/assets/angry-anger-svgrepo-com.svg)',
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskImage: 'url(/assets/angry-anger-svgrepo-com.svg)',
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center'
                }}
              />
           using <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className={`hover:underline decoration-2 underline-offset-2 transition-all ${darkMode ? 'text-cyan-400 decoration-cyan-400/30' : 'text-cyan-600 decoration-cyan-600/30'}`}>React</a>, <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className={`hover:underline decoration-2 underline-offset-2 transition-all ${darkMode ? 'text-sky-400 decoration-sky-400/30' : 'text-sky-600 decoration-sky-600/30'}`}>Tailwind</a>, <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className={`hover:underline decoration-2 underline-offset-2 transition-all ${darkMode ? 'text-emerald-400 decoration-emerald-400/30' : 'text-emerald-600 decoration-emerald-600/30'}`}>Supabase</a> & <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className={`hover:underline decoration-2 underline-offset-2 transition-all ${darkMode ? 'text-violet-400 decoration-violet-400/30' : 'text-violet-600 decoration-violet-600/30'}`}>Cloudinary</a>
          </p>
      
          <div className={`mt-4 pt-4 border-t w-full max-w-[200px] mx-auto ${darkMode ? 'border-zinc-400/20' : 'border-slate-500/20'}`}></div>
          <p className={`text-xs leading-relaxed max-w-4xl mx-auto opacity-80 ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            All content is crowdsourced. I take no responsibility for image accuracy, authenticity, or ownership.
          </p>
        </div>
      </footer>


      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onCreate={handleCreate} darkMode={darkMode} />}
        {showMap && (
          <Suspense fallback={
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
              <div className="text-white text-lg font-medium">Loading Map...</div>
            </div>
          }>
            <MapView reports={reports} onClose={() => setShowMap(false)} darkMode={darkMode} />
          </Suspense>
        )}
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



// Card component for displaying a pothole report
const ReportCard = ({ data, index, onVote, onSelect, darkMode, soundEnabled }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`rounded-3xl overflow-hidden backdrop-blur-sm border cursor-pointer transition-shadow duration-300 ${
        darkMode 
          ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.2)]' 
          : 'bg-white/20 border-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.1)]'
      }`}
    >

      <div className="aspect-square relative overflow-hidden group" onClick={() => onSelect(data)}>
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

      <div className="p-4">
        <h4 className={`text-sm font-bold mb-2 leading-tight line-clamp-2 min-h-[2.8em] ${darkMode ? 'text-white' : 'text-slate-800'}`}>{getDisplayLocation(data.location)}</h4>
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>{formatDate(data.created_at)}</span>
          <UpvoteButton onVote={onVote} votes={data.votes} size="sm" darkMode={darkMode} soundEnabled={soundEnabled} />
        </div>
      </div>
    </motion.div>
  );
};


// Modal component for viewing detailed pothole information
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${fullScreen ? 'z-[60]' : ''} ${
        darkMode ? 'bg-black/30' : 'bg-black/5'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className={`${fullScreen 
          ? 'fixed inset-0 w-screen h-screen max-w-none rounded-none z-[70] flex flex-col' 
          : 'w-full max-w-xl md:max-w-4xl max-h-[92vh] md:max-h-none overflow-y-auto md:overflow-visible custom-scrollbar rounded-[2rem] flex flex-col md:flex-row'
        } overflow-hidden transition-all duration-300 backdrop-blur-[75px] border ${
          darkMode 
            ? 'bg-[#0f172a]/60 border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-white/70 border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]'
        }`}
      >

        <div ref={containerRef} className={`relative overflow-hidden group cursor-crosshair ${fullScreen ? 'flex-1 w-full h-full' : 'flex-1 aspect-video md:aspect-auto rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none'} ${darkMode ? 'bg-black' : 'bg-slate-300/50'}`}>
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
              className={`w-full h-full ${fullScreen ? 'object-contain' : 'object-cover'} select-none pointer-events-none transition-transform duration-200 ${isDragging ? 'scale-[1.01]' : ''}`} 
              alt="Pothole Inspection" 
            />
          </motion.div>


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
          <div className="w-full md:w-[400px] p-6 md:p-8 flex flex-col md:h-full md:max-h-[90vh] md:overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <div className={`text-[10px] font-bold tracking-[0.2em] uppercase ${darkMode ? 'text-cyan-400/70' : 'text-cyan-600'}`}>
                  Subject Inspection
                </div>
                <h2 className={`text-3xl font-black tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  {sizeInfo.title}
                </h2>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
                  <MapPin size={14} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                  {getDisplayLocation(data.location)}
                </div>
              </div>
              <button 
                onClick={onClose} 
                className={`p-2.5 rounded-full transition-all flex-shrink-0 hover:rotate-90 duration-300 ${
                  darkMode 
                    ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' 
                    : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-800'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Info Cards Container */}
            <div className="space-y-4">
              {/* Threat Level Display */}
              <div className={`p-5 rounded-[2rem] border transition-all duration-300 ${
                darkMode 
                  ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/40 border-white/60 shadow-sm'
              }`}>
                <div className={`text-[9px] font-bold tracking-widest uppercase mb-2 text-center ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                  Threat Level
                </div>
                <div className="flex flex-col items-center gap-2">
                  {React.createElement(sizeInfo.icon, { size: 40, className: sizeInfo.textColor, strokeWidth: 2.5 })}
                  <div className={`text-2xl font-black tracking-tight ${sizeInfo.textColor}`}>
                    {sizeInfo.title}
                  </div>
                  <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${darkMode ? 'bg-white/10 text-cyan-400' : 'bg-cyan-50 text-cyan-700'}`}>
                    {sizeInfo.label}
                  </div>
                </div>
              </div>

              {/* Interaction Card */}
              <div className={`p-5 rounded-[2rem] border transition-all duration-300 ${
                darkMode 
                  ? 'bg-white/[0.03] border-white/10 shadow-[inner_0_0_20px_rgba(0,0,0,0.2)]' 
                  : 'bg-white/40 border-white/60 shadow-sm'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <div className={`text-[9px] font-bold tracking-widest uppercase mb-4 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    Public Outrage
                  </div>
                  <UpvoteButton 
                    onVote={onVote} 
                    votes={data.votes} 
                    size="md" 
                    darkMode={darkMode} 
                    soundEnabled={soundEnabled} 
                  />
                  <p className={`text-[10px] mt-4 leading-relaxed font-medium max-w-[220px] ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                    High interaction levels escalate this hazard into the <span className={darkMode ? 'text-cyan-400' : 'text-cyan-600'}>Hall of Shame</span>.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Footer Metadata */}
            <div className={`mt-auto pt-8 flex flex-col gap-4`}>
              <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                darkMode ? 'bg-black/20 border-white/5' : 'bg-white/30 border-black/5'
              }`}>
                <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
                  <Calendar size={14} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[9px] font-bold tracking-widest uppercase ${darkMode ? 'text-zinc-600' : 'text-slate-400'}`}>DISCOVERED ON</span>
                  <span className={`text-xs font-bold ${darkMode ? 'text-zinc-400' : 'text-slate-600'}`}>{formatDate(data.created_at)}</span>
                </div>
              </div>
              
              <div className={`text-[9px] text-center font-bold tracking-tight ${darkMode ? 'text-zinc-700' : 'text-slate-300'}`}>
                ID: {data.id.toString().toUpperCase().slice(0, 16)} • REPORT_AUTH_SECURED
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// Modal component for capturing and uploading new pothole reports
const UploadModal = ({ onClose, onCreate, darkMode }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [location, setLocation] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [aiStatus, setAiStatus] = useState('');
  const [model, setModel] = useState(null);
  const [isPothole, setIsPothole] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    const loadScript = (src) => new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

    const initAI = async () => {
      try {
        // Dynamically load TensorFlow and Teachable Machine only when modal opens
        await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest/dist/tf.min.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@teachablemachine/image@latest/dist/teachablemachine-image.min.js');
        
        if (window.tmImage) {
          const m = await window.tmImage.load('/pothole_model/model.json', '/pothole_model/metadata.json');
          setModel(m);
        }
      } catch (e) {
        console.error("AI Model Load Failed", e);
      }
    };
    initAI();
  }, []);

  // Gets the user's current location and attempts to find the address
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude: lat, longitude: lng } = position.coords;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const data = await res.json();
        

        const exactAddress = data.display_name || data.address.road || data.address.suburb || data.address.city || 'Unknown Address';
        
        setLocation(exactAddress);
        setGpsCoords({ lat, lng });
        
      } catch (err) {
        console.warn("Reverse geocoding failed, falling back to raw GPS", err);
        setLocation(`GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        setGpsCoords({ lat, lng });
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

  // Compress image to reduce file size before upload
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Resize to max 1920x1080 while maintaining aspect ratio
          const maxWidth = 1920;
          const maxHeight = 1080;
          
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with 0.7 quality (reduces file size significantly)
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.7);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Processes the selected image and runs AI pothole detection
  const handleFileChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    
    setFile(f);
    const previewUrl = URL.createObjectURL(f);
    setPreview(previewUrl);
    
    if (!model) return;
    
    setScanning(true);
    setIsPothole(false);
    setAiStatus('DETECTING POTHOLES...');
    
    try {

      // Keep "DETECTING POTHOLES..." for at least 2 seconds
      await new Promise(r => setTimeout(r, 2000));


      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = previewUrl;
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Ensure dimensions are available for TensorFlow
          if (img.width === 0 || img.height === 0) {
            img.width = img.naturalWidth;
            img.height = img.naturalHeight;
          }
          resolve();
        };
        img.onerror = () => reject(new Error('Failed to load image'));
      });
      
      const predictions = await model.predict(img);
      const potholeScore = predictions.find(p => p.className.toLowerCase().includes('pothole'))?.probability || 0;

      if (potholeScore < 0.98) {
        setAiStatus('NO POTHOLE DETECTED');
        setIsPothole(false);
        await new Promise(r => setTimeout(r, 2500));
        setAiStatus('');
        setFile(null);
        setPreview(null);
      } else {
        setAiStatus(`POTHOLE DETECTED: ${(potholeScore * 100).toFixed(0)}% MATCH`);
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

  // Uploads the report data and image to the server
  const handleUpload = async () => {
    if (!file || !location || !isPothole) return;
    setUploading(true);
    setAiStatus('COMPRESSING IMAGE...');
    
    try {
      // Compress the image first
      const compressedBlob = await compressImage(file);
      
      setAiStatus('UPLOADING TO CLOUDINARY...');
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', compressedBlob);
      formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'potholes');
      
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!cloudinaryResponse.ok) {
        const errData = await cloudinaryResponse.json().catch(() => ({}));
        console.error('Cloudinary Error:', errData);
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const imageUrl = cloudinaryData.secure_url;

      setAiStatus('SAVING TO DATABASE...');

      const locObj = gpsCoords ? { lat: gpsCoords.lat, lng: gpsCoords.lng, name: location } : location;

      const reportData = {
        image_url: imageUrl,  // Store Cloudinary URL
        location: typeof locObj === 'object' ? JSON.stringify(locObj) : locObj,
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with ${response.status}: ${errorText.slice(0, 100)}`);
      }

      let savedData = [];
      try {
        savedData = await response.json();
      } catch (e) {
        console.warn('No JSON response from create', e);
      }

      const serverRecord = (Array.isArray(savedData) ? savedData[0] : savedData) || {};
      const finalReport = { 
        ...reportData, 
        ...serverRecord, 
        location: locObj,
        id: serverRecord.id || Math.random().toString(), 
        isLocal: !serverRecord.id 
      };

      setUploadSuccess(true);
      setUploading(false);
      
      loadConfetti().then((fire) => fire({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 10001,
        colors: ['#06b6d4', '#22d3ee', '#ffffff']
      }));

      setTimeout(() => {
        onCreate(finalReport);
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setAiStatus('UPLOAD FAILED ❌');
      setUploading(false);
      alert(`Upload Error: ${err.message}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md ${
        darkMode ? 'bg-black/30' : 'bg-black/5'
      }`}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-2xl rounded-[2rem] p-4 md:p-6 transition-all duration-300 backdrop-blur-[75px] border ${
          darkMode 
            ? 'bg-[#0f172a]/60 border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-white/70 border-white/60 shadow-[0_20px_40px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]'
        }`}
      >
        {/* Header Section */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${
              darkMode 
                ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
            }`}>
              <Camera size={20} className={darkMode ? 'text-cyan-400' : 'text-cyan-600'} />
            </div>
            <h2 className={`text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-700'}`}>Mark My Pothole</h2>
          </div>
          <button 
            onClick={onClose} 
            className={`p-2.5 rounded-full transition-all flex-shrink-0 hover:rotate-90 duration-300 ${
              darkMode 
                ? 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white' 
                : 'bg-black/5 hover:bg-black/10 text-slate-500 hover:text-slate-800'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {uploadSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className={`w-24 h-24 rounded-[2rem] border-2 flex items-center justify-center ${
                  darkMode 
                    ? 'bg-green-500/10 border-green-500/20 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                    : 'bg-green-500/5 border-green-500/10 text-green-600'
                }`}>
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100 }}
                  >
                    <Trophy size={48} />
                  </motion.div>
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-800'}`}>Marked Successfully</h3>
                  <p className={`text-sm font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Pothole coordinates logged into global database.</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="form" className="space-y-2.5" exit={{ opacity: 0, x: -20 }}>
                <div>
                  <div 
                    onClick={() => !scanning && !uploading && document.getElementById('pothole-file').click()}
                    className={`cursor-pointer aspect-[2/1] rounded-[2rem] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group backdrop-blur-md border-2 border-dashed ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-white/[0.07]' 
                        : 'bg-black/5 border-black/5 hover:border-cyan-500/50 hover:bg-black/[0.07]'
                    } ${scanning || uploading ? 'cursor-wait opacity-80' : ''}`}
                  >
                    {preview ? (
                      <div className="relative w-full h-full">
                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                        {scanning && (
                          <>
                            <motion.div 
                              initial={{ top: '-5%' }}
                              animate={{ top: '105%' }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-10"
                            />
                            <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[2px]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl shadow-2xl">
                                <div className="flex items-center gap-3">
                                  <Loader2 size={16} className="text-cyan-400 animate-spin" />
                                  <span className="font-bold text-xs tracking-widest text-white uppercase">{aiStatus}</span>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                        {/* Removed Valid Target tag */}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-8 text-center space-y-4">
                        <div className={`p-5 rounded-[2rem] transition-all group-hover:scale-110 duration-300 ${
                          darkMode ? 'bg-white/5 text-zinc-500' : 'bg-black/5 text-slate-400'
                        }`}>
                          <Upload size={32} />
                        </div>
                        <div className="space-y-1">
                          <p className={`text-sm font-bold ${darkMode ? 'text-zinc-300' : 'text-slate-600'}`}>Select an Image</p>
                          <p className={`text-[10px] font-medium ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Supported formats: RAW, JPG, PNG (Max 10MB)</p>
                        </div>
                      </div>
                    )}
                    <input id="pothole-file" type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={scanning || uploading} />
                  </div>
                </div>

                {/* Metadata Fields */}
                <div className="space-y-1.5 pb-3">
                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold tracking-[0.2em] uppercase pl-1 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Geographic Location
                    </label>
                    <div className={`relative flex items-center p-1.5 rounded-2xl transition-all duration-300 backdrop-blur-md border ${
                      darkMode 
                        ? 'bg-white/5 border-white/10 shadow-[inner_0_2px_12px_rgba(0,0,0,0.3)]' 
                        : 'bg-white/40 border-black/5'
                    } focus-within:ring-2 focus-within:ring-cyan-500/30`}>
                      <input 
                        type="text" 
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Automated GPS or Manual Address"
                        className={`flex-1 bg-transparent p-2.5 font-bold outline-none text-[13px] ${
                          darkMode ? 'text-white placeholder-zinc-700' : 'text-slate-700 placeholder-slate-300'
                        }`}
                      />
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={detectLocation}
                        disabled={isLocating}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[9px] font-black tracking-widest uppercase transition-all ${
                          darkMode 
                            ? 'bg-white/5 text-cyan-400 border border-white/10 hover:bg-white/10' 
                            : 'bg-black/5 text-cyan-600 border border-black/5 hover:bg-black/10'
                        } ${isLocating ? 'opacity-50' : ''}`}
                      >
                        {isLocating ? <Loader2 size={12} className="animate-spin" /> : <LocateFixed size={12} />}
                        {isLocating ? 'Locating...' : 'Locate'}
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`text-[10px] font-bold tracking-[0.2em] uppercase pl-1 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                      Threat Evaluation
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {SIZES.map(s => (
                        <button 
                          key={s.level}
                          onClick={() => setSeverity(s.level)}
                          className={`py-2 rounded-2xl transition-all duration-300 font-black text-[9px] px-1.5 h-auto min-h-[38px] leading-tight backdrop-blur-md border uppercase tracking-wider ${
                            severity === s.level 
                              ? `${s.color} text-white shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3)] border-transparent scale-[1.05] z-10` 
                              : darkMode 
                                ? 'bg-white/5 border-white/10 text-zinc-500 hover:bg-white/10' 
                                : 'bg-white/40 border-black/5 text-slate-500 hover:bg-white/60'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {React.createElement(s.icon, { 
                              size: 14, 
                              className: `flex-shrink-0 ${severity === s.level ? 'text-white' : (darkMode ? 'text-cyan-400/70' : 'text-cyan-600')}` 
                            })}
                            <span>{s.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                </div>
                </div>

                <motion.button 
                  whileHover={!uploading && !scanning && file && location && isPothole && severity ? { scale: 1.01, y: -2 } : {}}
                  whileTap={!uploading && !scanning && file && location && isPothole && severity ? { scale: 0.99 } : {}}
                  onClick={handleUpload}
                  disabled={uploading || scanning || !file || !location || !isPothole || !severity}
                  className={`w-full py-4 rounded-[2rem] font-black text-xs tracking-[0.2em] uppercase transition-all duration-300 disabled:opacity-30 disabled:grayscale mt-6 ${
                    darkMode 
                      ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_20px_40px_-10px_rgba(34,211,238,0.3)]' 
                      : 'bg-slate-900 text-white shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)]'
                  }`}
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Marking...</span>
                    </div>
                  ) : 'Mark It'}
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
