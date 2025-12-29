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
  ChevronUp
} from 'lucide-react';

// --- SUPABASE CONFIG ---
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// --- SEVERITY SIZES ---
const SIZES = [
  { level: 1, label: "Baby", title: "Ankle Twister", emoji: "🤕", dbLabel: "Baby Pothole", color: "bg-blue-500", text: "text-blue-500" },
  { level: 2, label: "Street", title: "Coffee Spiller", emoji: "☕", dbLabel: "Street Acne", color: "bg-yellow-500", text: "text-yellow-600" },
  { level: 3, label: "Wheel", title: "The Rim Reaper", emoji: "💀", dbLabel: "Wheel Destroyer", color: "bg-orange-600", text: "text-orange-600" },
  { level: 4, label: "Crater", title: "Swimming Pool", emoji: "🏊", dbLabel: "Crater", color: "bg-red-600", text: "text-red-600" },
];

const getSizeFromSeverity = (severity) => {
  return SIZES.find(s => s.dbLabel === severity) || SIZES[2];
};

// Helper to display location or fallback
const getDisplayLocation = (location) => {
  if (!location || location.trim() === '' || location === 'null' || location === 'undefined') {
    return 'Somewhere on Earth 🌍';
  }
  // Also check for "unknown location" variations
  const lowerLocation = location.toLowerCase().trim();
  if (lowerLocation === 'unknown location' || lowerLocation === 'unknown' || lowerLocation === 'n/a') {
    return 'Somewhere on Earth 🌍';
  }
  return location;
};

// Custom upvote icon (boxicons)
const UpvoteIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
  >
    <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14z"/>
  </svg>
);

