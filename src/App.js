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
  ArrowBigUp,
  Upload,
  Loader2,
  LocateFixed,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

// --- SUPABASE CONFIG ---
const SUPABASE_URL = 'https://wqqkrjukegrqpnpulcit.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxcWtyanVrZWdycXBucHVsY2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4MjAyODYsImV4cCI6MjA4MjM5NjI4Nn0.cYMGASOsnDXYsXmOLpK7fmZLfNRL0fSpNLWJNzmSOeI';

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

const App = () => {
  const [reports, setReports] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedPothole, setSelectedPothole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
            className="w-16 h-16 border-4 border-black border-t-yellow-400 rounded-full mx-auto mb-4"
          />
          <p className="font-black uppercase text-zinc-600">Loading disasters...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen font-sans selection:bg-yellow-400 overflow-x-hidden transition-colors duration-500 ${darkMode ? 'bg-slate-950 text-white' : 'bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 text-zinc-900'}`}>
      
      {/* Animated Dark Mode Background */}
      {darkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Mesh gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-950/80 via-slate-950 to-indigo-950/80" />
          
          {/* Animated orbs */}
          <motion.div 
            animate={{ 
              x: [0, 100, 50, 0], 
              y: [0, -50, 50, 0],
              scale: [1, 1.2, 0.9, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -80, 0], 
              y: [0, 100, 0],
              scale: [1.2, 1, 1.2]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-600/15 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, 60, -30, 0], 
              y: [0, -40, 40, 0]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -50, 0], 
              y: [0, 80, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl"
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
          <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-purple-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-indigo-900/20 to-transparent" />
        </div>
      )}
      
      {/* --- COMPACT HEADER --- */}
      <header className="relative z-10 bg-gradient-to-r from-zinc-950 via-purple-950 to-zinc-900 text-white py-6 px-4 overflow-hidden">
        {/* Animated Gradient Orbs - Smaller */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-20 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-20 right-1/4 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl"
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
                className="hidden md:flex p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg shadow-yellow-500/30"
              >
                <Siren size={28} className="text-black" />
              </motion.div>
              <div>
                <motion.h1 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none"
                >
                  <span className="text-white">MARKMY</span>
                  <span className="text-yellow-400">POTHOLE</span>
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
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold py-3 px-5 rounded-xl shadow-lg shadow-yellow-500/30 transition-all"
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
                  <Sun size={20} className="text-yellow-400" />
                ) : (
                  <Moon size={20} className="text-zinc-300" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 pb-16">
        
        {/* --- HALL OF SHAME (TOP 3) --- */}
        {top3.length > 0 && (
          <div className="mb-16">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-4 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl shadow-lg shadow-yellow-500/30"
              >
                <Trophy className="text-black" size={28} />
              </motion.div>
              <div>
                <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Hall of Shame
                </h2>
                <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Top voted potholes this week</p>
              </div>
            </motion.div>

            {/* Podium Container - Arc/Curved arrangement */}
            <div className={`relative pt-12 pb-12 px-4 md:px-8 rounded-[60px] ${darkMode ? 'bg-gradient-to-b from-purple-900/40 to-indigo-900/30 border border-purple-700/30' : 'bg-gradient-to-b from-amber-100/80 to-orange-50/50 border border-amber-200/50'}`}>
              {/* Top edge highlight */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-full ${darkMode ? 'bg-gradient-to-r from-transparent via-purple-400 to-transparent' : 'bg-gradient-to-r from-transparent via-amber-400 to-transparent'}`} />
              
              {/* Arc Layout with 3 cards */}
              <div className="flex justify-center items-end gap-2 md:gap-4 max-w-4xl mx-auto">
                {/* 2nd Place - Left, rotated inward */}
                {top3[1] && (
                  <motion.div 
                    initial={{ opacity: 0, x: -50, rotate: -15 }}
                    animate={{ opacity: 1, x: 0, rotate: -6 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="flex-1 max-w-[280px] origin-bottom transform translate-y-4"
                    style={{ transform: 'rotate(-6deg) translateY(16px)' }}
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
                
                {/* 1st Place - Center, elevated and straight */}
                {top3[0] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="flex-1 max-w-[320px] z-10"
                    style={{ transform: 'translateY(-24px)' }}
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
                
                {/* 3rd Place - Right, rotated inward */}
                {top3[2] && (
                  <motion.div 
                    initial={{ opacity: 0, x: 50, rotate: 15 }}
                    animate={{ opacity: 1, x: 0, rotate: 6 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="flex-1 max-w-[280px] origin-bottom"
                    style={{ transform: 'rotate(6deg) translateY(16px)' }}
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
        )}

        {/* --- RECENT REPORTS (Grid of larger cards) --- */}
        {theRest.length > 0 && (
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl shadow-lg shadow-pink-500/30"
              >
                <Megaphone className="text-white" size={24} />
              </motion.div>
              <div>
                <h2 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${darkMode ? 'text-white' : 'text-zinc-800'}`}>
                  Recent Reports
                </h2>
                <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {theRest.length} more potholes awaiting justice
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 py-12 text-center border-t border-zinc-800">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-zinc-500 text-sm font-medium tracking-wide mb-2"
        >
          Built because my suspension broke 🚗💔
        </motion.p>
        <p className="text-zinc-700 text-xs">Made with frustration and React</p>
      </footer>
    </div>
  );
};

// --- COMPONENTS ---

const HallOfShameCard = ({ data, rank, onVote, onSelect, darkMode }) => {
  const sizeInfo = getSizeFromSeverity(data.severity);
  
  // Badge colors and emojis based on rank
  const rankStyles = {
    1: { gradient: 'from-yellow-400 via-amber-500 to-orange-500', shadow: 'shadow-yellow-500/40', emoji: '👑' },
    2: { gradient: 'from-zinc-300 via-slate-400 to-zinc-500', shadow: 'shadow-zinc-400/30', emoji: '🥈' },
    3: { gradient: 'from-amber-600 via-orange-700 to-amber-800', shadow: 'shadow-amber-600/30', emoji: '🥉' },
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
        relative p-4 rounded-3xl flex flex-col h-full transition-all duration-300 cursor-pointer
        ${darkMode 
          ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50' 
          : 'bg-white border border-zinc-200/50'}
        ${rank === 1 
          ? 'shadow-2xl shadow-yellow-500/20 ring-2 ring-yellow-400/30' 
          : 'shadow-xl shadow-black/10'}
      `}
    >
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

      {/* Image */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-2xl overflow-hidden mb-4 group cursor-pointer ring-1 ${darkMode ? 'bg-zinc-800 ring-zinc-700' : 'bg-zinc-100 ring-zinc-200'}`}
      >
        <img src={data.image_url} alt={data.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg`}>
          {sizeInfo.emoji} {sizeInfo.label}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <ZoomIn className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold leading-tight mb-1 truncate">{sizeInfo.title}</h3>
      <div className={`flex items-center gap-1.5 text-xs mb-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
        <MapPin size={12} /> {data.location}
      </div>

      <div className={`mt-auto flex items-center justify-between rounded-2xl p-3 ${darkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
        <div>
          <span className="block text-2xl font-bold leading-none">{data.votes}</span>
          <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Votes</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={(e) => { e.stopPropagation(); onVote(); }}
          className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-shadow"
        >
          <ArrowBigUp size={22} />
        </motion.button>
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
          <MapPin size={10} /> {data.location}
        </p>
      </div>

      <motion.button 
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        onClick={(e) => { e.stopPropagation(); onVote(); }}
        className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-shadow"
      >
        <ThumbsUp size={18} />
        <span className="font-bold text-xs">{data.votes}</span>
      </motion.button>
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
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ 
        layout: { type: "spring", stiffness: 400, damping: 35 },
        delay: index * 0.05
      }}
      className={`
        relative p-4 rounded-3xl flex flex-col transition-all duration-300 cursor-pointer
        ${darkMode 
          ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700/50 hover:border-zinc-600' 
          : 'bg-white border border-zinc-200/50 hover:border-zinc-300'}
        shadow-lg hover:shadow-xl
      `}
    >
      {/* Image */}
      <div 
        onClick={() => onSelect(data)}
        className={`relative aspect-square rounded-2xl overflow-hidden mb-4 group cursor-pointer ring-1 ${darkMode ? 'bg-zinc-800 ring-zinc-700' : 'bg-zinc-100 ring-zinc-200'}`}
      >
        <img src={data.image_url} alt={data.location} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className={`absolute top-3 left-3 ${sizeInfo.color} text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-lg`}>
          {sizeInfo.emoji} {sizeInfo.label}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
          <span className="text-white text-sm font-medium flex items-center gap-2">
            <ZoomIn className="w-4 h-4" /> View Details
          </span>
        </div>
      </div>

      <h3 className="text-base font-bold leading-tight mb-1 truncate">{sizeInfo.title}</h3>
      <div className={`flex items-center gap-1.5 text-xs mb-4 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
        <MapPin size={12} /> {data.location}
      </div>

      <div className={`mt-auto flex items-center justify-between rounded-2xl p-3 ${darkMode ? 'bg-zinc-800/50' : 'bg-zinc-50'}`}>
        <div>
          <span className="block text-xl font-bold leading-none">{data.votes}</span>
          <span className={`text-[10px] font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>Votes</span>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          onClick={(e) => { e.stopPropagation(); onVote(); }}
          className="p-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-shadow"
        >
          <ArrowBigUp size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
};

const PotholeDetailModal = ({ data, onClose, onVote }) => {
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
        className="bg-white w-full max-w-4xl rounded-2xl md:rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_#FFFF00] md:shadow-[12px_12px_0px_0px_#FFFF00] overflow-hidden max-h-[95vh] flex flex-col md:flex-row"
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
        <div className="w-full md:w-72 bg-white border-t-4 md:border-t-0 md:border-l-4 border-black p-4 flex flex-col">
          {/* Header with close */}
          <div className="hidden md:flex justify-between items-start mb-4">
            <div className={`${sizeInfo.color} text-white text-3xl p-3 rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]`}>
              {sizeInfo.emoji}
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-2xl font-black uppercase leading-tight mb-1">{sizeInfo.title}</h2>
          <div className="flex items-center gap-1 text-zinc-500 font-bold text-xs mb-4">
            <MapPin size={12} /> {data.location}
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center justify-between bg-zinc-100 rounded-lg p-2 border border-zinc-200">
              <span className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-1">
                <AlertTriangle size={12} /> Severity
              </span>
              <span className="font-black text-sm">{data.severity}</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-100 rounded-lg p-2 border border-zinc-200">
              <span className="text-zinc-500 text-xs font-bold uppercase flex items-center gap-1">
                <Calendar size={12} /> Reported
              </span>
              <span className="font-black text-sm">
                {new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Vote Section */}
          <div className="bg-yellow-100 rounded-xl p-3 border-2 border-yellow-300">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="block text-3xl font-black leading-none text-yellow-800">{data.votes}</span>
                <span className="text-[10px] font-bold uppercase text-yellow-600">Angry Voters</span>
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={onVote}
              className="w-full bg-black text-white font-black uppercase py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#ca8a04] border-2 border-black"
            >
              <ArrowBigUp size={20} />
              UPVOTE THIS HOLE
            </motion.button>
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
  const fileInputRef = useRef(null);

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

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImgFile(file);
      setImgPreview(URL.createObjectURL(file));
      setStep(2);
    }
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
        className="bg-white w-full max-w-sm rounded-2xl border-4 border-black shadow-[10px_10px_0px_0px_#FFFF00] overflow-hidden"
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
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-4 border-dashed border-zinc-200 hover:border-pink-500 bg-zinc-50 h-56 rounded-xl flex flex-col items-center justify-center transition-colors"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFile} />
              <div className="bg-white p-4 rounded-full border-2 border-zinc-100 shadow-lg mb-3 group-hover:scale-110 transition-transform">
                <Camera size={32} className="text-zinc-400 group-hover:text-pink-500" />
              </div>
              <p className="font-bold text-zinc-400 uppercase text-sm group-hover:text-pink-600">Tap to Add Photo</p>
              <p className="text-zinc-300 text-xs mt-1">Take photo or choose from library</p>
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
                      className={`flex-1 py-2.5 rounded-lg border-2 font-bold text-xl transition-all ${size === s.level ? 'bg-pink-500 border-black text-white -translate-y-1 shadow-[3px_3px_0px_0px_#000]' : 'bg-white border-zinc-200 text-zinc-300 hover:border-zinc-400'}`}
                    >
                      {s.emoji}
                    </motion.button>
                  ))}
                </div>
                <div className="text-center mt-1.5 font-black uppercase text-pink-600 text-sm">
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
                    className="flex-1 bg-zinc-100 border-2 border-transparent focus:bg-white focus:border-yellow-400 rounded-lg p-2.5 font-bold text-sm outline-none transition-colors"
                  />
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={getLocation}
                    disabled={fetchingLocation}
                    className={`px-3 rounded-lg border-2 border-black font-bold transition-all flex items-center justify-center ${
                      fetchingLocation 
                        ? 'bg-zinc-200 text-zinc-400 cursor-wait' 
                        : 'bg-yellow-400 hover:bg-yellow-300 text-black hover:-translate-y-0.5 shadow-[2px_2px_0px_0px_#000]'
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