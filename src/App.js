import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Trophy, 
  ThumbsUp, 
  X, 
  Siren,
  Megaphone,
  Flame,
  Upload,
  Loader2,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Sun,
  Moon,
  ChevronUp,
  Frown,
  Coffee,
  Skull,
  Waves,
  Globe
} from 'lucide-react';

// --- SUPABASE CONFIG ---
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Severity Icon Components
const SeverityIcon = ({ level, size = 16, className = "" }) => {
  const icons = {
    1: Frown,      // Ankle Twister - hurt face
    2: Coffee,     // Coffee Spiller - cup
    3: Skull,      // Rim Reaper - skull
    4: Waves,      // Swimming Pool - water waves
  };
  const Icon = icons[level] || Frown;
  return <Icon size={size} className={className} />;
};

// Hall of Shame Icon
const ShameIcon = ({ size = 20, className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" width={size} height={size} className={className}>
    <path d="M12 3L12.4892 2.12785C12.1854 1.95738 11.8146 1.95738 11.5108 2.12785L12 3ZM13.3976 3.784L12.9084 4.65615C13.0542 4.73792 13.2181 4.78185 13.3852 4.78392L13.3976 3.784ZM15 3.80385L15.8598 3.29316C15.6818 2.99359 15.3608 2.80824 15.0124 2.80392L15 3.80385ZM15.8184 5.18162L14.9586 5.69231C15.044 5.83601 15.164 5.95603 15.3077 6.04139L15.8184 5.18162ZM17.1962 6L18.1961 5.98761C18.1918 5.63921 18.0064 5.31817 17.7068 5.14023L17.1962 6ZM17.216 7.60238L16.2161 7.61476C16.2181 7.78189 16.2621 7.94584 16.3438 8.09161L17.216 7.60238ZM18 9L18.8722 9.48924C19.0426 9.18535 19.0426 8.81465 18.8722 8.51076L18 9ZM17.216 10.3976L16.3438 9.90839C16.2621 10.0542 16.2181 10.2181 16.2161 10.3852L17.216 10.3976ZM17.1962 12L17.7068 12.8598C18.0064 12.6818 18.1918 12.3608 18.1961 12.0124L17.1962 12ZM15.8184 12.8184L15.3077 11.9586C15.164 12.044 15.044 12.164 14.9586 12.3077L15.8184 12.8184ZM15 14.1962L15.0124 15.1961C15.3608 15.1918 15.6818 15.0064 15.8598 14.7068L15 14.1962ZM13.3976 14.216L13.3852 13.2161C13.2181 13.2181 13.0542 13.2621 12.9084 13.3438L13.3976 14.216ZM12 15L11.5108 15.8722C11.8146 16.0426 12.1854 16.0426 12.4892 15.8722L12 15ZM10.6024 14.216L11.0916 13.3438C10.9458 13.2621 10.7819 13.2181 10.6148 13.2161L10.6024 14.216ZM9 14.1962L8.14023 14.7068C8.31817 15.0064 8.63921 15.1918 8.98761 15.1961L9 14.1962ZM8.18162 12.8184L9.04139 12.3077C8.95603 12.164 8.83602 12.044 8.69231 11.9586L8.18162 12.8184ZM6.80385 12L5.80392 12.0124C5.80824 12.3608 5.99359 12.6818 6.29316 12.8598L6.80385 12ZM6.784 10.3976L7.78392 10.3852C7.78185 10.2181 7.73792 10.0542 7.65615 9.90839L6.784 10.3976ZM6 9L5.12785 8.51076C4.95738 8.81465 4.95738 9.18535 5.12785 9.48924L6 9ZM6.784 7.60238L7.65615 8.09161C7.73792 7.94584 7.78185 7.78189 7.78392 7.61476L6.784 7.60238ZM6.80385 6L6.29316 5.14023C5.99359 5.31817 5.80824 5.63921 5.80392 5.98762L6.80385 6ZM8.18162 5.18162L8.69231 6.04139C8.83602 5.95603 8.95603 5.83602 9.04139 5.69231L8.18162 5.18162ZM9 3.80385L8.98762 2.80392C8.63921 2.80824 8.31817 2.99359 8.14023 3.29316L9 3.80385ZM10.6024 3.784L10.6148 4.78392C10.7819 4.78185 10.9458 4.73792 11.0916 4.65615L10.6024 3.784ZM4 19L3.10557 18.5528C2.95058 18.8628 2.96714 19.2309 3.14935 19.5258C3.33156 19.8206 3.65342 20 4 20V19ZM6.5 19L7.3 18.4C7.11115 18.1482 6.81476 18 6.5 18V19ZM8 21L7.2 21.6C7.40795 21.8773 7.74463 22.0271 8.08981 21.996C8.43498 21.9649 8.73943 21.7572 8.89443 21.4472L8 21ZM20 19V20C20.3466 20 20.6684 19.8206 20.8507 19.5258C21.0329 19.2309 21.0494 18.8628 20.8944 18.5528L20 19ZM17.5 19V18C17.1852 18 16.8889 18.1482 16.7 18.4L17.5 19ZM16 21L15.1056 21.4472C15.2606 21.7572 15.565 21.9649 15.9102 21.996C16.2554 22.0271 16.5921 21.8773 16.8 21.6L16 21ZM11.5108 3.87215L12.9084 4.65615L13.8869 2.91185L12.4892 2.12785L11.5108 3.87215ZM13.3852 4.78392L14.9876 4.80377L15.0124 2.80392L13.41 2.78408L13.3852 4.78392ZM14.1402 4.31454L14.9586 5.69231L16.6781 4.67094L15.8598 3.29316L14.1402 4.31454ZM15.3077 6.04139L16.6855 6.85977L17.7068 5.14023L16.3291 4.32186L15.3077 6.04139ZM16.1962 6.01239L16.2161 7.61476L18.2159 7.58999L18.1961 5.98761L16.1962 6.01239ZM16.3438 8.09161L17.1278 9.48924L18.8722 8.51076L18.0882 7.11314L16.3438 8.09161ZM17.1278 8.51076L16.3438 9.90839L18.0882 10.8869L18.8722 9.48924L17.1278 8.51076ZM16.2161 10.3852L16.1962 11.9876L18.1961 12.0124L18.2159 10.41L16.2161 10.3852ZM14.9586 12.3077L14.1402 13.6855L15.8598 14.7068L16.6781 13.3291L14.9586 12.3077ZM14.9876 13.1962L13.3852 13.2161L13.41 15.2159L15.0124 15.1961L14.9876 13.1962ZM10.6148 13.2161L9.01239 13.1962L8.98761 15.1961L10.59 15.2159L10.6148 13.2161ZM9.85977 13.6855L9.04139 12.3077L7.32186 13.3291L8.14023 14.7068L9.85977 13.6855ZM7.80377 11.9876L7.78392 10.3852L5.78408 10.41L5.80392 12.0124L7.80377 11.9876ZM7.65615 9.90839L6.87215 8.51076L5.12785 9.48924L5.91185 10.8869L7.65615 9.90839ZM6.87215 9.48924L7.65615 8.09161L5.91185 7.11314L5.12785 8.51076L6.87215 9.48924ZM7.78392 7.61476L7.80377 6.01238L5.80392 5.98762L5.78408 7.58999L7.78392 7.61476ZM7.31454 6.85977L8.69231 6.04139L7.67094 4.32186L6.29316 5.14023L7.31454 6.85977ZM9.04139 5.69231L9.85977 4.31454L8.14023 3.29316L7.32186 4.67094L9.04139 5.69231ZM9.01238 4.80377L10.6148 4.78392L10.59 2.78408L8.98762 2.80392L9.01238 4.80377ZM11.0916 4.65615L12.4892 3.87215L11.5108 2.12785L10.1131 2.91185L11.0916 4.65615ZM16.6855 11.1402L15.3077 11.9586L16.3291 13.6781L17.7068 12.8598L16.6855 11.1402ZM8.69231 11.9586L7.31454 11.1402L6.29316 12.8598L7.67094 13.6781L8.69231 11.9586ZM12.9084 13.3438L11.5108 14.1278L12.4892 15.8722L13.8869 15.0882L12.9084 13.3438ZM12.4892 14.1278L11.0916 13.3438L10.1131 15.0882L11.5108 15.8722L12.4892 14.1278ZM4 20H6.5V18H4V20ZM5.7 19.6L7.2 21.6L8.8 20.4L7.3 18.4L5.7 19.6ZM20 18H17.5V20H20V18ZM16.7 18.4L15.2 20.4L16.8 21.6L18.3 19.6L16.7 18.4ZM17.6056 16.4472L19.1056 19.4472L20.8944 18.5528L19.3944 15.5528L17.6056 16.4472ZM13.6056 18.4472L15.1056 21.4472L16.8944 20.5528L15.3944 17.5528L13.6056 18.4472ZM8.60557 17.5528L7.10557 20.5528L8.89443 21.4472L10.3944 18.4472L8.60557 17.5528ZM4.60557 15.5528L3.10557 18.5528L4.89443 19.4472L6.39443 16.4472L4.60557 15.5528ZM13 9C13 9.55228 12.5523 10 12 10V12C13.6569 12 15 10.6569 15 9H13ZM12 10C11.4477 10 11 9.55228 11 9H9C9 10.6569 10.3431 12 12 12V10ZM11 9C11 8.44772 11.4477 8 12 8V6C10.3431 6 9 7.34315 9 9H11ZM12 8C12.5523 8 13 8.44772 13 9H15C15 7.34315 13.6569 6 12 6V8Z" fill="currentColor"/>
  </svg>
);

// --- SEVERITY SIZES ---
const SIZES = [
  { level: 1, label: "Baby", title: "Ankle Twister", dbLabel: "Baby Pothole", color: "bg-sky-400", text: "text-sky-400" },
  { level: 2, label: "Street", title: "Coffee Spiller", dbLabel: "Street Acne", color: "bg-cyan-400", text: "text-cyan-400" },
  { level: 3, label: "Wheel", title: "The Rim Reaper", dbLabel: "Wheel Destroyer", color: "bg-indigo-500", text: "text-indigo-400" },
  { level: 4, label: "Crater", title: "Swimming Pool", dbLabel: "Crater", color: "bg-fuchsia-600", text: "text-fuchsia-400" },
];

const getSizeFromSeverity = (severity) => {
  return SIZES.find(s => s.dbLabel === severity) || SIZES[2];
};

// Helper to display location or fallback
const getDisplayLocation = (location) => {
  if (!location || location.trim() === '' || location === 'null' || location === 'undefined') {
    return 'Unknown Location';
  }
  // Also check for "unknown location" variations
  const lowerLocation = location.toLowerCase().trim();
  if (lowerLocation === 'unknown location' || lowerLocation === 'unknown' || lowerLocation === 'n/a') {
    return 'Unknown Location';
  }
  return location;
};

// Animated Upvote Button with count
const UpvoteButton = ({ onVote, votes = 0, size = "md", darkMode = true }) => {
  const sizes = {
    sm: { padding: "px-3 py-2", icon: 14, text: "text-xs" },
    md: { padding: "px-4 py-2.5", icon: 16, text: "text-sm" },
  };
  
  const s = sizes[size] || sizes.md;
  
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onVote();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${s.padding} rounded-xl font-black transition-all duration-150 flex items-center gap-1.5 flex-shrink-0 active:scale-95 ${
        darkMode 
          ? 'bg-[#1a2038] text-cyan-400 shadow-[5px_5px_10px_#0b0e19,-5px_-5px_10px_#404a70] active:shadow-[inset_2px_2px_4px_#0b0e19,inset_-2px_-2px_4px_#404a70]' 
          : 'bg-[#f8fafc] text-cyan-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'
      }`}
    >
      <span className="font-black">{votes}</span>
      <svg viewBox="0 0 24 24" fill="currentColor" width={s.icon} height={s.icon}>
        <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
      </svg>
    </button>
  );
};

// Custom Neumorphic Switch for Mode Toggle
const ModeToggle = ({ darkMode, setDarkMode }) => {
  return (
    <div 
      onClick={() => setDarkMode(!darkMode)}
      className={`relative w-20 h-[44px] rounded-full cursor-pointer flex items-center p-1.5 transition-all duration-200 ${
        darkMode 
          ? 'bg-[#1a2038] shadow-[inset_4px_4px_8px_#0b0e19,inset_-4px_-4px_8px_#2a325a]' 
          : 'bg-[#d6d6d6] shadow-[inset_4px_4px_8px_#b0b0b0,inset_-4px_-4px_8px_#ffffff]'
      }`}
    >
      <motion.div
        animate={{ x: darkMode ? 36 : 0 }}
        transition={{ type: "spring", stiffness: 1200, damping: 40 }}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          darkMode 
            ? 'bg-gradient-to-br from-[#252d4a] to-[#1a2038] shadow-[2px_2px_5px_#0b0e19,-2px_-2px_5px_#404a70]' 
            : 'bg-gradient-to-br from-[#d9d9d9] to-[#bfbfbf] shadow-[2px_2px_5px_#b0b0b0,-2px_-2px_5px_#ffffff]'
        }`}
      >
        <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
          darkMode ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]' : 'bg-zinc-500 shadow-sm'
        }`} />
      </motion.div>
    </div>
  );
};

const App = () => {
  const [reports, setReports] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    loadPotholes();
    const interval = setInterval(loadPotholes, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadPotholes = async () => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('Missing Supabase credentials. Use REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
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
        // Fix: Don't overwrite if local has pending optimistic votes (higher count)
        setReports(prev => {
          const localVotes = new Map(prev.map(p => [p.id, p.votes]));
          return data.map(serverItem => ({
            ...serverItem,
            votes: Math.max(serverItem.votes, localVotes.get(serverItem.id) || 0)
          }));
        });
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get top 3 by votes for Hall of Shame (stable sort with ID tiebreaker)
  // Get top 3 by votes for Hall of Shame (stable sort with ID tiebreaker)
  const sortedByVotes = [...reports].sort((a, b) => {
    if (b.votes !== a.votes) return b.votes - a.votes;
    return String(a.id).localeCompare(String(b.id)); // Stable tiebreaker
  });
  const top3 = sortedByVotes.slice(0, 3);
  const top3Ids = new Set(top3.map(r => r.id));
  
  // Display ALL reports in the feed (including Hall of Fame items)
  const theRest = reports;

  const handleVote = async (id, currentVotes) => {
    const newVotes = currentVotes + 1;

    // Optimistic update
    setReports(prev => prev.map(item => 
      item.id === id ? { ...item, votes: newVotes } : item
    ));

    // Update selected modal state if open
    if (selectedPothole && selectedPothole.id === id) {
      setSelectedPothole(prev => ({ ...prev, votes: newVotes }));
    }

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/potholes?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ votes: newVotes })
      });
    } catch (err) {
      // Revert on error
      setReports(prev => prev.map(item => 
        item.id === id ? { ...item, votes: currentVotes } : item
      ));
      if (selectedPothole && selectedPothole.id === id) {
        setSelectedPothole(prev => ({ ...prev, votes: currentVotes }));
      }
    }
  };

  const handleCreate = (newReport) => {
    setReports([newReport, ...reports]);
    setShowUpload(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-zinc-700 border-t-cyan-400 rounded-full mx-auto mb-4"
          />
          <p className="font-black uppercase text-zinc-400">Loading disasters...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans selection:bg-cyan-400 overflow-x-hidden ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
      
      {/* GLASSMORPHISM BACKGROUND - Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient - Navy blue from reference */}
        <div className={`absolute inset-0 ${darkMode 
          ? 'bg-gradient-to-br from-[#1a1f38] via-[#242b4a] to-[#1a1f38]' 
          : 'bg-[#e2e8f0]'}`} 
        />
        {/* Colored orbs for depth */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${darkMode ? 'bg-blue-500/15' : 'bg-cyan-400/30'}`} />
        <div className={`absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl ${darkMode ? 'bg-indigo-500/20' : 'bg-cyan-400/20'}`} />
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full blur-3xl ${darkMode ? 'bg-purple-500/10' : 'bg-indigo-400/15'}`} />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>
      
      {/* --- HEADER (Glassmorphism) --- */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className={`backdrop-blur-xl border-b ${darkMode 
          ? 'bg-[#1a1f38]/80 border-white/10' 
          : 'bg-white/60 border-black/5'}`}
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5">
            <div className="flex items-center justify-between">
              {/* Left: Brand */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`hidden md:flex p-2.5 rounded-xl backdrop-blur-sm ${darkMode 
                    ? 'bg-cyan-500/20 border border-cyan-500/30' 
                    : 'bg-cyan-500 border border-cyan-600/30'}`}
                >
                  <Siren size={22} className={darkMode ? 'text-cyan-400' : 'text-white'} />
                </motion.div>
                <div>
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none"
                  >
                    <span className={darkMode ? 'text-white' : 'text-zinc-900'}>MARKMY</span>
                    <span className="text-cyan-400">POTHOLE</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.05 }}
                    className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}
                  >
                    They ignore it, <span className={darkMode ? 'text-white' : 'text-zinc-900'}>We expose it.</span>
                  </motion.p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-4">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.05, type: "spring", stiffness: 400 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUpload(true)}
                  className={`flex items-center gap-2 font-bold py-2.5 px-4 rounded-xl transition-all active:scale-95 duration-200 ${darkMode 
                    ? 'bg-[#1a2038] text-cyan-400 shadow-[4px_4px_8px_#0f1424,-4px_-4px_8px_#252c4c,0_0_12px_rgba(34,211,238,0.15)] hover:shadow-[4px_4px_8px_#0f1424,-4px_-4px_8px_#252c4c,0_0_20px_rgba(34,211,238,0.25)] active:shadow-[inset_3px_3px_6px_#0f1424,inset_-3px_-3px_6px_#252c4c]' 
                    : 'bg-[#f8fafc] text-cyan-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff,0_0_12px_rgba(6,182,212,0.2)] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff,0_0_20px_rgba(6,182,212,0.3)] active:shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff]'}`}
                >
                  <Camera size={18} strokeWidth={2.5} />
                  <span className="hidden sm:inline text-sm">REPORT</span>
                </motion.button>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <ModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STATS BAR (Glassmorphism Cards) */}
      <div className="relative z-10 pt-20 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {/* Reported */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all hover:-translate-y-1 duration-150 ${darkMode 
                ? 'bg-[#252d4a] border-white/5 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060]' 
                : 'bg-[#e2e8f0] border-white/20 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff]'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} className="text-cyan-400">
                  <path fillRule="evenodd" clipRule="evenodd" d="M4 1C3.44772 1 3 1.44772 3 2V22C3 22.5523 3.44772 23 4 23C4.55228 23 5 22.5523 5 22V13.5983C5.46602 13.3663 6.20273 13.0429 6.99251 12.8455C8.40911 12.4914 9.54598 12.6221 10.168 13.555C11.329 15.2964 13.5462 15.4498 15.2526 15.2798C17.0533 15.1004 18.8348 14.5107 19.7354 14.1776C20.5267 13.885 21 13.1336 21 12.3408V5.72337C21 4.17197 19.3578 3.26624 18.0489 3.85981C16.9875 4.34118 15.5774 4.87875 14.3031 5.0563C12.9699 5.24207 12.1956 4.9907 11.832 4.44544C10.5201 2.47763 8.27558 2.24466 6.66694 2.37871C6.0494 2.43018 5.47559 2.53816 5 2.65249V2C5 1.44772 4.55228 1 4 1ZM5 4.72107V11.4047C5.44083 11.2247 5.95616 11.043 6.50747 10.9052C8.09087 10.5094 10.454 10.3787 11.832 12.4455C12.3106 13.1634 13.4135 13.4531 15.0543 13.2897C16.5758 13.1381 18.1422 12.6321 19 12.3172V5.72337C19 5.67794 18.9081 5.66623 18.875 5.68126C17.7575 6.18804 16.1396 6.81972 14.5791 7.03716C13.0776 7.24639 11.2104 7.1185 10.168 5.55488C9.47989 4.52284 8.2244 4.25586 6.83304 4.3718C6.12405 4.43089 5.46427 4.58626 5 4.72107Z"/>
                </svg>
              </div>
              <div>
                <motion.span 
                  key={reports.length}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="block text-2xl font-black leading-none"
                >
                  {reports.length}
                </motion.span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Reported
                </span>
              </div>
            </motion.div>
            
            {/* Upvotes */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-all hover:-translate-y-1 duration-150 ${darkMode 
                ? 'bg-[#252d4a] border-white/5 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060]' 
                : 'bg-[#e2e8f0] border-white/20 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff]'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} className="text-cyan-400">
                  <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
                </svg>
              </div>
              <div>
                <motion.span 
                  key={reports.reduce((sum, r) => sum + r.votes, 0)}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="block text-2xl font-black leading-none"
                >
                  {reports.reduce((sum, r) => sum + r.votes, 0)}
                </motion.span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Upvotes
                </span>
              </div>
            </motion.div>
            
            {/* Fixed */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl border border-dashed transition-all hover:-translate-y-1 duration-150 ${darkMode 
                ? 'bg-[#252d4a] border-white/5 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060]' 
                : 'bg-[#e2e8f0] border-zinc-300 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff]'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/10'}`}>
                <svg viewBox="0 0 1800 1800" fill="currentColor" width={18} height={18} className="text-cyan-400">
                  <path d="M803.722,820.892l-247.878-247.87l71.705-71.702l247.875,247.871l40.808-40.802L655.949,448.104l74.925-74.921c0.596-0.596,1.147-1.216,1.682-1.86c0.592-0.499,1.175-1.006,1.735-1.562l135.512-135.512c11.126-11.12,11.292-29.106,0.366-40.43l-1.538-1.606c-1.284-1.349-2.572-2.693-3.893-4.018C796.995,120.454,709.056,80.01,629.497,80.01c-53.655,0-99.814,17.796-133.483,51.468c-0.733,0.73-1.409,1.503-2.053,2.3c-0.443,0.388-0.89,0.765-1.309,1.183L185.294,442.324c-11.267,11.271-11.267,29.539,0,40.81l45.403,45.399l-37.493,37.493l-45.403-45.408c-5.414-5.41-12.752-8.453-20.405-8.453c-7.652,0-14.99,3.043-20.404,8.453L12.869,614.75c-11.268,11.271-11.268,29.538,0,40.802l197.415,197.416c5.414,5.41,12.752,8.454,20.404,8.454c7.653,0,14.995-3.043,20.405-8.454l94.115-94.13c11.268-11.264,11.268-29.531,0-40.802l-45.395-45.399l37.493-37.493l45.395,45.399c5.636,5.636,13.019,8.446,20.405,8.446c7.383,0,14.77-2.818,20.401-8.446l79.124-79.124l260.285,260.285L803.722,820.892z M629.497,137.719c58.812,0,124.33,28.287,178.733,76.497l-94.34,94.334L559.981,154.64C579.485,143.503,603.046,137.719,629.497,137.719z M230.688,791.756L74.079,635.15l53.317-53.321l156.602,156.605L230.688,791.756z M261.089,629.749l-24.999-24.999l35.408-35.408l24.998,24.998L261.089,629.749z M403.106,619.331L246.505,462.725L513.058,196.17l156.609,156.612L403.106,619.331z"/>
                  <path d="M1763.996,1556.146l-593.695-593.688l-40.803,40.801l573.296,573.296l-71.701,71.709l-573.303-573.303l-40.803,40.81l593.704,593.705c5.41,5.408,12.752,8.452,20.401,8.452c7.657,0,14.999-3.044,20.409-8.452l112.502-112.521C1775.268,1585.686,1775.268,1567.418,1763.996,1556.146z"/>
                  <path d="M1780.444,264.271c-3.269-9.372-11.135-16.4-20.812-18.614c-9.67-2.206-19.806,0.708-26.825,7.729l-116.585,116.576l-109.307-109.315l116.585-116.57c7.02-7.021,9.942-17.156,7.729-26.833c-2.214-9.679-9.243-17.541-18.614-20.814c-29.071-10.149-59.48-15.298-90.379-15.298c-73.062,0-141.743,28.449-193.397,80.104c-51.671,51.66-80.123,120.344-80.123,193.406c0,35.343,6.723,69.648,19.442,101.514l-736.242,736.236c-31.861-12.721-66.158-19.435-101.497-19.435c-73.058,0-141.744,28.452-193.407,80.115c-73.802,73.801-99.243,185.193-64.809,283.775c3.272,9.372,11.134,16.4,20.812,18.614c9.673,2.206,19.809-0.7,26.833-7.72l116.581-116.586l109.315,109.299l-116.585,116.586c-7.021,7.02-9.938,17.155-7.729,26.833c2.214,9.677,9.242,17.534,18.613,20.812c29.064,10.152,59.468,15.296,90.372,15.304c0.008,0,0.008,0,0.016,0c73.042,0,141.728-28.46,193.39-80.122c79.559-79.566,99.726-196.352,60.563-294.822l736.347-736.333c31.865,12.728,66.162,19.443,101.506,19.443c0.008,0,0,0,0.008,0c73.046,0,141.736-28.444,193.391-80.106C1789.438,474.246,1814.878,362.854,1780.444,264.271z M583.011,1599.065c-40.762,40.763-94.948,63.216-152.58,63.216c0,0-0.012,0-0.016,0c-7.915-0.008-15.792-0.436-23.602-1.28l100.137-100.138c5.414-5.417,8.454-12.752,8.454-20.408c0-7.648-3.04-14.99-8.454-20.4L356.83,1369.946c-11.263-11.264-29.535-11.264-40.806,0l-100.072,100.072c-6.835-64.134,15.333-129.603,61.871-176.146c40.762-40.762,94.952-63.207,152.597-63.207c57.64,0,111.83,22.445,152.588,63.215C667.146,1378.013,667.146,1514.926,583.011,1599.065z M659.282,1288.535l-70.945-70.951l702.501-702.488l70.953,70.944L659.282,1288.535z M1674.832,507.246c-40.761,40.753-94.951,63.199-152.596,63.199S1410.394,548,1369.632,507.238c-40.753-40.762-63.207-94.953-63.207-152.597s22.454-111.834,63.216-152.598c40.753-40.758,94.951-63.204,152.596-63.204c7.922,0,15.796,0.429,23.605,1.28l-100.137,100.127c-5.411,5.41-8.453,12.752-8.453,20.4c0,7.657,3.042,14.991,8.453,20.401l150.108,150.117c11.271,11.271,29.547,11.271,40.81,0.008l100.072-100.073C1743.531,395.234,1721.367,460.704,1674.832,507.246z"/>
                </svg>
              </div>
              <div>
                <span className="block text-2xl font-black leading-none">
                  0
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  Fixed
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SCROLLING MARQUEE TICKER */}
      <div className={`relative z-10 overflow-hidden py-2 backdrop-blur-sm ${darkMode 
        ? 'bg-white/[0.02] border-y border-white/5' 
        : 'bg-black/[0.02] border-y border-black/5'}`}>
        <div className="animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className={`inline-block mx-4 text-[11px] font-medium uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              <span className="text-cyan-400">●</span> POTHOLE CRISIS <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> ROADS ARE BROKEN <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> WHERE ARE OUR TAX DOLLARS? <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> RIP SUSPENSION <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> 
              <span className="text-cyan-400">●</span> MOST WANTED POTHOLES <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> FIX THE ROADS <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> CITIZENS UNITE <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> HALL OF SHAME <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> 
            </span>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16">
        
        {/* --- HALL OF SHAME (TOP 3) --- */}
        {top3.length > 0 && (
          <div className="mb-12">
            {/* Mobile Title */}
            <div className="md:hidden text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="p-2 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/30"
                >
                  <ShameIcon className="text-white" size={20} />
                </motion.div>
                <h2 className={`text-xl font-black uppercase ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Hall of Shame
                </h2>
              </div>
            </div>

            {/* Desktop Layout with Vertical Title */}
            <div className="hidden md:flex gap-4">
              {/* Vertical Title - Left Side */}
              <motion.div 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <div 
                  className="flex items-center gap-3"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="p-2 bg-cyan-500 rounded-xl shadow-lg shadow-cyan-500/30"
                  >
                    <ShameIcon className="text-white" size={20} />
                  </motion.div>
                  <h2 className={`text-xl font-black uppercase tracking-widest ${darkMode ? 'text-white' : 'text-zinc-800'}`}
                    style={{ transform: 'rotate(180deg)' }}
                  >
                    Hall of Shame
                  </h2>
                </div>
              </motion.div>

              {/* Desktop Content Area */}
              <div className="flex-1">
                <div className={`relative py-6 px-6 rounded-3xl backdrop-blur-xl border ${darkMode 
                  ? 'bg-white/5 border-white/10' 
                  : 'bg-white/40 border-white/60'}`}>
                  
                  <div className="flex flex-row justify-center items-end gap-4 max-w-4xl mx-auto">
                    {top3[1] && (
                      <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, type: "spring", stiffness: 400 }}
                        className="flex-1 max-w-[280px]"
                      >
                        <HallOfShameCard 
                          data={top3[1]} 
                          rank={2} 
                          onVote={() => handleVote(top3[1].id, top3[1].votes)}
                          onSelect={setSelectedPothole}
                          darkMode={darkMode}
                        />
                      </motion.div>
                    )}
                    
                    {top3[0] && (
                      <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0, type: "spring", stiffness: 500, damping: 35 }}
                        className="flex-1 max-w-[320px] z-10"
                      >
                        <HallOfShameCard 
                          data={top3[0]} 
                          rank={1} 
                          onVote={() => handleVote(top3[0].id, top3[0].votes)}
                          onSelect={setSelectedPothole}
                          darkMode={darkMode}
                        />
                      </motion.div>
                    )}
                    
                    {top3[2] && (
                      <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
                        className="flex-1 max-w-[280px]"
                      >
                        <HallOfShameCard 
                          data={top3[2]} 
                          rank={3} 
                          onVote={() => handleVote(top3[2].id, top3[2].votes)}
                          onSelect={setSelectedPothole}
                          darkMode={darkMode}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Vertical Stack */}
            <div className="md:hidden">
              <div className={`relative py-6 px-4 rounded-3xl ${darkMode ? 'bg-gradient-to-b from-slate-800/60 to-zinc-800/40 border border-zinc-700/30' : 'bg-gradient-to-b from-zinc-100/80 to-slate-50/50 border border-zinc-200/50'}`}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 rounded-full ${darkMode ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent' : 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent'}`} />
                
                <div className="flex flex-col items-center gap-6">
                  {/* 1st Place */}
                  {top3[0] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, type: "spring" }}
                      className="w-full max-w-[300px]"
                    >
                      <HallOfShameCard 
                        data={top3[0]} 
                        rank={1} 
                        onVote={() => handleVote(top3[0].id, top3[0].votes)}
                        onSelect={setSelectedPothole}
                        darkMode={darkMode}
                      />
                    </motion.div>
                  )}
                  
                  {/* 2nd Place */}
                  {top3[1] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, type: "spring", stiffness: 400 }}
                      className="w-full max-w-[280px]"
                    >
                      <HallOfShameCard 
                        data={top3[1]} 
                        rank={2} 
                        onVote={() => handleVote(top3[1].id, top3[1].votes)}
                        onSelect={setSelectedPothole}
                        darkMode={darkMode}
                      />
                    </motion.div>
                  )}
                  
                  {/* 3rd Place */}
                  {top3[2] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, type: "spring" }}
                      className="w-full max-w-[280px]"
                    >
                      <HallOfShameCard 
                        data={top3[2]} 
                        rank={3} 
                        onVote={() => handleVote(top3[2].id, top3[2].votes)}
                        onSelect={setSelectedPothole}
                        darkMode={darkMode}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- RECENT REPORTS (Grid of larger cards) --- */}
        {theRest.length > 0 && (
          <div className="mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center mb-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="p-2 bg-cyan-500 rounded-lg shadow-md shadow-cyan-500/30"
                >
                  <Megaphone className="text-white" size={18} />
                </motion.div>
                <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Live Feed
                </h2>
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {reports.length} reports awaiting justice
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {theRest.map((hole, index) => (
                  <ReportCard 
                    key={hole.id} 
                    data={hole} 
                    index={index}
                    onVote={() => handleVote(hole.id, hole.votes)}
                    onSelect={setSelectedPothole}
                    darkMode={darkMode}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Empty State */}
        {reports.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-zinc-200 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-black">
              <Camera size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">No Reports Yet</h3>
            <p className="text-zinc-500 font-bold">Be the first to expose a pothole!</p>
          </motion.div>
        )}
      </main>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSubmit={handleCreate} darkMode={darkMode} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedPothole && (
          <PotholeDetailModal 
            data={selectedPothole} 
            onClose={() => setSelectedPothole(null)} 
            onVote={() => handleVote(selectedPothole.id, selectedPothole.votes)}
            darkMode={darkMode}
          />
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 500 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUpload(true)}
        className={`fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all ${darkMode 
          ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border-rose-500/30' 
          : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500 border-rose-500/30'}`}
      >
        <Camera size={24} />
      </motion.button>

      {/* Footer */}
      <footer className={`relative z-10 backdrop-blur-xl border-t ${darkMode 
        ? 'bg-white/5 border-white/10' 
        : 'bg-white/60 border-black/5'}`}>
        <div className="py-10 text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 backdrop-blur-sm ${darkMode 
            ? 'bg-white/10 border border-white/10' 
            : 'bg-black/5 border border-black/5'}`}>
            <Siren size={16} className="text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider">MarkMyPothole</span>
          </div>
          <p className={`text-sm font-medium mb-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Built because my suspension broke
          </p>
          <p className={`text-xs ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Made with frustration and React</p>
        </div>
      </footer>
    </div>
  );
};

// --- COMPONENTS ---

const HallOfShameCard = ({ data, rank, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);
  
  // Badge colors based on rank
  const rankStyles = {
    1: { bg: 'bg-cyan-500', glow: 'shadow-cyan-500/30' },
    2: { bg: 'bg-zinc-400', glow: 'shadow-zinc-400/20' },
    3: { bg: 'bg-amber-500', glow: 'shadow-amber-500/20' },
  };
  
  const style = rankStyles[rank] || rankStyles[3];

  return (
    <motion.div 
      layout
      layoutId={`hall-${data.id}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        layout: { type: "spring", stiffness: 700, damping: 45 },
        delay: rank * 0.05
      }}
      className={`
        relative p-4 rounded-2xl flex flex-col h-full cursor-pointer group backdrop-blur-xl border
        ${darkMode 
          ? 'bg-[#252d4a] border-white/5' 
          : 'bg-[#e2e8f0] border-white/20'}
        ${rank === 1 
          ? `shadow-xl ${style.glow}` 
          : darkMode 
            ? 'shadow-[4px_4px_12px_#151a30,-4px_-4px_12px_#354060]' 
            : 'shadow-[6px_6px_12px_#cbd5e1,-6px_-6px_12px_#ffffff]'
        }
        transition-all duration-150
      `}
    >
      {/* Rank Badge */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.05 + rank * 0.05, type: "spring", stiffness: 500 }}
        className={`absolute -top-3 left-1/2 -translate-x-1/2 ${style.bg} text-white font-bold text-[10px] px-3 py-1 rounded-full whitespace-nowrap z-30 shadow-lg`}
      >
        #{rank} PUBLIC ENEMY
      </motion.div>

      {/* Image Container */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-xl overflow-hidden mb-3 cursor-pointer ${darkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}
      >
        <img 
          src={data.image_url} 
          alt={data.location} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
        />
        {/* Severity Badge */}
        <div className={`absolute top-2 left-2 ${sizeInfo.color} text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1`}>
          <SeverityIcon level={sizeInfo.level} size={10} /> {sizeInfo.label}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center">
          <div className="backdrop-blur-sm bg-white/80 text-black text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            View Details
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">{sizeInfo.title}</h3>
          <div className={`flex items-center gap-1 text-xs truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <MapPin size={10} className="flex-shrink-0" /> 
            <span className="truncate">{getDisplayLocation(data.location)}</span>
          </div>
        </div>
        <UpvoteButton onVote={onVote} votes={data.votes} size="sm" darkMode={darkMode} />
      </div>
    </motion.div>
  );
};

const FeedCard = ({ data, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);

  return (
    <motion.div 
      layout
      layoutId={`feed-${data.id}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 4 }}
      transition={{ 
        layout: { type: "spring", stiffness: 400, damping: 35 },
        opacity: { duration: 0.2 }
      }}
      className={`rounded-xl p-3 flex gap-3 items-center cursor-pointer border ${
        darkMode 
          ? 'bg-[#252d4a] border-white/5 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060] hover:shadow-[6px_6px_14px_#151a30,-6px_-6px_14px_#354060]' 
          : 'bg-[#e2e8f0] border-white/20 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#cbd5e1,-7px_-7px_14px_#ffffff]'
      } transition-all duration-200`}
    >
      <div 
        onClick={() => onSelect(data)}
        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden relative cursor-pointer ${darkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}
      >
        <img src={data.image_url} alt={data.location} className="w-full h-full object-cover hover:scale-105 transition-transform duration-150" />
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-sm bg-black/60 text-white text-[7px] font-bold text-center py-0.5 flex items-center justify-center gap-0.5">
          <SeverityIcon level={sizeInfo.level} size={8} /> {sizeInfo.label}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <span className={`${sizeInfo.color} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full inline-block mb-1`}>
          {sizeInfo.title}
        </span>
        <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <MapPin size={10} /> {getDisplayLocation(data.location)}
        </p>
      </div>

      <UpvoteButton onVote={onVote} votes={data.votes} size="md" darkMode={darkMode} />
    </motion.div>
  );
};

