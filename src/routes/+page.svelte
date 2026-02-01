<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { Camera, X, Menu, Award, Map as MapIcon } from 'lucide-svelte';
  import ModeToggle from '$lib/components/ModeToggle.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import ReportCard from '$lib/components/ReportCard.svelte';
  import PodiumCard from '$lib/components/PodiumCard.svelte';
  import UploadModal from '$lib/components/UploadModal.svelte';
  import DetailModal from '$lib/components/DetailModal.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import LoadingScreen from '$lib/components/LoadingScreen.svelte';
  import { 
    SUPABASE_URL, SUPABASE_ANON_KEY, type Report
  } from '$lib/stores';
  
  // Persisted preferences
  let localDarkMode = true;
  let localSoundEnabled = true;
  
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
          localDarkMode = !localDarkMode;
          trackEvent('keyboard_shortcut', { key: 'd', action: 'toggle_dark_mode' });
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
      const savedDarkMode = localStorage.getItem('darkMode');
      const savedSound = localStorage.getItem('soundEnabled');
      const savedVotes = localStorage.getItem('votedIds');
      const savedSort = localStorage.getItem('sortBy') as SortOption;
      
      if (savedDarkMode !== null) localDarkMode = savedDarkMode === 'true';
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
    // Prevent double voting
    if (votedIds.has(id)) {
      showToast('You have already upvoted this pothole!', 'info');
      return;
    }
    
    // Mark as voted
    votedIds.add(id);
    votedIds = votedIds; // Trigger reactivity
    if (browser) {
      localStorage.setItem('votedIds', JSON.stringify([...votedIds]));
    }
    
    // Optimistic update
    localReports = localReports.map(r => 
      r.id === id ? { ...r, votes: r.votes + 1 } : r
    );

    if (localSelectedPothole && localSelectedPothole.id === id) {
      localSelectedPothole = { ...localSelectedPothole, votes: localSelectedPothole.votes + 1 };
    }
    
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const report = localReports.find(r => r.id === id);
      if (report) {
        try {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/potholes?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ votes: report.votes })
          });
          
          if (!res.ok) {
            showToast('Vote sync failed. It will be retried.', 'error');
          }
        } catch (err) {
          showToast('Network error while voting.', 'error');
        }
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

