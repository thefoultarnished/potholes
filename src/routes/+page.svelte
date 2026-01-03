<script lang="ts">
  import { onMount } from 'svelte';
  import { Camera, X, Menu, Award, Map as MapIcon } from 'lucide-svelte';
  import BlobBackground from '$lib/components/BlobBackground.svelte';
  import ModeToggle from '$lib/components/ModeToggle.svelte';
  import SoundToggle from '$lib/components/SoundToggle.svelte';
  import ReportCard from '$lib/components/ReportCard.svelte';
  import PodiumCard from '$lib/components/PodiumCard.svelte';
  import UploadModal from '$lib/components/UploadModal.svelte';
  import DetailModal from '$lib/components/DetailModal.svelte';
  import MapView from '$lib/components/MapView.svelte';
  import { 
    SUPABASE_URL, SUPABASE_ANON_KEY, type Report
  } from '$lib/stores';
  
  let localDarkMode = true;
  let localSoundEnabled = true;
  let localReports: Report[] = [];
  let localLoading = true;
  let localShowUpload = false;
  let localShowMap = false;
  let localShowMobileMenu = false;
  let localSelectedPothole: Report | null = null;
  
  $: top3 = [...localReports].sort((a, b) => b.votes - a.votes).slice(0, 3);
  
  onMount(() => {
    loadPotholes();
    const interval = setInterval(loadPotholes, 10000);
    return () => clearInterval(interval);
  });
  
  async function loadPotholes() {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      localLoading = false;
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
        localReports = data.map((serverItem: any) => {
          let loc = serverItem.location;
          try {
            if (typeof loc === 'string' && loc.startsWith('{')) {
              loc = JSON.parse(loc);
            }
          } catch (e) {
            console.warn('Failed to parse location', e);
          }
          return { ...serverItem, location: loc };
        });
        
        // Deduplicate reports by ID
        localReports = Array.from(new Map(localReports.map(item => [item.id, item])).values());
      }
    } catch (err) {
      console.error('Error loading potholes:', err);
    } finally {
      localLoading = false;
    }
  }
  
  async function handleVote(id: string) {
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
            console.warn(`Vote failed for ID ${id}: ${res.status} ${res.statusText}`);
            // Optionally revert local state if strict consistency needed
          }
        } catch (err) {
          console.warn(`Voting network error for ID ${id}:`, err);
        }
      }
    }
  }
  
  function handleCreate(newReport: Report) {
    if (localReports.some(r => r.id === newReport.id)) return;
    localReports = [newReport, ...localReports];
    localShowUpload = false;
  }
</script>

<svelte:head>
  <title>MarkMyPothole - Community Pothole Reporter</title>
</svelte:head>

<div class="min-h-screen relative transition-colors duration-500 {localDarkMode ? 'bg-[#02040a]' : 'bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50'}">
  
  {#if localDarkMode}
    <BlobBackground />
  {:else}
    <div class="fixed inset-0 overflow-hidden pointer-events-none" style="z-index: 0">
      <div class="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-cyan-200/40 to-blue-200/40 blur-3xl animate-aurora-slow"></div>
      <div class="absolute top-1/2 -left-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-blue-200/30 to-violet-200/30 blur-3xl animate-aurora-medium"></div>
      <div class="absolute -bottom-1/4 right-1/4 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-teal-200/30 to-cyan-200/30 blur-3xl animate-aurora-fast"></div>
    </div>
  {/if}

  <!-- Header -->
  <header class="fixed top-0 inset-x-0 z-30 py-3 px-4 sm:px-6 transition-all duration-300 {localDarkMode ? 'bg-[#0f1219]/60' : 'bg-white/40'} backdrop-blur-xl border-b {localDarkMode ? 'border-white/5' : 'border-black/5'}">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
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
          class="h-11 px-6 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:scale-102 active:scale-98
            {localDarkMode 
              ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:from-[#323d5e] hover:to-[#252f4e]' 
              : 'bg-white text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
            }"
        >
          <Camera size={16} />
          <span>Mark</span>
        </button>
        <button
          on:click={() => localShowMap = true}
          class="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95
            {localDarkMode 
              ? 'bg-gradient-to-b from-[#2a3352] to-[#1e2844] text-cyan-400 shadow-[0_4px_12px_rgba(0,0,0,0.4)] hover:from-[#323d5e] hover:to-[#252f4e]' 
              : 'bg-white/80 border border-white/60 text-cyan-600 shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
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
      <div class="p-6 rounded-[2.5rem] border backdrop-blur-md transition-all duration-300
        {localDarkMode 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white/10 border-white/50 shadow-xl ring-1 ring-white/50'
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
      <div class="flex items-center gap-3 mb-8">
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
          {#each localReports as p, i (p.id)}
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
      {/if}
    </section>
  </main>

  <!-- Footer -->
  <footer class="relative z-10 py-8 px-4 text-center {localDarkMode ? 'bg-gradient-to-t from-black/20 to-transparent' : 'bg-gradient-to-t from-white/30 to-transparent'}">
    <div class="max-w-6xl mx-auto px-6 py-5 rounded-3xl backdrop-blur-xl {localDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/60 border border-white/60 shadow-xl'}">
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
</div>
