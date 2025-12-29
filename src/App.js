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

// --- SEVERITY SIZES ---
const SIZES = [
  { level: 1, label: "Baby", title: "Ankle Twister", dbLabel: "Baby Pothole", color: "bg-blue-500", text: "text-blue-500" },
  { level: 2, label: "Street", title: "Coffee Spiller", dbLabel: "Street Acne", color: "bg-yellow-500", text: "text-yellow-600" },
  { level: 3, label: "Wheel", title: "The Rim Reaper", dbLabel: "Wheel Destroyer", color: "bg-orange-600", text: "text-orange-600" },
  { level: 4, label: "Crater", title: "Swimming Pool", dbLabel: "Crater", color: "bg-red-600", text: "text-red-600" },
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
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sizes = {
    sm: { padding: "px-2.5 py-1", icon: 12, text: "text-xs" },
    md: { padding: "px-3 py-1.5", icon: 14, text: "text-sm" },
  };
  
  const s = sizes[size] || sizes.md;
  
  const handleClick = (e) => {
    e.stopPropagation();
    setIsAnimating(true);
    onVote();
    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={handleClick}
      className={`${s.padding} rounded-lg font-bold ${s.text} transition-all duration-200 flex items-center gap-1 flex-shrink-0 backdrop-blur-sm border ${
        darkMode 
          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30' 
          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 border-rose-500/30'
      }`}
    >
      {/* Vote count */}
      <motion.span 
        key={votes}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        className="font-black"
      >
        {votes}
      </motion.span>
      
      {/* Icon with animation */}
      <motion.div
        animate={isAnimating ? { 
          y: [0, -3, 0],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <ChevronUp size={s.icon} strokeWidth={3} />
      </motion.div>
    </motion.button>
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
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/potholes?select=*&order=created_at.desc`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sort by votes descending for Hall of Shame
  const sortedReports = [...reports].sort((a, b) => b.votes - a.votes);
  const top3 = sortedReports.slice(0, 3);
  const theRest = sortedReports.slice(3);

  const handleVote = async (id, currentVotes) => {
    // Optimistic update
    setReports(prev => prev.map(item => 
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ));

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/potholes?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ votes: currentVotes + 1 })
      });
    } catch (err) {
      // Revert on error
      setReports(prev => prev.map(item => 
        item.id === id ? { ...item, votes: item.votes - 1 } : item
      ));
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
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-zinc-700 border-t-teal-400 rounded-full mx-auto mb-4"
          />
          <p className="font-black uppercase text-zinc-400">Loading disasters...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans selection:bg-teal-400 overflow-x-hidden ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
      
      {/* GLASSMORPHISM BACKGROUND - Gradient Mesh */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className={`absolute inset-0 ${darkMode 
          ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950' 
          : 'bg-gradient-to-br from-slate-100 via-zinc-50 to-slate-100'}`} 
        />
        {/* Colored orbs for depth */}
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl ${darkMode ? 'bg-teal-500/20' : 'bg-teal-400/30'}`} />
        <div className={`absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full blur-3xl ${darkMode ? 'bg-rose-500/15' : 'bg-rose-400/20'}`} />
        <div className={`absolute bottom-0 left-1/3 w-[600px] h-[400px] rounded-full blur-3xl ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-400/15'}`} />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />
      </div>
      
      {/* --- HEADER (Glassmorphism) --- */}
      <header className="sticky top-0 z-50">
        <div className={`backdrop-blur-xl border-b ${darkMode 
          ? 'bg-zinc-900/70 border-white/10' 
          : 'bg-white/70 border-black/5'}`}
        >
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Brand */}
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className={`hidden md:flex p-2.5 rounded-xl backdrop-blur-sm ${darkMode 
                    ? 'bg-teal-500/20 border border-teal-500/30' 
                    : 'bg-teal-500 border border-teal-600/30'}`}
                >
                  <Siren size={22} className={darkMode ? 'text-teal-400' : 'text-white'} />
                </motion.div>
                <div>
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none"
                  >
                    <span className={darkMode ? 'text-white' : 'text-zinc-900'}>MARKMY</span>
                    <span className="text-teal-500">POTHOLE</span>
                  </motion.h1>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className={`text-xs font-medium mt-0.5 ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}
                  >
                    They ignore it, <span className={darkMode ? 'text-white' : 'text-zinc-900'}>We expose it.</span>
                  </motion.p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUpload(true)}
                  className={`flex items-center gap-2 font-bold py-2.5 px-4 rounded-xl transition-all backdrop-blur-sm border ${darkMode 
                    ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30' 
                    : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 border-rose-500/30'}`}
                >
                  <Camera size={18} strokeWidth={2.5} />
                  <span className="hidden sm:inline text-sm">REPORT</span>
                </motion.button>
                
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${darkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/10' 
                    : 'bg-black/5 hover:bg-black/10 border border-black/5'}`}
                  title={darkMode ? 'Light Mode' : 'Dark Mode'}
                >
                  {darkMode ? (
                    <Sun size={18} className="text-amber-400" />
                  ) : (
                    <Moon size={18} className="text-zinc-600" />
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STATS BAR (Glassmorphism Cards) */}
      <div className="relative z-10 py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {/* Reported */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl border ${darkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/60 border-white/80 shadow-lg shadow-black/5'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-rose-500/20' : 'bg-rose-500/10'}`}>
                <AlertTriangle size={18} className="text-rose-500" />
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
              transition={{ delay: 0.2 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl border ${darkMode 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/60 border-white/80 shadow-lg shadow-black/5'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-teal-500/20' : 'bg-teal-500/10'}`}>
                <Flame size={18} className="text-teal-500" />
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
              transition={{ delay: 0.3 }}
              className={`flex items-center gap-3 px-5 py-3 rounded-2xl backdrop-blur-xl border border-dashed ${darkMode 
                ? 'bg-white/[0.02] border-white/10' 
                : 'bg-white/40 border-zinc-300 shadow-lg shadow-black/5'}`}
            >
              <div className={`p-2 rounded-xl ${darkMode ? 'bg-zinc-500/20' : 'bg-zinc-500/10'}`}>
                <Trophy size={18} className={darkMode ? 'text-zinc-500' : 'text-zinc-500'} />
              </div>
              <div>
                <span className={`block text-2xl font-black leading-none ${darkMode ? 'text-zinc-600' : 'text-zinc-300'}`}>
                  0
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${darkMode ? 'text-zinc-600' : 'text-zinc-500'}`}>
                  Fixed (lol)
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
              <span className="text-rose-500">●</span> POTHOLE CRISIS <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> ROADS ARE BROKEN <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> WHERE ARE OUR TAX DOLLARS? <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> RIP SUSPENSION <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> 
              <span className="text-teal-500">●</span> MOST WANTED POTHOLES <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> FIX THE ROADS <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> CITIZENS UNITE <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> HALL OF SHAME <span className={darkMode ? 'text-zinc-700' : 'text-zinc-300'}>—</span> 
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
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30"
                >
                  <Trophy className="text-white" size={20} />
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center justify-center"
              >
                <div 
                  className="flex items-center gap-3"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-rose-500 rounded-xl shadow-lg shadow-rose-500/30"
                  >
                    <Trophy className="text-white" size={20} />
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
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 rounded-full ${darkMode ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-50' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent opacity-30'}`} />
                  
                  <div className="flex flex-row justify-center items-end gap-4 max-w-4xl mx-auto">
                    {top3[1] && (
                      <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, type: "spring" }}
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
                        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
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
                        transition={{ delay: 0.3, type: "spring" }}
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
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 rounded-full ${darkMode ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'}`} />
                
                <div className="flex flex-col items-center gap-6">
                  {/* 1st Place */}
                  {top3[0] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, type: "spring" }}
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
                      transition={{ delay: 0.2, type: "spring" }}
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
                      transition={{ delay: 0.3, type: "spring" }}
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
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-teal-500 rounded-lg shadow-md shadow-teal-500/30"
                >
                  <Megaphone className="text-white" size={18} />
                </motion.div>
                <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Recent Reports
                </h2>
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {theRest.length} more awaiting justice
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
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowUpload(true)}
        className={`fixed bottom-6 right-6 z-40 md:hidden w-14 h-14 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all ${darkMode 
          ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border-rose-500/30' 
          : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-600 border-rose-500/30'}`}
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
            <Siren size={16} className="text-teal-500" />
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
    1: { bg: 'bg-rose-500', glow: 'shadow-rose-500/30' },
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
        layout: { type: "spring", stiffness: 350, damping: 30 },
        delay: rank * 0.1
      }}
      className={`
        relative p-4 rounded-2xl flex flex-col h-full cursor-pointer group backdrop-blur-xl border
        ${darkMode 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-white/60 border-white/80 hover:bg-white/80'}
        ${rank === 1 ? `shadow-xl ${style.glow}` : 'shadow-lg shadow-black/5'}
        transition-all duration-300
      `}
    >
      {/* Rank Badge */}
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3 + rank * 0.1, type: "spring" }}
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
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Severity Badge */}
        <div className={`absolute top-2 left-2 ${sizeInfo.color} text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1`}>
          <SeverityIcon level={sizeInfo.level} size={10} /> {sizeInfo.label}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
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
      className={`rounded-xl p-3 flex gap-3 items-center cursor-pointer backdrop-blur-xl border ${
        darkMode 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-white/60 border-white/80 hover:bg-white/80'
      } transition-all duration-200`}
    >
      <div 
        onClick={() => onSelect(data)}
        className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden relative cursor-pointer ${darkMode ? 'ring-1 ring-white/10' : 'ring-1 ring-black/5'}`}
      >
        <img src={data.image_url} alt={data.location} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
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

      <UpvoteButton onVote={onVote} votes={data.votes} size="sm" darkMode={darkMode} />
    </motion.div>
  );
};

// Large card for Recent Reports grid
const ReportCard = ({ data, index, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);

  return (
    <motion.div 
      layout
      layoutId={`report-${data.id}`}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        layout: { type: "spring", stiffness: 400, damping: 35 },
        delay: index * 0.05
      }}
      className={`
        relative p-4 rounded-2xl flex flex-col cursor-pointer group backdrop-blur-xl border
        ${darkMode 
          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
          : 'bg-white/60 border-white/80 hover:bg-white/80'}
        shadow-lg shadow-black/5 hover:shadow-xl transition-all duration-300
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
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Severity Badge */}
        <div className={`absolute top-2 left-2 ${sizeInfo.color} text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1`}>
          <SeverityIcon level={sizeInfo.level} size={10} /> {sizeInfo.label}
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
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
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
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
            <button onClick={onClose} className={`transition-colors ${darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'}`}>
              <X size={24} />
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
          <div className={`rounded-2xl p-4 backdrop-blur-sm border ${darkMode ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-500/5 border-rose-500/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm font-bold uppercase ${darkMode ? 'text-rose-300' : 'text-rose-400'}`}>Angry Voters</span>
                <span className={`block text-3xl font-black ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>🔥 {data.votes}</span>
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
        throw new Error('Configuration error: Missing Supabase credentials. Please check your environment variables.');
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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className={`w-full max-w-sm rounded-2xl backdrop-blur-xl border overflow-hidden shadow-2xl ${darkMode 
          ? 'bg-zinc-900/90 border-white/10' 
          : 'bg-white/90 border-black/10'}`}
      >
        {/* Modal Header */}
        <div className={`p-3 flex justify-between items-center border-b ${darkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-black/5 border-black/5'}`}>
          <h3 className={`font-black uppercase tracking-wider text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Report Pothole</h3>
          <button onClick={onClose} className={`transition-colors ${darkMode ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-500 hover:text-red-500'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
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
                  ? darkMode ? 'border-teal-500 bg-teal-900/20' : 'border-teal-400 bg-teal-50'
                  : darkMode ? 'border-zinc-700 bg-zinc-800/50 hover:border-teal-500' : 'border-zinc-200 bg-zinc-50 hover:border-teal-400'
              }`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              
              {validating ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="bg-teal-500 p-4 rounded-full mb-3"
                  >
                    <Loader2 size={32} className="text-white" />
                  </motion.div>
                  <p className={`font-bold uppercase text-sm ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Analyzing Image...</p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-teal-500' : 'text-teal-500'}`}>AI is checking for potholes</p>
                </>
              ) : (
                <>
                  <div className={`p-4 rounded-full border-2 mb-3 group-hover:scale-110 transition-transform ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                    <Camera size={32} className={`${darkMode ? 'text-zinc-500 group-hover:text-teal-400' : 'text-zinc-500 group-hover:text-teal-500'}`} />
                  </div>
                  <p className={`font-bold uppercase text-sm ${darkMode ? 'text-zinc-400 group-hover:text-teal-400' : 'text-zinc-600 group-hover:text-teal-500'}`}>Tap to Add Photo</p>
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
                      className={`flex-1 py-3 rounded-xl backdrop-blur-sm border font-bold transition-all flex items-center justify-center ${
                        size === s.level 
                          ? `${s.color} text-white border-transparent shadow-lg` 
                          : darkMode 
                            ? 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10' 
                            : 'bg-black/5 border-black/5 text-zinc-500 hover:bg-black/10'
                      }`}
                    >
                      <SeverityIcon level={s.level} size={20} />
                    </motion.button>
                  ))}
                </div>
                <div className={`text-center mt-1.5 font-black uppercase text-sm ${darkMode ? 'text-rose-400' : 'text-rose-500'}`}>
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
                    className={`flex-1 border-2 rounded-lg p-2.5 font-bold text-sm outline-none transition-colors ${
                      darkMode 
                        ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-600 focus:border-teal-500' 
                        : 'bg-zinc-100 border-transparent text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-teal-400'
                    }`}
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={getLocation}
                    disabled={fetchingLocation}
                    className={`px-3 rounded-lg backdrop-blur-sm border font-bold transition-all flex items-center justify-center ${
                      fetchingLocation 
                        ? darkMode 
                          ? 'bg-zinc-600/50 text-zinc-500 cursor-wait border-zinc-600' 
                          : 'bg-zinc-300/50 text-zinc-500 cursor-wait border-zinc-300'
                        : darkMode 
                          ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border-teal-500/30' 
                          : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-600 border-teal-500/30'
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
                className={`w-full font-black uppercase py-3 rounded-xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 backdrop-blur-sm border ${
                  darkMode 
                    ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 border-teal-500/30' 
                    : 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-600 border-teal-500/30'
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