// Large card for Recent Reports grid
const ReportCard = ({ data, index, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
      className={`
        relative p-4 rounded-2xl flex flex-col cursor-pointer group border
        ${darkMode 
          ? 'bg-[#252d4a] border-white/5 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060] hover:shadow-[6px_6px_14px_#151a30,-6px_-6px_14px_#354060]' 
          : 'bg-[#e2e8f0] border-white/20 shadow-[5px_5px_10px_#cbd5e1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#cbd5e1,-7px_-7px_14px_#ffffff]'}
        transition-all duration-150
      `}
    >
      {/* Image Container */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-xl overflow-hidden mb-3 cursor-pointer ${darkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}
      >
        <img 
          src={data.image_url} 
          alt={data.location} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
        />
        {/* Severity Badge */}
        <div className={`absolute top-2 left-2 ${sizeInfo.color} text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1`}>
          <SeverityIcon level={sizeInfo.level} size={10} /> {sizeInfo.label}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-150 flex items-center justify-center">
          <div className="backdrop-blur-sm bg-white/80 text-black text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            View Details
          </div>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">{sizeInfo.title}</h3>
          <div className={`flex items-center gap-1 text-xs truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <MapPin size={10} className="flex-shrink-0" /> 
            <span className="truncate">{getDisplayLocation(data.location)}</span>
          </div>
        </div>
        <UpvoteButton onVote={onVote} votes={data.votes} size="md" darkMode={darkMode} />
      </div>
    </motion.div>
  );
};

const PotholeDetailModal = ({ data, onClose, onVote, darkMode }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const sizeInfo = getSizeFromSeverity(data.severity);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 1));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl md:rounded-3xl border backdrop-blur-xl overflow-hidden max-h-[95vh] flex flex-col md:flex-row shadow-2xl ${darkMode 
          ? 'bg-zinc-900/90 border-white/10' 
          : 'bg-white/90 border-black/10'}`}
      >
        {/* Image Section */}
        <div className="relative bg-zinc-900 overflow-hidden flex-1 min-h-[250px] md:min-h-[450px]">
          <motion.div
            drag={zoom > 1}
            dragConstraints={{ left: -150, right: 150, top: -150, bottom: 150 }}
            dragElastic={0.1}
            style={{ 
              scale: zoom,
              x: position.x,
              y: position.y,
              cursor: zoom > 1 ? 'grab' : 'default'
            }}
            className="w-full h-full"
          >
            <img 
              src={data.image_url} 
              alt={data.location}
              className="w-full h-full object-contain"
              draggable={false}
            />
          </motion.div>

          {/* Close button on image */}
          <button 
            onClick={onClose} 
            className="absolute top-3 right-3 backdrop-blur-sm bg-black/50 hover:bg-red-600 text-white p-2 rounded-full transition-colors md:hidden"
          >
            <X size={20} />
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg border border-white/20 disabled:opacity-40"
            >
              <ZoomOut size={16} />
            </motion.button>
            <div className="backdrop-blur-sm bg-black/50 text-white text-xs font-bold px-3 py-2 rounded-lg border border-white/20">
              {Math.round(zoom * 100)}%
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg border border-white/20 disabled:opacity-40"
            >
              <ZoomIn size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="backdrop-blur-sm bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg border border-white/20"
            >
              <RotateCcw size={16} />
            </motion.button>
          </div>

          {/* Severity Badge on image */}
          <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg backdrop-blur-sm shadow-lg flex items-center gap-1.5`}>
            <SeverityIcon level={sizeInfo.level} size={14} /> {sizeInfo.label}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className={`w-full md:w-72 border-t md:border-t-0 md:border-l p-4 flex flex-col ${darkMode ? 'border-white/10' : 'border-black/10'}`}>
          {/* Header with close */}
          <div className="hidden md:flex justify-between items-start mb-4">
            <div className={`${sizeInfo.color} text-white text-3xl p-3 rounded-xl shadow-lg flex items-center justify-center`}>
              <SeverityIcon level={sizeInfo.level} size={32} />
            </div>
            <button onClick={onClose} className={`transition-all duration-200 active:scale-90 p-1.5 rounded-full ${
              darkMode 
                ? 'bg-[#252d4a] text-zinc-500 hover:text-red-400 shadow-[4px_4px_8px_#151a30,-4px_-4px_8px_#354060] active:shadow-[inset_2px_2px_4px_#151a30,inset_-2px_-2px_4px_#354060]' 
                : 'bg-[#f8fafc] text-zinc-400 hover:text-red-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'
            }`}>
              <X size={20} />
            </button>
          </div>

          {/* Title */}
          <h2 className={`text-xl md:text-2xl font-black uppercase leading-tight mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{sizeInfo.title}</h2>
          <div className={`flex items-center gap-1 font-bold text-xs mb-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
            <MapPin size={12} /> {getDisplayLocation(data.location)}
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4 flex-1">
            <div className={`flex items-center justify-between rounded-xl p-3 backdrop-blur-sm border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
              <span className={`text-xs font-bold uppercase flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <AlertTriangle size={12} /> Severity
              </span>
              <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{data.severity}</span>
            </div>
            <div className={`flex items-center justify-between rounded-xl p-3 backdrop-blur-sm border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/5'}`}>
              <span className={`text-xs font-bold uppercase flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                <Calendar size={12} /> Reported
              </span>
              <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Vote Section */}
          <div className={`rounded-2xl p-4 backdrop-blur-sm border ${darkMode ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-cyan-500/5 border-cyan-500/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-bold uppercase ${darkMode ? 'text-cyan-300' : 'text-cyan-400'}`}>Angry Voters</span>
                <span className={`block text-3xl font-black ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>🔥 {data.votes}</span>
              </div>
              <UpvoteButton onVote={onVote} votes={data.votes} size="md" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


const UploadModal = ({ onClose, onSubmit, darkMode }) => {
  const [step, setStep] = useState(1);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [size, setSize] = useState(3);
  const [location, setLocation] = useState('');
  const [uploading, setUploading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [model, setModel] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Load the Teachable Machine model on mount
  useEffect(() => {
    const loadModel = async () => {
      try {
        const modelURL = '/pothole_model/model.json';
        const metadataURL = '/pothole_model/metadata.json';
        const loadedModel = await window.tmImage.load(modelURL, metadataURL);
        setModel(loadedModel);
        console.log('Pothole detection model loaded!');
      } catch (err) {
        console.error('Failed to load model:', err);
      }
    };
    loadModel();
  }, []);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      // Fallback to IP-based location
      await getLocationByIP();
      return;
    }

    setFetchingLocation(true);
    setError('');

    const handleSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      await reverseGeocode(latitude, longitude);
      setFetchingLocation(false);
    };

    const handleError = async (err) => {
      console.log('GPS Error:', err.code, err.message);
      // Try IP-based fallback
      await getLocationByIP();
    };

    // Try with lower accuracy first (faster, works on desktop)
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  };

  const getLocationByIP = async () => {
    setFetchingLocation(true);
    try {
      // Free IP geolocation API
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        if (data.city) {
          setLocation(`${data.city}${data.region ? ', ' + data.region : ''}`);
        } else {
          setError('Could not detect location. Please enter manually.');
        }
      } else {
        setError('Could not detect location. Please enter manually.');
      }
    } catch (err) {
      setError('Could not detect location. Please enter manually.');
    }
    setFetchingLocation(false);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Reverse geocode using OpenStreetMap Nominatim (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Build a short address
        const addr = data.address;
        const shortAddress = addr.road 
          ? `${addr.road}${addr.suburb ? ', ' + addr.suburb : ''}${addr.city ? ', ' + addr.city : ''}`
          : data.display_name.split(',').slice(0, 3).join(',');
        setLocation(shortAddress);
      } else {
        // Fallback to coordinates
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
      }
    } catch (err) {
      // Fallback to coordinates on error
      setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    }
  };

  // Validate image using Teachable Machine model
  const validateImage = async (imageElement) => {
    if (!model) {
      console.warn('Model not loaded, skipping validation');
      return true; // Allow if model failed to load
    }

    try {
      const predictions = await model.predict(imageElement);
      console.log('Predictions:', predictions);

      // Find the pothole prediction
      const potholePrediction = predictions.find(p => p.className === 'Pothole');
      const nonPotholePrediction = predictions.find(p => p.className === 'Non Pothole');

      console.log('Pothole confidence:', potholePrediction?.probability);
      console.log('Non-Pothole confidence:', nonPotholePrediction?.probability);

      // Require at least 60% confidence that it's a pothole
      if (potholePrediction && potholePrediction.probability >= 0.6) {
        return true;
      }

      return false;
    } catch (err) {
      console.error('Validation error:', err);
      return true; // Allow on error
    }
  };

  // Compress image to reduce file size while maintaining quality
  // Max dimension: 1920px (Full HD), Quality: 88% JPEG
  const compressImage = (imageElement, originalFile) => {
    return new Promise((resolve) => {
      const MAX_DIMENSION = 1920; // Full HD
      const QUALITY = 0.88; // 88% quality - excellent visual quality with good compression

      let { width, height } = imageElement;
      
      // Calculate new dimensions while maintaining aspect ratio
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      // Create canvas for compression
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      
      // Use high-quality image smoothing for resize
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw image to canvas at new size
      ctx.drawImage(imageElement, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create a new File object with proper name
            const compressedFile = new File(
              [blob], 
              originalFile.name.replace(/\.[^/.]+$/, '.jpg'), // Ensure .jpg extension
              { type: 'image/jpeg' }
            );
            
            // Log compression stats
            const originalSize = (originalFile.size / 1024 / 1024).toFixed(2);
            const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2);
            const savings = ((1 - compressedFile.size / originalFile.size) * 100).toFixed(0);
            console.log(`📸 Image compressed: ${originalSize}MB → ${compressedSize}MB (${savings}% smaller)`);
            console.log(`📐 Dimensions: ${imageElement.width}x${imageElement.height} → ${width}x${height}`);
            
            resolve(compressedFile);
          } else {
            // Fallback to original if compression fails
            console.warn('Compression failed, using original file');
            resolve(originalFile);
          }
        },
        'image/jpeg',
        QUALITY
      );
    });
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setValidating(true);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImgPreview(previewUrl);

    // Create an image element for validation
    const img = new Image();
    img.src = previewUrl;

    img.onload = async () => {
      const isPothole = await validateImage(img);

      if (isPothole) {
        // Compress the image before storing
        const compressedFile = await compressImage(img, file);
        setImgFile(compressedFile);
        setStep(2);
        setValidating(false);
      } else {
        // Not a pothole - reject!
        setError('This doesn\'t look like a pothole! Please upload an image of an actual pothole.');
        setImgPreview(null);
        setImgFile(null);
        setValidating(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    img.onerror = () => {
      setError('Failed to load image. Please try another.');
      setImgPreview(null);
      setValidating(false);
    };
  };

  const handleSubmit = async () => {
    if (!imgFile) {
      setError('No image selected. Please add a photo first.');
      return;
    }
    
    setUploading(true);
    setError('');

    try {
      // Check if we have valid Supabase credentials
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Production Error: Missing Supabase credentials. You must add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY to your deployment environment variables (Netlify/Vercel settings).');
      }

      const fileExt = imgFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      console.log('📤 Starting upload...', { fileName, fileSize: (imgFile.size / 1024).toFixed(1) + 'KB' });

      // Upload image to storage
      const uploadResponse = await fetch(
        `${SUPABASE_URL}/storage/v1/object/potholes/${fileName}`,
        {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': imgFile.type,
          },
          body: imgFile
        }
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', uploadResponse.status, errorText);
        
        if (uploadResponse.status === 413) {
          throw new Error('Image file is too large. Please try a smaller image.');
        } else if (uploadResponse.status === 401 || uploadResponse.status === 403) {
          throw new Error('Authentication failed. Please refresh the page and try again.');
        } else if (uploadResponse.status === 500) {
          throw new Error('Server error. Please try again in a moment.');
        } else {
          throw new Error(`Failed to upload image (Error ${uploadResponse.status}). Please try again.`);
        }
      }

      console.log('✅ Image uploaded successfully');

      const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/potholes/${fileName}`;
      const sizeData = SIZES.find(s => s.level === size);
      
      const newPothole = {
        image_url: imageUrl,
        location: location.trim() || "Unknown Location",
        severity: sizeData.dbLabel,
        votes: 1
      };

      console.log('📝 Saving to database...');

      // Insert to database
      const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/potholes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(newPothole)
      });

      if (!insertResponse.ok) {
        const errorText = await insertResponse.text();
        console.error('Database insert failed:', insertResponse.status, errorText);
        
        if (insertResponse.status === 401 || insertResponse.status === 403) {
          throw new Error('Permission denied. Please refresh and try again.');
        } else {
          throw new Error(`Failed to save report (Error ${insertResponse.status}). The image was uploaded but the report wasn't saved.`);
        }
      }

      const [created] = await insertResponse.json();
      console.log('✅ Report saved successfully:', created.id);
      onSubmit(created);

    } catch (err) {
      console.error('Upload error:', err);
      
      // Handle specific error types
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.name === 'AbortError') {
        setError('Upload timed out. Please try again with a smaller image.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.1 }}
        className={`w-full max-w-sm rounded-2xl backdrop-blur-xl border overflow-hidden shadow-2xl ${darkMode 
          ? 'bg-zinc-900/90 border-white/10' 
          : 'bg-white/90 border-black/10'}`}
      >
        {/* Modal Header */}
        <div className={`p-3 flex justify-between items-center border-b ${darkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-black/5 border-black/5'}`}>
          <h3 className={`font-black uppercase tracking-wider text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Report Pothole</h3>
          <button onClick={onClose} className={`transition-all duration-200 active:scale-90 p-1.5 rounded-full ${
            darkMode 
              ? 'bg-[#252d4a] text-zinc-400 hover:text-red-400 shadow-[4px_4px_8px_#151a30,-4px_-4px_8px_#354060] active:shadow-[inset_2px_2px_4px_#151a30,inset_-2px_-2px_4px_#354060]' 
              : 'bg-[#f8fafc] text-zinc-500 hover:text-red-500 shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]'
          }`}>
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className={`text-sm font-medium p-3 rounded-xl mb-4 backdrop-blur-sm border flex items-start gap-2 ${darkMode 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-600'}`}
            >
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
              <button 
                onClick={() => setError('')}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}

          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => !validating && fileInputRef.current?.click()}
              className={`group cursor-pointer border-2 border-dashed h-56 rounded-xl flex flex-col items-center justify-center transition-colors ${
                validating 
                  ? darkMode ? 'border-cyan-500 bg-cyan-900/20' : 'border-cyan-400 bg-cyan-50'
                  : darkMode ? 'border-zinc-700 bg-zinc-800/50 hover:border-cyan-500' : 'border-zinc-200 bg-zinc-50 hover:border-cyan-400'
              }`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              
              {validating ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="bg-cyan-500 p-4 rounded-full mb-3"
                  >
                    <Loader2 size={32} className="text-white" />
                  </motion.div>
                  <p className={`font-bold uppercase text-sm ${darkMode ? 'text-cyan-400' : 'text-cyan-500'}`}>Analyzing Image...</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-cyan-400' : 'text-cyan-400'}`}>AI is checking for potholes</p>
                </>
              ) : (
                <>
                  <div className={`p-4 rounded-full border-2 mb-3 group-hover:scale-110 transition-transform ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                    <Camera size={32} className={`${darkMode ? 'text-zinc-500 group-hover:text-cyan-400' : 'text-zinc-500 group-hover:text-cyan-400'}`} />
                  </div>
                  <p className={`font-bold uppercase text-sm ${darkMode ? 'text-zinc-400 group-hover:text-cyan-400' : 'text-zinc-600 group-hover:text-cyan-400'}`}>Tap to Add Photo</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Take photo or choose from library</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Preview */}
              <div className="relative h-36 bg-zinc-900 rounded-xl border-2 border-zinc-700 overflow-hidden">
                <img src={imgPreview} className="w-full h-full object-cover" alt="Preview" />
                <button 
                  onClick={() => { setStep(1); setImgPreview(null); setImgFile(null); }} 
                  className="absolute top-2 right-2 backdrop-blur-sm bg-black/50 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-500 transition-colors"
                >
                  RETAKE
                </button>
              </div>

              {/* Size Selector */}
              <div>
                <label className={`block text-[10px] font-black uppercase mb-1.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Severity Level</label>
                <div className="flex gap-2">
                  {SIZES.map(s => (
                    <motion.button
                      key={s.level}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSize(s.level)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center duration-200 active:scale-95 ${
                        size === s.level 
                          ? darkMode
                            ? 'bg-[#252d4a] text-cyan-400 shadow-[inset_4px_4px_10px_#151a30,inset_-4px_-4px_10px_#354060] border border-cyan-500/20'
                            : 'bg-[#f8fafc] text-cyan-500 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-cyan-500/20'
                          : darkMode 
                            ? 'bg-[#252d4a] text-zinc-500 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060] hover:shadow-[6px_6px_12px_#151a30,-6px_-6px_12px_#354060]' 
                            : 'bg-[#f8fafc] text-zinc-400 shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#d1d5db,-7px_-7px_14px_#ffffff]'
                      }`}
                    >
                      <SeverityIcon level={s.level} size={20} />
                    </motion.button>
                  ))}
                </div>
                <div className={`text-center mt-1.5 font-black uppercase text-sm ${darkMode ? 'text-cyan-400' : 'text-cyan-400'}`}>
                  "{SIZES.find(s => s.level === size).title}"
                </div>
              </div>

              {/* Location */}
              <div>
                <label className={`block text-[10px] font-black uppercase mb-1.5 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}>Location</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 5th Avenue Intersection"
                    className={`flex-1 rounded-lg p-2.5 font-bold text-sm outline-none transition-all ${
                      darkMode 
                        ? 'bg-[#252d4a] text-white placeholder-zinc-600 shadow-[inset_4px_4px_10px_#151a30,inset_-4px_-4px_10px_#354060] focus:shadow-[inset_6px_6px_12px_#151a30,inset_-6px_-6px_12px_#354060]' 
                        : 'bg-[#e2e8f0] text-zinc-900 placeholder-zinc-500 shadow-[inset_4px_4px_8px_#cbd5e1,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_6px_6px_12px_#cbd5e1,inset_-6px_-6px_12px_#ffffff]'
                    }`}
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={getLocation}
                    disabled={fetchingLocation}
                    className={`px-3 rounded-lg font-bold transition-all flex items-center justify-center duration-200 active:scale-95 ${
                      fetchingLocation 
                        ? darkMode 
                          ? 'bg-zinc-800 text-zinc-600 shadow-none cursor-wait' 
                          : 'bg-zinc-200 text-zinc-400 shadow-none cursor-wait'
                        : darkMode 
                          ? 'bg-[#252d4a] text-cyan-400 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060] hover:shadow-[6px_6px_12px_#151a30,-6px_-6px_12px_#354060] active:shadow-[inset_3px_3px_6px_#151a30,inset_-3px_-3px_6px_#354060]' 
                          : 'bg-[#f8fafc] text-cyan-500 shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#d1d5db,-7px_-7px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
                    }`}
                    title="Get current location"
                  >
                    {fetchingLocation ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <LocateFixed size={18} />
                    )}
                  </motion.button>
                </div>
                <p className={`text-[9px] mt-1 ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>Type manually or tap GPS button</p>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={uploading}
                className={`w-full font-black uppercase py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 duration-200 active:scale-95 ${
                  darkMode 
                    ? 'bg-[#252d4a] text-cyan-400 shadow-[4px_4px_10px_#151a30,-4px_-4px_10px_#354060] hover:shadow-[6px_6px_12px_#151a30,-6px_-6px_12px_#354060] active:shadow-[inset_3px_3px_6px_#151a30,inset_-3px_-3px_6px_#354060]' 
                    : 'bg-[#f8fafc] text-cyan-500 shadow-[5px_5px_10px_#d1d5db,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#d1d5db,-7px_-7px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Submit Report
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default App;
