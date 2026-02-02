<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Camera, X, Menu, Award, Map as MapIcon, Sparkles, TrendingUp, Zap } from 'lucide-svelte';
  import ModeToggle from '$lib/components/ModeToggle.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import ReportCard from '$lib/components/ReportCard.svelte';
  import PodiumCard from '$lib/components/PodiumCard.svelte';
  import UploadModal from '$lib/components/UploadModal.svelte';
  import DetailModal from '$lib/components/DetailModal.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import Logo from '$lib/components/Logo.svelte';
  import UpvoteButton from '$lib/components/UpvoteButton.svelte';
  import PlayStreamIcon from '$lib/components/PlayStreamIcon.svelte';
  import AngryEmoji from '$lib/components/AngryEmoji.svelte';

  import { 
    SUPABASE_URL, SUPABASE_ANON_KEY, type Report
  } from '$lib/stores';
  
  // Persisted preferences
  // 0 = light, 1 = dark, 2 = torchlight
  let localMode = 1;
  $: localDarkMode = localMode >= 1;
  let localSoundEnabled = true;
  
  // Torchlight mouse/touch tracking
  let mouseX = 0;
  let mouseY = 0;
  
  function handleMouseMove(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }
  
  function handleTouchMove(e: TouchEvent) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
    }
  }
  
  // State
  let localReports: Report[] = [];
  let localLoading = true;
  let localShowUpload = false;
  let localShowMap = false;
  let localShowMobileMenu = false;
  let localSelectedPothole: Report | null = null;
  let showSplash = true;
  
  // Load more / pagination
  let visibleCount = 10;
  let hasMore = false;
  
  // Vote tracking (prevent double voting)
  let votedIds: Set<string> = new Set();
  
  // Toast notifications
  let toasts: { id: number; message: string; type: 'success' | 'error' | 'info' }[] = [];
  let toastId = 0;
  
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = ++toastId;
    toasts = [...toasts, { id, message, type }];
  }
  
  function removeToast(id: number) {
    toasts = toasts.filter(t => t.id !== id);
  }
  
  // Sort options
  type SortOption = 'recent' | 'votes' | 'severity';
  let sortBy: SortOption = 'recent';

  // Centralized text color for consistency
  $: primaryTextColor = localDarkMode ? 'text-zinc-200' : 'text-slate-500';
  
  // Theme Color Mapping
  // Change 'yellow' back to 'cyan' to revert to blue.
  $: themeColor = 'cyan'; 
  $: themeColorRGB = themeColor === 'yellow' ? '250, 204, 21' : '34, 211, 238';

  $: blueColor = themeColor === 'yellow' 
    ? (localDarkMode ? 'text-yellow-400' : 'text-yellow-600')
    : (localDarkMode ? 'text-cyan-400' : 'text-cyan-600');
  $: blueBgClass = themeColor === 'yellow'
    ? (localDarkMode ? 'bg-yellow-400' : 'bg-yellow-500')
    : (localDarkMode ? 'bg-cyan-400' : 'bg-cyan-500');
  $: blueShadowClass = localDarkMode ? `rgba(${themeColorRGB}, 0.3)` : `rgba(${themeColorRGB}, 0.2)`;
  
  // Analytics tracking
  function trackEvent(event: string, data?: Record<string, any>) {
    console.log(`[Analytics] ${event}`, data);
    // Future: Send to analytics service
  }
  
  $: top3 = [...localReports].sort((a, b) => b.votes - a.votes).slice(0, 3);
  
  // Sorted reports based on selected option
  $: sortedReports = [...localReports].sort((a, b) => {
    if (sortBy === 'votes') return b.votes - a.votes;
    if (sortBy === 'severity') return (b.severity || 0) - (a.severity || 0);
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  $: visibleReports = sortedReports.slice(0, visibleCount);
  $: hasMore = sortedReports.length > visibleCount;
  
  function loadMore() {
    visibleCount += 10;
    trackEvent('load_more', { count: visibleCount });
  }
  
  // Keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    // Ignore if typing in input
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
      case 'm':
        if (!localShowUpload && !localSelectedPothole) {
          localShowMap = !localShowMap;
          trackEvent('keyboard_shortcut', { key: 'm', action: 'toggle_map' });
        }
        break;
      case 'u':
        if (!localShowMap && !localSelectedPothole) {
          localShowUpload = !localShowUpload;
          trackEvent('keyboard_shortcut', { key: 'u', action: 'toggle_upload' });
        }
        break;
      case 'escape':
        localShowUpload = false;
        localShowMap = false;
        localSelectedPothole = null;
        localShowMobileMenu = false;
        break;
      case 'd':
        if (!localShowUpload && !localShowMap && !localSelectedPothole) {
          localMode = localMode === 1 ? 2 : 1;
          trackEvent('keyboard_shortcut', { key: 'd', action: 'toggle_torch' });
        }
        break;
    }
  }
  
  // Offline caching
  const CACHE_KEY = 'cached_reports';
  
  function cacheReports(reports: Report[]) {
    if (browser) {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: reports,
        timestamp: Date.now()
      }));
    }
  }
  
  function loadCachedReports(): Report[] | null {
    if (!browser) return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    try {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 1 hour
      if (Date.now() - timestamp < 3600000) return data;
    } catch {}
    return null;
  }
  
  onMount(() => {
    // Load preferences from localStorage
    if (browser) {
      const savedMode = localStorage.getItem('displayMode');
      const savedSound = localStorage.getItem('soundEnabled');
      const savedVotes = localStorage.getItem('votedIds');
      const savedSort = localStorage.getItem('sortBy') as SortOption;
      
      if (savedMode !== null) localMode = parseInt(savedMode) || 1;
      if (savedSound !== null) localSoundEnabled = savedSound === 'true';
      if (savedSort) sortBy = savedSort;
      if (savedVotes) {
        try {
          votedIds = new Set(JSON.parse(savedVotes));
        } catch {}
      }
    }
    
    // Load cached reports first for instant display
    const cached = loadCachedReports();
    if (cached && cached.length > 0) {
      localReports = cached;
      localLoading = false;
    }
    
    loadPotholes();
    
    // Supabase Realtime subscription
    let realtimeChannel: any = null;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      setupRealtime();
    }
    
    async function setupRealtime() {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        realtimeChannel = supabase
          .channel('potholes-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'potholes' }, (payload: any) => {
            if (payload.eventType === 'INSERT') {
              let loc = payload.new.location;
              try { if (typeof loc === 'string' && loc.startsWith('{')) loc = JSON.parse(loc); } catch {}
              const newReport = { ...payload.new, location: loc };
              if (!localReports.some(r => r.id === newReport.id)) {
                localReports = [newReport, ...localReports];
                showToast('New pothole reported!', 'info');
                trackEvent('realtime_insert', { id: newReport.id });
              }
            } else if (payload.eventType === 'UPDATE') {
              localReports = localReports.map(r => 
                r.id === payload.new.id ? { ...r, votes: payload.new.votes } : r
              );
            } else if (payload.eventType === 'DELETE') {
              localReports = localReports.filter(r => r.id !== payload.old.id);
            }
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription failed, falling back to polling:', err);
      }
    }
    
    // Fallback polling removed to prevent overwriting optimistic updates
    // const interval = setInterval(loadPotholes, 30000);
    
    trackEvent('page_view', { darkMode: localDarkMode });
    
    return () => {
      // clearInterval(interval);
      if (realtimeChannel) realtimeChannel.unsubscribe();
    };
  });
  
  // Persist preferences
  $: if (browser) {
    localStorage.setItem('darkMode', String(localDarkMode));
  }
  $: if (browser) {
    localStorage.setItem('soundEnabled', String(localSoundEnabled));
  }
  $: if (browser) {
    localStorage.setItem('sortBy', sortBy);
  }
  
  async function loadPotholes() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      localLoading = false;
      return;
    }

    try {
      const [recentRes, topRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/potholes?select=id,location,votes,image_url,created_at,severity&order=created_at.desc&limit=100`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        }),
        fetch(`${SUPABASE_URL}/rest/v1/potholes?select=id,location,votes,image_url,created_at,severity&order=votes.desc&limit=3`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` }
        })
      ]);
      
      if (recentRes.ok && topRes.ok) {
        const recentData = await recentRes.json();
        const topData = await topRes.json();
        
        const merged = [...recentData, ...topData];
        const uniqueMap = new Map();
        
        merged.forEach((item: any) => {
          let loc = item.location;
          try {
            if (typeof loc === 'string' && loc.startsWith('{')) loc = JSON.parse(loc);
          } catch (e) {}
          if (!uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, { ...item, location: loc });
          }
        });

        localReports = Array.from(uniqueMap.values()).sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        // Cache for offline use
        cacheReports(localReports);
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
      showToast('Failed to load reports. Please try again.', 'error');
    } finally {
      localLoading = false;
    }
  }

  
  async function handleVote(id: string) {
    // Get current vote count for this pothole (max 100 per user)
    let voteCounts: Record<string, number> = {};
    if (browser) {
      try {
        voteCounts = JSON.parse(localStorage.getItem('voteCounts') || '{}');
      } catch {}
    }
    
    const currentCount = voteCounts[id] || 0;
    if (currentCount >= 100) {
      showToast('You have reached 100 votes for this pothole!', 'info');
      return;
    }
    
    // Increment vote count
    voteCounts[id] = currentCount + 1;
    if (browser) {
      localStorage.setItem('voteCounts', JSON.stringify(voteCounts));
    }
    
    // Optimistic update
    localReports = localReports.map(r => 
      r.id === id ? { ...r, votes: r.votes + 1 } : r
    );

    if (localSelectedPothole && localSelectedPothole.id === id) {
      localSelectedPothole = { ...localSelectedPothole, votes: localSelectedPothole.votes + 1 };
    }
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      // Use Edge Function for secure voting
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/vote-pothole`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id })
        });
        
        if (!res.ok) {
          showToast('Vote failed to sync.', 'error');
        }
      } catch (err) {
        showToast('Network error while voting.', 'error');
      }
    }
  }
  
  function handleCreate(newReport: Report) {
    if (localReports.some(r => r.id === newReport.id)) return;
    localReports = [newReport, ...localReports];
    localShowUpload = false;
    showToast('Pothole reported successfully!', 'success');
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<svelte:head>
  <title>MarkMyPothole - Community Pothole Reporter</title>
</svelte:head>

<div class="min-h-screen relative transition-colors duration-500 {localDarkMode ? 'bg-[#020617]' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50'}" on:mousemove={handleMouseMove} on:touchmove={handleTouchMove} on:touchstart={handleTouchMove} role="application">
  <!-- Dynamic Theme Color Protection -->
  <div class="hidden text-yellow-400 text-yellow-500 text-yellow-600 bg-yellow-400 bg-yellow-500 bg-yellow-600 text-cyan-400 text-cyan-500 text-cyan-600 bg-cyan-400 bg-cyan-500 bg-cyan-600 border-yellow-400 border-yellow-500 border-cyan-400 border-cyan-500 focus-within:ring-yellow-500/30 focus-within:ring-cyan-500/30 shadow-yellow-400/50 shadow-cyan-400/50"></div>
  
  <div class="fixed inset-0 overflow-hidden pointer-events-none" style="z-index: 0">
    {#if localDarkMode}
      <!-- Bold Chromatic Night -->
      <div class="absolute inset-0 bg-[#030712]"></div>
      
      <!-- Hot Pink/Magenta Blaze (top-left) -->
      <div class="absolute -top-[15%] -left-[10%] w-[90vw] h-[90vw] rounded-full opacity-50"
        style="background: radial-gradient(circle at center, #ec4899 0%, transparent 60%); filter: blur(80px);"></div>
      
      <!-- Electric Cyan Burst (top-right) -->
      <div class="absolute -top-[10%] -right-[15%] w-[80vw] h-[80vw] rounded-full opacity-45"
        style="background: radial-gradient(circle at center, #06b6d4 0%, transparent 55%); filter: blur(70px);"></div>
      
      <!-- Deep Purple Core (center) -->
      <div class="absolute top-[25%] left-[15%] w-[100vw] h-[70vh] rounded-full opacity-35"
        style="background: radial-gradient(ellipse at center, #7c3aed 0%, transparent 65%); filter: blur(90px);"></div>
      
      <!-- Vibrant Blue Wave (bottom-left) -->
      <div class="absolute bottom-[-20%] -left-[20%] w-[100vw] h-[100vw] rounded-full opacity-50"
        style="background: radial-gradient(circle at center, #2563eb 0%, transparent 60%); filter: blur(80px);"></div>
      
      <!-- Teal Accent (bottom-right) -->
      <div class="absolute -bottom-[25%] -right-[10%] w-[85vw] h-[85vw] rounded-full opacity-40"
        style="background: radial-gradient(circle at center, #14b8a6 0%, transparent 60%); filter: blur(90px);"></div>
    {:else}
      <!-- Light Mode Static Background (Soft Pastels) -->
      <div class="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-rose-200/60 blur-[120px]"></div>
      <div class="absolute top-[10%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-cyan-200/60 blur-[100px]"></div>
      <div class="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-200/60 blur-[120px]"></div>
    {/if}
  </div>

  {#if showSplash}
    <LoadingScreen darkMode={localDarkMode} blueColor={blueColor} themeColorRGB={themeColorRGB} onComplete={() => showSplash = false} />
  {/if}

  <!-- Header -->
  <header class="fixed top-0 inset-x-0 z-30 py-1 transition-all duration-300 backdrop-blur-xl border-b {localDarkMode ? 'bg-white/[0.02] border-white/15 shadow-lg shadow-black/10' : 'bg-white/20 border-white/40 shadow-sm'}">
    <div class="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <Logo size="48" className="{blueColor} drop-shadow-lg w-10 h-10 sm:w-12 sm:h-12" />
        <div>
          <h1 class="font-bold text-lg tracking-tight leading-none {localDarkMode ? 'text-white' : 'text-slate-600'}">
            Mark<span class={blueColor}>My</span>Pothole
          </h1>
          <p class="text-[10px] font-medium tracking-wide {primaryTextColor}">
            They ignore it, <span class="{blueColor} font-bold">we expose it</span>.
          </p>
        </div>
      </div>

      <!-- Desktop Actions -->
      <div class="flex items-center gap-1.5 sm:gap-2">
        <button
          on:click={() => localShowUpload = true}
          class="group relative w-11 h-11 sm:w-auto sm:h-11 sm:px-6 rounded-full font-bold text-[15px] flex items-center justify-center gap-2 transition-all duration-500 active:scale-95 text-white backdrop-blur-2xl border border-white/40 shadow-sm"
          style="
            background: linear-gradient(135deg, rgba({themeColorRGB}, 0.7) 0%, rgba({themeColorRGB}, 0.3) 100%);
            box-shadow: 
              inset 0 1px 1px rgba(255,255,255,0.4),
              inset 0 -1px 1px rgba(0,0,0,0.1);
          "
        >
          <span class="transition-transform duration-300 group-hover:translate-x-1">
            <Camera size={18} />
          </span>
          <span class="hidden sm:inline transition-transform duration-300 group-hover:translate-x-1">Mark</span>
        </button>
        <button
          on:click={() => localShowMap = true}
          class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
            {localDarkMode 
              ? '' 
              : `bg-white/40 border border-white/40 ring-1 ring-white/40 ${blueColor} hover:bg-white/60 shadow-sm backdrop-blur-md`
            }"
          style={localDarkMode ? `
            background: 
              linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
              linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
              linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
            box-shadow: 
              rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
              rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
              inset 0px 0px 0px 1px rgba(255, 243, 215, 0.06), 
              inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
              inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
              inset 0px 4px 12px -6px rgba(255, 243, 215, 0.06);
            color: rgb(${themeColorRGB});
          ` : `color: rgb(${themeColorRGB});`}
        >
          <MapIcon size={20} class={localDarkMode ? blueColor : ''} />
        </button>
        <div class="hidden">
          <SoundToggle soundEnabled={localSoundEnabled} setSoundEnabled={(v: boolean) => localSoundEnabled = v} darkMode={localDarkMode} blueColor={blueColor} />
        </div>
        <ModeToggle mode={localMode} setMode={(v: number) => localMode = v} blueColor={blueColor} themeColorRGB={themeColorRGB} />
      </div>


    </div>
  </header>



  <!-- FAB Mobile -->
  <button
    on:click={() => localShowUpload = true}
    class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center sm:hidden transition-all active:scale-95
      {localDarkMode
        ? blueColor
        : `bg-white ${blueColor} shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-white/60`
      }"
    style={localDarkMode ? `
      background: 
        linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
        linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
        linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
      box-shadow: 
        rgba(10, 8, 5, 0.2) 0px 12px 24px 0px, 
        inset 0px 0px 0px 1px rgba(255, 243, 215, 0.06), 
        inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.24), 
        inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.24);
      color: rgb(${themeColorRGB});
    ` : `color: rgb(${themeColorRGB});`}
  >
    <Camera size={24} />
  </button>

  <main class="pt-24 pb-1 relative z-10">
    <!-- Hall of Shame -->
    <section class="mb-8 max-w-6xl mx-auto px-4">
      <div class="p-6 rounded-[2.5rem] transition-all duration-300
        {localDarkMode 
          ? '' 
          : 'bg-white/20 border border-white/40 shadow-xl ring-1 ring-white/40 backdrop-blur-xl'
        }"
        style={localDarkMode ? `
          background: 
            linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
            linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
            linear-gradient(rgba(255, 242, 212, 0.04), rgba(255, 242, 212, 0.01));
          border: 1px solid rgba(255, 243, 215, 0.06);
          box-shadow: 
            rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
            rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
            inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
            inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.08), 
            inset 0px 4px 12px -6px rgba(255, 243, 215, 0.04);
        ` : ""}>
        
        <div class="flex flex-col items-center justify-center mb-2 text-center">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-xl backdrop-blur-md {localDarkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'bg-white/80 border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}">
              <Award size={22} class={blueColor} />
            </div>
            <h2 class="text-2xl md:text-3xl font-black tracking-tight {localDarkMode ? 'text-white' : 'text-slate-800'}">
              Legendary Potholes
            </h2>
          </div>
          
          <div class="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase {blueColor} opacity-90">
            <span class="w-6 h-px bg-current opacity-50"></span>
            <span>Hall of Shame</span>
            <span class="w-6 h-px bg-current opacity-50"></span>
          </div>
        </div>

        <p class="text-center text-[11px] sm:text-xs mb-6 px-4 {primaryTextColor}">
          Earned their <span class="text-transparent bg-clip-text {localDarkMode ? 'bg-[linear-gradient(90deg,#fb923c,#a78bfa,#22d3ee,#fb923c,#fb923c,#a78bfa,#22d3ee,#fb923c)]' : 'bg-[linear-gradient(90deg,#f97316,#7c3aed,#0891b2,#f97316,#f97316,#7c3aed,#0891b2,#f97316)]'} font-bold animate-aura-text">elemental aura</span> through pure destructive power
        </p>

        <div class="flex flex-wrap sm:flex-nowrap items-end justify-center gap-3 sm:gap-6">
          {#each [top3[1], top3[0], top3[2]].filter(Boolean) as p}
            <PodiumCard 
              data={p} 
              rank={top3.indexOf(p) + 1}
              onVote={() => handleVote(p.id)}
              onSelect={(d: Report) => localSelectedPothole = d}
              darkMode={localDarkMode}
              soundEnabled={localSoundEnabled}
            />
          {/each}
        </div>
      </div>
    </section>

    <!-- Live Feed -->
    <section class="max-w-6xl mx-auto px-4">
      <div class="p-6 rounded-[2.5rem] transition-all duration-300
        {localDarkMode 
          ? '' 
          : 'bg-white/20 border border-white/40 shadow-xl ring-1 ring-white/40 backdrop-blur-xl'
        }"
        style={localDarkMode ? `
          background: 
            linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
            linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
            linear-gradient(rgba(255, 242, 212, 0.04), rgba(255, 242, 212, 0.01));
          border: 1px solid rgba(255, 243, 215, 0.06);
          box-shadow: 
            rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
            rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
            inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
            inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.08), 
            inset 0px 4px 12px -6px rgba(255, 243, 215, 0.04);
        ` : ""}>
      <div class="flex items-center justify-between gap-3 mb-8">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl {localDarkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}">
            <PlayStreamIcon size="20" className="{blueColor}" />
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight {localDarkMode ? 'text-white' : 'text-slate-700'}">Feed</h2>
          </div>
        </div>
        
        <!-- Sort Controls - Segmented Buttons with Sliding Indicator -->
        <div class="relative grid grid-cols-3 p-0 sm:p-1 rounded-full border w-full max-w-[120px] sm:max-w-[320px] h-10 sm:h-auto
          {localDarkMode 
            ? 'border-[#fff3d7]/10' 
            : 'bg-white/40 border-white/40 shadow-sm backdrop-blur-xl'
          }"
          style={localDarkMode ? `
            background: 
              linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
              linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
              linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
            box-shadow: 
              inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
              inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.12);
          ` : ""}>
          
          <!-- Sliding Indicator -->
          <!-- Desktop Indicator -->
          <div 
            class="absolute top-1 bottom-1 rounded-full transition-all duration-200 ease-out border shadow-sm hidden sm:block
              {localDarkMode ? 'border-transparent' : 'bg-white border-black/5'}"
            style="
              width: calc((100% - 8px) / 3); 
              left: 4px;
              transform: translateX({sortBy === 'recent' ? '0%' : sortBy === 'votes' ? '100%' : '200%'});
              {localDarkMode ? `
                background: 
                  linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                  linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                  linear-gradient(rgba(255, 242, 212, 0.1), rgba(255, 242, 212, 0.05));
                box-shadow: 
                  rgba(0, 0, 0, 0.3) 0px 4px 10px -2px, 
                  inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.3), 
                  inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.2);
              ` : ''}
            "
          ></div>

          <!-- Mobile Indicator -->
          <div 
            class="absolute top-[4px] bottom-1 rounded-full transition-all duration-200 ease-out border shadow-sm block sm:hidden
              {localDarkMode ? 'border-transparent' : 'bg-white border-black/5'}"
            style="
              width: 28%;
              left: calc({sortBy === 'recent' ? 0 : sortBy === 'votes' ? 1 : 2} * 33.333% + 2.666%);
              {localDarkMode ? `
                background: 
                  linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                  linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                  linear-gradient(rgba(255, 242, 212, 0.1), rgba(255, 242, 212, 0.05));
                box-shadow: 
                  rgba(0, 0, 0, 0.3) 0px 4px 10px -2px, 
                  inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.3), 
                  inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.2);
              ` : ''}
            "
          ></div>
          
          <button 
            on:click={() => sortBy = 'recent'}
            class="group relative z-10 py-2 rounded-full flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors duration-300
              {sortBy === 'recent' 
                ? blueColor
                : localDarkMode ? 'text-zinc-300 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
              }"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" class="{blueColor} {sortBy === 'recent' ? '' : 'opacity-70 group-hover:opacity-100'}" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10zm-4.581 3.324a1 1 0 0 0-.525-1.313L13 12.341V6.5a1 1 0 0 0-2 0v6.17c0 .6.357 1.143.909 1.379l4.197 1.8a1 1 0 0 0 1.313-.525z" />
            </svg>
            <span class="hidden sm:inline">Latest</span>
          </button>
          <button 
            on:click={() => sortBy = 'votes'}
            class="group relative z-10 py-2 rounded-full flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors duration-300
              {sortBy === 'votes' 
                ? blueColor
                : localDarkMode ? 'text-zinc-300 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
              }"
          >
            <TrendingUp size={16} class="text-emerald-400 {sortBy === 'votes' ? '' : 'opacity-70 group-hover:opacity-100'}" />
            <span class="hidden sm:inline">Ranked</span>
          </button>
          <button 
            on:click={() => sortBy = 'severity'}
            class="group relative z-10 py-2 rounded-full flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold transition-colors duration-300
              {sortBy === 'severity' 
                ? blueColor
                : localDarkMode ? 'text-zinc-300 hover:text-zinc-200' : 'text-slate-500 hover:text-slate-700'
              }"
          >
            <svg viewBox="0 0 128 128" width="16" height="16" class="text-red-500 {sortBy === 'severity' ? '' : 'opacity-70 group-hover:opacity-100'}" aria-hidden="true" role="img" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
              <path d="M117.95 95.7c25.01-27.3-28.72-49.4-65.53-44.38c-41.89 3.58-68.95 33.41-28.93 53.74c30.38 15.44 79.32 7.93 94.46-9.36c-.01 0-.01 0 0 0c-.01 0-.01 0 0 0zM64 109.27c-24.1 0-45.21-7.87-52.9-18.51c13.71-34.17 93.92-32.23 105.8 0c-7.69 10.63-28.8 18.51-52.9 18.51z" fill="currentColor"></path>
              <ellipse cx="64" cy="82" rx="57.07" ry="29.74" fill="currentColor" opacity="0.4"></ellipse>
            </svg>
            <span class="hidden sm:inline">Severe</span>
          </button>
        </div>
      </div>

      {#if localLoading}
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {#each Array(8) as _, i}
            <div class="rounded-3xl overflow-hidden animate-pulse {localDarkMode ? 'bg-white/5' : 'bg-black/5'}">
              <div class="aspect-square {localDarkMode ? 'bg-white/5' : 'bg-black/5'}"></div>
              <div class="p-4 space-y-3">
                <div class="h-4 rounded-full mb-3 w-3/4 {localDarkMode ? 'bg-white/10' : 'bg-black/10'}"></div>
                <div class="flex items-center justify-between">
                  <div class="h-3 rounded-full w-16 {localDarkMode ? 'bg-white/5' : 'bg-black/5'}"></div>
                  <div class="h-7 rounded-full w-14 {localDarkMode ? 'bg-white/10' : 'bg-black/10'}"></div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else if localReports.length === 0}
        <div class="text-center py-16 rounded-3xl {localDarkMode ? 'bg-white/5' : 'bg-white/10'}">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center {localDarkMode ? 'bg-white/5' : 'bg-slate-100'}">
            <Camera size={28} class={blueColor} />
          </div>
          <p class="font-medium {blueColor}">No reports yet</p>
          <p class="text-sm mt-1 {primaryTextColor}">Be the first to report a pothole!</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {#each visibleReports as p, i (p.id)}
            <ReportCard 
              data={p} 
              index={i}
              onVote={() => handleVote(p.id)}
              onSelect={(d: Report) => localSelectedPothole = d}
              darkMode={localDarkMode}
              soundEnabled={localSoundEnabled}
              blueColor={blueColor}
            />
          {/each}
        </div>
        
        {#if hasMore}
          <div class="mt-8 text-center">
            <button 
              on:click={loadMore}
              class="px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 border ring-1 backdrop-blur-md
                {localDarkMode 
                  ? `bg-white/[0.05] border-white/10 ring-white/5 ${blueColor} hover:bg-white/10` 
                  : `bg-white/40 border-white/40 ring-white/40 ${blueColor} hover:bg-white/60 shadow-sm`
                }"
            >
              Load More ({localReports.length - visibleCount} remaining)
            </button>
          </div>
        {/if}
      {/if}
      </div>
    </section>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 py-8 text-center {localDarkMode ? 'bg-gradient-to-t from-black/20 to-transparent' : 'bg-gradient-to-t from-white/30 to-transparent'}">
    <div class="max-w-6xl mx-auto px-4">
      <div class="p-6 rounded-[2.5rem] transition-all duration-300
        {localDarkMode 
          ? '' 
          : 'bg-white/20 border border-white/40 shadow-xl ring-1 ring-white/40 backdrop-blur-xl'
        }"
        style={localDarkMode ? `
          background: 
            linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
            linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
            linear-gradient(rgba(255, 242, 212, 0.04), rgba(255, 242, 212, 0.01));
          border: 1px solid rgba(255, 243, 215, 0.06);
          box-shadow: 
            rgba(10, 8, 5, 0.08) 0px 48px 56px 0px, 
            rgba(10, 8, 5, 0.12) 0px 24px 32px 0px, 
            inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
            inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.08), 
            inset 0px 4px 12px -6px rgba(255, 243, 215, 0.04);
        ` : ""}>
        <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2 text-sm font-medium {primaryTextColor}">
          Made with <span class="text-red-500 font-bold">frustration</span>
          <AngryEmoji size="20" className="inline-block relative text-red-500" /> & powered by :
        </div>
        
        <div class="flex flex-wrap justify-center items-center gap-x-3 gap-y-2 w-full">
          {#each [
            { 
              name: 'Svelte', 
              url: 'https://svelte.dev', 
              color: 'hover:text-orange-500 hover:bg-orange-500/10 hover:border-orange-500/20',
              logo: 'https://cdn.simpleicons.org/svelte/FF3E00'
            },

            { 
              name: 'Supabase', 
              url: 'https://supabase.com', 
              color: 'hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-500/20',
              logo: 'https://cdn.simpleicons.org/supabase/3ECF8E'
            },
            { 
              name: 'Cloudinary', 
              url: 'https://cloudinary.com', 
              color: 'hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/20',
              logo: 'https://cdn.simpleicons.org/cloudinary/3448C5'
            },
            { 
              name: 'TensorFlow.js', 
              url: 'https://www.tensorflow.org/js', 
              color: 'hover:text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500/20',
              logo: 'https://cdn.simpleicons.org/tensorflow/FF6F00'
            },

            { 
              name: 'OpenStreetMap', 
              url: 'https://www.openstreetmap.org', 
              color: 'hover:text-lime-500 hover:bg-lime-500/10 hover:border-lime-500/20',
              logo: 'https://cdn.simpleicons.org/openstreetmap/7EBC6F'
            }
          ] as tech}
            <a 
              href={tech.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:pl-5 hover:pr-3 border
                {localDarkMode ? 'text-zinc-300 bg-white/5 border-transparent' : 'bg-white/40 border-white/40 shadow-sm text-slate-500 hover:text-slate-800'} {tech.color}"
              style={localDarkMode ? `
                background-image: 
                  linear-gradient(rgba(0, 0, 0, 0) 80%, rgba(255, 243, 215, 0.04) 100%), 
                  linear-gradient(rgba(255, 243, 215, 0.04) 0%, rgba(0, 0, 0, 0) 20%), 
                  linear-gradient(rgba(255, 242, 212, 0.06), rgba(255, 242, 212, 0.02));
                border-color: rgba(255, 243, 215, 0.06);
                box-shadow: 
                  rgba(10, 8, 5, 0.08) 0px 4px 6px 0px, 
                  inset 0px 0.5px 0.5px 0px rgba(255, 243, 215, 0.12), 
                  inset 0px -0.5px 0.5px 0px rgba(255, 243, 215, 0.12);
              ` : ""}>
              <img src={tech.logo} alt={tech.name} class="w-3.5 h-3.5 object-contain" />
              {tech.name}
            </a>
          {/each}
        </div>

        <div class="w-full max-w-[32rem] h-px {localDarkMode ? 'bg-white/10' : 'bg-black/10'}"></div>
        
        <p class="text-xs leading-relaxed max-w-none mx-auto opacity-70 {primaryTextColor}">
          All content is crowdsourced. I take no responsibility for image accuracy, authenticity, or ownership.
        </p>
      </div>
    </div>
  </div>
  </footer>

  <!-- Modals -->
  {#if localShowUpload}
    <UploadModal 
      onClose={() => localShowUpload = false}
      onCreate={handleCreate}
      darkMode={localDarkMode}
      blueColor={blueColor}
      blueBgClass={blueBgClass}
      themeColorRGB={themeColorRGB}
    />
  {/if}

  {#if localShowMap}
    <MapView 
      reports={localReports}
      onClose={() => localShowMap = false}
      darkMode={localDarkMode}
    />
  {/if}

  {#if localSelectedPothole}
    <DetailModal 
      data={localSelectedPothole}
      onClose={() => localSelectedPothole = null}
      onVote={() => localSelectedPothole && handleVote(localSelectedPothole.id)}
      darkMode={localDarkMode}
      soundEnabled={localSoundEnabled}
      blueColor={blueColor}
    />
  {/if}

  <!-- Toast Notifications -->
  {#each toasts as toast (toast.id)}
    <Toast 
      message={toast.message} 
      type={toast.type} 
      onClose={() => removeToast(toast.id)} 
      blueColor={blueColor}
      themeColor={themeColor}
    />
  {/each}

  <!-- Torchlight Mode Overlay -->
  {#if localMode === 2}
    <div 
      class="fixed inset-0 pointer-events-none"
      style="
        z-index: 9999;
        background: radial-gradient(
          circle 200px at {mouseX}px {mouseY}px,
          transparent 0%,
          transparent 40%,
          rgba(0,0,0,0.3) 55%,
          rgba(0,0,0,0.6) 70%,
          rgba(0,0,0,0.85) 85%,
          black 100%
        );
      "
    ></div>
  {/if}
</div>