<div class="min-h-screen relative transition-colors duration-500 {localDarkMode ? 'bg-[#02040a]' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50'}">
  
  <div class="fixed inset-0 overflow-hidden pointer-events-none" style="z-index: 0">
    {#if localDarkMode}
      <!-- Hard-Edged Geometric Background (No Blur) -->
      <div class="absolute top-[-10%] left-[-10%] w-[60vw] h-[50vh] bg-pink-900/40 -rotate-12 origin-top-left"></div>
      <div class="absolute top-[-20%] right-[-10%] w-[70vw] h-[60vh] bg-blue-950/80 rotate-12 origin-top-right"></div>
      <div class="absolute top-[45%] left-[-20%] w-[150vw] h-[15vh] bg-teal-900/50 -rotate-6"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[60vh] bg-blue-900/50 rotate-6 origin-bottom-left"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[50vh] bg-purple-900/50 -rotate-12 origin-bottom-right"></div>
    {:else}
      <!-- Light Mode Static Background (Soft Pastels) -->
      <div class="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-rose-200/60 blur-[120px]"></div>
      <div class="absolute top-[10%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-cyan-200/60 blur-[100px]"></div>
      <div class="absolute bottom-[-20%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-violet-200/60 blur-[120px]"></div>
    {/if}
  </div>

  {#if showSplash}
    <LoadingScreen darkMode={localDarkMode} onComplete={() => showSplash = false} />
  {/if}

  <!-- Header -->
  <header class="fixed top-0 inset-x-0 z-30 py-1 transition-all duration-300 backdrop-blur-xl border-b {localDarkMode ? 'bg-white/[0.02] border-white/15 shadow-lg shadow-black/10' : 'bg-white/20 border-white/40 shadow-sm'}">
    <div class="max-w-6xl mx-auto w-full px-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <img 
          src="/assets/hole-emoji-smiley-svgrepo-com.svg"
          alt="Pothole Emoji" 
          class="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-lg"
        />
        <div>
          <h1 class="font-bold text-lg tracking-tight leading-none {localDarkMode ? 'text-white' : 'text-slate-600'}">
            Mark<span class={localDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>My</span>Pothole
          </h1>
          <p class="text-[10px] font-medium tracking-wide {localDarkMode ? 'text-zinc-400' : 'text-slate-400'}">
            They ignore it, <span class="text-cyan-400 font-bold">we expose it</span>.
          </p>
        </div>
      </div>

      <!-- Desktop Actions -->
      <div class="hidden sm:flex items-center gap-2">
        <button
          on:click={() => localShowUpload = true}
          class="h-11 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-102 active:scale-98 border ring-1 backdrop-blur-md
            {localDarkMode 
              ? 'bg-white/[0.05] border-white/10 ring-white/5 text-white hover:bg-white/10' 
              : 'bg-white/40 border-white/40 ring-white/40 text-slate-700 hover:bg-white/60'}"
        >
          <Camera size={18} />
          <span>Mark</span>
        </button>
        <button
          on:click={() => localShowMap = true}
          class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 border ring-1 backdrop-blur-md
            {localDarkMode 
              ? 'bg-white/[0.05] border-white/10 ring-white/5 text-cyan-400 hover:bg-white/10' 
              : 'bg-white/40 border-white/40 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm'
            }"
        >
          <MapIcon size={20} />
        </button>
        <SoundToggle soundEnabled={localSoundEnabled} setSoundEnabled={(v) => localSoundEnabled = v} darkMode={localDarkMode} />
        <ModeToggle darkMode={localDarkMode} setDarkMode={(v) => localDarkMode = v} />
      </div>

      <!-- Mobile Menu Toggle -->
      <button
        on:click={() => localShowMobileMenu = !localShowMobileMenu}
        class="sm:hidden p-2 rounded-xl transition-all {localDarkMode ? 'text-zinc-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-black/5'}"
      >
        {#if localShowMobileMenu}
          <X size={24} />
        {:else}
          <Menu size={24} />
        {/if}
      </button>
    </div>
  </header>

  <!-- Mobile Menu -->
  {#if localShowMobileMenu}
    <div class="fixed inset-x-0 top-16 z-30 p-4 border-b sm:hidden {localDarkMode ? 'bg-[#0f1219]/95 border-white/10 text-white backdrop-blur-xl' : 'bg-white/95 border-black/5 text-slate-800 backdrop-blur-xl'}">
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between p-2">
          <span class="font-semibold">Map View</span>
          <button
            on:click={() => { localShowMap = true; localShowMobileMenu = false; }}
            class="p-2 rounded-lg {localDarkMode ? 'bg-white/10' : 'bg-black/5'}"
          >
            <MapIcon size={20} class={localDarkMode ? 'text-cyan-400' : 'text-cyan-600'} />
          </button>
        </div>
        <div class="flex items-center justify-between p-2">
          <span class="font-semibold">Sound Effects</span>
          <SoundToggle soundEnabled={localSoundEnabled} setSoundEnabled={(v) => localSoundEnabled = v} darkMode={localDarkMode} />
        </div>
        <div class="flex items-center justify-between p-2">
          <span class="font-semibold">Dark Mode</span>
          <ModeToggle darkMode={localDarkMode} setDarkMode={(v) => localDarkMode = v} />
        </div>
      </div>
    </div>
  {/if}

  <!-- FAB Mobile -->
  <button
    on:click={() => localShowUpload = true}
    class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center sm:hidden transition-all
      {localDarkMode
        ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)]'
        : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.12)] border border-white/60'
      }"
  >
    <Camera size={24} />
  </button>

  <main class="pt-24 pb-20 relative z-10">
    <!-- Hall of Shame -->
    <section class="mb-8 max-w-6xl mx-auto px-4">
      <div class="p-6 rounded-[2.5rem] border backdrop-blur-xl transition-all duration-300
        {localDarkMode 
          ? 'bg-white/[0.02] border-white/15 shadow-2xl shadow-black/20 ring-1 ring-white/5' 
          : 'bg-white/20 border-white/40 shadow-xl ring-1 ring-white/40'
        }">
        
        <div class="flex flex-col items-center justify-center mb-2 text-center">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 rounded-xl backdrop-blur-md {localDarkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'bg-white/80 border border-white/60 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}">
              <Award size={22} class={localDarkMode ? 'text-cyan-400' : 'text-cyan-500'} />
            </div>
            <h2 class="text-2xl md:text-3xl font-black tracking-tight {localDarkMode ? 'text-white' : 'text-slate-800'}">
              Legendary Potholes
            </h2>
          </div>
          
          <div class="flex items-center gap-3 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase {localDarkMode ? 'text-cyan-400/90' : 'text-cyan-600'}">
            <span class="w-6 h-px bg-current opacity-50"></span>
            <span>Hall of Shame</span>
            <span class="w-6 h-px bg-current opacity-50"></span>
          </div>
        </div>

        <p class="text-center text-[11px] sm:text-xs mb-6 px-4 {localDarkMode ? 'text-zinc-400' : 'text-slate-500'}">
          Earned their <span class={localDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>elemental aura</span> through pure destructive power
        </p>

        <div class="flex flex-wrap sm:flex-nowrap items-end justify-center gap-3 sm:gap-6">
          {#each [top3[1], top3[0], top3[2]].filter(Boolean) as p, idx}
            {@const actualRank = idx === 1 ? 1 : idx === 0 ? 2 : 3}
            <PodiumCard 
              data={p} 
              rank={actualRank}
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
      <div class="flex items-center justify-between gap-3 mb-8">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl {localDarkMode ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] shadow-[0_4px_12px_rgba(0,0,0,0.3)]' : 'bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}">
            <div 
              class="w-[20px] h-[20px] {localDarkMode ? 'bg-cyan-400' : 'bg-cyan-500'}"
              style="mask-image: url(/assets/play-stream-svgrepo-com.svg); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url(/assets/play-stream-svgrepo-com.svg); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"
            ></div>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight {localDarkMode ? 'text-white' : 'text-slate-700'}">Live Feed</h2>
            <p class="text-xs font-semibold tracking-wider {localDarkMode ? 'text-cyan-400/70' : 'text-cyan-600'}">FRESH FROM THE STREETS</p>
          </div>
        </div>
        
        <!-- Sort Controls - Segmented Buttons with Sliding Indicator -->
        <div class="relative flex items-center p-1 rounded-full border backdrop-blur-md
          {localDarkMode 
            ? 'bg-white/[0.02] border-white/10' 
            : 'bg-white/30 border-white/40'
          }">
          
          <!-- Sliding Indicator -->
          <div 
            class="absolute inset-1 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              {localDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-500/25'}"
            style="width: calc(33.333% - 5.33px); left: calc(4px + {sortBy === 'recent' ? 0 : sortBy === 'votes' ? 1 : 2} * (33.333% - 1.33px));"
          ></div>
          
          <button 
            on:click={() => sortBy = 'recent'}
            class="relative z-10 flex-1 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-center transition-colors duration-300
              {sortBy === 'recent' 
                ? localDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                : localDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-700'
              }"
          >Latest</button>
          <button 
            on:click={() => sortBy = 'votes'}
            class="relative z-10 flex-1 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-center transition-colors duration-300
              {sortBy === 'votes' 
                ? localDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                : localDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-700'
              }"
          >Top</button>
          <button 
            on:click={() => sortBy = 'severity'}
            class="relative z-10 flex-1 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold text-center transition-colors duration-300
              {sortBy === 'severity' 
                ? localDarkMode ? 'text-cyan-400' : 'text-cyan-600'
                : localDarkMode ? 'text-zinc-500 hover:text-zinc-300' : 'text-slate-500 hover:text-slate-700'
              }"
          >Severe</button>
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
            <Camera size={28} class={localDarkMode ? 'text-zinc-500' : 'text-slate-400'} />
          </div>
          <p class="font-medium {localDarkMode ? 'text-zinc-400' : 'text-slate-500'}">No reports yet</p>
          <p class="text-sm mt-1 {localDarkMode ? 'text-zinc-600' : 'text-slate-400'}">Be the first to report a pothole!</p>
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
            />
          {/each}
        </div>
        
        {#if hasMore}
          <div class="mt-8 text-center">
            <button 
              on:click={loadMore}
              class="px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 hover:scale-105 border ring-1 backdrop-blur-md
                {localDarkMode 
                  ? 'bg-white/[0.05] border-white/10 ring-white/5 text-cyan-400 hover:bg-white/10' 
                  : 'bg-white/40 border-white/40 ring-white/40 text-cyan-600 hover:bg-white/60 shadow-sm'
                }"
            >
              Load More ({localReports.length - visibleCount} remaining)
            </button>
          </div>
        {/if}
      {/if}
    </section>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 py-8 text-center {localDarkMode ? 'bg-gradient-to-t from-black/20 to-transparent' : 'bg-gradient-to-t from-white/30 to-transparent'}">
    <div class="max-w-6xl mx-auto px-4">
      <div class="px-6 py-5 rounded-3xl backdrop-blur-xl {localDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/60 shadow-xl'}">
        <div class="flex flex-col items-center gap-4">
        <div class="flex items-center gap-2 text-sm font-medium {localDarkMode ? 'text-zinc-400' : 'text-slate-600'}">
          Made with <span class="text-red-500 font-bold">frustration</span>
          <span 
            class="h-5 w-5 inline-block relative bg-current transition-colors"
            style="mask-image: url(/assets/angry-anger-svgrepo-com.svg); mask-size: contain; mask-repeat: no-repeat; mask-position: center; -webkit-mask-image: url(/assets/angry-anger-svgrepo-com.svg); -webkit-mask-size: contain; -webkit-mask-repeat: no-repeat; -webkit-mask-position: center;"
          ></span> & powered by :
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
              name: 'Tailwind', 
              url: 'https://tailwindcss.com', 
              color: 'hover:text-cyan-500 hover:bg-cyan-500/10 hover:border-cyan-500/20',
              logo: 'https://cdn.simpleicons.org/tailwindcss/06B6D4'
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
              name: 'Vite', 
              url: 'https://vitejs.dev', 
              color: 'hover:text-purple-500 hover:bg-purple-500/10 hover:border-purple-500/20',
              logo: '/assets/vite.svg'
            },
            { 
              name: 'Lucide', 
              url: 'https://lucide.dev', 
              color: 'hover:text-pink-500 hover:bg-pink-500/10 hover:border-pink-500/20',
              logo: '/assets/lucide.svg'
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
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border {localDarkMode ? 'bg-white/5 border-white/10 text-zinc-400' : 'bg-white border-black/5 text-slate-500'} {tech.color} hover:pl-2 hover:pr-4"
            >
              <img src={tech.logo} alt={tech.name} class="w-3.5 h-3.5 object-contain" />
              {tech.name}
            </a>
          {/each}
        </div>

        <div class="w-12 h-px {localDarkMode ? 'bg-white/10' : 'bg-black/10'}"></div>
        
        <p class="text-xs leading-relaxed max-w-none mx-auto opacity-70 {localDarkMode ? 'text-zinc-500' : 'text-slate-500'}">
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
    />
  {/if}

  <!-- Toast Notifications -->
  {#each toasts as toast (toast.id)}
    <Toast 
      message={toast.message} 
      type={toast.type} 
      onClose={() => removeToast(toast.id)} 
    />
  {/each}
</div>