// Animated Upvote Button with count
const UpvoteButton = ({ onVote, votes = 0, size = "md" }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  const sizes = {
    sm: { padding: "px-3 py-1.5", icon: 14, text: "text-sm" },
    md: { padding: "px-4 py-2", icon: 16, text: "text-base" },
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
      className={`${s.padding} rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold ${s.text} shadow-md shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 flex items-center gap-1.5 relative overflow-visible flex-shrink-0`}
    >
      {/* Burst particles */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60) * Math.PI / 180) * 30,
                  y: Math.sin((i * 60) * Math.PI / 180) * 30,
                  opacity: [1, 1, 0]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
                style={{ pointerEvents: 'none' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      
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
          y: [0, -4, 0],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <UpvoteIcon size={s.icon} />
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
      <div className="min-h-screen bg-[#fff0f5] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-black border-t-teal-400 rounded-full mx-auto mb-4"
          />
          <p className="font-black uppercase text-zinc-600">Loading disasters...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans selection:bg-teal-400 overflow-x-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-100 text-zinc-900'}`}>
      
      {/* Animated Dark Mode Background */}
      {darkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Mesh gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-zinc-900 to-slate-950" />
          
          {/* Animated orbs */}
          <motion.div 
            animate={{ 
              x: [0, 100, 50, 0], 
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.9, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-600/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0], 
              y: [0, 100, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 60, -30, 0], 
              y: [0, -40, 40, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 80, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
          />
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Top and bottom glow */}
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-teal-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-slate-900/20 to-transparent" />
        </div>
      )}
      
      {/* --- COMPACT HEADER --- */}
      <header className="relative z-10 bg-gradient-to-r from-zinc-900 via-slate-800 to-zinc-900 text-white py-6 px-4 overflow-hidden">
        {/* Animated Gradient Orbs - Smaller */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 left-1/4 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 right-1/4 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Main Row: Logo + Title | Report Button */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Left: Brand */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="hidden md:flex p-3 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-lg shadow-teal-500/30"
              >
                <Siren size={24} className="text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none"
                >
                  <span className="text-white">MARKMY</span>
                  <span className="text-teal-400">POTHOLE</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs md:text-sm font-medium text-zinc-400 mt-1"
                >
                  They ignore it, <span className="text-white">We expose it.</span>
                </motion.p>
              </div>
            </div>

            {/* Right: Report Button + Dark Mode */}
            <div className="flex items-center gap-3">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold py-3 px-5 rounded-xl shadow-lg shadow-rose-500/30 transition-all"
              >
                <Camera size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">REPORT</span>
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl glass hover:bg-white/20 transition-all"
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
              >
                {darkMode ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} className="text-zinc-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Animated Light Mode Background */}
      {!darkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-rose-200/40 to-pink-200/30 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-40 right-10 w-80 h-80 bg-gradient-to-br from-teal-200/30 to-cyan-200/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, 20, -20, 0], y: [0, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-amber-100/30 to-orange-100/20 rounded-full blur-3xl"
          />
        </div>
      )}

      {/* 🔥 HERO STATS BAR */}
      <div className={`relative z-10 ${darkMode ? 'bg-gradient-to-r from-zinc-900/80 via-slate-800/80 to-zinc-900/80 border-b border-zinc-700/50' : 'bg-gradient-to-r from-white/70 via-zinc-50/80 to-white/70 border-b border-zinc-200/50'} backdrop-blur-lg`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {/* Total Reports */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <motion.span 
                key={reports.length}
                initial={{ scale: 1.5, color: '#f43f5e' }}
                animate={{ scale: 1, color: darkMode ? '#fff' : '#18181b' }}
                className="block text-3xl md:text-4xl font-black"
              >
                {reports.length}
              </motion.span>
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                🕳️ Disasters Exposed
              </span>
            </motion.div>
            
            {/* Total Upvotes */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <motion.span 
                key={reports.reduce((sum, r) => sum + r.votes, 0)}
                initial={{ scale: 1.5, color: '#14b8a6' }}
                animate={{ scale: 1, color: darkMode ? '#fff' : '#18181b' }}
                className="block text-3xl md:text-4xl font-black"
              >
                {reports.reduce((sum, r) => sum + r.votes, 0)}
              </motion.span>
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                🔥 Angry Upvotes
              </span>
            </motion.div>
            
            {/* Fixed (humorous) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <span className={`block text-3xl md:text-4xl font-black ${darkMode ? 'text-rose-400' : 'text-rose-500'}`}>
                0
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                🛠️ Fixed (lol)
              </span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* 🎢 SCROLLING MARQUEE TICKER */}
      <div className={`relative z-10 overflow-hidden py-3 ${darkMode ? 'bg-zinc-900/90 border-y border-zinc-800' : 'bg-zinc-100/90 border-y border-zinc-200'}`}>
        <div className="animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <span key={i} className={`inline-block mx-8 text-sm font-bold uppercase tracking-wider ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
              🚨 POTHOLE CRISIS • 🕳️ ROADS ARE BROKEN • 💰 WHERE ARE OUR TAX DOLLARS? • 🚗 RIP SUSPENSION • ⚠️ DANGER ZONE • 
              🔥 MOST WANTED POTHOLES • 😤 WE'RE MAD • 🛣️ FIX THE ROADS • 📢 CITIZENS UNITE • 🏆 HALL OF SHAME • 
            </span>
          ))}
        </div>
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16 noise-overlay">
        
        {/* --- HALL OF SHAME (TOP 3) --- */}
        {top3.length > 0 && (
          <div className="mb-12">
            {/* Mobile Title */}
            <div className="md:hidden text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-1">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/30"
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
                    className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl shadow-lg shadow-rose-500/30"
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
                <div className={`relative py-6 px-6 rounded-3xl ${darkMode ? 'bg-gradient-to-b from-slate-800/60 to-zinc-800/40 border border-zinc-700/30' : 'bg-gradient-to-b from-zinc-100/80 to-slate-50/50 border border-zinc-200/50'}`}>
                  <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-0.5 rounded-full ${darkMode ? 'bg-gradient-to-r from-transparent via-rose-400 to-transparent' : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent'}`} />
                  
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
                  className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md shadow-teal-500/30"
                >
                  <Megaphone className="text-white" size={18} />
                </motion.div>
                <h2 className={`text-xl md:text-2xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Recent Reports
                </h2>
              </div>
              <p className={`text-xs font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                📢 {theRest.length} more awaiting justice
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
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSubmit={handleCreate} />}
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

      {/* 📱 FLOATING ACTION BUTTON (Mobile) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowUpload(true)}
        className="fixed bottom-6 right-6 z-40 md:hidden w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white shadow-2xl shadow-rose-500/50 flex items-center justify-center"
      >
        {/* Pulsing ring */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-rose-500"
        />
        <Camera size={28} className="relative z-10" />
      </motion.button>

      {/* Footer */}
      <footer className={`relative z-10 py-12 text-center border-t ${darkMode ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-zinc-800' : 'bg-gradient-to-r from-zinc-100 via-white to-zinc-100 border-zinc-200'}`}>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-sm font-medium tracking-wide mb-2 ${darkMode ? 'text-zinc-500' : 'text-zinc-600'}`}
        >
          Built because my suspension broke 🚗💔
        </motion.p>
        <p className={`text-xs ${darkMode ? 'text-zinc-700' : 'text-zinc-500'}`}>Made with frustration and React</p>
      </footer>
    </div>
  );
};

// --- COMPONENTS ---

const HallOfShameCard = ({ data, rank, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);
  
  // Badge colors and emojis based on rank
  const rankStyles = {
    1: { gradient: 'from-rose-500 via-pink-500 to-rose-600', shadow: 'shadow-rose-500/40', emoji: '👑' },
    2: { gradient: 'from-zinc-300 via-slate-400 to-zinc-500', shadow: 'shadow-zinc-400/30', emoji: '🥈' },
    3: { gradient: 'from-orange-500 via-amber-600 to-orange-600', shadow: 'shadow-orange-500/30', emoji: '🥉' },
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
        delay: rank * 0.1,
        hover: { duration: 0.3 }
      }}
      className={`
        relative p-4 rounded-3xl flex flex-col h-full transition-all duration-500 cursor-pointer group/card
        ${darkMode 
          ? 'bg-zinc-900/70 backdrop-blur-xl border border-zinc-700/50 hover:border-teal-500/50' 
          : 'bg-white/70 backdrop-blur-xl border border-zinc-200/50 hover:border-rose-300'}
        ${rank === 1 
          ? 'shadow-2xl shadow-rose-500/20 ring-2 ring-rose-400/30 hover:shadow-rose-500/40' 
          : 'shadow-xl shadow-black/10 hover:shadow-2xl'}
      `}
    >
      {/* Hover glow effect */}
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ${rank === 1 ? 'bg-gradient-to-br from-rose-500/5 to-transparent' : 'bg-gradient-to-br from-teal-500/5 to-transparent'}`} />
      
      {/* Public Enemy Badge - All Ranks */}
      <motion.div 
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3 + rank * 0.1, type: "spring" }}
        className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${style.gradient} text-white font-bold text-xs px-4 py-2 rounded-full whitespace-nowrap z-30 flex items-center gap-2 shadow-lg ${style.shadow}`}
      >
        <motion.span 
          animate={rank === 1 ? { scale: [1, 1.2, 1] } : {}} 
          transition={{ duration: 1, repeat: Infinity }}
        >
          {style.emoji}
        </motion.span>
        Public Enemy #{rank}
      </motion.div>

      {/* Image with parallax-style hover */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-2xl overflow-hidden mb-4 group cursor-pointer ring-1 ${darkMode ? 'bg-zinc-800 ring-zinc-700' : 'bg-zinc-100 ring-zinc-200'}`}
      >
        <motion.img 
          src={data.image_url} 
          alt={data.location} 
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
          {sizeInfo.emoji} {sizeInfo.label}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <ZoomIn className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>

      {/* Compact info row: Title + Location + Vote */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">{sizeInfo.title}</h3>
          <div className={`flex items-center gap-1 text-xs truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <MapPin size={10} className="flex-shrink-0" /> 
            <span className="truncate">{getDisplayLocation(data.location)}</span>
          </div>
        </div>
        <UpvoteButton onVote={onVote} votes={data.votes} size="sm" />
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
      whileHover={{ scale: 1.02, x: 4 }}
      transition={{ 
        layout: { type: "spring", stiffness: 400, damping: 35 },
        opacity: { duration: 0.2 }
      }}
      className={`rounded-2xl p-4 flex gap-4 items-center transition-all duration-300 cursor-pointer ${
        darkMode 
          ? 'bg-gradient-to-r from-zinc-900 to-zinc-800/80 border border-zinc-800 shadow-lg shadow-black/20' 
          : 'bg-white border border-zinc-200 shadow-md shadow-black/5 hover:shadow-lg'
      }`}
    >
      <div 
        onClick={() => onSelect(data)}
        className={`w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative cursor-pointer group ring-1 ${darkMode ? 'bg-zinc-800 ring-zinc-700' : 'bg-zinc-100 ring-zinc-200'}`}
      >
        <img src={data.image_url} alt={data.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-1">
          <span className="text-white text-[8px] font-bold">{sizeInfo.emoji} {sizeInfo.label}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          <span className={`${sizeInfo.color} text-white text-[9px] font-bold px-2 py-0.5 rounded-full`}>
            {sizeInfo.title}
          </span>
        </div>
        <h3 className="text-sm font-bold leading-tight mb-1 truncate">{data.severity}</h3>
        <p className={`text-xs flex items-center gap-1 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
          <MapPin size={10} /> {getDisplayLocation(data.location)}
        </p>
      </div>

      <UpvoteButton onVote={onVote} votes={data.votes} size="sm" />
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
      initial={{ opacity: 0, y: 30, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        layout: { type: "spring", stiffness: 400, damping: 35 },
        delay: index * 0.08
      }}
      className={`
        relative p-4 rounded-3xl flex flex-col transition-all duration-500 cursor-pointer group/card
        ${darkMode 
          ? 'bg-zinc-900/70 backdrop-blur-xl border border-zinc-700/50 hover:border-teal-500/50' 
          : 'bg-white/70 backdrop-blur-xl border border-zinc-200/50 hover:border-rose-300'}
        shadow-lg hover:shadow-2xl
      `}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-teal-500/5 via-transparent to-rose-500/5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
      
      {/* Image with zoom effect */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-2xl overflow-hidden mb-4 group cursor-pointer ring-1 ${darkMode ? 'bg-zinc-800 ring-zinc-700' : 'bg-zinc-100 ring-zinc-200'}`}
      >
        <motion.img 
          src={data.image_url} 
          alt={data.location} 
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.15 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg backdrop-blur-sm`}>
          {sizeInfo.emoji} {sizeInfo.label}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="text-white text-sm font-medium flex items-center gap-2 backdrop-blur-sm bg-black/20 px-3 py-1.5 rounded-full">
            <ZoomIn className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>

      {/* Compact info row: Title + Location + Vote */}
      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">{sizeInfo.title}</h3>
          <div className={`flex items-center gap-1 text-xs truncate ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <MapPin size={10} className="flex-shrink-0" /> 
            <span className="truncate">{getDisplayLocation(data.location)}</span>
          </div>
        </div>
        <UpvoteButton onVote={onVote} votes={data.votes} size="sm" />
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-4xl rounded-2xl md:rounded-3xl border-4 shadow-[8px_8px_0px_0px_#14b8a6] md:shadow-[12px_12px_0px_0px_#14b8a6] overflow-hidden max-h-[95vh] flex flex-col md:flex-row ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-800'}`}
      >
        {/* Image Section - Takes most space */}
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
            className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white p-2 rounded-full transition-colors md:hidden"
          >
            <X size={20} />
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-3 right-3 flex gap-1">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="bg-black/80 hover:bg-black text-white p-2 rounded-lg border-2 border-white/20 backdrop-blur-sm disabled:opacity-40"
            >
              <ZoomOut size={16} />
            </motion.button>
            <div className="bg-black/80 text-white text-xs font-bold px-3 py-2 rounded-lg border-2 border-white/20 backdrop-blur-sm">
              {Math.round(zoom * 100)}%
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="bg-black/80 hover:bg-black text-white p-2 rounded-lg border-2 border-white/20 backdrop-blur-sm disabled:opacity-40"
            >
              <ZoomIn size={16} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleReset}
              className="bg-black/80 hover:bg-black text-white p-2 rounded-lg border-2 border-white/20 backdrop-blur-sm"
            >
              <RotateCcw size={16} />
            </motion.button>
          </div>

          {/* Severity Badge on image */}
          <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg border-2 border-black shadow-lg`}>
            {sizeInfo.emoji} {sizeInfo.label}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className={`w-full md:w-72 border-t-4 md:border-t-0 md:border-l-4 p-4 flex flex-col ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-black'}`}>
          {/* Header with close */}
          <div className="hidden md:flex justify-between items-start mb-4">
            <div className={`${sizeInfo.color} text-white text-3xl p-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]`}>
              {sizeInfo.emoji}
            </div>
            <button onClick={onClose} className={`transition-colors ${darkMode ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-400 hover:text-red-500'}`}>
              <X size={24} />
            </button>
          </div>

          {/* Title */}
          <h2 className={`text-xl md:text-2xl font-black uppercase leading-tight mb-1 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{sizeInfo.title}</h2>
          <div className={`flex items-center gap-1 font-bold text-xs mb-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            <MapPin size={12} /> {getDisplayLocation(data.location)}
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4 flex-1">
            <div className={`flex items-center justify-between rounded-lg p-2 border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <span className={`text-xs font-bold uppercase flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <AlertTriangle size={12} /> Severity
              </span>
              <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>{data.severity}</span>
            </div>
            <div className={`flex items-center justify-between rounded-lg p-2 border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'}`}>
              <span className={`text-xs font-bold uppercase flex items-center gap-1 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                <Calendar size={12} /> Reported
              </span>
              <span className={`font-black text-sm ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
                {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Vote Section */}
          <div className={`rounded-2xl p-4 border ${darkMode ? 'bg-gradient-to-br from-rose-900/30 to-pink-900/30 border-rose-800/50' : 'bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200/50'}`}>
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


const UploadModal = ({ onClose, onSubmit }) => {
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
        setError('🚫 This doesn\'t look like a pothole! Please upload an image of an actual pothole.');
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
    if (!imgFile) return;
    
    setUploading(true);
    setError('');

    try {
      const fileExt = imgFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;

      // Upload image
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

      if (!uploadResponse.ok) throw new Error('Upload failed');

      const imageUrl = `${SUPABASE_URL}/storage/v1/object/public/potholes/${fileName}`;
      const sizeData = SIZES.find(s => s.level === size);
      
      const newPothole = {
        image_url: imageUrl,
        location: location || "Somewhere On Earth",
        severity: sizeData.dbLabel,
        votes: 1
      };

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

      if (!insertResponse.ok) throw new Error('Database insert failed');

      const [created] = await insertResponse.json();
      onSubmit(created);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white w-full max-w-sm rounded-2xl border-4 border-zinc-800 shadow-[10px_10px_0px_0px_#14b8a6] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-black p-3 flex justify-between items-center">
          <h3 className="text-white font-black uppercase tracking-wider text-sm">Report Disaster</h3>
          <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 text-sm font-bold p-2 rounded-lg mb-4">
              {error}
            </div>
          )}

          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => !validating && fileInputRef.current?.click()}
              className={`group cursor-pointer border-4 border-dashed bg-zinc-50 h-56 rounded-xl flex flex-col items-center justify-center transition-colors ${
                validating 
                  ? 'border-teal-400 bg-teal-50' 
                  : 'border-zinc-200 hover:border-rose-400'
              }`}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              
              {validating ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="bg-teal-400 p-4 rounded-full shadow-lg mb-3"
                  >
                    <Loader2 size={32} className="text-white" />
                  </motion.div>
                  <p className="font-bold text-teal-600 uppercase text-sm">Analyzing Image...</p>
                  <p className="text-teal-500 text-xs mt-1">AI is checking for potholes</p>
                </>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-full border-2 border-zinc-100 shadow-lg mb-3 group-hover:scale-110 transition-transform">
                    <Camera size={32} className="text-zinc-400 group-hover:text-rose-500" />
                  </div>
                  <p className="font-bold text-zinc-400 uppercase text-sm group-hover:text-rose-500">Tap to Add Photo</p>
                  <p className="text-zinc-300 text-xs mt-1">Take photo or choose from library</p>
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
              <div className="relative h-36 bg-black rounded-xl border-2 border-black overflow-hidden">
                <img src={imgPreview} className="w-full h-full object-cover opacity-80" alt="Preview" />
                <button 
                  onClick={() => { setStep(1); setImgPreview(null); setImgFile(null); }} 
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm hover:bg-red-500 transition-colors"
                >
                  RETAKE
                </button>
              </div>

              {/* Size Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Severity Level</label>
                <div className="flex gap-1">
                  {SIZES.map(s => (
                    <motion.button
                      key={s.level}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSize(s.level)}
                      className={`flex-1 py-2.5 rounded-lg border-2 font-bold text-xl transition-all ${size === s.level ? 'bg-rose-500 border-zinc-800 text-white -translate-y-1 shadow-[3px_3px_0px_0px_#27272a]' : 'bg-white border-zinc-200 text-zinc-300 hover:border-zinc-400'}`}
                    >
                      {s.emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="text-center mt-1.5 font-black uppercase text-rose-500 text-sm">
                  "{SIZES.find(s => s.level === size).title}"
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-1.5">Location</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 5th Avenue Intersection"
                    className="flex-1 bg-zinc-100 border-2 border-transparent focus:bg-white focus:border-teal-400 rounded-lg p-2.5 font-bold text-sm outline-none transition-colors"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={getLocation}
                    disabled={fetchingLocation}
                    className={`px-3 rounded-lg border-2 border-zinc-800 font-bold transition-all flex items-center justify-center ${
                      fetchingLocation 
                        ? 'bg-zinc-200 text-zinc-400 cursor-wait' 
                        : 'bg-teal-400 hover:bg-teal-300 text-white hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#27272a]'
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
                <p className="text-[9px] text-zinc-400 mt-1">Type manually or tap GPS button</p>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={uploading}
                className="w-full bg-black text-white font-black uppercase py-3 rounded-xl text-sm hover:bg-zinc-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Submit to Hall of Shame
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